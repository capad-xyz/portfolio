"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

/**
 * The signature startup: a dark, light-refracting liquid drop wells up, falls,
 * splashes into a crown of droplets, and the impact sends a "develop wave" up
 * the page that the hero reveals in sync with (the hero runs its own matching
 * timings — keep the 0.56s impact / 1.15s loaded / 1.35s teardown contract).
 * Choreographed on one GSAP timeline: anticipation swell → gravity fall with
 * squash-and-stretch → pool + rings + crown → wave.
 *
 * Replay rule: the intro plays on the first visit of a session AND again on any
 * deliberate refresh (navigation type "reload" — a hard refresh included), but
 * never on SPA back-navigation from /work/[slug], so the signature moment can
 * be summoned on demand without haunting every route change.
 * Reduced-motion skips everything and signals loaded immediately.
 */

// splash crown: deterministic arcs (dx, peak height, size) — no RNG, SSR-safe
const CROWN = [
  { dx: -64, up: 84, s: 0.9 },
  { dx: -34, up: 112, s: 1.1 },
  { dx: -12, up: 92, s: 0.75 },
  { dx: 14, up: 118, s: 1 },
  { dx: 40, up: 96, s: 0.8 },
  { dx: 66, up: 78, s: 1.05 },
];

export function LiquidIntro() {
  const [gone, setGone] = useState(false);
  const drop = useRef<HTMLDivElement>(null);
  const pool = useRef<HTMLDivElement>(null);
  const rings = useRef<HTMLDivElement[]>([]);
  const crown = useRef<HTMLSpanElement[]>([]);
  const wave = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let seen = false;
    let isReload = false;
    try {
      seen = sessionStorage.getItem("capad:introSeen") === "1";
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      isReload = nav?.type === "reload";
    } catch {}

    // Phones skip the liquid-drop overlay entirely — it's the heaviest thing on
    // a mobile GPU and the hero still runs its own develop-in cascade. Desktop
    // keeps the signature intro. (Reduced-motion and already-seen also skip.)
    const skipIntro =
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      matchMedia("(max-width: 640px)").matches ||
      (seen && !isReload);

    if (skipIntro) {
      dispatchEvent(new Event("capad:loaded"));
      // defer a tick — setting state synchronously in an effect body triggers a
      // cascading render (react-hooks/set-state-in-effect)
      const t = window.setTimeout(() => setGone(true), 0);
      return () => window.clearTimeout(t);
    }

    const vh = window.innerHeight;
    const tl = gsap.timeline();

    // 1) anticipation: the drop wells up at the top edge, heavy with itself…
    tl.set(drop.current, { xPercent: -50, y: -90, scaleX: 1, scaleY: 1, opacity: 1 })
      .to(drop.current, {
        y: -64,
        scaleY: 1.14,
        scaleX: 0.92,
        duration: 0.14,
        ease: "power1.out",
      })
      // 2) …then gravity takes it: stretch grows with speed
      .to(drop.current, {
        y: vh - 34,
        scaleY: 1.5,
        scaleX: 0.9,
        duration: 0.36,
        ease: "power2.in",
      })
      // 3) impact: flatten into the floor and vanish into the pool
      .to(drop.current, {
        y: vh - 12,
        scaleY: 0.28,
        scaleX: 1.75,
        opacity: 0,
        duration: 0.07,
        ease: "power1.out",
      });

    // 4) splash: pool spreads, rings ripple out, a crown of droplets arcs up
    const IMPACT = 0.56;
    tl.fromTo(
      pool.current,
      { xPercent: -50, scale: 0, opacity: 1 },
      { scale: 1.5, opacity: 0.85, duration: 0.38, ease: "power2.out" },
      IMPACT,
    ).to(pool.current, { scale: 2.3, opacity: 0, duration: 0.55, ease: "power1.out" }, IMPACT + 0.38);

    rings.current.forEach((r, i) => {
      tl.fromTo(
        r,
        { xPercent: -50, yPercent: 50, scale: 0, opacity: 0.65 },
        { scale: 28, opacity: 0, duration: 1, ease: "power2.out" },
        IMPACT + i * 0.11,
      );
    });

    crown.current.forEach((c, i) => {
      const { dx, up, s } = CROWN[i];
      tl.fromTo(
        c,
        { x: 0, y: 0, scale: s * 0.6, opacity: 0.9 },
        { x: dx * 0.7, y: -up, scale: s, duration: 0.24, ease: "power2.out" },
        IMPACT + 0.02,
      ).to(
        c,
        { x: dx, y: 26, scale: s * 0.4, opacity: 0, duration: 0.34, ease: "power2.in" },
        IMPACT + 0.26,
      );
    });

    // 5) the develop wave sweeps up the screen (the hero reveals in sync)
    tl.fromTo(
      wave.current,
      { y: 0, opacity: 1 },
      { y: -vh, duration: 0.9, ease: "power2.inOut" },
      0.6,
    ).set(wave.current, { opacity: 0 }, 1.45);

    // 6) hand off to the cursor, then remove the overlay + remember we played it
    tl.call(() => dispatchEvent(new Event("capad:loaded")), [], 1.15);
    tl.call(
      () => {
        try {
          sessionStorage.setItem("capad:introSeen", "1");
        } catch {}
        setGone(true);
      },
      [],
      1.35,
    );

    return () => {
      tl.kill();
    };
  }, []);

  if (gone) return null;

  return (
    <div aria-hidden>
      <div ref={drop} className="drop" />
      <div ref={pool} className="pool" />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) rings.current[i] = el;
          }}
          className="ring"
        />
      ))}
      {CROWN.map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            if (el) crown.current[i] = el;
          }}
          className="splashlet"
        />
      ))}
      <div ref={wave} className="wave" style={{ bottom: 0 }} />
    </div>
  );
}
