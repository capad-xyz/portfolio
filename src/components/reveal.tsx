"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Tiny client island: attaches an IntersectionObserver to its children with the
 * `.reveal-up` class, promoting them to `.in` on first intersection. Lets the
 * surrounding section stay a server component while the on-scroll animation
 * still works. Reduced-motion ships static.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>(".reveal-up, .reveal-title");
    if (!els || !els.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        // Elements crossing in the same batch cascade in document order; a
        // solo element (slow scroll) reveals immediately. The inline delay is
        // cleared once the transition lands so hover effects never inherit it.
        let batch = 0;
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target as HTMLElement;
          const delay = Math.min(batch++ * 90, 450);
          if (delay) {
            el.style.transitionDelay = `${delay}ms`;
            window.setTimeout(() => {
              el.style.transitionDelay = "";
            }, delay + 950);
          }
          el.classList.add("in");
          io.unobserve(el);
        });
      },
      // threshold 0, and no negative bottom margin. Both mattered:
      //
      // A threshold is a share of the TARGET, and the case-study body is one
      // `.reveal-up` wrapper around the whole chapter list — 3,000px+ tall. At
      // 0.18 it needed ~600px of itself on screen, so a reader landing mid-page
      // saw a blank column until they scrolled.
      //
      // The -10% bottom margin was worse than useless here: it pulls the
      // observer root's bottom edge up to y=810, and the case body starts at
      // y=814. Four pixels of miss gate the entire article behind a scroll
      // that has to happen first. Anything already inside the viewport must
      // render on arrival, so the root is the viewport, unmodified.
      { threshold: 0, rootMargin: "0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return <div ref={root} className="contents">{children}</div>;
}
