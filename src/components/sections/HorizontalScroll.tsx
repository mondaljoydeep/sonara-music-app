import { ScrollRow } from "@/components/sections/ScrollRow";
import { useEffect, useRef, useState } from "react";
import type { Track } from "@/types/music";
import { TrackCard } from "@/components/cards/TrackCard";
import { CardSkeletonRow } from "@/components/sections/CardSkeletonRow";
import { usePlayer } from "@/context/PlayerContext";

interface HorizontalScrollProps {
  title: string;
  fetcher: () => Promise<Track[]>;
  lazy?: boolean;
  banner?: string | null;
}

export function HorizontalScroll({ title, fetcher, lazy = true, banner }: HorizontalScrollProps) {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(!lazy);
  const ref = useRef<HTMLDivElement>(null);
  const { setQueue } = usePlayer();

  useEffect(() => {
    if (!lazy || visible) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [lazy, visible]);

  const load = async () => {
    setError(false);
    setTracks(null);
    try {
      const t = await fetcher();
      setTracks(t);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    if (visible) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <section ref={ref} className="px-4 sm:px-6 lg:px-12 xl:px-16 mb-8">
      {banner ? (
        <div className="relative h-32 sm:h-40 lg:h-48 mb-4 rounded-2xl overflow-hidden group">
          <img
            src={banner}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="relative h-full flex items-end p-5 sm:p-7">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-lg">{title}</h2>
          </div>
        </div>
      ) : (
        <h2 className="text-xl sm:text-2xl font-bold mb-4">{title}</h2>
      )}
      {!tracks && !error && <CardSkeletonRow />}
      {error && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#b3b3b3]">Could not load. </span>
          <button onClick={load} className="text-sm text-[#1ed760] hover:underline">
            Retry
          </button>
        </div>
      )}
      {tracks && tracks.length === 0 && !error && (
        <div className="text-sm text-[#b3b3b3]">Nothing here yet.</div>
      )}
      {tracks && tracks.length > 0 && (
        <ScrollRow>
          {tracks.map((t, i) => (
            <TrackCard
              key={t.id}
              track={t}
              variant="grid"
              onPlay={() => setQueue(tracks, i)}
            />
          ))}
        </ScrollRow>
      )}
    </section>
  );
}
