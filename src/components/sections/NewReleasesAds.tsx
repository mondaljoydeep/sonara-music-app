import { ScrollRow } from "@/components/sections/ScrollRow";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Track } from "@/types/music";
import { searchYouTube } from "@/services/youtubeService";
import { usePlayer } from "@/context/PlayerContext";
import { getProfile } from "@/services/personalizationService";

const HIDE_KEY = "sonara:hideAds";

export function NewReleasesAds() {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [hidden, setHidden] = useState<boolean>(
    () => localStorage.getItem(HIDE_KEY) === "1"
  );
  const { setQueue } = usePlayer();

  useEffect(() => {
    if (hidden) return;
    const profile: any = getProfile();
    const genres = profile?.genres || profile?.topGenres || {};
    const topGenre = Array.isArray(genres)
      ? (genres[0] || "").toString().toLowerCase()
      : Object.keys(genres)[0]?.toLowerCase() || "";
    const query = topGenre
      ? `new ${topGenre} releases 2026`
      : "new music releases 2026 official";
    searchYouTube(query, 8).then((res) => {
      // keep only ones with video IDs (YouTube source)
      setTracks(res.filter((t) => !!t.videoId).slice(0, 6));
    });
  }, [hidden]);

  if (hidden || !tracks || tracks.length === 0) return null;

  const dismiss = () => {
    localStorage.setItem(HIDE_KEY, "1");
    setHidden(true);
  };

  return (
    <section className="px-4 sm:px-6 lg:px-12 xl:px-16 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">📀 New Releases — For You</h2>
        <button
          onClick={dismiss}
          className="text-xs text-[#b3b3b3] hover:text-white flex items-center gap-1"
          aria-label="Hide new releases"
        >
          <X size={14} /> Hide
        </button>
      </div>
      <ScrollRow>
        {tracks.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setQueue(tracks, i)}
            className="flex-shrink-0 w-56 sm:w-64 text-left group"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 ring-1 ring-white/10 group-hover:ring-white/40 transition">
              <iframe
                src={`https://www.youtube.com/embed/${t.videoId}?autoplay=1&mute=1&loop=1&playlist=${t.videoId}&controls=0&modestbranding=1&playsinline=1&rel=0`}
                title={t.title}
                className="absolute inset-0 w-full h-full pointer-events-none"
                allow="autoplay; encrypted-media"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 right-3">
                <div className="text-sm font-bold truncate drop-shadow">{t.title}</div>
                <div className="text-xs text-white/80 truncate">{t.artist}</div>
              </div>
            </div>
          </button>
        ))}
      </ScrollRow>
    </section>
  );
}
