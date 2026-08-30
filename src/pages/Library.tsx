import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Heart, ListMusic, Plus, Trash2, Upload, Download, Search } from "lucide-react";
import {
  createPlaylist,
  deletePlaylist,
  getLikedSongs,
  getPlaylists,
  getRecentlyPlayed,
  getUploads,
  removeFromPlaylist,
  toggleLike,
} from "@/services/libraryService";
import type { Playlist, Track } from "@/types/music";
import { TrackCard } from "@/components/cards/TrackCard";
import { usePlayer } from "@/context/PlayerContext";
import { useToast } from "@/context/ToastContext";

type View = "main" | "liked" | "playlist" | "recent" | "uploads" | "downloads";
type SortMode = "date" | "title" | "artist";

function relTime(ts?: number) {
  if (!ts) return "";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

function groupRecent(tracks: Track[]) {
  const today: Track[] = [];
  const yesterday: Track[] = [];
  const week: Track[] = [];
  const earlier: Track[] = [];
  const now = Date.now();
  for (const t of tracks) {
    const age = now - (t.playedAt || 0);
    if (age < 24 * 3600 * 1000) today.push(t);
    else if (age < 48 * 3600 * 1000) yesterday.push(t);
    else if (age < 7 * 24 * 3600 * 1000) week.push(t);
    else earlier.push(t);
  }
  return { today, yesterday, week, earlier };
}

export default function Library() {
  const [view, setView] = useState<View>("main");
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [liked, setLiked] = useState<Track[]>([]);
  const [recent, setRecent] = useState<Track[]>([]);
  const [uploads, setUploads] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("date");
  const { setQueue } = usePlayer();
  const toast = useToast();

  const refresh = () => {
    setLiked(getLikedSongs());
    setRecent(getRecentlyPlayed());
    setUploads(getUploads());
    setPlaylists(getPlaylists());
  };

  useEffect(() => { refresh(); }, [view]);

  const handleNewPlaylist = () => {
    const name = prompt("Playlist name?");
    if (!name?.trim()) return;
    createPlaylist(name.trim());
    refresh();
    toast("Playlist created");
  };

  const sortedFilteredLiked = useMemo(() => {
    let arr = liked;
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
    }
    return [...arr].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "artist") return a.artist.localeCompare(b.artist);
      return (b.likedAt || 0) - (a.likedAt || 0);
    });
  }, [liked, search, sort]);

  const downloads = useMemo(() => {
    // saved = liked tracks (YouTube saved-as-liked) + uploads + audius likes
    const all = [...uploads, ...liked.filter((t) => t.source !== "youtube")];
    const seen = new Set<string>();
    return all.filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)));
  }, [liked, uploads]);

  const renderTrackList = (tracks: Track[], onRemove?: (id: string) => void) => (
    <div className="space-y-1">
      {tracks.map((t, i) => (
        <div key={t.id + i} className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <TrackCard track={t} index={i} showIndex onPlay={() => setQueue(tracks, i)} />
          </div>
          {onRemove && (
            <button
              onClick={() => { onRemove(t.id); }}
              className="p-2 text-[#b3b3b3] hover:text-red-400"
              aria-label="Remove"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  if (view === "liked") {
    return (
      <div className="px-4 sm:px-6 lg:px-12 xl:px-16 pt-6">
        <button onClick={() => setView("main")} className="text-sm text-[#b3b3b3] mb-4">← Back</button>
        <div className="flex items-end gap-4 mb-6">
          <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-xl bg-gradient-to-br from-[#1ed760] to-[#0a5c2a] flex items-center justify-center shadow-2xl">
            <Heart size={48} fill="white" className="text-white" />
          </div>
          <div>
            <div className="text-xs text-[#b3b3b3] uppercase tracking-wider">Playlist</div>
            <h1 className="text-3xl sm:text-5xl font-black">Liked Songs</h1>
            <div className="text-sm text-[#b3b3b3] mt-2">{liked.length} songs</div>
          </div>
        </div>

        {liked.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={48} className="mx-auto text-[#535353] mb-3" />
            <div className="text-white font-semibold">No liked songs yet</div>
            <div className="text-sm text-[#b3b3b3] mt-1">Like songs to see them here.</div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="flex-1 flex items-center gap-2 bg-[#1a1a24] rounded-full px-4 py-2">
                <Search size={16} className="text-[#b3b3b3]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search liked songs"
                  aria-label="Search liked songs"
                  className="bg-transparent outline-none text-sm flex-1"
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                aria-label="Sort liked songs"
                className="bg-[#1a1a24] rounded-full px-4 py-2 text-sm outline-none"
              >
                <option value="date">Recently liked</option>
                <option value="title">Title (A–Z)</option>
                <option value="artist">Artist (A–Z)</option>
              </select>
              <button
                onClick={() => setQueue(sortedFilteredLiked, 0)}
                className="px-5 py-2 rounded-full bg-[#1ed760] text-black text-sm font-semibold hover:scale-105 transition"
              >
                ▶ Play all
              </button>
            </div>
            {renderTrackList(sortedFilteredLiked, (id) => {
              const tr = liked.find((t) => t.id === id);
              if (tr) { toggleLike(tr); refresh(); toast("Removed from Liked"); }
            })}
          </>
        )}
      </div>
    );
  }

  if (view === "recent") {
    const groups = groupRecent(recent);
    const Section = ({ title, items }: { title: string; items: Track[] }) =>
      items.length === 0 ? null : (
        <section className="mb-6">
          <h2 className="text-sm uppercase tracking-wider text-[#b3b3b3] mb-2">{title}</h2>
          <div className="space-y-1">
            {items.map((t, i) => (
              <div key={t.id + i} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <TrackCard track={t} onPlay={() => setQueue(items, i)} />
                </div>
                <span className="text-xs text-[#b3b3b3] hidden sm:block flex-shrink-0">{relTime(t.playedAt)}</span>
              </div>
            ))}
          </div>
        </section>
      );

    return (
      <div className="px-4 sm:px-6 lg:px-12 xl:px-16 pt-6">
        <button onClick={() => setView("main")} className="text-sm text-[#b3b3b3] mb-4">← Back</button>
        <h1 className="text-3xl sm:text-5xl font-black mb-6">🕐 Recently Played</h1>
        {recent.length === 0 ? (
          <div className="text-[#b3b3b3]">Nothing played yet.</div>
        ) : (
          <>
            <Section title="Today" items={groups.today} />
            <Section title="Yesterday" items={groups.yesterday} />
            <Section title="This week" items={groups.week} />
            <Section title="Earlier" items={groups.earlier} />
          </>
        )}
      </div>
    );
  }

  if (view === "uploads") {
    return (
      <div className="px-4 sm:px-6 lg:px-12 xl:px-16 pt-6">
        <button onClick={() => setView("main")} className="text-sm text-[#b3b3b3] mb-4">← Back</button>
        <h1 className="text-3xl sm:text-5xl font-black mb-6">My Uploads</h1>
        {uploads.length === 0 ? (
          <div className="text-center py-16">
            <Upload size={48} className="mx-auto text-[#535353] mb-3" />
            <div className="text-white font-semibold">No uploads yet</div>
            <div className="text-sm text-[#b3b3b3] mt-1">Upload from the Profile page.</div>
          </div>
        ) : (
          renderTrackList(uploads)
        )}
      </div>
    );
  }

  if (view === "downloads") {
    return (
      <div className="px-4 sm:px-6 lg:px-12 xl:px-16 pt-6">
        <button onClick={() => setView("main")} className="text-sm text-[#b3b3b3] mb-4">← Back</button>
        <h1 className="text-3xl sm:text-5xl font-black mb-6">⬇️ Downloads</h1>
        <p className="text-sm text-[#b3b3b3] mb-4">
          Audius and uploaded tracks are saved locally. YouTube tracks are saved as Liked.
        </p>
        {downloads.length === 0 ? (
          <div className="text-center py-16">
            <Download size={48} className="mx-auto text-[#535353] mb-3" />
            <div className="text-white font-semibold">No downloads yet</div>
            <div className="text-sm text-[#b3b3b3] mt-1">Download or like songs to see them here.</div>
          </div>
        ) : (
          renderTrackList(downloads)
        )}
      </div>
    );
  }

  if (view === "playlist" && activePlaylist) {
    const pl = playlists.find((p) => p.id === activePlaylist.id) || activePlaylist;
    return (
      <div className="px-4 sm:px-6 lg:px-12 xl:px-16 pt-6">
        <button onClick={() => setView("main")} className="text-sm text-[#b3b3b3] mb-4">← Back</button>
        <div className="flex items-end gap-4 mb-6">
          <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-xl overflow-hidden bg-gradient-to-br from-[#7209b7] to-[#3a0ca3] flex items-center justify-center shadow-2xl grid grid-cols-2 grid-rows-2">
            {pl.tracks.slice(0, 4).map((t, i) => (
              t.artwork
                ? <img key={i} src={t.artwork} alt="" className="w-full h-full object-cover" />
                : <div key={i} className="bg-[#3a0ca3]" />
            ))}
            {pl.tracks.length === 0 && <ListMusic size={48} className="col-span-2 row-span-2 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[#b3b3b3] uppercase tracking-wider">Playlist</div>
            <h1 className="text-3xl sm:text-5xl font-black truncate">{pl.name}</h1>
            <div className="text-sm text-[#b3b3b3] mt-2">{pl.tracks.length} songs</div>
            {pl.tracks.length > 0 && (
              <button
                onClick={() => setQueue(pl.tracks, 0)}
                className="mt-3 px-5 py-2 rounded-full bg-[#1ed760] text-black text-sm font-semibold hover:scale-105 transition"
              >
                ▶ Play all
              </button>
            )}
          </div>
          <button
            onClick={() => {
              if (confirm(`Delete "${pl.name}"?`)) {
                deletePlaylist(pl.id);
                refresh();
                setView("main");
                toast("Playlist deleted");
              }
            }}
            className="p-2 text-[#b3b3b3] hover:text-red-400"
            aria-label="Delete playlist"
          >
            <Trash2 size={20} />
          </button>
        </div>
        {pl.tracks.length === 0 ? (
          <div className="text-[#b3b3b3]">Add songs from anywhere using the ⋯ menu.</div>
        ) : (
          renderTrackList(pl.tracks, (id) => {
            removeFromPlaylist(pl.id, id);
            refresh();
            toast("Removed from playlist");
          })
        )}
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-12 xl:px-16 pt-6">
      <Helmet>
        <title>Your Library — Playlists, Liked Songs & Uploads | Sonara</title>
        <meta name="description" content="Your Sonara library: liked songs, playlists, uploads, downloads and recently played tracks in one place." />
        <link rel="canonical" href="https://sonora-rhythm.lovable.app/library" />
        <meta property="og:title" content="Your Library on Sonara" />
        <meta property="og:description" content="Liked songs, playlists, uploads and recently played tracks — your music, organized." />
        <meta property="og:url" content="https://sonora-rhythm.lovable.app/library" />
      </Helmet>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl sm:text-4xl font-black">Your Library</h1>
        <button
          onClick={handleNewPlaylist}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1ed760] text-black text-sm font-semibold hover:scale-105 transition"
        >
          <Plus size={16} /> New
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button
          onClick={() => setView("liked")}
          className="flex items-center gap-4 p-3 rounded-xl bg-[#1a1a24] hover:bg-[#22222e] transition"
        >
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#1ed760] to-[#0a5c2a] flex items-center justify-center">
            <Heart size={28} fill="white" className="text-white" />
          </div>
          <div className="text-left">
            <div className="font-semibold">Liked Songs</div>
            <div className="text-xs text-[#b3b3b3]">{liked.length} songs</div>
          </div>
        </button>

        <button
          onClick={() => setView("recent")}
          className="flex items-center gap-4 p-3 rounded-xl bg-[#1a1a24] hover:bg-[#22222e] transition"
        >
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#3a86ff] to-[#0466c8] flex items-center justify-center text-2xl">🕐</div>
          <div className="text-left">
            <div className="font-semibold">Recently Played</div>
            <div className="text-xs text-[#b3b3b3]">{recent.length} songs</div>
          </div>
        </button>

        <button
          onClick={() => setView("uploads")}
          className="flex items-center gap-4 p-3 rounded-xl bg-[#1a1a24] hover:bg-[#22222e] transition"
        >
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#fb8500] to-[#ffb703] flex items-center justify-center">
            <Upload size={28} className="text-white" />
          </div>
          <div className="text-left">
            <div className="font-semibold">My Uploads</div>
            <div className="text-xs text-[#b3b3b3]">{uploads.length} songs</div>
          </div>
        </button>

        <button
          onClick={() => setView("downloads")}
          className="flex items-center gap-4 p-3 rounded-xl bg-[#1a1a24] hover:bg-[#22222e] transition"
        >
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#06d6a0] to-[#118ab2] flex items-center justify-center">
            <Download size={28} className="text-white" />
          </div>
          <div className="text-left">
            <div className="font-semibold">Downloads</div>
            <div className="text-xs text-[#b3b3b3]">{downloads.length} songs</div>
          </div>
        </button>

        {playlists.map((p) => (
          <button
            key={p.id}
            onClick={() => { setActivePlaylist(p); setView("playlist"); }}
            className="flex items-center gap-4 p-3 rounded-xl bg-[#1a1a24] hover:bg-[#22222e] transition"
          >
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#7209b7] to-[#3a0ca3] flex items-center justify-center overflow-hidden grid grid-cols-2 grid-rows-2">
              {p.tracks.slice(0, 4).map((t, i) => (
                t.artwork
                  ? <img key={i} src={t.artwork} alt="" className="w-full h-full object-cover" />
                  : <div key={i} className="bg-[#3a0ca3]" />
              ))}
              {p.tracks.length === 0 && <ListMusic size={28} className="col-span-2 row-span-2 text-white" />}
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="font-semibold truncate">{p.name}</div>
              <div className="text-xs text-[#b3b3b3]">{p.tracks.length} songs</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
