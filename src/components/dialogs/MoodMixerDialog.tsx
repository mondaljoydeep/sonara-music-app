import { useState } from "react";
import { X, Sparkles, Loader2, Play } from "lucide-react";
import { Portal } from "@/components/ui/Portal";
import { searchSaavn } from "@/services/saavnService";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";
import type { Track } from "@/types/music";

interface Props { onClose: () => void; }

type MoodKey = "energy" | "happy" | "focus" | "chill" | "romance";

const MOODS: { key: MoodKey; label: string; emoji: string; queries: string[] }[] = [
  { key: "energy",  label: "Energy",  emoji: "⚡", queries: ["party hits", "workout edm", "high energy dance"] },
  { key: "happy",   label: "Happy",   emoji: "😄", queries: ["feel good pop", "happy bollywood", "uplifting songs"] },
  { key: "focus",   label: "Focus",   emoji: "🎯", queries: ["lofi study", "instrumental focus", "deep focus"] },
  { key: "chill",   label: "Chill",   emoji: "🌙", queries: ["chill vibes", "acoustic chill", "sunset lofi"] },
  { key: "romance", label: "Romance", emoji: "💜", queries: ["romantic bollywood", "love songs english", "romantic hits"] },
];

const LANGS = ["Any", "Hindi", "English", "Punjabi", "Tamil", "K-Pop"];

export function MoodMixerDialog({ onClose }: Props) {
  const [vals, setVals] = useState<Record<MoodKey, number>>({
    energy: 60, happy: 70, focus: 20, chill: 40, romance: 30,
  });
  const [lang, setLang] = useState("Any");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Track[] | null>(null);
  const { setQueue } = usePlayer();
  const toast = useToast();

  const generate = async () => {
    setLoading(true);
    // Rank moods and take top 2 as seed queries, weighted picks.
    const ranked = [...MOODS].sort((a, b) => vals[b.key] - vals[a.key]);
    const seeds = ranked.slice(0, 2).map((m) => m.queries[Math.floor(Math.random() * m.queries.length)]);
    const langSuffix = lang === "Any" ? "" : ` ${lang.toLowerCase()}`;
    const results = await Promise.all(seeds.map((s) => searchSaavn(s + langSuffix, 15)));
    // Interleave
    const mix: Track[] = [];
    const max = Math.max(...results.map((r) => r.length));
    for (let i = 0; i < max; i++) results.forEach((r) => r[i] && mix.push(r[i]));
    // Dedupe
    const seen = new Set<string>();
    const unique = mix.filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)));
    setPreview(unique.slice(0, 25));
    setLoading(false);
    if (unique.length === 0) toast("Couldn't build a mix. Try different moods.");
  };

  const playMix = () => {
    if (!preview || preview.length === 0) return;
    setQueue(preview, 0);
    toast(`🎧 Your Mood Mix is playing — ${preview.length} tracks`);
    onClose();
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
        <div className="w-full max-w-md bg-gradient-to-b from-[#1f1a2e] to-[#0a0a0f] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <div className="text-base font-black leading-tight">Mood Mixer</div>
                <div className="text-[11px] text-[#b3b3b3]">Dial your vibe — we'll build the queue</div>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
            {MOODS.map((m) => (
              <div key={m.key}>
                <div className="flex justify-between text-sm font-semibold mb-1.5">
                  <span>{m.emoji} {m.label}</span>
                  <span className="text-[#1ed760]">{vals[m.key]}</span>
                </div>
                <input
                  type="range" min={0} max={100} value={vals[m.key]}
                  onChange={(e) => setVals((v) => ({ ...v, [m.key]: Number(e.target.value) }))}
                  className="w-full accent-[#1ed760]"
                />
              </div>
            ))}

            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#b3b3b3] mb-2">Language</div>
              <div className="flex flex-wrap gap-2">
                {LANGS.map((l) => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${lang === l ? "bg-[#1ed760] text-black" : "bg-white/5 text-white hover:bg-white/10"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {preview && preview.length > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="text-xs font-bold uppercase tracking-widest text-[#1ed760] mb-2">Preview · {preview.length} tracks</div>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {preview.slice(0, 6).map((t) => (
                    <li key={t.id} className="text-xs text-white/80 truncate">• {t.title} <span className="text-[#b3b3b3]">— {t.artist}</span></li>
                  ))}
                  {preview.length > 6 && <li className="text-[11px] text-[#b3b3b3]">+ {preview.length - 6} more…</li>}
                </ul>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10 flex gap-2">
            <button onClick={generate} disabled={loading}
              className="flex-1 h-11 rounded-full bg-white/10 hover:bg-white/15 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {preview ? "Regenerate" : "Generate Mix"}
            </button>
            <button onClick={playMix} disabled={!preview || preview.length === 0}
              className="flex-1 h-11 rounded-full bg-[#1ed760] text-black font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40">
              <Play size={16} fill="currentColor" /> Play
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
