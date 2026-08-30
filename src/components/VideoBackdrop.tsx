import { useEffect, useRef, useState } from "react";
import bgVideo from "@/assets/sonara-bg.mp4";

/**
 * Site-wide cinematic video backdrop.
 * Fixed behind all content, parallax-scales on scroll, GPU friendly,
 * and fully disabled for reduced-motion / save-data users.
 */
export function VideoBackdrop() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const saveData = (navigator as any)?.connection?.saveData;
    if (reduce || saveData) setEnabled(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !enabled) return;
    v.play().catch(() => {});
    const onVis = () => (document.hidden ? v.pause() : v.play().catch(() => {}));
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [enabled]);

  const p = Math.min(scrollY / 900, 1);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0f]" aria-hidden>
      {enabled && (
        <video
          ref={videoRef}
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          style={{
            transform: `scale(${1.12 + p * 0.12}) translate3d(0, ${p * -24}px, 0) rotate(${p * 0.6}deg)`,
            filter: `saturate(${1.15 - p * 0.2}) brightness(${0.55 - p * 0.15}) hue-rotate(${p * 20}deg)`,
            transition: "filter 200ms linear",
          }}
        />
      )}
      {/* depth + readability layers */}
      <div className="absolute inset-0 bg-[#0a0a0f]/55" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 20% 0%, rgba(30,215,96,0.16), transparent 60%)," +
            "radial-gradient(1000px 600px at 90% 10%, rgba(120,80,255,0.20), transparent 60%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/40 via-[#0a0a0f]/70 to-[#0a0a0f]" />
    </div>
  );
}
