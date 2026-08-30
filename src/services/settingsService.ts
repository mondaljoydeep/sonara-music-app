import type { EqBands } from "./audioEffects";

export interface Settings {
  audioQuality: "high" | "medium" | "low";
  autoplay: boolean;
  crossfade: number; // seconds 0-12
  lyricsOnMini: boolean;
  queueChooser: boolean; // ask Play Now / Next / Queue on tap
  eqEnabled: boolean;
  eqPreset: string;
  eqGains: EqBands;
  playbackRate: number; // 0.5 - 2
}

const KEY = "sonara_settings";
const DEFAULTS: Settings = {
  audioQuality: "high",
  autoplay: true,
  crossfade: 0,
  lyricsOnMini: true,
  queueChooser: true,
  eqEnabled: false,
  eqPreset: "Flat",
  eqGains: [0, 0, 0, 0, 0],
  playbackRate: 1,
};

type Listener = (s: Settings) => void;
let listeners: Listener[] = [];

export function getSettings(): Settings {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...DEFAULTS };
  }
}

export function updateSettings(patch: Partial<Settings>) {
  const next = { ...getSettings(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l(next));
}

export function subscribeSettings(fn: Listener) {
  listeners.push(fn);
  fn(getSettings());
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function clearAllData() {
  const keep = ["yt_daily_usage"];
  Object.keys(localStorage)
    .filter((k) => k.startsWith("sonara_") || k.startsWith("yt_") || k.startsWith("audius_"))
    .forEach((k) => {
      if (!keep.includes(k)) localStorage.removeItem(k);
    });
}
