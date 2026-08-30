import type { Track } from "@/types/music";
import { searchSaavn } from "./saavnService";
import { searchYouTube } from "./youtubeService";

const CACHE_PREFIX = "sonara:newRel:v1:";
const TTL_MS = 24 * 60 * 60 * 1000;

export interface LangFeed {
  id: string;
  label: string;
  query: string;
}

const YEAR = new Date().getFullYear();

export const LANGUAGE_FEEDS: LangFeed[] = [
  { id: "hindi", label: "🇮🇳 New Hindi", query: `new hindi songs ${YEAR}` },
  { id: "punjabi", label: "🥁 New Punjabi", query: `new punjabi songs ${YEAR}` },
  { id: "tamil", label: "🌟 New Tamil", query: `new tamil songs ${YEAR}` },
  { id: "telugu", label: "✨ New Telugu", query: `new telugu songs ${YEAR}` },
  { id: "english", label: "🎸 New English", query: `new english songs ${YEAR}` },
  { id: "kpop", label: "🇰🇷 New K-Pop", query: `new kpop songs ${YEAR}` },
  { id: "malayalam", label: "🟣 New Malayalam", query: `new malayalam songs ${YEAR}` },
  { id: "bengali", label: "🟤 New Bengali", query: `new bengali songs ${YEAR}` },
  { id: "spanish", label: "🌶️ New Latin", query: `new latin reggaeton ${YEAR}` },
  { id: "global", label: "🌍 Global Fresh", query: `top new releases ${YEAR}` },
];

function readCache(key: string): Track[] | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > TTL_MS) return null;
    return data as Track[];
  } catch {
    return null;
  }
}
function writeCache(key: string, data: Track[]) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

export async function getNewReleases(feed: LangFeed): Promise<Track[]> {
  const cached = readCache(feed.id);
  if (cached && cached.length) return cached;
  const [js, yt] = await Promise.allSettled([
    searchSaavn(feed.query, 18),
    searchYouTube(feed.query, 8),
  ]);
  const all: Track[] = [];
  if (js.status === "fulfilled") all.push(...js.value);
  if (yt.status === "fulfilled") all.push(...yt.value);
  const seen = new Set<string>();
  const dedup = all.filter((t) => {
    const k = `${t.title.toLowerCase()}__${t.artist.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  writeCache(feed.id, dedup);
  return dedup;
}
