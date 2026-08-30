import type { Track } from "@/types/music";
import { searchSaavn } from "./saavnService";

// AI DJ — builds an unlimited, multilingual party mix on demand.
// Pulls trending across languages, dedupes by id, and shuffles into a long party set.
const DJ_QUERIES = [
  "party hits 2024 hindi",
  "punjabi party 2024",
  "bollywood dance hits",
  "english party hits 2024",
  "edm party",
  "kpop dance hits",
  "tamil party hits",
  "telugu party hits",
  "spanish party reggaeton",
  "afrobeats party",
  "arabic party hits",
  "hip hop party 2024",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function buildAIDjSet(limitPerBucket = 8): Promise<Track[]> {
  const buckets = await Promise.all(
    DJ_QUERIES.map((q) => searchSaavn(q, limitPerBucket).catch(() => [] as Track[]))
  );
  const seen = new Set<string>();
  const merged: Track[] = [];
  // Interleave across languages so the set never sits on one vibe
  const max = Math.max(...buckets.map((b) => b.length));
  for (let i = 0; i < max; i++) {
    for (const b of shuffle(buckets)) {
      const t = b[i];
      if (t && !seen.has(t.id)) {
        seen.add(t.id);
        merged.push(t);
      }
    }
  }
  return merged;
}
