import { Heart, ListMusic, Music2, Pause, Play, SkipBack, SkipForward, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { isLiked, toggleLike } from "@/services/libraryService";
import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { getLyrics, type LyricsResult } from "@/services/lyricsService";
import { getSettings, subscribeSettings } from "@/services/settingsService";
import { PersonalizedAdBanner } from "@/components/ads/PersonalizedAdBanner";


function fmtMs(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function MiniPlayer() {
  const { track, isPlaying, currentTime, duration, togglePlay, next, prev, sleepRemainingMs, sleepEndOfSong } = usePlayer();
  const navigate = useNavigate();
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
  const [showLyric, setShowLyric] = useState(getSettings().lyricsOnMini);

  useEffect(() => subscribeSettings((s) => setShowLyric(s.lyricsOnMini)), []);

  useEffect(() => {
    setLiked(track ? isLiked(track.id) : false);
    setLyrics(null);
    if (track && showLyric) {
      let cancelled = false;
      void getLyrics(track.title, track.artist).then((r) => {
        if (!cancelled) setLyrics(r);
      });
      return () => { cancelled = true; };
    }
  }, [track, showLyric]);

  if (!track) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const onLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!track) return;
    const now = toggleLike(track);
    setLiked(now);
    toast(now ? "Added to Liked Songs" : "Removed from Liked Songs");
  };

  const currentLine = (() => {
    if (!showLyric || !lyrics?.synced || !lyrics.lines) return null;
    const idx = lyrics.lines.findIndex((l, i) => {
      const nx = lyrics.lines![i + 1];
      return currentTime >= l.time && (!nx || currentTime < nx.time);
    });
    return idx >= 0 ? lyrics.lines[idx]?.text : null;
  })();

  return (
    <div className="fixed left-0 right-0 bottom-[60px] lg:bottom-0 z-40 animate-slide-up">
      <PersonalizedAdBanner variant="strip" contextArtist={track.artist} />
      {(currentLine || sleepRemainingMs !== null || sleepEndOfSong) && (

        <div className="px-4 py-1 bg-[#0d0d14]/80 backdrop-blur-xl text-center flex items-center justify-center gap-3 border-t border-white/5">
          {currentLine && (
            <div className="text-xs text-[#b3b3b3] italic truncate max-w-md animate-fade-in" key={currentLine}>
              ♪ {currentLine}
            </div>
          )}
          {sleepEndOfSong && (
            <div className="text-xs text-[#1ed760] flex items-center gap-1">
              <Moon size={12} /> Stops at end of song
            </div>
          )}
          {sleepRemainingMs !== null && (
            <div className="text-xs text-[#1ed760] flex items-center gap-1">
              <Moon size={12} /> {fmtMs(sleepRemainingMs)}
            </div>
          )}
        </div>
      )}
      <div className="bg-[#181818]/95 backdrop-blur-xl border-t border-white/5">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5">
          <div
            className="h-full bg-[#1ed760] transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 max-w-screen-2xl mx-auto">
          <div
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
            onClick={() => navigate("/player")}
          >
            <div className={`relative w-12 h-12 rounded-md overflow-hidden bg-[#22222e] flex-shrink-0 ${isPlaying ? "animate-spin-slow" : ""}`}>
              {track.artwork ? (
                <img src={track.artwork} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music2 size={20} className="text-[#535353]" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{track.title}</div>
              <div className="text-xs text-[#b3b3b3] truncate">{track.artist}</div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={prev} className="p-2 text-[#b3b3b3] hover:text-white hidden sm:block">
              <SkipBack size={20} />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            <button onClick={next} className="p-2 text-[#b3b3b3] hover:text-white">
              <SkipForward size={20} />
            </button>
          </div>

          <div className="flex items-center gap-1 ml-1 sm:ml-2">
            <button onClick={onLike} className="p-2 text-[#b3b3b3] hover:text-white" aria-label="Like">
              <Heart size={18} className={liked ? "fill-[#1ed760] text-[#1ed760]" : ""} />
            </button>
            <button
              onClick={() => navigate("/player?tab=queue")}
              className="relative p-2 text-[#b3b3b3] hover:text-white"
              aria-label="Open queue"
              title="Queue"
            >
              <ListMusic size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
