import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Desktop-friendly horizontal rail:
 *  - hover arrows (mouse / laptop)
 *  - click-and-drag panning
 *  - shift + wheel horizontal scroll
 *  - native touch swipe still works on mobile
 */
export function ScrollRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, children]);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" });
  };

  const onWheel = (e: React.WheelEvent) => {
    const el = ref.current;
    if (!el) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // trackpad native
    if (!e.shiftKey) return;
    el.scrollLeft += e.deltaY;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const el = ref.current;
    if (!el) return;
    drag.current = { active: true, moved: false, startX: e.clientX, startScroll: el.scrollLeft };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  };
  const endDrag = (e: React.PointerEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
    drag.current.active = false;
    setTimeout(() => (drag.current.moved = false), 0);
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const arrow =
    "hidden lg:flex absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/70 backdrop-blur border border-white/15 text-white hover:bg-[#1ed760] hover:text-black hover:scale-110 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.6)]";

  return (
    <div className="relative group/rail">
      {!atStart && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollBy(-1)}
          className={`${arrow} -left-3 opacity-0 group-hover/rail:opacity-100`}
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {!atEnd && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollBy(1)}
          className={`${arrow} -right-3 opacity-0 group-hover/rail:opacity-100`}
        >
          <ChevronRight size={20} />
        </button>
      )}
      <div
        ref={ref}
        onScroll={update}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        className={`flex gap-4 overflow-x-auto no-scrollbar -mx-1 px-1 pb-2 scroll-smooth lg:cursor-grab lg:active:cursor-grabbing ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
