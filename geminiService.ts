import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { LiveBenchmarks } from "../types";

// ─── Gemini client ─────────────────────────────────────────────────────────────
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// ─── Monthly localStorage cache ───────────────────────────────────────────────
// Generates a key like "netflix_pulse_2026_4" — changes every calendar month,
// so the app auto-refreshes live data on the 1st of each new month.
function getCacheKey(): string {
  const d = new Date();
  return `netflix_pulse_${d.getFullYear()}_${d.getMonth() + 1}`;
}

function readCache(): LiveBenchmarks | null {
  try {
    const raw = localStorage.getItem(getCacheKey());
    return raw ? (JSON.parse(raw) as LiveBenchmarks) : null;
  } catch {
    return null;
  }
}

function writeCache(data: LiveBenchmarks): void {
  try {
    const key = getCacheKey();
    // Remove stale month keys so storage never fills up
    Object.keys(localStorage)
      .filter(k => k.startsWith("netflix_pulse_") && k !== key)
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Storage quota exceeded or unavailable — skip silently
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseNum(val: string, multiplier = 1): number {
  if (!val) return 0;
  const n = parseFloat(String(val).replace(/[^0-9.]/g, ""));
  return (isNaN(n) ? 0 : n) * multiplier;
}

function monthYear(): string {
  return new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function fetchLiveNetflixBenchmarks(): Promise<LiveBenchmarks | null> {
  // 1. Serve monthly cache if present (avoids hammering the API)
  const cached = readCache();
  if (cached) {
    return { ...cached, lastUpdated: new Date().toLocaleTimeString() };
  }

  // 2. Validate API key before attempting a call
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key || key === "your_actual_gemini_api_key_here" || key.trim() === "") {
    console.warn("[Netflix Pulse] No Gemini API key — using mock data");
    return getMockData();
  }

  // 3. Fetch live data from Gemini 2.0 Flash with Google Search grounding
  try {
    const prompt = `
You have access to Google Search. Use it to find real, current data.

TASK: Build the Netflix Pulse dashboard data for ${monthYear()}.

═══ SECTION A: FINANCIAL METRICS ═══
Search for the most recent Netflix quarterly earnings report (Q3 2024 or Q4 2024).
Extract:
- revenue: Total quarterly revenue as a string e.g. "$9.83B"
- subscribers: Total global paid members as a string e.g. "282.7M"  
- arm: Average Revenue per Member as a string e.g. "$11.60"
- churn: Average monthly churn rate as a string e.g. "2.4%"

═══ SECTION B: TRENDING CONTENT ═══
Search for "Netflix top trending shows ${monthYear()}" and similar queries.
Return exactly 5 shows, 5 movies, and 5 anime that are currently trending on Netflix globally.

For EVERY title provide:
- id: unique slug e.g. "show-1"
- title: exact title string
- description: 2-sentence plot summary
- genres: array of 2-3 strings
- type: exactly "show" | "movie" | "anime"
- rating: number 0-10 (use IMDb or similar)
- episodes: (shows and anime ONLY) array of exactly 5 objects: { "episode": number, "rating": number, "title": string }
- popularityByRegion: array of exactly 5 objects with these regions in order:
  { "region": "North America", "popularity": number 0-100 }
  { "region": "Europe", "popularity": number 0-100 }
  { "region": "Asia", "popularity": number 0-100 }
  { "region": "Latin America", "popularity": number 0-100 }
  { "region": "Middle East & Africa", "popularity": number 0-100 }
- trendData: array of exactly 7 objects for the last 7 days: { "date": "YYYY-MM-DD", "value": number 0-100 }

═══ OUTPUT FORMAT ═══
Return ONLY a raw JSON object. No markdown. No code fences. No explanation before or after.
Exactly this structure:
{
  "revenue": "...",
  "subscribers": "...",
  "arm": "...",
  "churn": "...",
  "trendingShows": [...5 items...],
  "trendingMovies": [...5 items...],
  "trendingAnime": [...5 items...]
}
`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        temperature: 0.1,
        tools: [{ googleSearch: {} }],
      },
    });

    const raw = response.text ?? "";
    // Strip any accidental markdown fences Gemini might add
    const json = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    if (!json) {
      console.warn("[Netflix Pulse] Empty response — using mock data");
      return getMockData();
    }

    const data = JSON.parse(json);

    const result: LiveBenchmarks = {
      revenue:        data.revenue        ?? "$9.83B",
      subscribers:    data.subscribers    ?? "282.7M",
      arm:            data.arm            ?? "$11.60",
      churn:          data.churn          ?? "2.4%",
      lastUpdated:    new Date().toLocaleTimeString(),
      rawRevenue:     parseNum(data.revenue, 1_000_000_000),
      rawSubscribers: parseNum(data.subscribers, 1_000_000),
      rawArm:         parseNum(data.arm, 1),
      rawChurn:       parseNum(data.churn, 1),
      trendingShows:  Array.isArray(data.trendingShows)  ? data.trendingShows  : [],
      trendingMovies: Array.isArray(data.trendingMovies) ? data.trendingMovies : [],
      trendingAnime:  Array.isArray(data.trendingAnime)  ? data.trendingAnime  : [],
    };

    writeCache(result);
    return result;

  } catch (err) {
    console.error("[Netflix Pulse] Gemini API error:", err);
    return getMockData();
  }
}

// ─── Mock fallback ─────────────────────────────────────────────────────────────
// Shown when: (a) no API key, (b) API call fails, (c) empty response.
// Rich enough that the entire UI renders correctly with all charts/graphs.
function getMockData(): LiveBenchmarks {
  return {
    revenue:        "$9.83B",
    subscribers:    "282.7M",
    arm:            "$11.60",
    churn:          "2.4%",
    lastUpdated:    new Date().toLocaleTimeString(),
    rawRevenue:     9_830_000_000,
    rawSubscribers: 282_700_000,
    rawArm:         11.60,
    rawChurn:       2.4,

    trendingShows: [
      {
        id: "show-1",
        title: "Stranger Things",
        description:
          "When a young boy vanishes in Hawkins, Indiana, his mother and the local police chief uncover a series of extraordinary mysteries involving secret government experiments. A supernatural thriller drenched in 80s nostalgia.",
        genres: ["Drama", "Fantasy", "Horror"],
        type: "show",
        rating: 8.7,
        episodes: [
          { episode: 1, rating: 8.5, title: "The Vanishing of Will Byers" },
          { episode: 2, rating: 8.8, title: "The Weirdo on Maple Street" },
          { episode: 3, rating: 9.1, title: "Holly, Jolly" },
          { episode: 4, rating: 8.9, title: "The Body" },
          { episode: 5, rating: 9.2, title: "The Flea and the Acrobat" },
        ],
        popularityByRegion: [
          { region: "North America",        popularity: 95 },
          { region: "Europe",               popularity: 88 },
          { region: "Asia",                 popularity: 79 },
          { region: "Latin America",        popularity: 84 },
          { region: "Middle East & Africa", popularity: 71 },
        ],
        trendData: [
          { date: "2026-03-31", value: 90 },
          { date: "2026-04-01", value: 93 },
          { date: "2026-04-02", value: 96 },
          { date: "2026-04-03", value: 94 },
          { date: "2026-04-04", value: 95 },
          { date: "2026-04-05", value: 97 },
          { date: "2026-04-06", value: 94 },
        ],
      },
      {
        id: "show-2",
        title: "Wednesday",
        description:
          "Wednesday Addams navigates her emerging psychic abilities while solving a monstrous murder mystery at Nevermore Academy. Sharp wit, dark aesthetics, and a breakout lead performance.",
        genres: ["Comedy", "Fantasy", "Mystery"],
        type: "show",
        rating: 8.1,
        episodes: [
          { episode: 1, rating: 8.0, title: "Wednesday's Child Is Full of Woe" },
          { episode: 2, rating: 8.2, title: "Woe Is the Loneliest Number" },
          { episode: 3, rating: 8.3, title: "Friend or Woe" },
          { episode: 4, rating: 8.1, title: "Woe What a Night" },
          { episode: 5, rating: 8.6, title: "You Reap What You Woe" },
        ],
        popularityByRegion: [
          { region: "North America",        popularity: 91 },
          { region: "Europe",               popularity: 86 },
          { region: "Asia",                 popularity: 88 },
          { region: "Latin America",        popularity: 92 },
          { region: "Middle East & Africa", popularity: 74 },
        ],
        trendData: [
          { date: "2026-03-31", value: 87 },
          { date: "2026-04-01", value: 89 },
          { date: "2026-04-02", value: 92 },
          { date: "2026-04-03", value: 90 },
          { date: "2026-04-04", value: 93 },
          { date: "2026-04-05", value: 95 },
          { date: "2026-04-06", value: 91 },
        ],
      },
      {
        id: "show-3",
        title: "The Crown",
        description:
          "A meticulous dramatisation of Queen Elizabeth II's reign spanning six decades of political upheaval, personal sacrifice, and the tension between duty and desire. One of television's most expensive and acclaimed productions.",
        genres: ["Drama", "History"],
        type: "show",
        rating: 8.6,
        episodes: [
          { episode: 1, rating: 8.4, title: "Wolferton Splash" },
          { episode: 2, rating: 8.7, title: "Hyde Park Corner" },
          { episode: 3, rating: 8.5, title: "Windsor" },
          { episode: 4, rating: 8.8, title: "Act of God" },
          { episode: 5, rating: 8.9, title: "Smoke and Mirrors" },
        ],
        popularityByRegion: [
          { region: "North America",        popularity: 87 },
          { region: "Europe",               popularity: 94 },
          { region: "Asia",                 popularity: 72 },
          { region: "Latin America",        popularity: 75 },
          { region: "Middle East & Africa", popularity: 64 },
        ],
        trendData: [
          { date: "2026-03-31", value: 84 },
          { date: "2026-04-01", value: 86 },
          { date: "2026-04-02", value: 89 },
          { date: "2026-04-03", value: 87 },
          { date: "2026-04-04", value: 90 },
          { date: "2026-04-05", value: 88 },
          { date: "2026-04-06", value: 91 },
        ],
      },
      {
        id: "show-4",
        title: "Squid Game",
        description:
          "Hundreds of cash-strapped players accept a strange invitation to compete in children's games for a life-changing prize. The stakes are deadly in this brutal Korean survival thriller.",
        genres: ["Thriller", "Drama", "Action"],
        type: "show",
        rating: 8.0,
        episodes: [
          { episode: 1, rating: 8.2, title: "Red Light, Green Light" },
          { episode: 2, rating: 8.0, title: "Hell" },
          { episode: 3, rating: 8.4, title: "The Man with the Umbrella" },
          { episode: 4, rating: 8.1, title: "Stick to the Team" },
          { episode: 5, rating: 8.6, title: "A Fair World" },
        ],
        popularityByRegion: [
          { region: "North America",        popularity: 89 },
          { region: "Europe",               popularity: 87 },
          { region: "Asia",                 popularity: 98 },
          { region: "Latin America",        popularity: 91 },
          { region: "Middle East & Africa", popularity: 83 },
        ],
        trendData: [
          { date: "2026-03-31", value: 88 },
          { date: "2026-04-01", value: 91 },
          { date: "2026-04-02", value: 93 },
          { date: "2026-04-03", value: 95 },
          { date: "2026-04-04", value: 92 },
          { date: "2026-04-05", value: 94 },
          { date: "2026-04-06", value: 96 },
        ],
      },
      {
        id: "show-5",
        title: "Bridgerton",
        description:
          "Set in the glittering, competitive world of Regency-era London high society, this romantic drama follows the Bridgerton family's search for love and social standing. Lavish, scandalous, and irresistibly watchable.",
        genres: ["Drama", "Romance", "History"],
        type: "show",
        rating: 7.3,
        episodes: [
          { episode: 1, rating: 7.2, title: "Diamond of the First Water" },
          { episode: 2, rating: 7.4, title: "Shock and Delight" },
          { episode: 3, rating: 7.3, title: "Art of the Swoon" },
          { episode: 4, rating: 7.5, title: "An Unthinkable Fate" },
          { episode: 5, rating: 7.6, title: "The Duke and I" },
        ],
        popularityByRegion: [
          { region: "North America",        popularity: 85 },
          { region: "Europe",               popularity: 82 },
          { region: "Asia",                 popularity: 70 },
          { region: "Latin America",        popularity: 88 },
          { region: "Middle East & Africa", popularity: 68 },
        ],
        trendData: [
          { date: "2026-03-31", value: 80 },
          { date: "2026-04-01", value: 83 },
          { date: "2026-04-02", value: 85 },
          { date: "2026-04-03", value: 82 },
          { date: "2026-04-04", value: 84 },
          { date: "2026-04-05", value: 86 },
          { date: "2026-04-06", value: 83 },
        ],
      },
    ],

    trendingMovies: [
      {
        id: "movie-1",
        title: "Dune: Part Two",
        description:
          "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Denis Villeneuve's breathtaking sci-fi epic raises the bar for blockbuster filmmaking.",
        genres: ["Sci-Fi", "Adventure", "Drama"],
        type: "movie",
        rating: 8.8,
        popularityByRegion: [
          { region: "North America",        popularity: 93 },
          { region: "Europe",               popularity: 90 },
          { region: "Asia",                 popularity: 88 },
          { region: "Latin America",        popularity: 85 },
          { region: "Middle East & Africa", popularity: 80 },
        ],
        trendData: [
          { date: "2026-03-31", value: 89 },
          { date: "2026-04-01", value: 91 },
          { date: "2026-04-02", value: 94 },
          { date: "2026-04-03", value: 92 },
          { date: "2026-04-04", value: 90 },
          { date: "2026-04-05", value: 93 },
          { date: "2026-04-06", value: 91 },
        ],
      },
      {
        id: "movie-2",
        title: "Rebel Ridge",
        description:
          "A former Marine arrives in a small Louisiana town to bail out his cousin and uncovers a deep-rooted conspiracy of police corruption. A masterclass in slow-burn tension.",
        genres: ["Action", "Thriller"],
        type: "movie",
        rating: 7.9,
        popularityByRegion: [
          { region: "North America",        popularity: 88 },
          { region: "Europe",               popularity: 80 },
          { region: "Asia",                 popularity: 72 },
          { region: "Latin America",        popularity: 79 },
          { region: "Middle East & Africa", popularity: 69 },
        ],
        trendData: [
          { date: "2026-03-31", value: 82 },
          { date: "2026-04-01", value: 85 },
          { date: "2026-04-02", value: 88 },
          { date: "2026-04-03", value: 86 },
          { date: "2026-04-04", value: 87 },
          { date: "2026-04-05", value: 89 },
          { date: "2026-04-06", value: 87 },
        ],
      },
      {
        id: "movie-3",
        title: "The Electric State",
        description:
          "In an alternate-history 1990s America, a teenage girl and a peculiar robot embark on a cross-country road trip to find her missing brother. Stunning visuals meet a deeply human story.",
        genres: ["Sci-Fi", "Adventure", "Drama"],
        type: "movie",
        rating: 6.8,
        popularityByRegion: [
          { region: "North America",        popularity: 80 },
          { region: "Europe",               popularity: 75 },
          { region: "Asia",                 popularity: 78 },
          { region: "Latin America",        popularity: 82 },
          { region: "Middle East & Africa", popularity: 67 },
        ],
        trendData: [
          { date: "2026-03-31", value: 76 },
          { date: "2026-04-01", value: 79 },
          { date: "2026-04-02", value: 82 },
          { date: "2026-04-03", value: 80 },
          { date: "2026-04-04", value: 78 },
          { date: "2026-04-05", value: 81 },
          { date: "2026-04-06", value: 79 },
        ],
      },
      {
        id: "movie-4",
        title: "Extraction 2",
        description:
          "Black-market mercenary Tyler Rake is resurrected for another near-impossible mission — rescuing the battered family of a ruthless Georgian gangster from prison. Relentless action cinema at its finest.",
        genres: ["Action", "Thriller"],
        type: "movie",
        rating: 7.6,
        popularityByRegion: [
          { region: "North America",        popularity: 84 },
          { region: "Europe",               popularity: 81 },
          { region: "Asia",                 popularity: 83 },
          { region: "Latin America",        popularity: 86 },
          { region: "Middle East & Africa", popularity: 78 },
        ],
        trendData: [
          { date: "2026-03-31", value: 80 },
          { date: "2026-04-01", value: 83 },
          { date: "2026-04-02", value: 85 },
          { date: "2026-04-03", value: 83 },
          { date: "2026-04-04", value: 84 },
          { date: "2026-04-05", value: 86 },
          { date: "2026-04-06", value: 84 },
        ],
      },
      {
        id: "movie-5",
        title: "Carry-On",
        description:
          "A TSA agent is coerced into allowing a mysterious bag on a Christmas Eve flight or his family will be killed. A high-concept Die Hard-style thriller that dominated Netflix in its opening weekend.",
        genres: ["Action", "Thriller", "Crime"],
        type: "movie",
        rating: 7.1,
        popularityByRegion: [
          { region: "North America",        popularity: 86 },
          { region: "Europe",               popularity: 79 },
          { region: "Asia",                 popularity: 74 },
          { region: "Latin America",        popularity: 80 },
          { region: "Middle East & Africa", popularity: 71 },
        ],
        trendData: [
          { date: "2026-03-31", value: 79 },
          { date: "2026-04-01", value: 81 },
          { date: "2026-04-02", value: 84 },
          { date: "2026-04-03", value: 82 },
          { date: "2026-04-04", value: 83 },
          { date: "2026-04-05", value: 85 },
          { date: "2026-04-06", value: 82 },
        ],
      },
    ],

    trendingAnime: [
      {
        id: "anime-1",
        title: "Attack on Titan: Final Season",
        description:
          "Humanity's final reckoning with the Titans arrives as Eren Yeager's terrifying plan unfolds and former enemies must unite to stop him. The most acclaimed anime finale in a generation.",
        genres: ["Action", "Drama", "Fantasy"],
        type: "anime",
        rating: 9.2,
        episodes: [
          { episode: 1, rating: 9.0, title: "Judgment" },
          { episode: 2, rating: 9.3, title: "Memories of the Future" },
          { episode: 3, rating: 9.5, title: "Two Brothers" },
          { episode: 4, rating: 9.4, title: "Traitor" },
          { episode: 5, rating: 9.6, title: "The Dawn of Humanity" },
        ],
        popularityByRegion: [
          { region: "North America",        popularity: 91 },
          { region: "Europe",               popularity: 88 },
          { region: "Asia",                 popularity: 97 },
          { region: "Latin America",        popularity: 90 },
          { region: "Middle East & Africa", popularity: 83 },
        ],
        trendData: [
          { date: "2026-03-31", value: 91 },
          { date: "2026-04-01", value: 93 },
          { date: "2026-04-02", value: 96 },
          { date: "2026-04-03", value: 94 },
          { date: "2026-04-04", value: 95 },
          { date: "2026-04-05", value: 97 },
          { date: "2026-04-06", value: 94 },
        ],
      },
      {
        id: "anime-2",
        title: "One Piece",
        description:
          "Monkey D. Luffy and his Straw Hat Pirates sail the treacherous Grand Line in pursuit of the legendary One Piece and the title of King of the Pirates. Twenty-five years in and still the gold standard of adventure anime.",
        genres: ["Action", "Adventure", "Comedy"],
        type: "anime",
        rating: 8.9,
        episodes: [
          { episode: 1, rating: 8.7, title: "Egghead: Enter Vegapunk" },
          { episode: 2, rating: 9.0, title: "The World's Most Wanted Man" },
          { episode: 3, rating: 9.1, title: "A Giant's Tears" },
          { episode: 4, rating: 8.9, title: "The Weight of the Past" },
          { episode: 5, rating: 9.2, title: "The Final Road Poneglyph" },
        ],
        popularityByRegion: [
          { region: "North America",        popularity: 85 },
          { region: "Europe",               popularity: 81 },
          { region: "Asia",                 popularity: 98 },
          { region: "Latin America",        popularity: 89 },
          { region: "Middle East & Africa", popularity: 80 },
        ],
        trendData: [
          { date: "2026-03-31", value: 85 },
          { date: "2026-04-01", value: 88 },
          { date: "2026-04-02", value: 91 },
          { date: "2026-04-03", value: 89 },
          { date: "2026-04-04", value: 92 },
          { date: "2026-04-05", value: 94 },
          { date: "2026-04-06", value: 91 },
        ],
      },
      {
        id: "anime-3",
        title: "Demon Slayer: Hashira Training Arc",
        description:
          "With the final battle against Muzan Kibutsuji approaching, Tanjiro and the Corps undergo brutal training under the nine Hashira. Studio Ufotable's animation reaches new heights of visual spectacle.",
        genres: ["Action", "Fantasy", "Drama"],
        type: "anime",
        rating: 8.8,
        episodes: [
          { episode: 1, rating: 8.6, title: "To Defeat Muzan Kibutsuji" },
          { episode: 2, rating: 8.8, title: "Water Breathing Refined" },
          { episode: 3, rating: 9.0, title: "The Stone Hashira's Trial" },
          { episode: 4, rating: 8.9, title: "Flames of Resolve" },
          { episode: 5, rating: 9.1, title: "The Final Preparation" },
        ],
        popularityByRegion: [
          { region: "North America",        popularity: 88 },
          { region: "Europe",               popularity: 83 },
          { region: "Asia",                 popularity: 96 },
          { region: "Latin America",        popularity: 87 },
          { region: "Middle East & Africa", popularity: 79 },
        ],
        trendData: [
          { date: "2026-03-31", value: 86 },
          { date: "2026-04-01", value: 88 },
          { date: "2026-04-02", value: 91 },
          { date: "2026-04-03", value: 89 },
          { date: "2026-04-04", value: 92 },
          { date: "2026-04-05", value: 90 },
          { date: "2026-04-06", value: 93 },
        ],
      },
      {
        id: "anime-4",
        title: "Jujutsu Kaisen",
        description:
          "High schooler Yuji Itadori swallows a cursed talisman to save his friends and becomes host to a powerful demon, forcing him into a secret world of Jujutsu sorcerers. Explosive fights with deep emotional stakes.",
        genres: ["Action", "Fantasy", "Horror"],
        type: "anime",
        rating: 8.7,
        episodes: [
          { episode: 1, rating: 8.5, title: "The Merger" },
          { episode: 2, rating: 8.8, title: "Cursed Child" },
          { episode: 3, rating: 9.0, title: "Tokyo No. 1 Colony" },
          { episode: 4, rating: 8.9, title: "Fluctuations" },
          { episode: 5, rating: 9.2, title: "Evening Festival" },
        ],
        popularityByRegion: [
          { region: "North America",        popularity: 90 },
          { region: "Europe",               popularity: 86 },
          { region: "Asia",                 popularity: 95 },
          { region: "Latin America",        popularity: 88 },
          { region: "Middle East & Africa", popularity: 81 },
        ],
        trendData: [
          { date: "2026-03-31", value: 88 },
          { date: "2026-04-01", value: 90 },
          { date: "2026-04-02", value: 93 },
          { date: "2026-04-03", value: 91 },
          { date: "2026-04-04", value: 94 },
          { date: "2026-04-05", value: 92 },
          { date: "2026-04-06", value: 95 },
        ],
      },
      {
        id: "anime-5",
        title: "Vinland Saga",
        description:
          "Young Thorfinn joins the crew of the mercenary who murdered his father in hopes of one day killing him in a fair duel. A sweeping Viking epic about violence, revenge, and the search for true peace.",
        genres: ["Action", "Drama", "History"],
        type: "anime",
        rating: 8.8,
        episodes: [
          { episode: 1, rating: 8.6, title: "Lost Sheep" },
          { episode: 2, rating: 8.8, title: "Stop, Thorfinn" },
          { episode: 3, rating: 9.0, title: "Into the East" },
          { episode: 4, rating: 8.9, title: "The Land on the Far Bank" },
          { episode: 5, rating: 9.1, title: "Path of Blood" },
        ],
        popularityByRegion: [
          { region: "North America",        popularity: 82 },
          { region: "Europe",               popularity: 85 },
          { region: "Asia",                 popularity: 90 },
          { region: "Latin America",        popularity: 80 },
          { region: "Middle East & Africa", popularity: 74 },
        ],
        trendData: [
          { date: "2026-03-31", value: 80 },
          { date: "2026-04-01", value: 82 },
          { date: "2026-04-02", value: 85 },
          { date: "2026-04-03", value: 83 },
          { date: "2026-04-04", value: 86 },
          { date: "2026-04-05", value: 84 },
          { date: "2026-04-06", value: 87 },
        ],
      },
    ],
  };
}
