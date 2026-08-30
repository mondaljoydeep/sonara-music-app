import { useEffect, useState } from "react";
import { Sparkles, Play, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Track } from "@/types/music";
import { searchSaavn } from "@/services/saavnService";
import { getProfile, getTopArtists, getTopLanguage } from "@/services/personalizationService";
import { usePlayer } from "@/context/PlayerContext";

interface Props {
  variant?: "wide" | "compact" | "strip";
  contextArtist?: string;
  contextQuery?: string;
  className?: string;
}

const HIDE_KEY = "sonara:hidePersonalAd";

function buildQuery(contextArtist?: string, contextQuery?: string): { q: string; label: string } {
  if (contextArtist) return { q: `${contextArtist} similar artists`, label: `More like ${contextArtist}` };
  if (contextQuery) return { q: `${contextQuery} top hits`, label: `Top picks: ${contextQuery}` };
  const top = getTopArtists(1)[0];
  if (top) return { q: `${top} new song`, label: `Because you love ${top}` };
  const lang = getTopLanguage();
  if (lang === "Hindi") return { q: `new hindi top hit ${new Date().getFullYear()}`, label: "🇮🇳 Hot for you · Hindi" };
  if (lang === "Korean") return { q: `new kpop hit ${new Date().getFullYear()}`, label: "🇰🇷 Hot for you · K-Pop" };
  if (lang === "Tamil") return { q: `new tamil hit ${new Date().getFullYear()}`, label: "🌟 Hot for you · Tamil" };
  if (lang === "Punjabi") return { q: `new punjabi hit ${new Date().getFullYear()}`, label: "🥁 Hot for you · Punjabi" };
  return { q: `top new releases ${new Date().getFullYear()}`, label: "🌍 Fresh global hits" };
}

export function PersonalizedAdBanner({ variant = "wide", contextArtist, contextQuery, className }: Props) {
  const [track, setTrack] = useState<Track | null>(null);
  const [label, setLabel] = useState("");
  const [hidden, setHidden] = useState(() => sessionStorage.getItem(HIDE_KEY) === "1");
  const { setQueue } = usePlayer();
  const navigate = useNavigate();
  const profile = getProfile();

  useEffect(() => {
    if (hidden) return;
    const { q, label } = buildQuery(contextArtist, contextQuery);
    setLabel(label);
    searchSaavn(q, 8).then((res) => {
      if (res.length === 0) return;
      // pick a non-deterministic but stable-per-mount track
      setTrack(res[Math.floor(Math.random() * Math.min(3, res.length))]);
    });
  }, [contextArtist, contextQuery, hidden, profile.totalPlays]);

  if (hidden || !track) return null;

  const handlePlay = () => setQueue([track], 0);
  const handleOpen = () => navigate("/player");
  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    sessionStorage.setItem(HIDE_KEY, "1");
    setHidden(true);
  };

  if (variant === "strip") {
    return (
      <button
        onClick={handlePlay}
        className={`w-full flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-fuchsia-600/20 via-purple-600/20 to-emerald-500/20 border-y border-white/10 text-left hover:from-fuchsia-600/30 hover:to-emerald-500/30 transition ${className || ""}`}
      >
        {track.artwork && <img src={track.artwork} alt="" className="w-8 h-8 rounded object-cover" />}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-[#1ed760]">Sponsored for you</div>
          <div className="text-xs font-semibold truncate">{track.title} · {track.artist}</div>
        </div>
        <Play size={14} className="text-white/80" />
        <span onClick={dismiss as any} className="p-1 text-white/60 hover:text-white"><X size={12} /></span>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`relative rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-purple-600/30 to-pink-500/20 p-3 flex items-center gap-3 ${className || ""}`}>
        {track.artwork && <img src={track.artwork} alt="" className="w-14 h-14 rounded-lg object-cover" />}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-white/70 flex items-center gap-1"><Sparkles size={10} /> {label}</div>
          <div className="text-sm font-bold truncate">{track.title}</div>
          <div className="text-xs text-white/80 truncate">{track.artist}</div>
        </div>
        <button onClick={handlePlay} className="w-9 h-9 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow">
          <Play size={16} fill="currentColor" />
        </button>
        <button onClick={dismiss} aria-label="Dismiss" className="absolute top-1 right-1 text-white/60 hover:text-white"><X size={12} /></button>
      </div>
    );
  }

  // wide
  return (
    <section className={`mx-4 sm:mx-6 lg:mx-12 xl:mx-16 mb-8 ${className || ""}`}>
      <div className="relative rounded-2xl overflow-hidden border border-white/10 min-h-[140px] sm:min-h-[180px]">
        {track.artwork && (
          <img src={track.artwork} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-md opacity-60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-fuchsia-900/30" />
        <button onClick={dismiss} aria-label="Hide ad" className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center">
          <X size={14} />
        </button>
        <div className="relative flex items-center gap-4 p-4 sm:p-6">
          {track.artwork && (
            <img src={track.artwork} alt="" className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl object-cover ring-2 ring-white/20 shadow-2xl flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-[#1ed760] flex items-center gap-1">
              <Sparkles size={12} /> Sponsored · Personalized
            </div>
            <p className="text-xs text-white/70 mt-0.5">{label}</p>
            <h3 className="text-xl sm:text-2xl font-black truncate mt-1">{track.title}</h3>
            <p className="text-sm text-white/80 truncate">{track.artist}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={handlePlay} className="flex items-center gap-2 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold px-4 py-2 rounded-full text-sm transition">
                <Play size={14} fill="currentColor" /> Play now
              </button>
              <button onClick={handleOpen} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm font-semibold border border-white/10">
                Open player
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
