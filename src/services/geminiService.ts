import { GoogleGenAI } from "@google/genai";
import { LiveBenchmarks } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env?.VITE_GEMINI_API_KEY || 'dummy-key-for-testing' });

const parseRawNumeric = (val: string, multiplier: number = 1): number => {
  if (!val) return 0;
  const clean = String(val).replace(/[^0-9.]/g, '');
  return (parseFloat(clean) || 0) * multiplier;
};

// Monthly cache logic
const getCacheKey = (category: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return `netflix_pulse_${category}_${year}_${month}`;
};

const getCachedData = (category: string): any => {
  const cacheKey = getCacheKey(category);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const data = JSON.parse(cached);
    const cacheDate = new Date(data.cachedAt);
    const now = new Date();
    // Check if cache is from current month
    if (cacheDate.getMonth() === now.getMonth() && cacheDate.getFullYear() === now.getFullYear()) {
      return data.data;
    }
  }
  return null;
};

const setCachedData = (category: string, data: any): void => {
  const cacheKey = getCacheKey(category);
  const cacheData = {
    data,
    cachedAt: new Date().toISOString()
  };
  localStorage.setItem(cacheKey, JSON.stringify(cacheData));
};

export async function fetchLiveNetflixBenchmarks(): Promise<LiveBenchmarks | null> {
  console.log('All environment variables:', import.meta.env);
  console.log('API Key check:', import.meta.env?.VITE_GEMINI_API_KEY ? 'Key found' : 'No key');
  console.log('API Key value:', import.meta.env?.VITE_GEMINI_API_KEY);
  
  // Check if API key is available
  if (!import.meta.env?.VITE_GEMINI_API_KEY || import.meta.env?.VITE_GEMINI_API_KEY === 'your_actual_gemini_api_key_here') {
    console.warn('Using mock data - no valid Gemini API key found');
    return getMockData();
  }

  // For now, return enhanced mock data with 20 items per category
  console.log('Using enhanced mock data with 20 items per category');
  return getEnhancedMockData();
}

// Enhanced mock data with 20 items per category
function getEnhancedMockData(): LiveBenchmarks {
  const shows = [
    { id: "show-1", title: "Stranger Things", description: "Kids in small town face supernatural forces and government conspiracies", genres: ["Sci-Fi", "Horror", "Drama"], type: "show" as const, rating: 8.7 },
    { id: "show-2", title: "The Crown", description: "Historical drama following the reign of Queen Elizabeth II", genres: ["Drama", "History"], type: "show" as const, rating: 8.6 },
    { id: "show-3", title: "Wednesday", description: "Wednesday Addams investigates murders at her new school", genres: ["Comedy", "Mystery", "Horror"], type: "show" as const, rating: 8.1 },
    { id: "show-4", title: "Bridgerton", description: "Regency-era romance and scandal among London's high society", genres: ["Romance", "Drama"], type: "show" as const, rating: 7.9 },
    { id: "show-5", title: "The Witcher", description: "Monster hunter Geralt navigates a world of magic and political intrigue", genres: ["Fantasy", "Action", "Drama"], type: "show" as const, rating: 8.2 },
    { id: "show-6", title: "Squid Game", description: "Deadly games for cash prize in South Korean survival thriller", genres: ["Thriller", "Drama", "Action"], type: "show" as const, rating: 8.0 },
    { id: "show-7", title: "Money Heist", description: "Criminal masterminds execute the perfect heist at the Royal Mint", genres: ["Action", "Crime", "Thriller"], type: "show" as const, rating: 8.2 },
    { id: "show-8", title: "Dark", description: "German sci-fi thriller about missing children and time travel", genres: ["Sci-Fi", "Mystery", "Thriller"], type: "show" as const, rating: 8.7 },
    { id: "show-9", title: "Narcos", description: "Rise and fall of Colombian drug kingpin Pablo Escobar", genres: ["Crime", "Drama", "Action"], type: "show" as const, rating: 8.8 },
    { id: "show-10", title: "The Umbrella Academy", description: "Dysfunctional superhero family saves the world", genres: ["Superhero", "Comedy", "Drama"], type: "show" as const, rating: 7.9 },
    { id: "show-11", title: "Elite", description: "Spanish drama about class struggles at an exclusive private school", genres: ["Drama", "Mystery", "Romance"], type: "show" as const, rating: 7.6 },
    { id: "show-12", title: "Ozark", description: "Financial advisor launders money for Mexican drug cartel", genres: ["Crime", "Drama", "Thriller"], type: "show" as const, rating: 8.4 },
    { id: "show-13", title: "The Queen's Gambit", description: "Chess prodigy battles addiction and competition in Cold War era", genres: ["Drama", "Sport"], type: "show" as const, rating: 8.0 },
    { id: "show-14", title: "Lucifer", description: "Devil runs nightclub in LA and helps LAPD solve crimes", genres: ["Fantasy", "Crime", "Drama"], type: "show" as const, rating: 8.1 },
    { id: "show-15", title: "The Good Place", description: "Afterlife comedy about ethics and moral philosophy", genres: ["Comedy", "Fantasy"], type: "show" as const, rating: 8.2 },
    { id: "show-16", title: "You", description: "Stalker becomes obsessed with women he meets on social media", genres: ["Psychological", "Thriller", "Drama"], type: "show" as const, rating: 7.7 },
    { id: "show-17", title: "Russian Doll", description: "Woman relives same night repeatedly in time loop", genres: ["Drama", "Comedy", "Sci-Fi"], type: "show" as const, rating: 8.0 },
    { id: "show-18", title: "Black Mirror", description: "Anthology series about dark side of technology", genres: ["Sci-Fi", "Thriller", "Drama"], type: "show" as const, rating: 8.8 },
    { id: "show-19", title: "Mindhunter", description: "FBI agents develop criminal profiling by interviewing serial killers", genres: ["Crime", "Drama", "Thriller"], type: "show" as const, rating: 8.6 },
    { id: "show-20", title: "The Haunting of Hill House", description: "Family confronts supernatural past in haunted mansion", genres: ["Horror", "Drama", "Mystery"], type: "show" as const, rating: 8.6 }
  ].map((show, i) => ({
    ...show,
    episodes: Array.from({ length: 5 }, (_, j) => ({
      episode: j + 1,
      rating: 7.5 + Math.random() * 2,
      title: `Episode ${j + 1}: ${show.title.split(' ')[0]} Adventures`
    })),
    popularityByRegion: [
      { region: "North America", popularity: 85 + Math.random() * 15 },
      { region: "Europe", popularity: 80 + Math.random() * 20 },
      { region: "Asia", popularity: 75 + Math.random() * 25 },
      { region: "Latin America", popularity: 70 + Math.random() * 30 },
      { region: "Africa", popularity: 65 + Math.random() * 35 }
    ],
    trendData: Array.from({ length: 7 }, (_, k) => ({
      date: new Date(Date.now() - (6 - k) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 80 + Math.random() * 20
    }))
  }));

  const movies = [
    { id: "movie-1", title: "Dune: Part Two", description: "Paul Atreides seeks revenge for his family's destruction", genres: ["Sci-Fi", "Action", "Drama"], type: "movie" as const, rating: 8.8 },
    { id: "movie-2", title: "The Super Mario Bros. Movie", description: "Brothers transported to magical world of Mushroom Kingdom", genres: ["Animation", "Adventure", "Comedy"], type: "movie" as const, rating: 7.9 },
    { id: "movie-3", title: "Glass Onion: A Knives Out Mystery", description: "Detective investigates murder among wealthy friends", genres: ["Mystery", "Comedy", "Drama"], type: "movie" as const, rating: 7.9 },
    { id: "movie-4", title: "The Gray Man", description: "CIA agent hunted by former colleague", genres: ["Action", "Thriller"], type: "movie" as const, rating: 6.9 },
    { id: "movie-5", title: "Red Notice", description: "Interpol agent pursues art thief", genres: ["Action", "Comedy", "Thriller"], type: "movie" as const, rating: 6.4 },
    { id: "movie-6", title: "The Adam Project", description: "Time-traveling pilot meets younger self", genres: ["Sci-Fi", "Action", "Comedy"], type: "movie" as const, rating: 7.0 },
    { id: "movie-7", title: "Don't Look Up", description: "Scientists warn of approaching comet", genres: ["Comedy", "Sci-Fi", "Drama"], type: "movie" as const, rating: 7.2 },
    { id: "movie-8", title: "The Power of the Dog", description: "Rancher intimidates brother's new wife and son", genres: ["Drama", "Western"], type: "movie" as const, rating: 7.3 },
    { id: "movie-9", title: "The Irishman", description: "Hitman reflects on his life and career", genres: ["Crime", "Drama", "Biography"], type: "movie" as const, rating: 7.9 },
    { id: "movie-10", title: "Marriage Story", description: "Couple navigates divorce proceedings", genres: ["Drama", "Romance"], type: "movie" as const, rating: 7.9 },
    { id: "movie-11", title: "Roma", description: "Domestic worker in 1970s Mexico City", genres: ["Drama", "Romance"], type: "movie" as const, rating: 8.1 },
    { id: "movie-12", title: "The Ballad of Buster Scruggs", description: "Six stories about American West", genres: ["Western", "Drama", "Comedy"], type: "movie" as const, rating: 7.8 },
    { id: "movie-13", title: "Bird Box", description: "Woman and children navigate post-apocalyptic world blindfolded", genres: ["Thriller", "Horror", "Sci-Fi"], type: "movie" as const, rating: 6.6 },
    { id: "movie-14", title: "Bright", description: "Human cop teams up with orc in fantasy LA", genres: ["Action", "Fantasy", "Crime"], type: "movie" as const, rating: 6.3 },
    { id: "movie-15", title: "Okja", description: "Girl fights corporation to save genetically modified pig", genres: ["Adventure", "Drama", "Sci-Fi"], type: "movie" as const, rating: 7.3 },
    { id: "movie-16", title: "The Other Side of the Wind", description: "Orson Welles' final film about aging director", genres: ["Drama", "Comedy"], type: "movie" as const, rating: 7.0 },
    { id: "movie-17", title: "Triple Frontier", description: "Special forces operatives plan heist", genres: ["Action", "Thriller", "Crime"], type: "movie" as const, rating: 6.6 },
    { id: "movie-18", title: "The Platform", description: "Prisoners in vertical cell system", genres: ["Thriller", "Horror", "Sci-Fi"], type: "movie" as const, rating: 7.0 },
    { id: "movie-19", title: "I Am Mother", description: "Teen raised by robot in post-apocalyptic bunker", genres: ["Sci-Fi", "Thriller"], type: "movie" as const, rating: 7.0 },
    { id: "movie-20", title: "The King", description: "Prince becomes King of England", genres: ["Drama", "War", "History"], type: "movie" as const, rating: 7.3 }
  ].map((movie, i) => ({
    ...movie,
    popularityByRegion: [
      { region: "North America", popularity: 85 + Math.random() * 15 },
      { region: "Europe", popularity: 80 + Math.random() * 20 },
      { region: "Asia", popularity: 75 + Math.random() * 25 },
      { region: "Latin America", popularity: 70 + Math.random() * 30 },
      { region: "Africa", popularity: 65 + Math.random() * 35 }
    ],
    trendData: Array.from({ length: 7 }, (_, k) => ({
      date: new Date(Date.now() - (6 - k) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 80 + Math.random() * 20
    }))
  }));

  const anime = [
    { id: "anime-1", title: "Attack on Titan", description: "Humanity fights giant man-eating Titans", genres: ["Action", "Dark Fantasy", "Post-Apocalyptic"], type: "anime" as const, rating: 9.0 },
    { id: "anime-2", title: "One Piece", description: "Pirates search for legendary treasure", genres: ["Adventure", "Comedy", "Action"], type: "anime" as const, rating: 8.9 },
    { id: "anime-3", title: "Death Note", description: "Student finds notebook that kills anyone whose name is written", genres: ["Psychological", "Thriller", "Supernatural"], type: "anime" as const, rating: 9.0 },
    { id: "anime-4", title: "Demon Slayer", description: "Boy becomes demon slayer to save sister", genres: ["Action", "Dark Fantasy", "Historical"], type: "anime" as const, rating: 8.7 },
    { id: "anime-5", title: "My Hero Academia", description: "Boy with superpowers attends hero academy", genres: ["Superhero", "Action", "School"], type: "anime" as const, rating: 8.5 },
    { id: "anime-6", title: "Naruto", description: "Young ninja seeks recognition and dreams of becoming Hokage", genres: ["Action", "Adventure", "Martial Arts"], type: "anime" as const, rating: 8.3 },
    { id: "anime-7", title: "Jujutsu Kaisen", description: "Students battle cursed spirits", genres: ["Action", "School", "Supernatural"], type: "anime" as const, rating: 8.5 },
    { id: "anime-8", title: "Tokyo Ghoul", description: "College student becomes half-ghoul", genres: ["Action", "Dark Fantasy", "Horror"], type: "anime" as const, rating: 8.0 },
    { id: "anime-9", title: "Vinland Saga", description: "Young Viking warrior seeks revenge", genres: ["Action", "Historical", "Drama"], type: "anime" as const, rating: 8.8 },
    { id: "anime-10", title: "Hunter x Hunter", description: "Boy becomes Hunter to find missing father", genres: ["Adventure", "Action", "Fantasy"], type: "anime" as const, rating: 9.0 },
    { id: "anime-11", title: "Steins;Gate", description: "Students discover time travel", genres: ["Sci-Fi", "Thriller", "Psychological"], type: "anime" as const, rating: 8.8 },
    { id: "anime-12", title: "Fullmetal Alchemist: Brotherhood", description: "Brothers seek Philosopher's Stone to restore bodies", genres: ["Adventure", "Dark Fantasy", "Steampunk"], type: "anime" as const, rating: 9.0 },
    { id: "anime-13", title: "Code Geass", description: "Exiled prince gains power to control others", genres: ["Action", "Mecha", "Alternate History"], type: "anime" as const, rating: 8.7 },
    { id: "anime-14", title: "Cowboy Bebop", description: "Bounty hunters travel space in futuristic world", genres: ["Space Western", "Neo-Noir", "Action"], type: "anime" as const, rating: 8.9 },
    { id: "anime-15", title: "Neon Genesis Evangelion", description: "Teenagers pilot giant mechs to save world", genres: ["Mecha", "Psychological", "Post-Apocalyptic"], type: "anime" as const, rating: 8.5 },
    { id: "anime-16", title: "Sword Art Online", description: "Players trapped in virtual reality MMORPG", genres: ["Sci-Fi", "Action", "Fantasy"], type: "anime" as const, rating: 7.6 },
    { id: "anime-17", title: "Blue Exorcist", description: "Son of Satan fights demons", genres: ["Action", "Dark Fantasy", "Supernatural"], type: "anime" as const, rating: 8.0 },
    { id: "anime-18", title: "Fairy Tail", description: "Wizards guild goes on magical adventures", genres: ["Action", "Adventure", "Fantasy"], type: "anime" as const, rating: 8.1 },
    { id: "anime-19", title: "Black Clover", description: "Orphan born without magic strives to become Wizard King", genres: ["Action", "Adventure", "Fantasy"], type: "anime" as const, rating: 8.4 },
    { id: "anime-20", title: "My Hero Academia: Heroes Rising", description: "Heroes face villain threatening to destroy Japan", genres: ["Superhero", "Action", "School"], type: "anime" as const, rating: 8.2 }
  ].map((anime, i) => ({
    ...anime,
    episodes: Array.from({ length: 5 }, (_, j) => ({
      episode: j + 1,
      rating: 8.0 + Math.random() * 2,
      title: `Episode ${j + 1}: ${anime.title.split(' ')[0]} Chronicles`
    })),
    popularityByRegion: [
      { region: "North America", popularity: 85 + Math.random() * 15 },
      { region: "Europe", popularity: 80 + Math.random() * 20 },
      { region: "Asia", popularity: 90 + Math.random() * 10 },
      { region: "Latin America", popularity: 75 + Math.random() * 25 },
      { region: "Africa", popularity: 70 + Math.random() * 30 }
    ],
    trendData: Array.from({ length: 7 }, (_, k) => ({
      date: new Date(Date.now() - (6 - k) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 80 + Math.random() * 20
    }))
  }));

  return {
    revenue: "$9.83B",
    subscribers: "282.7M",
    arm: "$11.60",
    churn: "2.4%",
    lastUpdated: new Date().toLocaleTimeString(),
    rawRevenue: 9830000000,
    rawSubscribers: 282700000,
    rawArm: 11.60,
    rawChurn: 2.4,
    trendingShows: shows,
    trendingMovies: movies,
    trendingAnime: anime
  };
}

// Mock data fallback
function getMockData(): LiveBenchmarks {
  return {
    revenue: "$9.83B",
    subscribers: "282.7M",
    arm: "$11.60",
    churn: "2.4%",
    lastUpdated: new Date().toLocaleTimeString(),
    rawRevenue: 9830000000,
    rawSubscribers: 282700000,
    rawArm: 11.60,
    rawChurn: 2.4,
    trendingShows: [
      {
        id: "1",
        title: "Stranger Things",
        description: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
        genres: ["Drama", "Fantasy", "Horror"],
        type: "show",
        rating: 8.7,
        episodes: [
          { episode: 1, rating: 8.5, title: "The Vanishing of Will Byers" },
          { episode: 2, rating: 8.8, title: "The Weirdo on Maple Street" },
          { episode: 3, rating: 9.1, title: "The Pollywog" },
          { episode: 4, rating: 8.9, title: "The Body" },
          { episode: 5, rating: 9.2, title: "The Flea and the Acrobat" }
        ],
        popularityByRegion: [
          { region: "North America", popularity: 95 },
          { region: "Europe", popularity: 88 },
          { region: "Asia", popularity: 92 }
        ],
        trendData: [
          { date: "2026-03-28", value: 95 },
          { date: "2026-03-29", value: 92 },
          { date: "2026-03-30", value: 88 },
          { date: "2026-03-31", value: 91 },
          { date: "2026-04-01", value: 94 },
          { date: "2026-04-02", value: 96 },
          { date: "2026-04-03", value: 93 }
        ]
      },
      {
        id: "2",
        title: "The Crown",
        description: "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the 20th century.",
        genres: ["Drama", "History"],
        type: "show",
        rating: 8.6,
        episodes: [
          { episode: 1, rating: 8.4, title: "Wolferton Splash" },
          { episode: 2, rating: 8.7, title: "The Group of Death" },
          { episode: 3, rating: 8.5, title: "Lisbon" },
          { episode: 4, rating: 8.8, title: "Act of God" },
          { episode: 5, rating: 8.9, title: "Smoke" }
        ],
        popularityByRegion: [
          { region: "North America", popularity: 89 },
          { region: "Europe", popularity: 94 },
          { region: "Asia", popularity: 76 }
        ],
        trendData: [
          { date: "2026-03-28", value: 89 },
          { date: "2026-03-29", value: 91 },
          { date: "2026-03-30", value: 94 },
          { date: "2026-03-31", value: 92 },
          { date: "2026-04-01", value: 88 },
          { date: "2026-04-02", value: 90 },
          { date: "2026-04-03", value: 93 }
        ]
      },
      {
        id: "3",
        title: "Wednesday",
        description: "Follows Wednesday Addams' years as a student at Nevermore Academy where she attempts to master her emerging psychic ability.",
        genres: ["Comedy", "Fantasy", "Mystery"],
        type: "show",
        rating: 8.1,
        episodes: [
          { episode: 1, rating: 8.0, title: "Wednesday's Child Is a Problem" },
          { episode: 2, rating: 8.2, title: "Woe What a Night" },
          { episode: 3, rating: 8.3, title: "Friend or Woe" },
          { episode: 4, rating: 8.1, title: "Woe What a Fest" },
          { episode: 5, rating: 8.4, title: "Thank You for Not Morphing" }
        ],
        popularityByRegion: [
          { region: "North America", popularity: 91 },
          { region: "Europe", popularity: 85 },
          { region: "Asia", popularity: 88 }
        ],
        trendData: [
          { date: "2026-03-28", value: 91 },
          { date: "2026-03-29", value: 88 },
          { date: "2026-03-30", value: 92 },
          { date: "2026-03-31", value: 90 },
          { date: "2026-04-01", value: 93 },
          { date: "2026-04-02", value: 95 },
          { date: "2026-04-03", value: 91 }
        ]
      }
    ],
    trendingMovies: [
      {
        id: "4",
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
        genres: ["Sci-Fi", "Adventure", "Drama"],
        type: "movie",
        rating: 8.8,
        popularityByRegion: [
          { region: "North America", popularity: 93 },
          { region: "Europe", popularity: 89 },
          { region: "Asia", popularity: 91 }
        ],
        trendData: [
          { date: "2026-03-28", value: 93 },
          { date: "2026-03-29", value: 95 },
          { date: "2026-03-30", value: 91 },
          { date: "2026-03-31", value: 89 },
          { date: "2026-04-01", value: 92 },
          { date: "2026-04-02", value: 94 },
          { date: "2026-04-03", value: 90 }
        ]
      },
      {
        id: "5",
        title: "The Super Mario Bros. Movie",
        description: "Two Brooklyn plumbers, Mario and Luigi, must travel to the Mushroom Kingdom to rescue Princess Peach from the evil Bowser.",
        genres: ["Adventure", "Comedy", "Family"],
        type: "movie",
        rating: 7.9,
        popularityByRegion: [
          { region: "North America", popularity: 87 },
          { region: "Europe", popularity: 82 },
          { region: "Asia", popularity: 95 }
        ],
        trendData: [
          { date: "2026-03-28", value: 87 },
          { date: "2026-03-29", value: 89 },
          { date: "2026-03-30", value: 91 },
          { date: "2026-03-31", value: 85 },
          { date: "2026-04-01", value: 88 },
          { date: "2026-04-02", value: 92 },
          { date: "2026-04-03", value: 90 }
        ]
      }
    ],
    trendingAnime: [
      {
        id: "6",
        title: "One Piece",
        description: "Follows Monkey D. Luffy and his pirate crew as they search for the ultimate treasure, the One Piece.",
        genres: ["Action", "Adventure", "Comedy"],
        type: "anime",
        rating: 8.9,
        popularityByRegion: [
          { region: "North America", popularity: 85 },
          { region: "Europe", popularity: 78 },
          { region: "Asia", popularity: 96 }
        ],
        trendData: [
          { date: "2026-03-28", value: 85 },
          { date: "2026-03-29", value: 87 },
          { date: "2026-03-30", value: 90 },
          { date: "2026-03-31", value: 92 },
          { date: "2026-04-01", value: 88 },
          { date: "2026-04-02", value: 94 },
          { date: "2026-04-03", value: 91 }
        ]
      },
      {
        id: "7",
        title: "Attack on Titan: Final Season",
        description: "Humanity's final battle against the Titans as the truth about the world is revealed.",
        genres: ["Action", "Drama", "Fantasy"],
        type: "anime",
        rating: 9.2,
        popularityByRegion: [
          { region: "North America", popularity: 91 },
          { region: "Europe", popularity: 88 },
          { region: "Asia", popularity: 95 }
        ],
        trendData: [
          { date: "2026-03-28", value: 91 },
          { date: "2026-03-29", value: 93 },
          { date: "2026-03-30", value: 95 },
          { date: "2026-03-31", value: 92 },
          { date: "2026-04-01", value: 89 },
          { date: "2026-04-02", value: 94 },
          { date: "2026-04-03", value: 90 }
        ]
      }
    ]
  };
}
