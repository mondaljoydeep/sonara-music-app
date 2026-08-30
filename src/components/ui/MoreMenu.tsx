import { useEffect, useRef, useState } from "react";
import { Heart, Play, ListPlus, ListMusic, Share2, Download, Info, Plus } from "lucide-react";
import type { Track } from "@/types/music";
import { isLiked, toggleLike, getPlaylists, addToPlaylist, createPlaylist, downloadTrack } from "@/services/libraryService";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";

interface MoreMenuProps {
  track: Track;
  onClose: () => void;
  anchorRect?: DOMRect | null;
}

export function MoreMenu({ track, onClose, anchorRect }: MoreMenuProps) {
  const { playNext, addToQueue } = usePlayer();
  const toast = useToast();
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [liked, setLiked] = useState(() => isLiked(track.id));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener("mousedown", onClick), 0);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  const style = (() => {
    if (!anchorRect) return { bottom: 80, right: 20 } as React.CSSProperties;
    const top = Math.min(anchorRect.bottom + 6, window.innerHeight - 360);
    const right = Math.max(window.innerWidth - anchorRect.right, 8);
    return { top, right } as React.CSSProperties;
  })();

  const playlists = getPlaylists();

  const handleLike = () => {
    const now = toggleLike(track);
    setLiked(now);
    toast(now ? "Added to Liked Songs" : "Removed from Liked Songs");
    onClose();
  };

  const handleNewPlaylist = () => {
    const name = prompt("Playlist name?");
    if (!name?.trim()) return;
    const pl = createPlaylist(name.trim());
    addToPlaylist(pl.id, track);
    toast(`Added to ${pl.name}`);
    onClose();
  };

  const handleShare = async () => {
    const url = track.source === "youtube"
      ? `https://www.youtube.com/watch?v=${track.videoId}`
      : window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: track.title, text: `${track.title} — ${track.artist}`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Link copied");
      }
    } catch {
      // ignore
    }
    onClose();
  };

  const handleDownload = async () => {
    const r = await downloadTrack(track);
    if (r.success && r.method === "saved") toast("Saved to Liked Songs");
    else if (r.success) toast("Download started");
    else toast("Download unavailable");
    onClose();
  };

  return (
    <div
      ref={ref}
      style={style}
      className="fixed z-[80] w-64 rounded-xl bg-[#22222e] border border-white/10 shadow-2xl overflow-hidden animate-fade-in"
    >
      {!showPlaylists ? (
        <ul className="py-2 text-sm">
          <li>
            <button onClick={handleLike} className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-white/5">
              <Heart size={16} className={liked ? "fill-[#1ed760] text-[#1ed760]" : ""} />
              {liked ? "Remove from Liked" : "Like"}
            </button>
          </li>
          <li>
            <button onClick={() => { playNext(track); toast("Playing next"); onClose(); }} className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-white/5">
              <Play size={16} /> Play Next
            </button>
          </li>
          <li>
            <button onClick={() => { addToQueue(track); toast("Added to queue"); onClose(); }} className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-white/5">
              <ListPlus size={16} /> Add to Queue
            </button>
          </li>
          <li>
            <button onClick={() => setShowPlaylists(true)} className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-white/5">
              <ListMusic size={16} /> Add to Playlist
            </button>
          </li>
          <li>
            <button onClick={handleShare} className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-white/5">
              <Share2 size={16} /> Share
            </button>
          </li>
          <li>
            <button onClick={handleDownload} className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-white/5">
              <Download size={16} /> Download
            </button>
          </li>
          <li>
            <button onClick={() => { toast(`${track.title} — ${track.artist}`); onClose(); }} className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-white/5">
              <Info size={16} /> Track Info
            </button>
          </li>
        </ul>
      ) : (
        <div className="py-2 text-sm max-h-80 overflow-y-auto">
          <div className="px-4 py-2 text-xs uppercase tracking-wide text-[#b3b3b3]">Add to playlist</div>
          <button onClick={handleNewPlaylist} className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-white/5">
            <Plus size={16} /> New playlist
          </button>
          {playlists.length === 0 ? (
            <div className="px-4 py-3 text-[#b3b3b3] text-xs">No playlists yet</div>
          ) : (
            playlists.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  const ok = addToPlaylist(p.id, track);
                  toast(ok ? `Added to ${p.name}` : "Already in playlist");
                  onClose();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-white/5"
              >
                <ListMusic size={16} /> {p.name}
                <span className="ml-auto text-xs text-[#b3b3b3]">{p.tracks.length}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
