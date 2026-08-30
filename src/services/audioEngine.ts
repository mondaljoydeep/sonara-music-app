import type { Track, PlayerState } from "@/types/music";
import { getAudiusStreamUrl } from "./audiusService";
import { logPlay } from "./personalizationService";
import { getSettings, subscribeSettings } from "./settingsService";
import { attachEqualizer, setEqEnabled, resumeContext } from "./audioEffects";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export type RepeatMode = "off" | "all" | "one";

const htmlPlayer = new Audio();
htmlPlayer.crossOrigin = "anonymous";
htmlPlayer.preload = "metadata";

// Crossfade secondary audio element (Audius/uploaded only)
const fadePlayer = new Audio();
fadePlayer.crossOrigin = "anonymous";
fadePlayer.preload = "metadata";

// Attach equalizer chain and react to settings (EQ + playback rate).
attachEqualizer(htmlPlayer);
subscribeSettings((s) => {
  setEqEnabled(s.eqEnabled, s.eqGains);
  if (Math.abs(htmlPlayer.playbackRate - s.playbackRate) > 0.001) {
    htmlPlayer.playbackRate = s.playbackRate;
  }
});

let ytPlayer: any = null;
let ytReady = false;
let ytInitStarted = false;

let currentTrack: Track | null = null;
let queue: Track[] = [];
let originalQueue: Track[] = []; // for un-shuffle
let queueIndex = 0;
let isPlaying = false;
let activeSource: Track["source"] | null = null;
let pendingYTVideoId: string | null = null;

let shuffle = false;
let repeat: RepeatMode = "off";

// Sleep timer
let sleepTimerId: number | null = null;
let sleepEndAt: number | null = null;
let sleepEndOfSong = false;

type Listener = (s: PlayerState) => void;
let listeners: Listener[] = [];

export function subscribe(fn: Listener) {
  listeners.push(fn);
  fn(getState());
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

function getState(): PlayerState {
  return {
    track: currentTrack,
    isPlaying,
    currentTime: getCurrentTime(),
    duration: getDuration(),
    queue,
    queueIndex,
    shuffle,
    repeat,
    sleepRemainingMs: sleepEndAt ? Math.max(0, sleepEndAt - Date.now()) : null,
    sleepEndOfSong,
  };
}

function emit() {
  listeners.forEach((fn) => fn(getState()));
}

export function initYouTube() {
  if (ytInitStarted) return;
  ytInitStarted = true;

  if (!document.getElementById("yt-player")) {
    const div = document.createElement("div");
    div.id = "yt-player";
    div.style.cssText =
      "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;bottom:0;left:0;z-index:-1";
    document.body.appendChild(div);
  }

  window.onYouTubeIframeAPIReady = () => {
    ytPlayer = new window.YT.Player("yt-player", {
      height: "1",
      width: "1",
      playerVars: {
        autoplay: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          ytReady = true;
          if (pendingYTVideoId) {
            ytPlayer.loadVideoById(pendingYTVideoId);
            pendingYTVideoId = null;
          }
        },
        onStateChange: (e: any) => {
          if (e.data === 1) {
            isPlaying = true;
            emit();
          } else if (e.data === 2) {
            isPlaying = false;
            emit();
          } else if (e.data === 0) {
            handleTrackEnd();
          }
        },
      },
    });
  };

  if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  }
}

htmlPlayer.addEventListener("timeupdate", () => {
  maybeCrossfade();
  emit();
});
htmlPlayer.addEventListener("loadedmetadata", () => emit());
htmlPlayer.addEventListener("ended", handleTrackEnd);
htmlPlayer.addEventListener("play", () => {
  isPlaying = true;
  emit();
});
htmlPlayer.addEventListener("pause", () => {
  isPlaying = false;
  emit();
});

function handleTrackEnd() {
  if (sleepEndOfSong) {
    sleepEndOfSong = false;
    sleepEndAt = null;
    pauseAll();
    isPlaying = false;
    emit();
    return;
  }
  if (repeat === "one" && currentTrack) {
    void playTrack(currentTrack);
    return;
  }
  if (queueIndex < queue.length - 1) {
    queueIndex++;
    void playTrack(queue[queueIndex]);
  } else if (repeat === "all" && queue.length > 0) {
    queueIndex = 0;
    void playTrack(queue[0]);
  } else {
    isPlaying = false;
    emit();
  }
}

let crossfading = false;
function maybeCrossfade() {
  const settings = getSettings();
  const cf = settings.crossfade;
  if (!cf || cf <= 0) return;
  if (crossfading) return;
  if (activeSource === "youtube") return; // crossfade only supported for HTML audio
  if (queueIndex >= queue.length - 1) return;
  const dur = htmlPlayer.duration;
  if (!dur || isNaN(dur)) return;
  const remaining = dur - htmlPlayer.currentTime;
  if (remaining > cf + 0.2) return;

  const nextTrack = queue[queueIndex + 1];
  if (!nextTrack || nextTrack.source === "youtube") return;

  crossfading = true;
  void (async () => {
    try {
      const url =
        nextTrack.source === "audius" && nextTrack.audiusId
          ? await getAudiusStreamUrl(nextTrack.audiusId)
          : nextTrack.audioUrl || "";
      fadePlayer.src = url;
      fadePlayer.volume = 0;
      await fadePlayer.play().catch(() => {});

      const startVol = htmlPlayer.volume;
      const steps = 20;
      const interval = (cf * 1000) / steps;
      let i = 0;
      const fadeId = window.setInterval(() => {
        i++;
        const t = i / steps;
        htmlPlayer.volume = Math.max(0, startVol * (1 - t));
        fadePlayer.volume = Math.min(1, t);
        if (i >= steps) {
          window.clearInterval(fadeId);
          // swap
          htmlPlayer.pause();
          htmlPlayer.src = fadePlayer.src;
          htmlPlayer.currentTime = fadePlayer.currentTime;
          htmlPlayer.volume = 1;
          fadePlayer.pause();
          fadePlayer.removeAttribute("src");
          void htmlPlayer.play().catch(() => {});
          queueIndex++;
          currentTrack = nextTrack;
          activeSource = nextTrack.source;
          try { logPlay(nextTrack); } catch { /* ignore */ }
          updateMediaSession(nextTrack);
          crossfading = false;
          emit();
        }
      }, interval);
    } catch {
      crossfading = false;
    }
  })();
}

function pauseAll() {
  try { htmlPlayer.pause(); } catch { /* ignore */ }
  try { ytPlayer?.pauseVideo?.(); } catch { /* ignore */ }
}

export async function playTrack(track: Track) {
  crossfading = false;
  fadePlayer.pause();
  fadePlayer.removeAttribute("src");
  htmlPlayer.volume = 1;

  currentTrack = track;
  activeSource = track.source;

  try {
    logPlay(track);
  } catch {
    // ignore
  }

  if (track.source === "youtube") {
    try {
      htmlPlayer.pause();
      htmlPlayer.removeAttribute("src");
      htmlPlayer.load();
    } catch {
      // ignore
    }
    if (ytReady && ytPlayer && track.videoId) {
      ytPlayer.loadVideoById(track.videoId);
    } else if (track.videoId) {
      pendingYTVideoId = track.videoId;
    }
  } else {
    try {
      ytPlayer?.pauseVideo?.();
    } catch {
      // ignore
    }
    const url =
      track.source === "audius" && track.audiusId
        ? await getAudiusStreamUrl(track.audiusId)
        : track.audioUrl || track.streamUrl || "";
    htmlPlayer.src = url;
    try {
      htmlPlayer.playbackRate = getSettings().playbackRate;
      resumeContext();
      await htmlPlayer.play();
    } catch {
      // autoplay can fail silently
    }
  }

  updateMediaSession(track);
  emit();
}

export function togglePlay() {
  if (!currentTrack) return;
  if (isPlaying) {
    if (activeSource === "youtube") ytPlayer?.pauseVideo?.();
    else htmlPlayer.pause();
  } else {
    if (activeSource === "youtube") ytPlayer?.playVideo?.();
    else void htmlPlayer.play().catch(() => {});
  }
}

export function seek(seconds: number) {
  if (activeSource === "youtube") {
    ytPlayer?.seekTo?.(seconds, true);
  } else {
    htmlPlayer.currentTime = seconds;
  }
  emit();
}

export function seekRelative(delta: number) {
  seek(Math.max(0, getCurrentTime() + delta));
}

export function getCurrentTime(): number {
  if (activeSource === "youtube") {
    try {
      return ytPlayer?.getCurrentTime?.() || 0;
    } catch {
      return 0;
    }
  }
  return htmlPlayer.currentTime || 0;
}

export function getDuration(): number {
  if (activeSource === "youtube") {
    try {
      return ytPlayer?.getDuration?.() || 0;
    } catch {
      return 0;
    }
  }
  return htmlPlayer.duration || 0;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function setQueue(tracks: Track[], startIndex = 0) {
  originalQueue = [...tracks];
  if (shuffle && tracks.length > 1) {
    const start = tracks[startIndex];
    const rest = tracks.filter((_, i) => i !== startIndex);
    queue = [start, ...shuffleArray(rest)];
    queueIndex = 0;
  } else {
    queue = [...tracks];
    queueIndex = Math.max(0, Math.min(startIndex, queue.length - 1));
  }
  if (queue.length) void playTrack(queue[queueIndex]);
}

export function nextTrack() {
  if (queueIndex < queue.length - 1) {
    queueIndex++;
    void playTrack(queue[queueIndex]);
  } else if (repeat === "all" && queue.length > 0) {
    queueIndex = 0;
    void playTrack(queue[0]);
  }
}

export function prevTrack() {
  if (getCurrentTime() > 3) {
    seek(0);
  } else if (queueIndex > 0) {
    queueIndex--;
    void playTrack(queue[queueIndex]);
  } else {
    seek(0);
  }
}

export function playNext(track: Track) {
  const insertAt = queueIndex + 1;
  queue.splice(insertAt, 0, track);
  emit();
}

export function addToQueue(track: Track) {
  queue.push(track);
  emit();
}

export function removeFromQueue(index: number) {
  if (index < 0 || index >= queue.length) return;
  if (index === queueIndex) {
    // if removing current, advance
    queue.splice(index, 1);
    if (queueIndex >= queue.length) queueIndex = Math.max(0, queue.length - 1);
    if (queue.length) void playTrack(queue[queueIndex]);
    else { pauseAll(); currentTrack = null; isPlaying = false; }
  } else {
    queue.splice(index, 1);
    if (index < queueIndex) queueIndex--;
  }
  emit();
}

export function clearQueue() {
  // keep current track playing, but empty the up-next list
  if (currentTrack) {
    queue = [currentTrack];
    queueIndex = 0;
  } else {
    queue = [];
    queueIndex = 0;
  }
  emit();
}

export function reorderQueue(from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= queue.length || to >= queue.length) return;
  const [item] = queue.splice(from, 1);
  queue.splice(to, 0, item);
  if (from === queueIndex) queueIndex = to;
  else if (from < queueIndex && to >= queueIndex) queueIndex--;
  else if (from > queueIndex && to <= queueIndex) queueIndex++;
  emit();
}

export function setShuffle(on: boolean) {
  shuffle = on;
  if (queue.length <= 1) { emit(); return; }
  if (on) {
    const cur = queue[queueIndex];
    const rest = queue.filter((_, i) => i !== queueIndex);
    queue = [cur, ...shuffleArray(rest)];
    queueIndex = 0;
  } else if (originalQueue.length) {
    const cur = queue[queueIndex];
    queue = [...originalQueue];
    const i = queue.findIndex((t) => t.id === cur.id);
    queueIndex = i >= 0 ? i : 0;
  }
  emit();
}

export function toggleShuffle() {
  setShuffle(!shuffle);
  return shuffle;
}

export function cycleRepeat(): RepeatMode {
  repeat = repeat === "off" ? "all" : repeat === "all" ? "one" : "off";
  emit();
  return repeat;
}

export function getQueue() { return queue; }
export function getQueueIndex() { return queueIndex; }
export function getCurrentTrack() { return currentTrack; }
export function getIsPlaying() { return isPlaying; }
export function getShuffle() { return shuffle; }
export function getRepeat() { return repeat; }

// Sleep timer
export function setSleepTimer(minutes: number | "endOfSong" | null) {
  if (sleepTimerId) { window.clearTimeout(sleepTimerId); sleepTimerId = null; }
  sleepEndAt = null;
  sleepEndOfSong = false;
  if (minutes === null) { emit(); return; }
  if (minutes === "endOfSong") {
    sleepEndOfSong = true;
    emit();
    return;
  }
  const ms = minutes * 60 * 1000;
  sleepEndAt = Date.now() + ms;
  sleepTimerId = window.setTimeout(() => {
    pauseAll();
    isPlaying = false;
    sleepEndAt = null;
    emit();
  }, ms);
  emit();
}

function updateMediaSession(track: Track) {
  if (!("mediaSession" in navigator)) return;
  try {
    // Build a multi-size artwork list. Always include the Sonara icon at smaller
    // sizes so the OS lock-screen / notification shade shows Sonara branding
    // (album cover label) instead of the browser's default logo.
    const artwork: MediaImage[] = [];
    if (track.artwork) {
      artwork.push(
        { src: track.artwork, sizes: "512x512", type: "image/jpeg" },
        { src: track.artwork, sizes: "256x256", type: "image/jpeg" },
      );
    }
    artwork.push(
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    );

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: "Sonara — Feel Every Beat",
      artwork,
    });
    navigator.mediaSession.setActionHandler("play", () => togglePlay());
    navigator.mediaSession.setActionHandler("pause", () => togglePlay());
    navigator.mediaSession.setActionHandler("nexttrack", () => nextTrack());
    navigator.mediaSession.setActionHandler("previoustrack", () => prevTrack());
    navigator.mediaSession.setActionHandler("seekto", (d: any) => {
      if (typeof d.seekTime === "number") seek(d.seekTime);
    });
  } catch {
    // ignore
  }
}


setInterval(() => {
  if (activeSource === "youtube" && isPlaying) emit();
  if (sleepEndAt) emit();
}, 500);
