import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sliders, Moon, Mic2, Share2, Download, Sparkles, Radio, Wand2 } from "lucide-react";
import { EqualizerDialog } from "@/components/dialogs/EqualizerDialog";
import { PlaybackDialog } from "@/components/dialogs/PlaybackDialog";
import { MoodMixerDialog } from "@/components/dialogs/MoodMixerDialog";
import { FavoriteArtistsOnboarding } from "@/components/FavoriteArtistsOnboarding";
import { useToast } from "@/context/ToastContext";

interface Tool {
  id: string;
  label: string;
  sub: string;
  icon: any;
  gradient: string;
  onClick: () => void;
}

export function AdvancedToolsBar() {
  const [eqOpen, setEqOpen] = useState(false);
  const [playbackOpen, setPlaybackOpen] = useState(false);
  const [artistsOpen, setArtistsOpen] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleShare = async () => {
    const url = window.location.origin;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Sonara — Feel Every Beat", text: "Free music streaming across Bollywood, Pop, K-Pop and more.", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Link copied — share Sonara with friends!");
      }
    } catch { /* ignore */ }
  };

  const handleInstall = () => {
    // Defer to existing InstallButton flow; show hint
    toast("Tap the install banner above, or use your browser menu → Add to Home Screen");
  };

  const tools: Tool[] = [
    { id: "mood",     label: "Mood Mixer",sub: "AI vibe queue",       icon: Wand2,     gradient: "from-fuchsia-500 to-orange-500", onClick: () => setMoodOpen(true) },
    { id: "eq",       label: "Equalizer", sub: "9 presets + custom",  icon: Sliders,   gradient: "from-[#1ed760] to-[#0e9e48]", onClick: () => setEqOpen(true) },
    { id: "karaoke",  label: "Karaoke",   sub: "Synced lyrics",       icon: Mic2,      gradient: "from-pink-500 to-purple-600", onClick: () => navigate("/player") },
    { id: "sleep",    label: "Playback",  sub: "Sleep · Crossfade",   icon: Moon,      gradient: "from-indigo-500 to-blue-600", onClick: () => setPlaybackOpen(true) },
    { id: "radio",    label: "Discover",  sub: "Pick favorites",      icon: Sparkles,  gradient: "from-amber-400 to-orange-600", onClick: () => setArtistsOpen(true) },
    { id: "browse",   label: "Browse",    sub: "Genres · Moods",      icon: Radio,     gradient: "from-cyan-400 to-teal-600", onClick: () => navigate("/search") },
    { id: "share",    label: "Share App", sub: "Tell a friend",       icon: Share2,    gradient: "from-emerald-500 to-green-700", onClick: handleShare },
    { id: "install",  label: "Install",   sub: "Add to device",       icon: Download,  gradient: "from-slate-500 to-zinc-700", onClick: handleInstall },
  ];

  return (
    <>
      <section className="px-4 sm:px-6 lg:px-12 xl:px-16 mb-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[#1ed760] text-[10px] font-bold uppercase tracking-widest mb-1">
              <Sparkles size={12} /> Sonara Pro Tools
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">Power your listening</h2>
          </div>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {tools.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={t.onClick}
                className="group relative flex flex-col items-center text-center p-3 rounded-2xl bg-[#1a1a24]/60 border border-white/5 hover:border-white/20 hover:bg-[#22222e]/80 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div className="text-xs font-bold leading-tight">{t.label}</div>
                <div className="text-[10px] text-[#b3b3b3] mt-0.5 leading-tight">{t.sub}</div>
              </button>
            );
          })}
        </div>
      </section>

      {eqOpen && <EqualizerDialog onClose={() => setEqOpen(false)} />}
      {playbackOpen && <PlaybackDialog onClose={() => setPlaybackOpen(false)} />}
      {moodOpen && <MoodMixerDialog onClose={() => setMoodOpen(false)} />}
      {artistsOpen && <FavoriteArtistsOnboarding forceOpen onClose={() => setArtistsOpen(false)} />}
    </>
  );
}
