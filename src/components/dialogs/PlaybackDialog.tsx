import { useState } from "react";
import { X, Moon, Repeat2, Music2 } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { getSettings, updateSettings, subscribeSettings } from "@/services/settingsService";
import { useEffect } from "react";
import { Portal } from "@/components/ui/Portal";

interface Props { onClose: () => void }

export function PlaybackDialog({ onClose }: Props) {
  const { setSleepTimer, sleepRemainingMs, sleepEndOfSong } = usePlayer();
  const [s, setS] = useState(getSettings());
  useEffect(() => subscribeSettings(setS), []);

  return (
    <Portal>
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md px-2 sm:px-4 py-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-gradient-to-br from-[#1a1a24] to-[#0f0f17] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#1ed760] font-bold">Playback</div>
            <h3 className="text-xl font-black">Sleep · Crossfade · Gapless</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-[#b3b3b3]" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-5">
          <section>
            <div className="flex items-center gap-2 text-sm font-bold mb-2">
              <Moon size={14} className="text-[#1ed760]" /> Sleep Timer
              {sleepRemainingMs !== null && <span className="text-[10px] text-[#1ed760] font-mono">{Math.ceil(sleepRemainingMs / 60000)}m left</span>}
              {sleepEndOfSong && <span className="text-[10px] text-[#1ed760]">End of song</span>}
            </div>
            <div className="flex flex-wrap gap-2">
              {[15, 30, 45, 60].map((m) => (
                <button key={m} onClick={() => setSleepTimer(m)} className="px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-white/10 font-semibold">{m} min</button>
              ))}
              <button onClick={() => setSleepTimer("endOfSong")} className="px-3 py-1.5 rounded-full text-xs bg-white/5 hover:bg-white/10 font-semibold">End of song</button>
              <button onClick={() => setSleepTimer(null)} className="px-3 py-1.5 rounded-full text-xs bg-red-500/20 text-red-300 hover:bg-red-500/30 font-semibold">Off</button>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Repeat2 size={14} className="text-[#1ed760]" /> Crossfade
              </div>
              <div className="text-xs text-[#b3b3b3] font-mono">{s.crossfade}s</div>
            </div>
            <input
              type="range"
              min={0}
              max={12}
              step={1}
              value={s.crossfade}
              onChange={(e) => updateSettings({ crossfade: parseInt(e.target.value, 10) })}
              className="w-full accent-[#1ed760]"
            />
            <div className="text-[10px] text-[#b3b3b3] mt-1">Smoothly blend the end of one song into the next.</div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Music2 size={14} className="text-[#1ed760]" /> Mini-player lyrics
              </div>
              <button
                onClick={() => updateSettings({ lyricsOnMini: !s.lyricsOnMini })}
                className={`relative w-11 h-6 rounded-full transition ${s.lyricsOnMini ? "bg-[#1ed760]" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${s.lyricsOnMini ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
            <div className="text-[10px] text-[#b3b3b3] mt-1">Show the current lyric line above the mini-player.</div>
          </section>

          <section>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold">
                Ask Play Now / Next / Queue
              </div>
              <button
                onClick={() => updateSettings({ queueChooser: !s.queueChooser })}
                className={`relative w-11 h-6 rounded-full transition ${s.queueChooser ? "bg-[#1ed760]" : "bg-white/10"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${s.queueChooser ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
            <div className="text-[10px] text-[#b3b3b3] mt-1">When on, tapping a song while another is playing opens a menu instead of switching instantly.</div>
          </section>
        </div>
      </div>
    </div>
    </Portal>
  );
}
