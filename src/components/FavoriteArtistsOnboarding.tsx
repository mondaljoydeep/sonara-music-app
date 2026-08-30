import { useEffect, useMemo, useState } from "react";
import { Sparkles, Check, Music2, X, Loader2, Search } from "lucide-react";
import { TOP_ARTISTS, getArtistImage, type ArtistCategory } from "@/services/artistsService";
import { setFavoriteArtists, getFavoriteArtists, markOnboarded, hasOnboarded } from "@/services/favoriteArtistsService";
import { useToast } from "@/context/ToastContext";
import { Portal } from "@/components/ui/Portal";

interface Props {
  onClose?: () => void;
  forceOpen?: boolean;
}

const CATEGORIES: ArtistCategory[] = [
  "Bollywood Playback",
  "Punjabi & Haryanvi",
  "Hindi Hip-Hop / Rap",
  "Hindi Indie / I-Pop",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Kannada",
  "Bengali",
  "Bhojpuri",
  "Global",
];

export function FavoriteArtistsOnboarding({ onClose, forceOpen }: Props) {
  const [open, setOpen] = useState(forceOpen ?? !hasOnboarded());
  const [selected, setSelected] = useState<Set<string>>(() => new Set(getFavoriteArtists()));
  const [images, setImages] = useState<Record<string, string | null>>({});
  const [activeCat, setActiveCat] = useState<ArtistCategory | "All">("All");
  const [q, setQ] = useState("");
  const toast = useToast();

  // Lazy-load images per visible category so we don't hammer the API on open.
  useEffect(() => {
    if (!open) return;
    const visible = TOP_ARTISTS.filter((a) => activeCat === "All" || a.category === activeCat);
    let cancelled = false;
    (async () => {
      const missing = visible.filter((a) => images[a.slug] === undefined).slice(0, 40);
      for (const a of missing) {
        const url = await getArtistImage(a.name).catch(() => null);
        if (cancelled) return;
        setImages((prev) => ({ ...prev, [a.slug]: url }));
      }
    })();
    return () => { cancelled = true; };
  }, [open, activeCat]);

  const filtered = useMemo(() => {
    const list = TOP_ARTISTS.filter((a) => activeCat === "All" || a.category === activeCat);
    if (!q.trim()) return list;
    const s = q.toLowerCase();
    return list.filter((a) => a.name.toLowerCase().includes(s));
  }, [activeCat, q]);

  if (!open) return null;

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const finish = () => {
    setFavoriteArtists(Array.from(selected));
    markOnboarded();
    toast(selected.size ? `Tuned your Home for ${selected.size} artist${selected.size > 1 ? "s" : ""}` : "You can pick artists later from Profile");
    setOpen(false);
    onClose?.();
  };

  const skip = () => {
    markOnboarded();
    setOpen(false);
    onClose?.();
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-xl px-2 sm:px-4 py-4">
        <div className="w-full max-w-5xl h-[95vh] sm:h-[92vh] flex flex-col bg-gradient-to-br from-[#1a1a24] via-[#15151f] to-[#0f0f17] rounded-3xl border border-white/10 shadow-2xl animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between p-5 sm:p-6 pb-3 border-b border-white/5">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 text-[#1ed760] text-[10px] font-bold uppercase tracking-widest mb-1.5">
                <Sparkles size={12} /> Personalize Sonara
              </div>
              <h2 className="text-2xl sm:text-3xl font-black leading-tight">Pick your favorite artists</h2>
              <p className="text-xs sm:text-sm text-[#b3b3b3] mt-1">
                Choose 3 or more. Your Home, recommendations & daily mix will be tuned to their music instantly.
              </p>
            </div>
            <button onClick={skip} className="p-2 rounded-full hover:bg-white/10 text-[#b3b3b3] flex-shrink-0" aria-label="Skip">
              <X size={20} />
            </button>
          </div>

          {/* Search + categories */}
          <div className="px-4 sm:px-6 py-3 border-b border-white/5 space-y-2.5">
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-2">
              <Search size={16} className="text-[#b3b3b3]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search artists…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#535353]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
              {(["All", ...CATEGORIES] as const).map((c) => {
                const active = activeCat === c;
                return (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                      active ? "bg-[#1ed760] text-black" : "bg-white/5 text-[#b3b3b3] hover:bg-white/10"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center py-20 text-[#b3b3b3] text-sm">
                No artists match "{q}"
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
                {filtered.map((a) => {
                  const isSel = selected.has(a.name);
                  const img = images[a.slug];
                  return (
                    <button
                      key={a.slug}
                      onClick={() => toggle(a.name)}
                      className={`group relative flex flex-col items-center text-center transition ${isSel ? "scale-[1.03]" : "hover:scale-105"}`}
                    >
                      <div
                        className={`relative w-full aspect-square rounded-full overflow-hidden bg-[#22222e] ring-2 transition ${
                          isSel
                            ? "ring-[#1ed760] shadow-[0_0_24px_rgba(30,215,96,0.6)]"
                            : "ring-white/10 group-hover:ring-white/30"
                        }`}
                      >
                        {img ? (
                          <img src={img} alt={a.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : img === null ? (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#22222e] to-[#0f0f17]">
                            <span className="text-lg font-black text-[#1ed760]">{a.name.slice(0, 1)}</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 size={16} className="text-[#535353] animate-spin" />
                          </div>
                        )}
                        {isSel && (
                          <div className="absolute inset-0 bg-[#1ed760]/30 flex items-center justify-center animate-fade-in">
                            <div className="w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center">
                              <Check size={18} strokeWidth={3} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] sm:text-xs font-semibold mt-2 truncate w-full leading-tight">{a.name}</div>
                      <div className="text-[9px] text-[#535353] truncate w-full">{a.category}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 p-4 sm:p-5 border-t border-white/10 bg-black/40">
            <div className="text-xs text-[#b3b3b3]">
              <span className="text-white font-bold">{selected.size}</span> selected
              {selected.size < 3 && <span className="text-[#1ed760]"> · Pick {3 - selected.size} more</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={skip} className="px-4 py-2 text-sm text-[#b3b3b3] hover:text-white">Skip</button>
              <button
                onClick={finish}
                disabled={selected.size < 3}
                className="px-6 py-2.5 rounded-full bg-[#1ed760] text-black font-bold hover:scale-105 transition disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(30,215,96,0.4)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
