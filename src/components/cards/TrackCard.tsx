import { useState } from "react";
import { MoreHorizontal, Music2, Play } from "lucide-react";
import type { Track } from "@/types/music";
import { MoreMenu } from "@/components/ui/MoreMenu";
import { QueueActionPopover } from "@/components/ui/QueueActionPopover";
import { usePlayer } from "@/context/PlayerContext";
import { getSettings } from "@/services/settingsService";
import { useToast } from "@/context/ToastContext";

interface TrackCardProps {
  track: Track;
  onPlay?: () => void;
  variant?: "list" | "grid";
  index?: number;
  showIndex?: boolean;
}

function fmtDuration(seconds: number | null) {
  if (!seconds || isNaN(seconds)) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TrackCard({ track, onPlay, variant = "list", index, showIndex }: TrackCardProps) {
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const [queueRect, setQueueRect] = useState<DOMRect | null>(null);
  const { track: current, isPlaying, playNext, addToQueue } = usePlayer();
  const toast = useToast();
  const isCurrent = current?.id === track.id;

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMenuRect(e.currentTarget.getBoundingClientRect());
  };

  const triggerPlay = (e: React.MouseEvent<HTMLElement>) => {
    const askEach = getSettings().queueChooser;
    if (askEach && current) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setQueueRect(rect);
      return;
    }
    onPlay?.();
  };

  const handlePlayNow = () => { setQueueRect(null); onPlay?.(); };
  const handlePlayNext = () => { setQueueRect(null); playNext(track); toast("Playing next"); };
  const handleAddQueue = () => { setQueueRect(null); addToQueue(track); toast("Added to queue"); };

  if (variant === "grid") {
    return (
      <>
        <div
          onClick={triggerPlay}
          className="group cursor-pointer w-36 sm:w-40 lg:w-48 flex-shrink-0"
        >
          <div className="relative aspect-square rounded-lg overflow-hidden bg-[#22222e] mb-2 shadow-lg">
            {track.artwork ? (
              <img
                src={track.artwork}
                alt={`${track.title} cover art by ${track.artist}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music2 className="text-[#535353]" size={42} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <button
              onClick={(e) => { e.stopPropagation(); triggerPlay(e); }}
              className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl hover:scale-110"
              aria-label="Play"
            >
              <Play size={18} fill="currentColor" />
            </button>
          </div>
          <div className="text-sm font-semibold truncate" title={track.title}>
            {track.title}
          </div>
          <div className="text-xs text-[#b3b3b3] truncate" title={track.artist}>
            {track.artist}
          </div>
        </div>
        {queueRect && (
          <QueueActionPopover
            track={track}
            anchorRect={queueRect}
            onClose={() => setQueueRect(null)}
            onPlayNow={handlePlayNow}
            onPlayNext={handlePlayNext}
            onAddToQueue={handleAddQueue}
          />
        )}
      </>
    );
  }

  return (
    <div
      onClick={triggerPlay}
      className={`group flex items-center gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors ${
        isCurrent ? "bg-white/5" : ""
      }`}
    >
      {showIndex && (
        <div className="w-6 text-right text-[#b3b3b3] text-sm hidden sm:block">
          {isCurrent && isPlaying ? (
            <span className="text-[#1ed760]">▶</span>
          ) : (
            (index ?? 0) + 1
          )}
        </div>
      )}
      <div className="relative w-12 h-12 rounded-md overflow-hidden bg-[#22222e] flex-shrink-0">
        {track.artwork ? (
          <img src={track.artwork} alt={`${track.title} cover art by ${track.artist}`} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music2 className="text-[#535353]" size={20} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-medium truncate ${isCurrent ? "text-[#1ed760]" : ""}`}>
          {track.title}
        </div>
        <div className="text-xs text-[#b3b3b3] truncate">{track.artist}</div>
      </div>
      {track.duration ? (
        <div className="text-xs text-[#b3b3b3] hidden sm:block">{fmtDuration(track.duration)}</div>
      ) : null}
      <button
        onClick={openMenu}
        className="p-2 rounded-full hover:bg-white/10 text-[#b3b3b3] hover:text-white opacity-60 group-hover:opacity-100 transition-opacity"
        aria-label="More options"
      >
        <MoreHorizontal size={18} />
      </button>
      {menuRect && <MoreMenu track={track} anchorRect={menuRect} onClose={() => setMenuRect(null)} />}
      {queueRect && (
        <QueueActionPopover
          track={track}
          anchorRect={queueRect}
          onClose={() => setQueueRect(null)}
          onPlayNow={handlePlayNow}
          onPlayNext={handlePlayNext}
          onAddToQueue={handleAddQueue}
        />
      )}
    </div>
  );
}
