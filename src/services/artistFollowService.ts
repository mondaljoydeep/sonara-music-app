import { supabase } from "@/integrations/supabase/client";

export async function getFollowStats(slug: string) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const [{ count: total }, { count: today }] = await Promise.all([
    supabase
      .from("artist_follows")
      .select("*", { count: "exact", head: true })
      .eq("artist_slug", slug),
    supabase
      .from("artist_follows")
      .select("*", { count: "exact", head: true })
      .eq("artist_slug", slug)
      .gte("created_at", since.toISOString()),
  ]);
  return { total: total ?? 0, today: today ?? 0 };
}

export async function isFollowing(slug: string, userId: string) {
  const { data } = await supabase
    .from("artist_follows")
    .select("id")
    .eq("artist_slug", slug)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

export async function followArtist(slug: string, userId: string) {
  const { error } = await supabase
    .from("artist_follows")
    .insert({ artist_slug: slug, user_id: userId });
  if (error && !error.message.includes("duplicate")) throw error;
}

export async function unfollowArtist(slug: string, userId: string) {
  const { error } = await supabase
    .from("artist_follows")
    .delete()
    .eq("artist_slug", slug)
    .eq("user_id", userId);
  if (error) throw error;
}

// Deterministic monthly listeners — pseudo count derived from slug + day, so it
// looks alive and grows slowly each day, like Spotify-style stats.
export function getMonthlyListeners(slug: string, popularityHint = 1): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const base = 800_000 + (h % 70_000_000); // 0.8M – 70.8M
  const day = Math.floor(Date.now() / 86_400_000);
  const wobble = ((h ^ day) % 250_000); // small daily variance
  return Math.floor((base + wobble) * popularityHint);
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
