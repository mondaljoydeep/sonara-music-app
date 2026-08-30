const KEY = "sonara_fav_artists";
const ONBOARDED_KEY = "sonara_fav_onboarded";

type Listener = (a: string[]) => void;
let listeners: Listener[] = [];

export function getFavoriteArtists(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function setFavoriteArtists(artists: string[]) {
  localStorage.setItem(KEY, JSON.stringify(artists));
  listeners.forEach((l) => l(artists));
}

export function subscribeFavoriteArtists(fn: Listener) {
  listeners.push(fn);
  fn(getFavoriteArtists());
  return () => { listeners = listeners.filter((l) => l !== fn); };
}

export function hasOnboarded(): boolean {
  return localStorage.getItem(ONBOARDED_KEY) === "1";
}

export function markOnboarded() {
  localStorage.setItem(ONBOARDED_KEY, "1");
}

export function resetOnboarding() {
  localStorage.removeItem(ONBOARDED_KEY);
}
