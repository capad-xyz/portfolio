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
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return <div ref={root} className="contents">{children}</div>;
}
