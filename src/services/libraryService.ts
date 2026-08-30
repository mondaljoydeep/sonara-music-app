import type { Track, Playlist } from "@/types/music";

const LIKED_KEY = "sonara_liked";
const RECENT_KEY = "sonara_recent";
const PLAYLISTS_KEY = "sonara_playlists";
const UPLOADS_KEY = "sonara_uploads";

// LIKED
export function getLikedSongs(): Track[] {
  return JSON.parse(localStorage.getItem(LIKED_KEY) || "[]");
}
export function isLiked(trackId: string): boolean {
  return getLikedSongs().some((t) => t.id === trackId);
}
export function toggleLike(track: Track): boolean {
  const liked = getLikedSongs();
  const idx = liked.findIndex((t) => t.id === track.id);
  if (idx >= 0) liked.splice(idx, 1);
  else liked.unshift({ ...track, likedAt: Date.now() });
  localStorage.setItem(LIKED_KEY, JSON.stringify(liked));
  return idx < 0;
}

// RECENTLY PLAYED
export function getRecentlyPlayed(): Track[] {
  return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
}
export function logRecentlyPlayed(track: Track) {
  const recent = getRecentlyPlayed().filter((t) => t.id !== track.id);
  recent.unshift({ ...track, playedAt: Date.now() });
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 50)));
}

// PLAYLISTS
export function getPlaylists(): Playlist[] {
  return JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || "[]");
}
export function createPlaylist(name: string): Playlist {
  const playlists = getPlaylists();
  const playlist: Playlist = {
    id: `pl_${Date.now()}`,
    name,
    tracks: [],
    createdAt: Date.now(),
  };
  playlists.push(playlist);
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  return playlist;
}
export function addToPlaylist(playlistId: string, track: Track): boolean {
  const playlists = getPlaylists();
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return false;
  if (pl.tracks.some((t) => t.id === track.id)) return false;
  pl.tracks.unshift({ ...track, addedAt: Date.now() });
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  return true;
}
export function removeFromPlaylist(playlistId: string, trackId: string) {
  const playlists = getPlaylists();
  const pl = playlists.find((p) => p.id === playlistId);
  if (!pl) return;
  pl.tracks = pl.tracks.filter((t) => t.id !== trackId);
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}
export function deletePlaylist(playlistId: string) {
  const playlists = getPlaylists().filter((p) => p.id !== playlistId);
  localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
}

// UPLOADS
export function getUploads(): Track[] {
  return JSON.parse(localStorage.getItem(UPLOADS_KEY) || "[]");
}
export function addUpload(track: Track) {
  const uploads = getUploads();
  uploads.unshift(track);
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads));
}
export function removeUpload(trackId: string) {
  const uploads = getUploads().filter((t) => t.id !== trackId);
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads));
}

// DOWNLOAD
export async function downloadTrack(track: Track) {
  if (track.source === "youtube") {
    toggleLike(track);
    return { success: true, method: "saved" as const };
  }
  const url = track.source === "audius" ? track.streamUrl : track.audioUrl;
  if (!url) return { success: false };
  const a = document.createElement("a");
  a.href = url;
  a.download = `${track.title} - ${track.artist}.mp3`;
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return { success: true, method: "download" as const };
}
