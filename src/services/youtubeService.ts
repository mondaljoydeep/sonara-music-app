import type { Track } from "@/types/music";
import { searchAudius } from "@/services/audiusService";

const YT_API_KEYS = [
  "AIzaSyAzWnH00KJFcyzVmOF5EHNurwnrBOkknZE",
  "AIzaSyDo8Q0F3Vv2TJQ7OME_A-R2xBPY9oZ_eOg",
];

let activeKeyIndex = 0;

interface DailyUsage {
  date: string;
  counts: number[];
}

// Guard against non-browser environments (SSR / build scripts) where
// localStorage is undefined at module evaluation time.
const hasStorage = typeof localStorage !== "undefined";

const dailyUsage: DailyUsage = JSON.parse(
  (hasStorage && localStorage.getItem("yt_daily_usage")) ||
    JSON.stringify({ date: "", counts: [0, 0] })
);

if (dailyUsage.date !== new Date().toDateString()) {
  dailyUsage.date = new Date().toDateString();
  dailyUsage.counts = [0, 0];
  if (hasStorage) localStorage.setItem("yt_daily_usage", JSON.stringify(dailyUsage));
}

function getKey() {
  return YT_API_KEYS[activeKeyIndex];
}

function rotateKey() {
  if (activeKeyIndex < YT_API_KEYS.length - 1) {
    activeKeyIndex++;
    return true;
  }
  return false;
}

function incrementUsage() {
  dailyUsage.counts[activeKeyIndex]++;
  if (dailyUsage.counts[activeKeyIndex] >= 9000) rotateKey();
  localStorage.setItem("yt_daily_usage", JSON.stringify(dailyUsage));
}

function cleanTitle(title: string) {
  return title
    .replace(/\(Official.*?\)/gi, "")
    .replace(/\[Official.*?\]/gi, "")
    .replace(/Official (Audio|Video|Lyrics)/gi, "")
    .replace(/\(Lyrics?\)/gi, "")
    .replace(/\[.*?\]/gi, "")
    .replace(/\(HD\)/gi, "")
    .replace(/ft\..+/gi, "")
    .trim();
}

function mapYTItem(item: any): Track {
  return {
    id: `yt_${item.id.videoId}`,
    videoId: item.id.videoId,
    title: cleanTitle(item.snippet.title),
    artist: (item.snippet.channelTitle || "")
      .replace(" - Topic", "")
      .replace("VEVO", "")
      .trim(),
    artwork:
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.medium?.url ||
      item.snippet.thumbnails?.default?.url ||
      null,
    duration: null,
    source: "youtube",
    genre: null,
  };
}

export async function searchYouTube(query: string, limit = 20): Promise<Track[]> {
  let attempts = 0;
  let quotaHit = false;
  while (attempts < YT_API_KEYS.length) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
          query
        )}&type=video&videoCategoryId=10&maxResults=${limit}&key=${getKey()}`
      );
      const data = await res.json();
      if (data.error?.code === 403) {
        quotaHit = true;
        if (!rotateKey()) break;
        attempts++;
        continue;
      }
      incrementUsage();
      return (data.items || [])
        .filter((it: any) => it.id?.videoId)
        .map(mapYTItem);
    } catch {
      attempts++;
    }
  }
  // Fallback to Audius when YouTube quota exhausted or fails
  if (quotaHit || attempts >= YT_API_KEYS.length) {
    try {
      return await searchAudius(query, limit);
    } catch {
      return [];
    }
  }
  return [];
}

export const HOME_QUERIES = [
  { id: "bollywood", label: "🎬 Bollywood Hits", query: "bollywood hits 2024 official audio" },
  { id: "hindi", label: "🎵 Hindi Songs", query: "hindi songs 2024 arijit pritam" },
  { id: "global", label: "🌍 Global Top Hits", query: "top global hits 2024" },
  { id: "kpop", label: "🇰🇷 K-Pop", query: "kpop bts blackpink 2024" },
  { id: "english", label: "🎸 English Hits", query: "english pop hits 2024" },
  { id: "lofi", label: "😌 Lo-Fi Chill", query: "lofi hip hop chill beats" },
  { id: "workout", label: "💪 Workout Energy", query: "workout gym music energy 2024" },
  { id: "punjabi", label: "🥁 Punjabi Hits", query: "punjabi hits 2024" },
  { id: "tamil", label: "🌟 Tamil Hits", query: "tamil hits 2024" },
  { id: "romantic", label: "❤️ Romantic", query: "romantic songs hindi english 2024" },
];
