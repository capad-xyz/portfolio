"use client";

import { useEffect, useRef } from "react";
import { LiquidButton } from "./liquid-button";

/**
 * Peak-end: the close shapes memory and the decision to act. The friction
 * hierarchy is deliberate — a one-tap email is the primary, near-zero-friction
 * CTA (catches the impulsive, high-intent visitor before System 2 kicks in),
 * GitHub is the quiet secondary, and the floating widget offers a guided form
 * for those who prefer structure. One canonical address everywhere:
 * connect@capad.fyi (the inbox /api/contact already delivers to).
 */
export function Contact() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>(".reveal-up");
    if (!els) return;
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
      { threshold: 0.25 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="contact"
      ref={root}
      className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6 py-28 text-center"
    >
      <p className="reveal-up section-eyebrow mb-8">say hello</p>

      <h2 className="reveal-up max-w-2xl text-[clamp(34px,6vw,72px)] font-bold leading-[0.95] tracking-[-0.03em]">
        Building something? Let&apos;s talk.
      </h2>

      <p className="reveal-up mt-6 max-w-md text-[clamp(15px,1.5vw,18px)] leading-[1.55] text-[var(--muted)]">
        Open to good problems, free tools, and the occasional desktop oddity. The
        fastest way to reach me is email.
      </p>

      <div className="reveal-up mt-10 flex flex-wrap items-center justify-center gap-4">
        <LiquidButton
          href="mailto:connect@capad.fyi"
          className="px-8 py-[15px] text-[15px] font-semibold"
        >
          connect@capad.fyi
        </LiquidButton>
        <LiquidButton
          href="https://github.com/capad-xyz"
          external
          variant="outline"
          className="px-6 py-[15px] text-[15px] font-medium"
        >
          GitHub
        </LiquidButton>
      </div>

      <p className="reveal-up mt-20 font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">
        capad.fyi &nbsp;·&nbsp; built in glass
      </p>
    </section>
  );
}
