import { useEffect, useRef } from "react";
import { Play, ListPlus, FastForward } from "lucide-react";
import type { Track } from "@/types/music";

interface Props {
  track: Track;
  anchorRect: DOMRect;
  onClose: () => void;
  onPlayNow: () => void;
  onPlayNext: () => void;
  onAddToQueue: () => void;
}

export function QueueActionPopover({ track, anchorRect, onClose, onPlayNow, onPlayNext, onAddToQueue }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", onClick), 0);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", onClick); };
  }, [onClose]);

  const top = Math.min(anchorRect.bottom + 8, window.innerHeight - 220);
  const leftRaw = anchorRect.left + anchorRect.width / 2 - 120;
  const left = Math.max(8, Math.min(leftRaw, window.innerWidth - 248));

  return (
    <div
      ref={ref}
      style={{ top, left }}
      className="fixed z-[90] w-60 rounded-2xl bg-[#1a1a24]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in"
    >
      <div className="px-4 pt-3 pb-2 border-b border-white/5">
        <div className="text-[10px] uppercase tracking-widest text-[#1ed760] font-bold">Queue</div>
        <div className="text-sm font-semibold truncate">{track.title}</div>
        <div className="text-xs text-[#b3b3b3] truncate">{track.artist}</div>
      </div>
      <ul className="py-1.5 text-sm">
        <li>
          <button onClick={onPlayNow} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition">
            <div className="w-9 h-9 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-[0_0_16px_rgba(30,215,96,0.4)]">
              <Play size={16} fill="currentColor" />
            </div>
            <div>
              <div className="font-semibold">Play Now</div>
              <div className="text-[11px] text-[#b3b3b3]">Replace current track</div>
            </div>
          </button>
        </li>
        <li>
          <button onClick={onPlayNext} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition">
            <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center">
              <FastForward size={16} />
            </div>
            <div>
              <div className="font-semibold">Play Next</div>
              <div className="text-[11px] text-[#b3b3b3]">After the current song</div>
            </div>
          </button>
        </li>
        <li>
          <button onClick={onAddToQueue} className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition">
            <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center">
              <ListPlus size={16} />
            </div>
            <div>
              <div className="font-semibold">Add to Queue</div>
              <div className="text-[11px] text-[#b3b3b3]">Play at the end</div>
            </div>
          </button>
        </li>
      </ul>
    </div>
  );
}
