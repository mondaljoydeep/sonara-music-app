import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ChevronDown, Heart, Music2, Pause, Play, Repeat, Repeat1, Shuffle,
  SkipBack, SkipForward, Download, Share2, MoreHorizontal, Plus, Moon, Trash2, GripVertical
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { downloadTrack, isLiked, toggleLike } from "@/services/libraryService";
import { useToast } from "@/context/ToastContext";
import { getLyrics, type LyricsResult } from "@/services/lyricsService";
import { TrackCard } from "@/components/cards/TrackCard";
import { MoreMenu } from "@/components/ui/MoreMenu";

function fmt(s: number) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const SOURCE_PILL: Record<string, { label: string; cls: string }> = {
  youtube: { label: "YOUTUBE", cls: "bg-red-600 text-white" },
  audius: { label: "AUDIUS", cls: "bg-purple-600 text-white" },
  uploaded: { label: "MY UPLOAD", cls: "bg-[#1ed760] text-black" },
  saavn: { label: "JIOSAAVN", cls: "bg-orange-500 text-white" },
};

function useDominantColor(src: string | null) {
  const [color, setColor] = useState<string>("#22222e");
  useEffect(() => {
    if (!src) { setColor("#22222e"); return; }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = c.height = 16;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 16, 16);
        const d = ctx.getImageData(8, 8, 1, 1).data;
        if (!cancelled) setColor(`rgb(${d[0]},${d[1]},${d[2]})`);
      } catch {
        // CORS may block — fall back silently
      }
    };
    img.src = src;
    return () => { cancelled = true; };
  }, [src]);
  return color;
}

function Waveform({ active }: { active: boolean }) {
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: 24 }, () => Math.random() * 0.8 + 0.2));
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setBars(Array.from({ length: 24 }, () => Math.random() * 0.85 + 0.15));
    }, 140);
    return () => clearInterval(id);
  }, [active]);
  return (
    <div className="flex items-end justify-center gap-[3px] h-8 mt-2">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-sm bg-[#1ed760]/60 transition-all"
          style={{ height: `${(active ? h : 0.15) * 100}%` }}
        />
      ))}
    </div>
  );
}

export default function FullPlayer() {
  const {
    track, isPlaying, currentTime, duration, togglePlay, next, prev, seek,
    queue, queueIndex, setQueue, shuffle, repeat, toggleShuffle, cycleRepeat,
    removeFromQueue, clearQueue, reorderQueue, setSleepTimer, sleepRemainingMs, sleepEndOfSong
  } = usePlayer();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const initialTab = (searchParams.get("tab") as "now" | "lyrics" | "queue") || "now";
  const [tab, setTab] = useState<"now" | "lyrics" | "queue">(
    initialTab === "queue" || initialTab === "lyrics" || initialTab === "now" ? initialTab : "now"
  );
  const [liked, setLiked] = useState(false);
  const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const [moreRect, setMoreRect] = useState<DOMRect | null>(null);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const dom = useDominantColor(track?.artwork || null);

  useEffect(() => {
    setLiked(track ? isLiked(track.id) : false);
  }, [track]);

  useEffect(() => {
    if (!track || tab !== "lyrics") return;
    setLyrics(null);
    void getLyrics(track.title, track.artist).then(setLyrics);
  }, [track, tab]);

  const activeLineIdx = useMemo(() => {
    if (!lyrics?.synced || !lyrics.lines) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.lines.length; i++) {
      if (lyrics.lines[i].time <= currentTime) idx = i; else break;
    }
    return idx;
  }, [lyrics, currentTime]);

  useEffect(() => {
    if (tab !== "lyrics" || activeLineIdx < 0 || !lyricsRef.current) return;
    const el = lyricsRef.current.querySelector(`[data-idx="${activeLineIdx}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeLineIdx, tab]);

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white">
        <div className="text-center">
          <div className="text-[#b3b3b3] mb-4">Nothing is playing.</div>
          <button onClick={() => navigate("/")} className="text-[#1ed760]">Go home</button>
        </div>
      </div>
    );
  }

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => seek(parseFloat(e.target.value));

  const handleArtistTap = () => {
    navigate(`/search?q=${encodeURIComponent(track.artist)}`);
  };

  const sourcePill = SOURCE_PILL[track.source];

  const handleSleep = (opt: number | "endOfSong" | null) => {
    setSleepTimer(opt);
    setSleepOpen(false);
    if (opt === null) toast("Sleep timer cleared");
    else if (opt === "endOfSong") toast("Will stop at end of song");
    else toast(`Sleep timer: ${opt} min`);
  };

  const playerTitle = track ? `${track.title} — ${track.artist} | Sonara Player` : "Now Playing | Sonara Player";
  const playerDesc = track
    ? `Listen to ${track.title} by ${track.artist} on Sonara — full-screen player with lyrics, queue and controls.`
    : "Sonara's full-screen music player with synced lyrics, queue management and playback controls.";

  return (
    <div
      className="min-h-screen text-white flex flex-col relative overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at top, ${dom} 0%, #0a0a0f 70%)`,
      }}
    >
      <Helmet>
        <title>{playerTitle.slice(0, 60)}</title>
        <meta name="description" content={playerDesc.slice(0, 158)} />
        <link rel="canonical" href="https://sonora-rhythm.lovable.app/player" />
        <meta property="og:type" content="music.song" />
        <meta property="og:title" content={playerTitle} />
        <meta property="og:description" content={playerDesc.slice(0, 158)} />
        <meta property="og:url" content="https://sonora-rhythm.lovable.app/player" />
        {track?.artwork && <meta property="og:image" content={track.artwork} />}
      </Helmet>
      {track.artwork && (
        <img
          src={track.artwork}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 pointer-events-none"
        />
      )}
      <div className="relative z-10 flex flex-col flex-1">
        <header className="flex items-center justify-between p-4 sm:p-6">
          <button onClick={() => navigate(-1)} aria-label="Close player" className="p-2 rounded-full hover:bg-white/10">
            <ChevronDown size={24} />
          </button>
          <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#b3b3b3]">Now Playing</div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sourcePill.cls}`}>
              {sourcePill.label}
            </span>
          </div>
          <button
            onClick={() => setSleepOpen((v) => !v)}
            className={`p-2 rounded-full hover:bg-white/10 relative ${sleepRemainingMs !== null || sleepEndOfSong ? "text-[#1ed760]" : "text-white"}`}
            aria-label="Sleep timer"
          >
            <Moon size={20} />
          </button>
        </header>

        {sleepOpen && (
          <div className="absolute right-4 top-16 z-30 w-52 rounded-2xl bg-[#181824]/95 backdrop-blur-xl border border-white/10 shadow-2xl py-2 animate-fade-in">
            <div className="px-4 py-2 text-xs uppercase tracking-wider text-[#b3b3b3]">Sleep Timer</div>
            {[15, 30, 45, 60].map((m) => (
              <button key={m} onClick={() => handleSleep(m)} className="w-full text-left px-4 py-2 text-sm hover:bg-white/5">{m} min</button>
            ))}
            <button onClick={() => handleSleep("endOfSong")} className="w-full text-left px-4 py-2 text-sm hover:bg-white/5">End of song</button>
            <button onClick={() => handleSleep(null)} className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 text-red-400">Off</button>
          </div>
        )}

        <div className="flex justify-center px-4 mb-4">
          <div className="inline-flex bg-white/5 rounded-full p-1 text-sm">
            {(["now", "lyrics", "queue"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full capitalize transition ${
                  tab === t ? "bg-white text-black" : "text-[#b3b3b3]"
                }`}
              >
                {t === "now" ? "Playing" : t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-4 sm:px-8 max-w-2xl mx-auto w-full">
          {tab === "now" && (
            <div
              onClick={togglePlay}
              className={`aspect-square w-[280px] sm:w-[320px] mx-auto rounded-2xl overflow-hidden bg-[#22222e] cursor-pointer ${isPlaying ? "animate-spin-slow" : ""}`}
              style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.8)" }}
            >
              {track.artwork ? (
                <img src={track.artwork} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 size={80} className="text-[#535353]" />
                </div>
              )}
            </div>
          )}

          {tab === "lyrics" && (
            <div ref={lyricsRef} className="max-h-[55vh] overflow-y-auto py-8 space-y-2 text-center">
              {!lyrics && <div className="text-[#b3b3b3]">Loading lyrics…</div>}
              {lyrics && !lyrics.found && (
                <div className="text-center py-12">
                  <Music2 size={48} className="mx-auto text-[#535353] mb-3" />
                  <div className="text-white font-semibold">Lyrics not available</div>
                  <div className="text-sm text-[#b3b3b3] mt-1">We couldn't find lyrics for this track.</div>
                </div>
              )}
              {lyrics?.synced && lyrics.lines?.map((l, i) => {
                const past = i < activeLineIdx;
                const active = i === activeLineIdx;
                return (
                  <div
                    key={i}
                    data-idx={i}
                    className={`transition-all duration-300 px-4 py-2 rounded-lg ${
                      active
                        ? "text-white font-bold text-xl sm:text-2xl bg-[#1ed760]/10 border-l-4 border-[#1ed760] text-left"
                        : past
                          ? "text-[#535353] text-base opacity-60"
                          : "text-[#b3b3b3] text-base"
                    }`}
                  >
                    {l.text || "♪"}
                  </div>
                );
              })}
              {lyrics?.found && !lyrics.synced && lyrics.plain && (
                <pre className="whitespace-pre-wrap text-left text-base text-[#dcdcdc] leading-7 font-sans">
                  {lyrics.plain}
                </pre>
              )}
            </div>
          )}

          {tab === "queue" && (
            <div className="max-h-[55vh] overflow-y-auto pb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm uppercase tracking-wider text-[#b3b3b3]">Up Next ({queue.length})</h3>
                <button onClick={() => { clearQueue(); toast("Queue cleared"); }} className="text-xs text-[#b3b3b3] hover:text-red-400 flex items-center gap-1">
                  <Trash2 size={12} /> Clear
                </button>
              </div>
              {queue.length === 0 && <div className="text-[#b3b3b3]">Queue is empty.</div>}
              <div className="space-y-1">
                {queue.map((t, i) => (
                  <div
                    key={t.id + i}
                    draggable
                    onDragStart={() => setDragIndex(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragIndex !== null && dragIndex !== i) reorderQueue(dragIndex, i);
                      setDragIndex(null);
                    }}
                    className={`flex items-center gap-1 ${i === queueIndex ? "bg-[#1ed760]/10 rounded-lg" : ""}`}
                  >
                    <GripVertical size={14} className="text-[#535353] cursor-grab flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <TrackCard track={t} showIndex index={i} onPlay={() => setQueue(queue, i)} />
                    </div>
                    <button
                      onClick={() => removeFromQueue(i)}
                      className="p-2 text-[#b3b3b3] hover:text-red-400 flex-shrink-0"
                      aria-label="Remove from queue"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 sm:px-8 max-w-2xl mx-auto w-full mt-4 pb-8">
          <h1 className="sr-only">Now playing: {track.title} by {track.artist}</h1>
          <div className="text-center mb-3">
            <div className="text-xl sm:text-2xl font-black truncate">{track.title}</div>
            <button onClick={handleArtistTap} className="text-sm text-[#b3b3b3] truncate hover:text-white hover:underline">
              {track.artist}
            </button>
          </div>

          <div className="relative">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={onSeek}
              className="w-full h-1 accent-[#1ed760] cursor-pointer"
              style={{ filter: "drop-shadow(0 0 6px rgba(30,215,96,0.5))" }}
            />
            <div className="flex justify-between text-xs text-[#b3b3b3] mt-1">
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          <Waveform active={isPlaying} />

          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4">
            <button
              onClick={() => { toggleShuffle(); toast(`Shuffle ${!shuffle ? "on" : "off"}`); }}
              className={`p-2 ${shuffle ? "text-[#1ed760]" : "text-[#b3b3b3]"} hover:text-white`}
              aria-label="Shuffle"
            >
              <Shuffle size={20} />
            </button>
            <button onClick={prev} aria-label="Previous track" className="text-white p-2">
              <SkipBack size={28} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#1ed760] to-[#14a34a] text-black flex items-center justify-center hover:scale-105 transition"
              style={{ boxShadow: "0 0 30px var(--accent-glow)" }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={next} aria-label="Next track" className="text-white p-2">
              <SkipForward size={28} fill="currentColor" />
            </button>
            <button
              onClick={() => { const m = cycleRepeat(); toast(`Repeat ${m}`); }}
              className={`p-2 ${repeat !== "off" ? "text-[#1ed760]" : "text-[#b3b3b3]"} hover:text-white`}
              aria-label="Repeat"
            >
              {repeat === "one" ? <Repeat1 size={20} /> : <Repeat size={20} />}
            </button>
          </div>

          <div className="flex items-center justify-around mt-6 text-[#b3b3b3]">
            <button
              onClick={async () => {
                const r = await downloadTrack(track);
                toast(r.success ? (r.method === "saved" ? "Saved" : "Download started") : "Unavailable");
              }}
              className="p-2 hover:text-white flex flex-col items-center gap-1"
            >
              <Download size={18} />
              <span className="text-[10px]">Download</span>
            </button>
            <button
              onClick={() => {
                const now = toggleLike(track);
                setLiked(now);
                toast(now ? "Liked" : "Unliked");
              }}
              className="p-2 hover:text-white flex flex-col items-center gap-1"
            >
              <Heart size={18} className={liked ? "fill-[#1ed760] text-[#1ed760]" : ""} />
              <span className="text-[10px]">Like</span>
            </button>
            <button
              onClick={async () => {
                const url = track.source === "youtube"
                  ? `https://www.youtube.com/watch?v=${track.videoId}`
                  : window.location.href;
                try {
                  if (navigator.share) await navigator.share({ title: track.title, text: track.artist, url });
                  else { await navigator.clipboard.writeText(url); toast("Link copied"); }
                } catch { /* ignore */ }
              }}
              className="p-2 hover:text-white flex flex-col items-center gap-1"
            >
              <Share2 size={18} />
              <span className="text-[10px]">Share</span>
            </button>
            <button
              onClick={(e) => setMoreRect(e.currentTarget.getBoundingClientRect())}
              className="p-2 hover:text-white flex flex-col items-center gap-1"
            >
              <MoreHorizontal size={18} />
              <span className="text-[10px]">More</span>
            </button>
            <button
              onClick={(e) => setMoreRect(e.currentTarget.getBoundingClientRect())}
              className="p-2 hover:text-white flex flex-col items-center gap-1"
            >
              <Plus size={18} />
              <span className="text-[10px]">Add to</span>
            </button>
          </div>

          {moreRect && <MoreMenu track={track} anchorRect={moreRect} onClose={() => setMoreRect(null)} />}
        </div>
      </div>
    </div>
  );
}
