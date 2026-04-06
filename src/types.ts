export type ProjectLayer = 'Staging' | 'Intermediate' | 'Marts' | 'Exposures';

export interface ModelColumn {
  name: string;
  type: string;
  desc: string;
}

export interface DbtModel {
  id: string;
  name: string;
  layer: ProjectLayer;
  description: string;
  dependencies: string[];
  tests: string[];
  schema: ModelColumn[];
  compiledSql?: string;
}

export interface MetricCardData {
  title: string;
  value: string;
  change: number;
  unit?: string;
}

export interface DataQualityReport {
  timestamp: string;
  status: 'passed' | 'failed' | 'warning';
  totalTests: number;
  failures: number;
  details: {
    testName: string;
    model: string;
    error: string;
  }[];
}

export interface MessageSource {
  title: string;
  uri: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: MessageSource[];
}

export interface EpisodeRating {
  episode: number;
  rating: number;
  title: string;
}

export interface RegionalPopularity {
  region: string;
  popularity: number; // 0-100
}

export interface DetailedContent {
  id: string;
  title: string;
  description: string;
  genres: string[];
  type: 'show' | 'movie' | 'anime';
  rating: number;
  episodes?: EpisodeRating[];
  popularityByRegion: RegionalPopularity[];
  trendData: { date: string; value: number }[];
  posterUrl?: string;
}

export interface LiveBenchmarks {
  revenue: string;
  subscribers: string;
  arm: string;
  churn: string;
  lastUpdated: string;
  trendingShows: DetailedContent[];
  trendingMovies: DetailedContent[];
  trendingAnime: DetailedContent[];
  // Pre-calculated numeric values for charts
  rawRevenue: number;
  rawSubscribers: number;
  rawArm: number;
  rawChurn: number;
}
