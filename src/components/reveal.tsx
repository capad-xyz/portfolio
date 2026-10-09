"use client";

import { useEffect } from "react";

/**
 * The observer behind `data-rise`. One instance per page, mounted by SiteShell,
 * watching the WHOLE document rather than a wrapper's children.
 *
 * It used to wrap a subtree (`<Reveal>`) and watch `.reveal-up, .reveal-title`.
 * Both of those are gone as concepts: `data-rise` is now the whole motion system
 * (see the block in globals.css), and it works on any element without anyone
 * having to remember to wrap it. The wrapper was the reason the old system could
 * only be applied where a component remembered to mount one.
 *
 * Two things it still owns that CSS cannot:
 *
 *  - The cascade. Elements crossing in the same batch land in document order, up
 *    to a 450ms ceiling so a long list does not leave its last row waiting two
 *    seconds. The delay is written to `--d` (the same custom property the
 *    transition reads) and cleared once landed, so a hover transition on the same
 *    element never inherits a 300ms lag.
 *  - Nothing at all under reduced motion. There the CSS already pins every
 *    `[data-rise]` to its end state, so this class is a no-op and the observer is
 *    skipped entirely rather than run and immediately discarded.
 */
const CASCADE_STEP_MS = 90;
const CASCADE_CEILING_MS = 450;

export function RevealObserver() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-rise]:not(.in)"),
    );
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        let batch = 0;
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const el = en.target as HTMLElement;
          const delay = Math.min(batch++ * CASCADE_STEP_MS, CASCADE_CEILING_MS);
          if (delay) {
            el.style.setProperty("--d", `${delay}ms`);
            window.setTimeout(() => el.style.removeProperty("--d"), delay + 950);
          }
          el.classList.add("in");
          io.unobserve(el);
        }
      },
      // threshold 0, unmodified root. Both mattered where this used to be used
      // per-section: the case-study body is ONE [data-rise] wrapper around the
      // whole 3,000px chapter list, so any threshold would need ~600px of itself
      // on screen before a reader landing mid-page saw anything, and a negative
      // bottom margin gated the entire article behind a scroll that had to happen
      // first. Anything already in the viewport must render on arrival.
      { threshold: 0, rootMargin: "0px" },
    );

    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, []);

  return null;
}