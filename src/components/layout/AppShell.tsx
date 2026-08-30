import { ReactNode, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { MiniPlayer } from "./MiniPlayer";
import { usePlayer } from "@/context/PlayerContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { RotateButton, useManualRotate, usePhysicalLandscape } from "@/components/RotateButton";
import { VideoBackdrop } from "@/components/VideoBackdrop";
import { SiteFooter } from "@/components/layout/SiteFooter";

/** Rotation-safe mobile check: based on the smaller viewport edge + touch capability. */
function useMobileDevice() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      const minEdge = Math.min(window.innerWidth, window.innerHeight);
      const coarse = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
      setMobile(minEdge < 768 && coarse);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);
  return mobile;
}

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { track } = usePlayer();
  useKeyboardShortcuts();
  const manualLandscape = useManualRotate();
  const physicalLandscape = usePhysicalLandscape();
  const isMobile = useMobileDevice();
  const pb = track
    ? "pb-[150px] lg:pb-[100px]"
    : "pb-[80px] lg:pb-6";

  // Desired visual orientation (based only on the rotate button — never the device).
  const desiredLandscape = manualLandscape;
  // Counter-rotate whenever the device orientation doesn't match what the user chose.
  const needsRotate = isMobile && desiredLandscape !== physicalLandscape;

  // +90 if we need to go portrait→landscape, -90 for landscape→portrait.
  const angle = needsRotate ? (desiredLandscape ? 90 : -90) : 0;
  // Swap viewport dims when the layout orientation differs from the device.
  const w = needsRotate ? "100vh" : "100vw";
  const h = needsRotate ? "100vw" : "100vh";
  const translate = angle === 90 ? "translateY(-100%)" : angle === -90 ? "translateX(-100%)" : "";

  const rotateWrapperStyle: React.CSSProperties = needsRotate
    ? {
        width: w,
        height: h,
        transform: `rotate(${angle}deg) ${translate}`.trim(),
        transformOrigin: "top left",
        position: "absolute",
        top: 0,
        left: 0,
        overflowX: "hidden",
      }
    : {};

  return (
    <div
      style={
        needsRotate
          ? { width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }
          : undefined
      }
    >
      <div style={rotateWrapperStyle} className={needsRotate ? "" : "min-h-screen"}>
        <div className="min-h-screen text-white relative">
          <VideoBackdrop />
          <Sidebar />
          <div className={`lg:ml-64 max-w-screen-2xl mx-auto ${pb}`}>
            {children}
            <SiteFooter />
          </div>
          <MiniPlayer />
          <BottomNav />
        </div>
      </div>
      <RotateButton />
    </div>
  );
}
