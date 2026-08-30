import type { Track } from "@/types/music";

// Public JioSaavn proxy with CORS enabled. Fallback list in case primary is down.
const SAAVN_HOSTS = [
  "https://saavn.dev",
  "https://saavn-api-eight.vercel.app",
  "https://jiosaavan-api-2-harsh-patel.vercel.app",
  "https://jiosaavn-api-privatecvc2.vercel.app",
];

function decode(str: string) {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function pickUrl(arr: any[] | undefined, preferred: string[]): string | null {
  if (!Array.isArray(arr)) return null;
  for (const q of preferred) {
    const m = arr.find((x) => x?.quality === q);
    if (m?.url) return m.url;
  }
  return arr[arr.length - 1]?.url || null;
}

function mapSaavnSong(s: any): Track | null {
  const stream = pickUrl(s.downloadUrl, ["320kbps", "160kbps", "96kbps"]);
  if (!stream) return null;
  const artwork = pickUrl(s.image, ["500x500", "150x150", "50x50"]);
  const artists =
    s.artists?.primary?.map((a: any) => a.name).join(", ") ||
    s.primaryArtists ||
    s.subtitle ||
    "Unknown";
  return {
    id: `js_${s.id}`,
    title: decode(s.name || s.title || ""),
    artist: decode(artists),
    artwork,
    duration: typeof s.duration === "number" ? s.duration : Number(s.duration) || null,
    source: "saavn",
    genre: s.language || null,
    audioUrl: stream,
    playCount: typeof s.playCount === "number" ? s.playCount : undefined,
  };
}

async function fetchJSON(path: string): Promise<any | null> {
  for (const host of SAAVN_HOSTS) {
    try {
      const res = await fetch(`${host}${path}`);
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.success === false) continue;
      return data;
    } catch {
      // try next
    }
  }
  return null;
}

export async function searchSaavn(query: string, limit = 20): Promise<Track[]> {
  const data = await fetchJSON(
    `/api/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`
  );
  const results: any[] = data?.data?.results || data?.results || [];
  return results.map(mapSaavnSong).filter((t): t is Track => !!t);
}

// Curated home sections — Hindi to International
export const SAAVN_HOME_QUERIES = [
  { id: "trending-hindi", label: "🔥 Trending Hindi", query: "trending hindi 2024" },
  { id: "arijit", label: "🎤 Arijit Singh Hits", query: "arijit singh" },
  { id: "bollywood", label: "🎬 Bollywood Hits", query: "bollywood hits 2024" },
  { id: "punjabi", label: "🥁 Punjabi Hits", query: "punjabi 2024" },
  { id: "tamil", label: "🌟 Tamil Hits", query: "tamil hits 2024" },
  { id: "telugu", label: "✨ Telugu Hits", query: "telugu hits 2024" },
  { id: "english", label: "🎸 English Pop Hits", query: "english top hits 2024" },
  { id: "international", label: "🌍 Global Top", query: "top global hits" },
  { id: "kpop", label: "🇰🇷 K-Pop", query: "kpop bts blackpink" },
  { id: "lofi", label: "😌 Lo-Fi Chill", query: "lofi chill" },
  { id: "workout", label: "💪 Workout Energy", query: "workout edm 2024" },
  { id: "romantic", label: "❤️ Romantic", query: "romantic hindi english" },
  { id: "rap", label: "🎤 Hip-Hop / Rap", query: "rap hip hop 2024" },
  { id: "old", label: "📻 Old Classics", query: "old hindi classics kishore lata" },
];
