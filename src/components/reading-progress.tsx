"use client";

import { useEffect, useRef } from "react";

/**
 * Thin ink reading-progress line pinned to the top edge of a case study — the
 * page "fills" with ink as you read, the same liquid the rest of the site
 * bleeds. Transform-only (scaleX) inside one rAF-throttled scroll listener, so
 * it never touches layout. Hidden from AT (purely decorative) and gone under
 * reduced motion via the global animation kill-switch.
 */
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, scrollY / max) : 0;
      bar.current?.style.setProperty("transform", `scaleX(${p.toFixed(4)})`);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue, { passive: true });
    update();
    return () => {
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]">
      <div
        ref={bar}
        className="h-full origin-left bg-[var(--ink)]/55"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
