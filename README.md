# Netflix Pulse: Live Market Intelligence Dashboard

A real-time analytics dashboard tracking global Netflix performance metrics and trending content. Powered by the **Google Gemini 2.0 Flash API** with **Google Search Grounding** to fetch verified fiscal data and current global trends.

---

## Features

- **Live Market Dashboard** — Global Revenue, Paid Members, ARM, and Churn Rate from the latest Netflix earnings report
- **Trending Shows** — Top 5 with episode-by-episode ratings, regional popularity bars, and 7-day trend charts
- **Trending Movies** — Global ranking with popularity trajectory and regional breakdown
- **Trending Anime** — Dedicated tracking with episode ratings and region data
- **Historical Seasonality** — Monthly engagement intensity heatmap
- **Revenue Trajectory** — Verified quarterly MRR chart from 2023 to present
- **Monthly Auto-Refresh** — Live data is cached per calendar month, so it refreshes automatically on the 1st of each month without burning API quota

---

## Tech Stack

- **Frontend** — React 18, Vite 5, Tailwind CSS v4
- **Charts** — Recharts (Area, Bar)
- **Animations** — Motion (motion/react)
- **AI / Data** — Google Gemini 2.0 Flash with Google Search grounding
- **Icons** — Lucide React
- **Deploy** — Vercel (one-click)

---

## Local Setup

### 1. Clone

```bash
git clone https://github.com/Parthkhillare/StreamPulse.git
cd StreamPulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your `.env` file

```bash
cp .env.example .env
```

Open `.env` and add your key:

```env
VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

Get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

> **Important:** The variable MUST be named `VITE_GEMINI_API_KEY` — not `GEMINI_API_KEY`.
> Without the `VITE_` prefix, Vite will not expose it to the browser and the app will silently use mock data.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment on Vercel

1. Push your code to a GitHub repository (`.env` is gitignored — never commit it)
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. In **Environment Variables**, add:
   - **Name:** `VITE_GEMINI_API_KEY`
   - **Value:** your Gemini API key
4. Click **Deploy**

Vercel auto-detects Vite. No extra config needed beyond `vercel.json` (already included).

---

## How the data refresh works

| Scenario | Behaviour |
|---|---|
| First visit of the month | Calls Gemini API, fetches live data, caches it in localStorage |
| Subsequent visits same month | Serves from cache instantly — no API call |
| 1st of a new month | Cache key changes → fresh API call on next visit |
| No API key / API failure | Falls back to built-in mock data — all charts still render |

---

## Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx
│   ├── Dashboard.tsx
│   ├── TrendingContent.tsx
│   └── ChatInterface.tsx
├── services/
│   └── geminiService.ts   ← all Gemini logic lives here
├── types.ts
├── constants.ts
├── App.tsx
├── main.tsx
└── index.css
```

---

**Developed by [Parth Khillare](https://github.com/Parthkhillare)**
