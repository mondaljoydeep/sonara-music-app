import { supabase } from "@/integrations/supabase/client";
import type { Track } from "@/types/music";

export type SongStatus = "pending" | "approved" | "rejected";

export interface CreatorSong {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  genre: string | null;
  mood: string | null;
  vocal_style: string | null;
  lyrics: string | null;
  audio_url: string;
  artwork_url: string | null;
  duration_sec: number | null;
  status: SongStatus;
  ai_notes: string | null;
  plays: number;
  likes: number;
  created_at: string;
}

export interface UploadInput {
  title: string;
  description?: string;
  genre?: string;
  mood?: string;
  vocalStyle?: string;
  lyrics?: string;
  audioFile: File;
  artworkFile?: File | null;
}

async function uploadFile(bucket: string, userId: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  return uploadFile("avatars", userId, file);
}

export async function uploadCreatorSong(
  userId: string,
  input: UploadInput,
  onProgress?: (pct: number) => void,
): Promise<CreatorSong> {
  onProgress?.(10);
  const audio_url = await uploadFile("creator-audio", userId, input.audioFile);
  onProgress?.(55);
  let artwork_url: string | null = null;
  if (input.artworkFile) {
    artwork_url = await uploadFile("creator-artwork", userId, input.artworkFile);
  }
  onProgress?.(70);

  // AI safety verification
  let status: SongStatus = "approved";
  let ai_notes = "Auto-approved by Sonara AI.";
  try {
    const { data, error } = await supabase.functions.invoke("verify-upload", {
      body: {
        title: input.title,
        description: input.description,
        lyrics: input.lyrics,
        genre: input.genre,
      },
    });
    if (!error && data) {
      status = data.safe ? "approved" : "rejected";
      ai_notes = data.reason || ai_notes;
    }
  } catch (e) {
    console.warn("verify-upload failed, defaulting to approved", e);
  }
  onProgress?.(85);

  const { data: row, error } = await supabase
    .from("creator_songs")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description || null,
      genre: input.genre || null,
      mood: input.mood || null,
      vocal_style: input.vocalStyle || null,
      lyrics: input.lyrics || null,
      audio_url,
      artwork_url,
      status,
      ai_notes,
    })
    .select()
    .single();
  if (error) throw error;
  onProgress?.(100);
  return row as CreatorSong;
}

export async function listApprovedSongs(limit = 60): Promise<CreatorSong[]> {
  const { data, error } = await supabase
    .from("creator_songs")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error(error);
    return [];
  }
  return (data || []) as CreatorSong[];
}

export async function listMySongs(userId: string): Promise<CreatorSong[]> {
  const { data, error } = await supabase
    .from("creator_songs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data || []) as CreatorSong[];
}

export async function listSongsByCreator(userId: string): Promise<CreatorSong[]> {
  const { data, error } = await supabase
    .from("creator_songs")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data || []) as CreatorSong[];
}

export async function deleteSong(id: string) {
  await supabase.from("creator_songs").delete().eq("id", id);
}

export function songToTrack(s: CreatorSong, artistName: string): Track {
  return {
    id: `cs_${s.id}`,
    title: s.title,
    artist: artistName,
    artwork: s.artwork_url,
    audioUrl: s.audio_url,
    duration: s.duration_sec ?? null,
    source: "uploaded",
    genre: s.genre || null,
    uploadedAt: new Date(s.created_at).getTime(),
  };
}
