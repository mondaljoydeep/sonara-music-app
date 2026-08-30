import { Search as SearchIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { NotificationsBell } from "@/components/layout/NotificationsBell";
import { TopBarExtras } from "@/components/layout/TopBarExtras";
import { AIDjButton } from "@/components/AIDjButton";
import { VoiceSearchButton } from "@/components/VoiceSearchButton";

interface TopBarProps {
  filter?: string;
  onFilterChange?: (f: string) => void;
}

const FILTERS = [
  "All", "Hindi", "English", "Bollywood",
  "K-Pop", "Lo-Fi", "Punjabi", "Tamil",
  "Trending", "New", "Chill",
];

export function TopBar({ filter, onFilterChange }: TopBarProps) {
  const navigate = useNavigate();
  const { isPlaying } = usePlayer();

  return (
    <header className="sticky top-0 z-30 bg-[#0a0a0f]/85 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-12 xl:px-16 py-3 flex items-center gap-3">
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1ed760] flex items-center justify-center text-black font-black">
            S
          </div>
          <span className="text-lg font-black tracking-tight">Sonara</span>
        </div>
        <div
          onClick={() => navigate("/search")}
          className="hidden md:flex flex-1 max-w-xl items-center gap-2 bg-[#1a1a24] border border-white/5 rounded-full px-4 py-2 cursor-pointer hover:bg-[#22222e] transition"
        >
          <SearchIcon size={18} className="text-[#b3b3b3]" />
          <span className="text-sm text-[#b3b3b3]">What do you want to listen to?</span>
        </div>
        <div className="flex-1 md:hidden" />
        <div className="flex items-center gap-2 ml-auto">
          {isPlaying && (
            <span className="hidden sm:inline-flex w-2 h-2 rounded-full bg-[#1ed760] animate-pulse-dot shadow-[0_0_10px_rgba(30,215,96,0.7)]" />
          )}
          <AIDjButton variant="icon" />
          <VoiceSearchButton />
          <TopBarExtras />
          <NotificationsBell />
          <button onClick={() => navigate("/profile")} className="w-9 h-9 rounded-full bg-[#1ed760] text-black font-bold flex items-center justify-center hover:scale-105 transition">
            S
          </button>
        </div>
      </div>
      {onFilterChange && (
        <div className="px-4 sm:px-6 lg:px-12 xl:px-16 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => {
            const active = (filter || "All") === f;
            return (
              <button
                key={f}
                onClick={() => onFilterChange(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? "bg-[#1ed760] text-black"
                    : "bg-[#1a1a24] text-[#b3b3b3] hover:bg-[#22222e]"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
