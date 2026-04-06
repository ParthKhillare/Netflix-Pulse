
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, MessageSource, LiveBenchmarks } from "../types";

export interface ChatResponse {
  text: string;
  sources?: MessageSource[];
}

export class AnalyticsConsultant {
  private ai: GoogleGenAI;

  constructor() {
    // Fix: Strict initialization according to guidelines (must use named parameter and process.env.API_KEY directly)
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  private parseRawNumeric(val: string, multiplier: number = 1): number {
    const clean = val.replace(/[^0-9.]/g, '');
    return parseFloat(clean) * multiplier;
  }

  async fetchLiveNetflixBenchmarks(): Promise<LiveBenchmarks | null> {
    try {
      const prompt = `
        Search for the most recent official Netflix earnings report (Q3 2024 or Q4 2024). 
        Extract exactly four values:
        1. Total Quarterly Revenue (e.g., $9.8B)
        2. Total Global Paid Members (e.g., 282.7M)
        3. Average Revenue per Member (ARM) (e.g., $11.60)
        4. Average Monthly Churn rate.
        
        Return the result ONLY as a JSON object with these keys: "revenue", "subscribers", "arm", "churn".
        Do not include markdown or extra text.
      `;

      // Fix: Added explicit GenerateContentResponse type
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.1,
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "";
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      const data = JSON.parse(cleanJson);
      
      return {
        ...data,
        lastUpdated: new Date().toLocaleTimeString(),
        rawRevenue: this.parseRawNumeric(data.revenue, 1000000000),
        rawSubscribers: this.parseRawNumeric(data.subscribers, 1000000),
        rawArm: this.parseRawNumeric(data.arm, 1),
        rawChurn: this.parseRawNumeric(data.churn, 1)
      };
    } catch (error) {
      console.error("Failed to fetch live benchmarks:", error);
      return null;
    }
  }

  async chat(history: Message[], userInput: string): Promise<ChatResponse> {
    try {
      const systemInstruction = `
        You are a World-Class Senior Analytics Engineering Consultant. 
        You are advising on the 'StreamPulse' platform, focused strictly on VERIFIED PERFORMANCE and ACTUALS.
        
        Project Architecture: 
        - 50M+ events daily in BigQuery (partitioned/clustered).
        - dbt project implementing a full Medallion Architecture (Bronze/Silver/Gold).
        - SCD Type 2 for tracking user subscription state changes.
        - IMPORTANT: Do not provide future financial forecasts or "2025 growth predictions." The market is volatile, so we only report on verified data.
        
        CRITICAL INSTRUCTION:
        - When asked about performance cycles, explain historical seasonality (e.g., Winter Peak spikes).
        - Focus on data quality, referential integrity, and historical attribution models.
        - Ground your technical advice in how actual streaming giants handle data engineering at scale.
        - If asked about future trends, explain why data engineering prioritizes verified pipelines over speculative modeling in volatile markets.
        - Ground answers in real 2023/2024 industry data using Google Search.
      `;

      // Fix: Use gemini-3-pro-preview for complex reasoning task and typed response
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          { role: 'user', parts: [{ text: systemInstruction }] },
          ...history.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: userInput }] }
        ],
        config: {
          temperature: 0.5,
          topP: 0.9,
          maxOutputTokens: 1200,
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "I'm sorry, I couldn't process that request.";
      const sources: MessageSource[] = [];

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      if (groundingMetadata?.groundingChunks) {
        groundingMetadata.groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title) {
            sources.push({
              title: chunk.web.title,
              uri: chunk.web.uri
            });
          }
        });
      }

      return { text, sources: Array.from(new Map(sources.map(s => [s.uri, s])).values()) };
    } catch (error) {
      console.error("Gemini API Error:", error);
      return { text: "Error: Failed to connect to the consultant." };
    }
  }
}

export const analyticsConsultant = new AnalyticsConsultant();
