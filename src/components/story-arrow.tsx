"use client";

import { useEffect, useRef } from "react";

/**
 * The "open the article" disc on a /projects row. The row itself is the link,
 * so the disc never gets its own :hover — instead it listens to the row and
 * floods with the same pointer-origin ink drop as every liquid button: the
 * fill starts from the disc edge nearest where the cursor entered the row,
 * scaled to reach the farthest corner (see .lqbtn .fill / --fill-scale).
 */
export function StoryArrow() {
  const disc = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = disc.current;
    if (!el) return;
    const row = el.closest("a");
    if (!row) return;
    const fill = el.querySelector<HTMLElement>(".fill");

    const place = (e: PointerEvent) => {
      if (!fill) return;
      const r = el.getBoundingClientRect();
      // clamp the pointer onto the disc so the flood rises from its near edge
      const x = Math.min(Math.max(e.clientX - r.left, 0), r.width);
      const y = Math.min(Math.max(e.clientY - r.top, 0), r.height);
      fill.style.left = `${x}px`;
      fill.style.top = `${y}px`;
      const far = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));
      el.style.setProperty("--fill-scale", `${Math.ceil((far / 12) * 1.1)}`);
    };
    const enter = (e: PointerEvent) => {
      place(e);
      el.classList.add("is-on");
    };
    const leave = (e: PointerEvent) => {
      place(e);
      el.classList.remove("is-on");
    };
    row.addEventListener("pointerenter", enter);
    row.addEventListener("pointerleave", leave);
    return () => {
      row.removeEventListener("pointerenter", enter);
      row.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <span
      ref={disc}
      aria-hidden
      className="story-arrow relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-black/10 bg-white/40"
    >
      <span className="fill" aria-hidden />
      <svg
        viewBox="0 0 16 16"
        className="relative z-[1] h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2.5 8h11" />
        <path d="M8.5 3.5 13.5 8l-5 4.5" />
      </svg>
    </span>
  );
}
