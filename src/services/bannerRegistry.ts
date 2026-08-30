import bollywood from "@/assets/banners/bollywood.jpg";
import punjabi from "@/assets/banners/punjabi.jpg";
import tamil from "@/assets/banners/tamil.jpg";
import telugu from "@/assets/banners/telugu.jpg";
import english from "@/assets/banners/english.jpg";
import kpop from "@/assets/banners/kpop.jpg";
import lofi from "@/assets/banners/lofi.jpg";
import workout from "@/assets/banners/workout.jpg";
import romantic from "@/assets/banners/romantic.jpg";
import rap from "@/assets/banners/rap.jpg";
import old from "@/assets/banners/old.jpg";
import trending from "@/assets/banners/trending.jpg";
import hindi from "@/assets/banners/hindi.jpg";
import international from "@/assets/banners/international.jpg";

/** Maps a section id to a cinematic AI-generated banner image. */
export const SECTION_BANNERS: Record<string, string> = {
  "trending-hindi": hindi,
  arijit: hindi,
  bollywood,
  punjabi,
  tamil,
  telugu,
  english,
  international,
  kpop,
  lofi,
  workout,
  romantic,
  rap,
  old,
  trending,
};

export function getBannerForSection(id: string): string | null {
  return SECTION_BANNERS[id] || null;
}
