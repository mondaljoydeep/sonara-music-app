import { useEffect, useState } from "react";
import { X, Power } from "lucide-react";
import { EQ_BANDS, EQ_PRESETS, type EqBands } from "@/services/audioEffects";
import { getSettings, updateSettings, subscribeSettings } from "@/services/settingsService";
import { Portal } from "@/components/ui/Portal";

interface Props { onClose: () => void }

export function EqualizerDialog({ onClose }: Props) {
  const [s, setS] = useState(getSettings());

  useEffect(() => subscribeSettings(setS), []);

  const setBand = (i: number, v: number) => {
    const next = [...s.eqGains] as EqBands;
    next[i] = v;
    updateSettings({ eqGains: next, eqPreset: "Custom", eqEnabled: true });
  };

  const applyPreset = (name: string) => {
    const gains = EQ_PRESETS[name];
    if (!gains) return;
    updateSettings({ eqPreset: name, eqGains: gains, eqEnabled: true });
  };

  const setRate = (v: number) => updateSettings({ playbackRate: v });

  return (
    <Portal>
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md px-2 sm:px-4 py-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-gradient-to-br from-[#1a1a24] to-[#0f0f17] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in">

        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#1ed760] font-bold">Audio Lab</div>
            <h3 className="text-xl font-black">Equalizer</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSettings({ eqEnabled: !s.eqEnabled })}
              className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${s.eqEnabled ? "bg-[#1ed760] text-black" : "bg-white/10 text-[#b3b3b3]"}`}
            >
              <Power size={12} /> {s.eqEnabled ? "On" : "Off"}
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-[#b3b3b3]" aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-5 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {Object.keys(EQ_PRESETS).map((name) => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                s.eqPreset === name ? "bg-[#1ed760] text-black" : "bg-white/5 text-[#b3b3b3] hover:bg-white/10"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="px-6 py-6 grid grid-cols-5 gap-2 sm:gap-4">
          {EQ_BANDS.map((freq, i) => {
            const v = s.eqGains[i];
            const pct = ((v + 12) / 24) * 100;
            return (
              <div key={freq} className="flex flex-col items-center gap-2">
                <div className="text-[10px] text-[#1ed760] font-mono w-6 text-center">
                  {v > 0 ? `+${v}` : v}
                </div>
                <div className="relative h-32 sm:h-40 flex items-center">
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={v}
                    onChange={(e) => setBand(i, parseInt(e.target.value, 10))}
                    className="eq-slider"
                    style={{
                      background: `linear-gradient(to top, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.08) ${100 - pct}%, #1ed760 ${100 - pct}%, #1ed760 100%)`,
                    }}
                    aria-label={`${freq} Hz`}
                  />
                </div>
                <div className="text-[10px] text-[#b3b3b3] font-mono">
                  {freq >= 1000 ? `${freq / 1000}k` : freq}
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-6 pb-6">
          <div className="text-xs uppercase tracking-widest text-[#b3b3b3] mb-2">Playback Speed</div>
          <div className="flex gap-2 flex-wrap">
            {[0.75, 1, 1.25, 1.5, 2].map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                  Math.abs(s.playbackRate - r) < 0.01 ? "bg-[#1ed760] text-black" : "bg-white/5 text-[#b3b3b3] hover:bg-white/10"
                }`}
              >
                {r}×
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 text-[10px] text-[#535353]">
          EQ applies to JioSaavn, Audius and uploaded tracks. YouTube playback uses the embed's own audio path.
        </div>
      </div>
    </div>
    </Portal>
  );
}
