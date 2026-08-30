import { useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { isLiked, toggleLike } from "@/services/libraryService";
import { useToast } from "@/context/ToastContext";
import { useNavigate } from "react-router-dom";

export function useKeyboardShortcuts() {
  const { track, togglePlay, next, prev, seekRelative, toggleShuffle, cycleRepeat } = usePlayer();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;

      switch (e.key) {
        case " ":
          if (track) { e.preventDefault(); togglePlay(); }
          break;
        case "ArrowLeft":
          if (e.shiftKey) { e.preventDefault(); prev(); }
          else { e.preventDefault(); seekRelative(-10); }
          break;
        case "ArrowRight":
          if (e.shiftKey) { e.preventDefault(); next(); }
          else { e.preventDefault(); seekRelative(10); }
          break;
        case "l":
        case "L":
          if (track) {
            const now = toggleLike(track);
            toast(now ? "Liked" : "Unliked");
          }
          break;
        case "s":
        case "S":
          { toggleShuffle(); toast(`Shuffle toggled`); }
          break;
        case "r":
        case "R":
          { const m = cycleRepeat(); toast(`Repeat ${m}`); }
          break;
        case "f":
        case "F":
          if (track) navigate("/player");
          break;
      }
      // unused isLiked import suppression
      void isLiked;
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [track, togglePlay, next, prev, seekRelative, toggleShuffle, cycleRepeat, toast, navigate]);
}
