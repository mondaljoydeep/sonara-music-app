/**
 * Cinematic, video-like backdrop for the Sonara home hero.
 * Pure CSS + SVG, GPU-accelerated. Zero external deps.
 *
 * Layers (back → front):
 *  1. Deep aurora gradient wash (breathing)
 *  2. Parallax star / dust field
 *  3. Perspective grid floor (scrolling)
 *  4. Floating color orbs
 *  5. Animated equalizer / waveform bars across the bottom
 *  6. Sound-wave concentric rings
 *  7. Rotating wire-cube + vinyl disc accents
 *
 * Everything is pointer-events:none and -z-0 so it never blocks UI.
 */
export function Hero3DBackdrop() {
  // 40 waveform bars with pseudo-random heights and delays.
  const bars = Array.from({ length: 40 }, (_, i) => {
    const h = 20 + ((i * 37) % 55); // 20 – 75
    const d = ((i * 91) % 100) / 100; // 0 – 1s delay
    return { h, d };
  });

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden -z-0" aria-hidden>
      {/* 1. Aurora wash */}
      <div className="absolute inset-0 opacity-90 animate-[auroraShift_18s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(1200px 600px at 15% 20%, rgba(30,215,96,0.22), transparent 60%)," +
            "radial-gradient(1000px 500px at 85% 10%, rgba(120,80,255,0.28), transparent 60%)," +
            "radial-gradient(900px 500px at 50% 90%, rgba(255,77,141,0.22), transparent 60%)",
        }}
      />

      {/* 2. Star / dust field */}
      <div className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 12% 22%, rgba(255,255,255,0.85), transparent 60%)," +
            "radial-gradient(1px 1px at 78% 14%, rgba(255,255,255,0.7), transparent 60%)," +
            "radial-gradient(1.5px 1.5px at 42% 70%, rgba(255,255,255,0.7), transparent 60%)," +
            "radial-gradient(1px 1px at 88% 60%, rgba(255,255,255,0.6), transparent 60%)," +
            "radial-gradient(1.5px 1.5px at 22% 88%, rgba(255,255,255,0.6), transparent 60%)," +
            "radial-gradient(1px 1px at 60% 40%, rgba(255,255,255,0.6), transparent 60%)",
          animation: "starsDrift 22s linear infinite",
        }}
      />

      {/* 3. Perspective grid floor */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] [perspective:700px]">
        <div
          className="absolute inset-0 origin-top opacity-40"
          style={{
            transform: "rotateX(62deg)",
            backgroundImage:
              "linear-gradient(rgba(30,215,96,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(120,80,255,0.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "linear-gradient(to bottom, transparent, black 25%, black 70%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 25%, black 70%, transparent)",
            animation: "gridScroll 12s linear infinite",
          }}
        />
      </div>

      {/* 4. Floating orbs */}
      <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full blur-3xl opacity-60 bg-[radial-gradient(circle_at_30%_30%,#1ed760,transparent_60%)] animate-[orbFloat_9s_ease-in-out_infinite]" />
      <div className="absolute top-16 right-0 w-80 h-80 rounded-full blur-3xl opacity-60 bg-[radial-gradient(circle_at_70%_30%,#7850ff,transparent_60%)] animate-[orbFloat_11s_ease-in-out_infinite_reverse]" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-50 bg-[radial-gradient(circle_at_50%_50%,#ff4d8d,transparent_60%)] animate-[orbFloat_13s_ease-in-out_infinite]" />

      {/* 5. Bottom equalizer / waveform */}
      <div className="absolute inset-x-0 bottom-0 h-24 flex items-end justify-center gap-[3px] px-2 opacity-70">
        {bars.map((b, i) => (
          <span
            key={i}
            className="w-[6px] rounded-t-sm bg-gradient-to-t from-[#1ed760] via-[#7850ff] to-[#ff4d8d] shadow-[0_0_8px_rgba(30,215,96,0.5)]"
            style={{
              height: `${b.h}%`,
              animation: `barPulse 1.1s ease-in-out ${b.d}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* 6. Sound wave concentric rings (center-right) */}
      <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-50">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute inline-block rounded-full border border-[#1ed760]/60"
            style={{
              width: 80,
              height: 80,
              left: -40,
              top: -40,
              animation: `ringPulse 3s ease-out ${i * 1}s infinite`,
            }}
          />
        ))}
      </div>

      {/* 7. Rotating wire-cube */}
      <div className="absolute top-6 right-6 sm:right-10 [perspective:600px] opacity-80">
        <div className="relative w-20 h-20 sm:w-28 sm:h-28 [transform-style:preserve-3d] animate-[cubeSpin_14s_linear_infinite]">
          {[
            "rotateY(0deg) translateZ(40px)",
            "rotateY(90deg) translateZ(40px)",
            "rotateY(180deg) translateZ(40px)",
            "rotateY(-90deg) translateZ(40px)",
            "rotateX(90deg) translateZ(40px)",
            "rotateX(-90deg) translateZ(40px)",
          ].map((t, i) => (
            <div
              key={i}
              className="absolute inset-0 border border-[#1ed760]/60 rounded-md bg-[#1ed760]/5 backdrop-blur-[1px]"
              style={{ transform: t }}
            />
          ))}
        </div>
      </div>

      {/* Vinyl disc bottom-left */}
      <div className="absolute -bottom-10 -left-10 opacity-70">
        <div className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-[radial-gradient(circle,#0a0a0f_30%,#1a1a24_31%,#0a0a0f_60%,#1a1a24_61%,#0a0a0f)] border border-white/10 animate-spin-slow shadow-[0_0_60px_rgba(120,80,255,0.4)]">
          <div className="absolute inset-1/3 rounded-full bg-gradient-to-br from-[#1ed760] to-[#7850ff]" />
          <div className="absolute inset-[46%] rounded-full bg-[#0a0a0f]" />
        </div>
      </div>

      {/* Soft bottom fade so content below never merges with backdrop */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#0a0a0f]" />

      <style>{`
        @keyframes auroraShift {
          0%,100% { filter: hue-rotate(0deg) saturate(1); transform: scale(1); }
          50%     { filter: hue-rotate(25deg) saturate(1.15); transform: scale(1.05); }
        }
        @keyframes gridScroll {
          0%   { background-position: 0 0, 0 0; }
          100% { background-position: 0 44px, 44px 0; }
        }
        @keyframes orbFloat {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50%     { transform: translate3d(20px,-30px,0) scale(1.1); }
        }
        @keyframes cubeSpin {
          0%   { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(180deg); }
        }
        @keyframes starsDrift {
          0%   { background-position: 0 0; }
          100% { background-position: -200px 100px; }
        }
        @keyframes barPulse {
          0%   { transform: scaleY(0.35); opacity: 0.55; }
          100% { transform: scaleY(1);    opacity: 1; }
        }
        @keyframes ringPulse {
          0%   { transform: scale(0.4); opacity: 0.9; }
          100% { transform: scale(3.2); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pointer-events-none [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
