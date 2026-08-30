// Universal Track shape used across the app
export interface Track {
  id: string;
  videoId?: string;
  audiusId?: string;
  title: string;
  artist: string;
  artwork: string | null;
  duration: number | null;
  source: "youtube" | "audius" | "uploaded" | "saavn";
  genre: string | null;
  audioUrl?: string;
  streamUrl?: string;
  playCount?: number;
  likedAt?: number;
  playedAt?: number;
  addedAt?: number;
  uploadedAt?: number;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
}

export type RepeatMode = "off" | "all" | "one";

export interface PlayerState {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  queue: Track[];
  queueIndex: number;
  shuffle: boolean;
  repeat: RepeatMode;
  sleepRemainingMs: number | null;
  sleepEndOfSong: boolean;
}
