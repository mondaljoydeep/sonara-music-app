import { ScrollRow } from "@/components/sections/ScrollRow";
import { useEffect, useState } from "react";
import { LANGUAGE_FEEDS, getNewReleases, type LangFeed } from "@/services/newReleasesService";
import type { Track } from "@/types/music";
import { TrackCard } from "@/components/cards/TrackCard";
import { usePlayer } from "@/context/PlayerContext";
import { CardSkeletonRow } from "./CardSkeletonRow";
import { Radio } from "lucide-react";

function FeedRow({ feed }: { feed: LangFeed }) {
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const { setQueue } = usePlayer();

  useEffect(() => {
    let alive = true;
    getNewReleases(feed).then((t) => { if (alive) setTracks(t); });
    return () => { alive = false; };
  }, [feed.id]);

  if (tracks && tracks.length === 0) return null;
  return (
    <section className="px-4 sm:px-6 lg:px-12 xl:px-16 mb-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
        <Radio size={18} className="text-[#1ed760]" /> {feed.label}
        <span className="text-[10px] uppercase tracking-wider text-emerald-400 ml-1 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Auto
        </span>
      </h2>
      {!tracks ? (
        <CardSkeletonRow />
      ) : (
        <ScrollRow>
          {tracks.slice(0, 18).map((t, i) => (
            <TrackCard key={t.id} track={t} variant="grid" onPlay={() => setQueue(tracks, i)} />
          ))}
        </ScrollRow>
      )}
    </section>
  );
}

export function NewReleasesAuto() {
  return (
    <>
      {LANGUAGE_FEEDS.map((f) => <FeedRow key={f.id} feed={f} />)}
    </>
  );
}
