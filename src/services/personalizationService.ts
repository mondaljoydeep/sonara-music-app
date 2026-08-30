import type { Track } from "@/types/music";
import { logRecentlyPlayed } from "./libraryService";
import { getFavoriteArtists } from "./favoriteArtistsService";

const KEY = "sonara_profile";

export interface Profile {
  artists: Record<string, number>;
  genres: Record<string, number>;
  languages: Record<string, number>;
  totalPlays: number;
}

export function getProfile(): Profile {
  return JSON.parse(
    localStorage.getItem(KEY) ||
      JSON.stringify({ artists: {}, genres: {}, languages: {}, totalPlays: 0 })
  );
}

function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

function detectLang(title = "", artist = ""): string {
  const text = (title + " " + artist).toLowerCase();
  const hindi = ["arijit", "pritam", "rahman", "shreya", "atif", "neha", "jubin", "armaan", "sonu", "udit", "lata", "kishore", "rafi", "asha", "kavita"];
  const kpop = ["bts", "blackpink", "exo", "twice", "stray kids", "nct", "ive", "aespa", "seventeen"];
  const tamil = ["anirudh", "harris jayaraj", "ilayaraja", "yuvan", "dhanush", "vijay", "ajith"];
  const punjabi = ["diljit", "ap dhillon", "sidhu", "shubh", "karan aujla", "imran khan"];
  if (hindi.some((a) => text.includes(a)) || /[\u0900-\u097F]/.test(title)) return "Hindi";
  if (kpop.some((a) => text.includes(a)) || /[\uAC00-\uD7AF]/.test(title)) return "Korean";
  if (tamil.some((a) => text.includes(a))) return "Tamil";
  if (punjabi.some((a) => text.includes(a))) return "Punjabi";
  return "English";
}

export function logPlay(track: Track) {
  const p = getProfile();
  p.totalPlays++;
  if (track.artist) p.artists[track.artist] = (p.artists[track.artist] || 0) + 1;
  if (track.genre) p.genres[track.genre] = (p.genres[track.genre] || 0) + 1;
  const lang = detectLang(track.title, track.artist);
  p.languages[lang] = (p.languages[lang] || 0) + 1;
  saveProfile(p);
  logRecentlyPlayed(track);
}

export function getTopArtists(n = 3): string[] {
  const p = getProfile();
  return Object.entries(p.artists)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name]) => name);
}

export function getTopLanguage(): string | null {
  const p = getProfile();
  const langs = Object.entries(p.languages).sort((a, b) => b[1] - a[1]);
  return langs[0]?.[0] || null;
}

export function getPersonalizedQueries(): { label: string; query: string }[] {
  const queries: { label: string; query: string }[] = [];
  // Favorites picked at onboarding take top priority
  const favs = getFavoriteArtists();
  favs.slice(0, 4).forEach((a) => {
    queries.push({ label: `⭐ ${a} for you`, query: `${a} hits` });
  });
  // Then learned top artists
  const artists = getTopArtists(2);
  artists.forEach((a) => {
    if (favs.some((f) => f.toLowerCase() === a.toLowerCase())) return;
    queries.push({ label: `🎵 More of ${a}`, query: `${a} best songs` });
  });
  const lang = getTopLanguage();
  if (lang === "Hindi") queries.push({ label: "🇮🇳 Because you love Hindi music", query: "latest hindi songs 2024" });
  if (lang === "Korean") queries.push({ label: "🇰🇷 Because you love K-Pop", query: "kpop hits 2024" });
  if (lang === "Tamil") queries.push({ label: "🌟 Because you love Tamil music", query: "tamil hits 2024" });
  if (lang === "Punjabi") queries.push({ label: "🥁 Because you love Punjabi music", query: "punjabi hits 2024" });
  return queries;
}

// Personalized trending query — mixes user's favourite artists, top learned artist,
// and top language so the "Trending Now" strip always has rich artwork tracks
// pulled from JioSaavn (never blank Audius fallbacks).
export function getPersonalizedTrendingQuery(): string {
  const favs = getFavoriteArtists();
  const topArtists = getTopArtists(2);
  const lang = getTopLanguage();
  const pool = [...favs.slice(0, 2), ...topArtists];
  if (pool.length > 0) {
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return `${pick} trending`;
  }
  if (lang === "Hindi") return "trending hindi 2024";
  if (lang === "Korean") return "kpop trending 2024";
  if (lang === "Tamil") return "tamil trending 2024";
  if (lang === "Punjabi") return "punjabi trending 2024";
  return "trending hits 2024";
}
