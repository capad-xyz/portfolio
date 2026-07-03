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
    const els = root.current?.querySelectorAll<HTMLElement>(".reveal-up");
    if (!els || !els.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        // Elements crossing in the same batch cascade in document order; a
        // solo element (slow scroll) reveals immediately. Once landed, the
        // inline delay is cleared (so hover effects never inherit it) and
        // filter is pinned to `none` — the entrance blur, even at blur(0),
        // would otherwise keep a backdrop root alive and mute the glass
        // cards' backdrop-filter.
        let batch = 0;
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target as HTMLElement;
          const delay = Math.min(batch++ * 90, 450);
          if (delay) el.style.transitionDelay = `${delay}ms`;
          window.setTimeout(() => {
            el.style.transitionDelay = "";
            el.style.filter = "none";
          }, delay + 950);
          el.classList.add("in");
          io.unobserve(el);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return <div ref={root} className="contents">{children}</div>;
}
