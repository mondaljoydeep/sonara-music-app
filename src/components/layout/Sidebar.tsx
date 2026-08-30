import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Home, Search, Library, User, LogIn, LogOut, Music2, History, Heart,
  Upload, Users, Sparkles, Sliders, Radio, Mail,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePlayer } from "@/context/PlayerContext";
import { getRecentlyPlayed, getLikedSongs } from "@/services/libraryService";
import type { Track } from "@/types/music";
import sonaraLogo from "@/assets/sonara-logo.jpg";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/library", label: "Your Library", icon: Library },
  { to: "/community", label: "AI Community", icon: Users },
  { to: "/upload", label: "Upload Track", icon: Upload },
  { to: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { setQueue, track } = usePlayer();
  const [history, setHistory] = useState<Track[]>([]);
  const [likedCount, setLikedCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setHistory(getRecentlyPlayed().slice(0, 12));
      setLikedCount(getLikedSongs().length);
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [track?.id]);

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0f]/80 backdrop-blur-2xl border-r border-white/10 z-30 px-4 py-6">
      <Link to="/" className="flex items-center gap-3 px-1 mb-7 group">
        <img
          src={sonaraLogo}
          alt="Sonara logo"
          className="w-10 h-10 rounded-xl object-cover ring-1 ring-[#1ed760]/40 shadow-[0_8px_28px_rgba(30,215,96,0.35)] group-hover:scale-105 transition-transform"
        />
        <div className="leading-none">
          <div className="text-xl font-black tracking-tight">Sonara</div>
          <div className="text-[10px] text-[#1ed760] tracking-widest uppercase mt-1">Feel Every Beat</div>
        </div>
      </Link>

      <nav className="space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-white/10 text-white" : "text-[#b3b3b3] hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon size={19} /> {label}
          </NavLink>
        ))}
      </nav>

      {/* Quick actions */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link
          to="/library?tab=liked"
          className="rounded-xl px-3 py-2.5 bg-gradient-to-br from-[#ff4d8d]/25 to-[#7850ff]/20 border border-white/10 hover:border-white/25 transition"
        >
          <Heart size={16} className="text-[#ff4d8d]" />
          <div className="text-xs font-semibold mt-1.5">Liked</div>
          <div className="text-[10px] text-[#b3b3b3]">{likedCount} songs</div>
        </Link>
        <Link
          to="/player?tab=queue"
          className="rounded-xl px-3 py-2.5 bg-gradient-to-br from-[#1ed760]/25 to-[#7850ff]/20 border border-white/10 hover:border-white/25 transition"
        >
          <Sliders size={16} className="text-[#1ed760]" />
          <div className="text-xs font-semibold mt-1.5">Queue</div>
          <div className="text-[10px] text-[#b3b3b3]">Reorder mix</div>
        </Link>
      </div>

      {/* Recently played history */}
      <div className="mt-6 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-1 mb-2">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#8b8b8b] flex items-center gap-1.5">
            <History size={13} /> Recently played
          </h2>
          {history.length > 0 && (
            <button
              onClick={() => setQueue(history, 0)}
              className="text-[10px] text-[#1ed760] hover:underline"
            >
              Play all
            </button>
          )}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-1 pr-1">
          {history.length === 0 ? (
            <p className="text-xs text-[#6b6b6b] px-1">Nothing played yet — start listening.</p>
          ) : (
            history.map((t, i) => (
              <button
                key={t.id + "_" + i}
                onClick={() => setQueue(history, i)}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition ${
                  track?.id === t.id ? "bg-[#1ed760]/15" : "hover:bg-white/5"
                }`}
              >
                <img
                  src={t.artwork || "/placeholder.svg"}
                  alt={`${t.title} by ${t.artist} cover art`}
                  loading="lazy"
                  className="w-9 h-9 rounded object-cover flex-shrink-0"
                />
                <span className="min-w-0">
                  <span className={`block text-xs font-medium truncate ${track?.id === t.id ? "text-[#1ed760]" : "text-white"}`}>
                    {t.title}
                  </span>
                  <span className="block text-[10px] text-[#8b8b8b] truncate">{t.artist}</span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        {user ? (
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#b3b3b3] hover:text-white hover:bg-white/5"
          >
            <LogOut size={18} /> Sign out
          </button>
        ) : (
          <Link
            to="/login"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold bg-[#1ed760] text-black hover:scale-[1.01] transition"
          >
            <LogIn size={18} /> Sign in
          </Link>
        )}
      </div>

      <div className="mt-3 px-1 text-[10px] text-[#5a5a5a] space-y-1">
        <div className="flex items-center gap-1.5"><Radio size={12} /> Saavn · YouTube · Audius</div>
        <a href="mailto:developerworkjoy@gmail.com" className="flex items-center gap-1.5 hover:text-white">
          <Mail size={12} /> developerworkjoy@gmail.com
        </a>
        <div className="flex gap-3 pt-1">
          <Link to="/privacy" className="hover:text-white">Privacy</Link>
          <Link to="/terms" className="hover:text-white">Terms</Link>
        </div>
        <div className="flex items-center gap-1.5 pt-1 text-[#4a4a4a]">
          <Sparkles size={11} /> © {new Date().getFullYear()} Sonara
        </div>
      </div>
    </aside>
  );
}
