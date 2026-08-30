import { useEffect, useState } from "react";
import sonaraLogo from "@/assets/sonara-logo.jpg";

const KEY = "sonara_splash_seen";

/**
 * App-launch splash overlay. Shows once per session (or on PWA cold start)
 * to make web/PWA launches feel native. Auto-dismisses after ~1.4s.
 */
export function SonaraSplash() {
  const [show, setShow] = useState(() => {
    try { return !sessionStorage.getItem(KEY); } catch { return true; }
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!show) return;
    const t1 = setTimeout(() => setFading(true), 1100);
    const t2 = setTimeout(() => {
      setShow(false);
      try { sessionStorage.setItem(KEY, "1"); } catch { /* noop */ }
    }, 1700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [show]);

  if (!show) return null;
  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0f] via-[#15102a] to-[#0a0a0f] transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-3xl bg-[#7850ff] blur-3xl opacity-50 animate-pulse" />
        <img
          src={sonaraLogo}
          alt=""
          className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl shadow-[0_0_60px_rgba(120,80,255,0.6)]"
        />
      </div>
      <div className="mt-8 text-3xl sm:text-4xl font-black tracking-tight text-white">Sonara</div>
      <div className="mt-2 text-sm text-[#b3b3b3]">Feel every beat.</div>
      <div className="mt-10 w-32 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-[#1ed760] animate-[loadbar_1.4s_ease-out_forwards]" />
      </div>
      <style>{`
        @keyframes loadbar { from { width: 0% } to { width: 100% } }
      `}</style>
    </div>
  );
}
