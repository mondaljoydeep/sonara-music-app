import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { PlayerState, Track, RepeatMode } from "@/types/music";
import * as engine from "@/services/audioEngine";

interface PlayerContextValue extends PlayerState {
  playTrack: (track: Track) => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  seek: (s: number) => void;
  seekRelative: (delta: number) => void;
  next: () => void;
  prev: () => void;
  playNext: (track: Track) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
  clearQueue: () => void;
  toggleShuffle: () => boolean;
  cycleRepeat: () => RepeatMode;
  setSleepTimer: (m: number | "endOfSong" | null) => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlayerState>({
    track: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    queue: [],
    queueIndex: 0,
    shuffle: false,
    repeat: "off",
    sleepRemainingMs: null,
    sleepEndOfSong: false,
  });

  useEffect(() => {
    engine.initYouTube();
    const unsub = engine.subscribe(setState);
    return unsub;
  }, []);

  const value: PlayerContextValue = {
    ...state,
    playTrack: (t) => engine.playTrack(t),
    setQueue: (tracks, idx) => engine.setQueue(tracks, idx),
    togglePlay: () => engine.togglePlay(),
    seek: (s) => engine.seek(s),
    seekRelative: (d) => engine.seekRelative(d),
    next: () => engine.nextTrack(),
    prev: () => engine.prevTrack(),
    playNext: (t) => engine.playNext(t),
    addToQueue: (t) => engine.addToQueue(t),
    removeFromQueue: (i) => engine.removeFromQueue(i),
    reorderQueue: (f, t) => engine.reorderQueue(f, t),
    clearQueue: () => engine.clearQueue(),
    toggleShuffle: () => engine.toggleShuffle(),
    cycleRepeat: () => engine.cycleRepeat(),
    setSleepTimer: (m) => engine.setSleepTimer(m),
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
