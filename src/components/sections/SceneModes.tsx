import { useState } from "react";
import { Brain, PartyPopper, Dumbbell, Moon, Car, Sparkles, Loader2 } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";
import { searchSaavn } from "@/services/saavnService";
import { EQ_PRESETS, setEqEnabled, type EqBands } from "@/services/audioEffects";
import { updateSettings } from "@/services/settingsService";
import { getTopLanguage } from "@/services/personalizationService";

type Scene = {
  id: string;
  label: string;
  sub: string;
  icon: any;
  gradient: string;
  eqPreset: keyof typeof EQ_PRESETS;
  crossfade: number;
  sleepMin: number | null;
  queries: (lang: string | null) => string[];
};

const SCENES: Scene[] = [
  {
    id: "focus",
    label: "Focus",
    sub: "Deep work · Lo-Fi",
    icon: Brain,
    gradient: "from-indigo-500 to-cyan-500",
    eqPreset: "Late Night",
    crossfade: 6,
    sleepMin: null,
    queries: () => ["lofi study beats", "instrumental focus", "chill piano"],
  },
  {
    id: "party",
    label: "Party",
    sub: "Bangers · High energy",
    icon: PartyPopper,
    gradient: "from-fuchsia-500 to-orange-500",
    eqPreset: "Dance",
    crossfade: 4,
    sleepMin: null,
    queries: (l) =>
      l === "Hindi"
        ? ["bollywood party hits 2024", "punjabi party", "edm party"]
        : ["party hits 2024", "edm party bangers", "dance hits"],
  },
  {
    id: "workout",
    label: "Workout",
    sub: "Pump · BPM 120+",
    icon: Dumbbell,
    gradient: "from-red-500 to-yellow-500",
    eqPreset: "Bass Boost",
    crossfade: 2,
    sleepMin: null,
    queries: () => ["workout gym motivation", "hip hop workout 2024", "edm workout"],
  },
  {
    id: "chill",
    label: "Sleep",
    sub: "Wind down · 30min timer",
    icon: Moon,
    gradient: "from-slate-600 to-indigo-800",
    eqPreset: "Late Night",
    crossfade: 8,
    sleepMin: 30,
    queries: () => ["calm sleep music", "ambient sleep", "soft acoustic lullaby"],
  },
  {
    id: "commute",
    label: "Commute",
    sub: "Feel-good singalongs",
    icon: Car,
    gradient: "from-emerald-500 to-teal-600",
    eqPreset: "Pop",
    crossfade: 3,
    sleepMin: null,
    queries: (l) =>
      l === "Hindi"
        ? ["arijit singh road trip", "bollywood feel good", "punjabi road trip"]
        : ["feel good hits", "road trip pop", "top singalongs"],
  },
];

export function SceneModes() {
  const { setQueue, setSleepTimer } = usePlayer();
  const toast = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const activate = async (scene: Scene) => {
    setLoadingId(scene.id);
    try {
      // 1) Apply EQ preset
      const gains = EQ_PRESETS[scene.eqPreset] as EqBands;
      setEqEnabled(true, gains);
      updateSettings({
        eqEnabled: true,
        eqPreset: scene.eqPreset as string,
        eqGains: gains,
        crossfade: scene.crossfade,
      });

      // 2) Build a rich queue from Saavn using multiple seeds
      const lang = getTopLanguage();
      const seeds = scene.queries(lang);
      const results = await Promise.allSettled(
        seeds.map((q) => searchSaavn(q, 12))
      );
      const merged = results
        .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
        .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);

      if (merged.length === 0) {
        toast("Scene ready — no tracks found, try again");
        return;
      }
      // Shuffle a bit
      merged.sort(() => Math.random() - 0.5);

      // 3) Optional sleep timer
      if (scene.sleepMin) setSleepTimer(scene.sleepMin);

      // 4) Start queue
      setQueue(merged, 0);
      toast(`${scene.label} scene on — ${merged.length} tracks queued`);
    } catch {
      toast("Couldn't start scene, try again");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="px-4 sm:px-6 lg:px-12 xl:px-16 mb-8">
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-fuchsia-400 text-[10px] font-bold uppercase tracking-widest mb-1">
            <Sparkles size={12} /> One-Tap Scenes
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Set the mood in one tap</h2>
          <p className="text-xs text-[#b3b3b3] mt-1">
            EQ, crossfade and a fresh queue tuned to the moment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SCENES.map((s) => {
          const Icon = s.icon;
          const busy = loadingId === s.id;
          return (
            <button
              key={s.id}
              disabled={busy}
              onClick={() => activate(s)}
              className={`group relative overflow-hidden rounded-2xl p-4 text-left transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] disabled:opacity-70 disabled:cursor-wait bg-gradient-to-br ${s.gradient}`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="relative z-10 flex items-start justify-between mb-8">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  {busy ? (
                    <Loader2 size={20} className="text-white animate-spin" />
                  ) : (
                    <Icon size={22} className="text-white" />
                  )}
                </div>
              </div>
              <div className="relative z-10">
                <div className="text-base font-bold text-white leading-tight">{s.label}</div>
                <div className="text-[11px] text-white/80 mt-0.5">{s.sub}</div>
              </div>
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
