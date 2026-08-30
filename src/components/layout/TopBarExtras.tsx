import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Sliders, Moon, Cast, Share2, Mic2, Sparkles } from "lucide-react";
import { EqualizerDialog } from "@/components/dialogs/EqualizerDialog";
import { PlaybackDialog } from "@/components/dialogs/PlaybackDialog";
import { useToast } from "@/context/ToastContext";

/**
 * Sonara-exclusive quick tools that competitors don't surface in their topbar:
 * one-tap EQ, sleep/crossfade, cast, share, and karaoke.
 */
export function TopBarExtras() {
  const [open, setOpen] = useState(false);
  const [eq, setEq] = useState(false);
  const [pb, setPb] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) {
      setTimeout(() => document.addEventListener("mousedown", onClick), 0);
      return () => document.removeEventListener("mousedown", onClick);
    }
  }, [open]);

  const cast = async () => {
    setOpen(false);
    try {
      const audio = document.querySelector("audio") as HTMLMediaElement & { remote?: { prompt: () => Promise<void> } };
      if (audio?.remote?.prompt) {
        await audio.remote.prompt();
        return;
      }
    } catch { /* fall through */ }
    toast("Casting needs Chrome with a Cast-ready speaker on the same Wi-Fi.");
  };

  const share = async () => {
    setOpen(false);
    const url = window.location.origin;
    try {
      if (navigator.share) await navigator.share({ title: "Sonara", url });
      else { await navigator.clipboard.writeText(url); toast("Sonara link copied!"); }
    } catch { /* ignore */ }
  };

  const items = [
    { icon: Sliders, label: "Equalizer",    sub: "9 presets + custom", onClick: () => { setOpen(false); setEq(true); } },
    { icon: Moon,    label: "Sleep timer",  sub: "Crossfade & gapless", onClick: () => { setOpen(false); setPb(true); } },
    { icon: Mic2,    label: "Karaoke",      sub: "Synced lyrics",       onClick: () => { setOpen(false); navigate("/player"); } },
    { icon: Cast,    label: "Cast",         sub: "Speaker / TV",        onClick: cast },
    { icon: Share2,  label: "Share Sonara", sub: "Tell a friend",       onClick: share },
  ];

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Quick tools"
          title="Sonara quick tools"
          className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#1ed760] to-[#0e9e48] text-black flex items-center justify-center shadow-[0_0_18px_rgba(30,215,96,0.45)] hover:scale-105 transition"
        >
          <Zap size={16} fill="currentColor" />
        </button>
        {open && (
          <div className="absolute right-0 top-12 w-72 rounded-2xl bg-[#181824]/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50 animate-fade-in p-2">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#1ed760] flex items-center gap-1">
              <Sparkles size={12} /> Sonara-only tools
            </div>
            <ul>
              {items.map((it) => {
                const Icon = it.icon;
                return (
                  <li key={it.label}>
                    <button
                      onClick={it.onClick}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-left"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                        <Icon size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{it.label}</div>
                        <div className="text-[11px] text-[#b3b3b3]">{it.sub}</div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      {eq && <EqualizerDialog onClose={() => setEq(false)} />}
      {pb && <PlaybackDialog onClose={() => setPb(false)} />}
    </>
  );
}
