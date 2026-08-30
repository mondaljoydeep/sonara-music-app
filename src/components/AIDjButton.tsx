import { useState } from "react";
import { Disc3, Loader2, Sparkles } from "lucide-react";
import { buildAIDjSet } from "@/services/aiDjService";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";

interface Props {
  variant?: "hero" | "icon";
}

export function AIDjButton({ variant = "hero" }: Props) {
  const [loading, setLoading] = useState(false);
  const { setQueue, toggleShuffle, shuffle } = usePlayer();
  const toast = useToast();

  const start = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const tracks = await buildAIDjSet(8);
      if (!tracks.length) {
        toast("AI DJ couldn't fetch tracks. Try again.");
        return;
      }
      setQueue(tracks, 0);
      if (!shuffle) toggleShuffle();
      toast(`🎧 AI DJ spinning ${tracks.length} party tracks worldwide`);
    } catch {
      toast("AI DJ failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={start}
        title="AI DJ — Unlimited party mix"
        aria-label="AI DJ"
        className="relative w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-amber-400 flex items-center justify-center text-white shadow-[0_0_18px_rgba(236,72,153,0.5)] hover:scale-105 transition"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Disc3 size={16} className="animate-spin-slow" />}
      </button>
    );
  }

  return (
    <button
      onClick={start}
      disabled={loading}
      className="group relative overflow-hidden w-full rounded-3xl p-5 text-left bg-gradient-to-br from-fuchsia-600 via-pink-500 to-amber-400 shadow-[0_20px_60px_rgba(236,72,153,0.35)] hover:shadow-[0_25px_80px_rgba(236,72,153,0.55)] transition-all hover:-translate-y-0.5"
    >
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-black/20 blur-2xl" />
      <div className="relative flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-black/30 backdrop-blur flex items-center justify-center">
          {loading ? (
            <Loader2 size={28} className="text-white animate-spin" />
          ) : (
            <Disc3 size={32} className="text-white animate-spin-slow" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/90 mb-1">
            <Sparkles size={10} /> Exclusive · Not on Spotify
          </div>
          <div className="text-lg sm:text-xl font-black text-white leading-tight">
            AI DJ — Endless Party Mix
          </div>
          <div className="text-xs text-white/85 mt-0.5">
            Tap to spin unlimited dance hits across Hindi, English, Punjabi, K-Pop, Tamil, Latin & more.
          </div>
        </div>
      </div>
    </button>
  );
}
