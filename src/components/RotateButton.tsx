import { useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/context/ToastContext";

const KEY = "sonara_manual_rotate";

export function useManualRotate() {
  const [rotated, setRotated] = useState(false);
  useEffect(() => {
    setRotated(localStorage.getItem(KEY) === "1");
    const handler = () => setRotated(localStorage.getItem(KEY) === "1");
    window.addEventListener("sonara:rotate", handler);
    return () => window.removeEventListener("sonara:rotate", handler);
  }, []);
  return rotated;
}

/** True when the physical device is currently held in landscape orientation. */
export function usePhysicalLandscape() {
  const [landscape, setLandscape] = useState(false);
  useEffect(() => {
    const update = () => {
      // Compare viewport dims — most reliable across mobile browsers & iframes.
      const w = window.innerWidth;
      const h = window.innerHeight;
      let isLandscape = w > h;
      // Also consult ScreenOrientation API when available (handles square-ish iframes).
      const t = (screen.orientation && screen.orientation.type) || "";
      if (t.startsWith("landscape")) isLandscape = true;
      else if (t.startsWith("portrait")) isLandscape = false;
      setLandscape(isLandscape);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    screen.orientation?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      screen.orientation?.removeEventListener?.("change", update);
    };
  }, []);
  return landscape;
}

export function RotateButton() {
  const isMobile = useIsMobile();
  const toast = useToast();
  const rotated = useManualRotate();

  if (!isMobile) return null;

  const toggle = async () => {
    const next = !rotated;
    localStorage.setItem(KEY, next ? "1" : "0");
    window.dispatchEvent(new Event("sonara:rotate"));
    try {
      const scr = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
      if (next && scr?.lock) await scr.lock("landscape");
      else if (!next && scr?.unlock) scr.unlock();
    } catch {
      // Orientation lock requires fullscreen on most browsers — CSS rotate handles the visual.
    }
    toast(next ? "Rotated to landscape" : "Rotated to portrait · auto-rotate locked");
  };

  return (
    <button
      onClick={toggle}
      aria-label={rotated ? "Rotate to portrait" : "Rotate to landscape"}
      title="Rotate view (auto-rotate is locked)"
      className="fixed bottom-[170px] right-3 z-[60] w-11 h-11 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-[0_6px_20px_rgba(30,215,96,0.5)] hover:scale-110 transition lg:hidden"
    >
      <RotateCw size={18} style={{ transform: rotated ? "rotate(90deg)" : "none" }} />
    </button>
  );
}
