"use client";

import { useEffect, useRef } from "react";

/**
 * A liquid-glass lens that rides the cursor but stays invisible — it only fades
 * in over elements marked `.lensable` (the wordmark, cards, quotes), gently
 * refracting what's beneath it. Its edge is feathered in CSS so the disc never
 * reads as a hard circle. It backs off whenever the cursor is over — or near —
 * any interactive control (links, buttons, fields) so it never fights a
 * button's own hover effect. While it's showing, the gooey cursor steps aside
 * (body.lensing). One rAF, sampling only when the pointer moves. Skipped on
 * touch / reduced motion.
 */
export function LiquidLens() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    if (
      matchMedia("(pointer: coarse)").matches ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    // controls the lens must never sit on — nor linger near
    const INTERACTIVE = "a, button, input, textarea, select, label, [data-no-lens]";
    // unit ring sampled around the cursor so the lens fades out *near* a control,
    // not only when directly over it
    const RING = 34;
    const OFFSETS = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7],
    ] as const;

    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let active = false;
    let dirty = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      dirty = true;
    };
    addEventListener("pointermove", onMove, { passive: true });

    // should the lens show at the current cursor position? (one layout pass/frame)
    const lensableAt = () => {
      const center = document.elementFromPoint(x, y);
      if (!center) return false;
      if (center.closest(INTERACTIVE)) return false; // directly over a control
      if (!center.closest(".lensable")) return false; // only over opted-in content
      for (const [dx, dy] of OFFSETS) {
        const near = document.elementFromPoint(x + dx * RING, y + dy * RING);
        if (near?.closest(INTERACTIVE)) return false; // a control is within reach
      }
      return true;
    };

    const loop = () => {
      if (dirty) {
        dirty = false;
        node.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        const next = lensableAt();
        if (next !== active) {
          active = next;
          node.classList.toggle("on", active);
          document.body.classList.toggle("lensing", active);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      document.body.classList.remove("lensing");
    };
  }, []);

  return <div ref={el} className="lens" aria-hidden />;
}
