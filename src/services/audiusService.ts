import type { Track } from "@/types/music";

let AUDIUS_HOST: string | null = null;

async function getHost(): Promise<string> {
  if (AUDIUS_HOST) return AUDIUS_HOST;
  try {
    const res = await fetch("https://api.audius.co");
    const data = await res.json();
    AUDIUS_HOST = data.data[0];
    return AUDIUS_HOST!;
  } catch {
    AUDIUS_HOST = "https://discoveryprovider.audius.co";
    return AUDIUS_HOST;
  }
}

function mapAudiusTrack(track: any): Track {
  return {
    id: `au_${track.id}`,
    audiusId: track.id,
    title: track.title,
    artist: track.user?.name || "Unknown",
    artwork:
      track.artwork?.["480x480"] ||
      track.artwork?.["150x150"] ||
      null,
    duration: track.duration ?? null,
    genre: track.genre || null,
    playCount: track.play_count,
    source: "audius",
  };
}

export async function searchAudius(query: string, limit = 20): Promise<Track[]> {
  try {
    const host = await getHost();
    const res = await fetch(
      `${host}/v1/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}&app_name=Sonara`
    );
    const data = await res.json();
    return (data.data || []).map(mapAudiusTrack);
  } catch {
    return [];
  }
}

export async function getTrending(genre = "", limit = 20): Promise<Track[]> {
  try {
    const host = await getHost();
    const g = genre ? `&genre=${encodeURIComponent(genre)}` : "";
    const res = await fetch(
      `${host}/v1/tracks/trending?limit=${limit}${g}&app_name=Sonara`
    );
    const data = await res.json();
    return (data.data || []).map(mapAudiusTrack);
  } catch {
    return [];
  }
}

export async function getAudiusStreamUrl(audiusId: string): Promise<string> {
  const host = await getHost();
  return `${host}/v1/tracks/${audiusId}/stream?app_name=Sonara`;
}
