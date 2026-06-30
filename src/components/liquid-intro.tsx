"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The signature startup: a dark, light-refracting liquid drop falls to the
 * bottom of the screen, splashes, and the impact sends a "develop wave" up the
 * page that the hero reveals in sync with (the hero runs its own matching
 * timings). The drop then hands off to the gooey cursor (`capad:loaded`).
 * All movement is transform/opacity via the Web Animations API.
 *
 * Reduced-motion skips the whole thing and signals loaded immediately. The full
 * animation plays once per session; repeat views (e.g. returning from a
 * /work/[slug] page) skip straight to loaded so the signature moment isn't
 * replayed on every back-navigation.
 */
export function LiquidIntro() {
  const [gone, setGone] = useState(false);
  const drop = useRef<HTMLDivElement>(null);
  const pool = useRef<HTMLDivElement>(null);
  const rings = useRef<HTMLDivElement[]>([]);
  const wave = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("capad:introSeen") === "1";
    } catch {}

    if (matchMedia("(prefers-reduced-motion: reduce)").matches || seen) {
      dispatchEvent(new Event("capad:loaded"));
      // defer a tick — setting state synchronously in an effect body triggers a
      // cascading render (react-hooks/set-state-in-effect)
      const t = window.setTimeout(() => setGone(true), 0);
      return () => window.clearTimeout(t);
    }

    const timers: number[] = [];
    const ease = "cubic-bezier(.45,0,.85,.5)";

    // 1) the drop falls to the bottom — transform + scale only
    drop.current?.animate(
      [
        { transform: "translate(-50%,-90px) scaleX(1) scaleY(1)" },
        { transform: "translate(-50%,46vh) scaleX(.9) scaleY(1.25)", offset: 0.66 },
        { transform: "translate(-50%,calc(100vh - 34px)) scaleX(.92) scaleY(1.5)", offset: 0.93 },
        { transform: "translate(-50%,calc(100vh - 12px)) scaleX(1.7) scaleY(.3)", opacity: 0, offset: 1 },
      ],
      { duration: 560, fill: "forwards", easing: ease },
    );

    // 2) impact splash: pool + ripples
    timers.push(
      window.setTimeout(() => {
        pool.current?.animate(
          [
            { transform: "translateX(-50%) scale(0)", opacity: 1 },
            { transform: "translateX(-50%) scale(1.5)", opacity: 0.85, offset: 0.4 },
            { transform: "translateX(-50%) scale(2.3)", opacity: 0 },
          ],
          { duration: 1000, fill: "forwards", easing: "cubic-bezier(.2,.7,.3,1)" },
        );
        rings.current.forEach((r, i) =>
          timers.push(
            window.setTimeout(() => {
              r?.animate(
                [
                  { transform: "translate(-50%,50%) scale(0)", opacity: 0.65 },
                  { transform: "translate(-50%,50%) scale(28)", opacity: 0 },
                ],
                { duration: 1000, fill: "forwards", easing: "cubic-bezier(.2,.7,.3,1)" },
              );
            }, i * 110),
          ),
        );
      }, 520),
    );

    // 3) develop wave sweeps up the screen (the hero reveals in sync)
    timers.push(
      window.setTimeout(() => {
        const w = wave.current;
        if (!w) return;
        w.style.opacity = "1";
        w.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100vh)" }], {
          duration: 900,
          fill: "forwards",
          easing: "cubic-bezier(.4,0,.2,1)",
        });
        timers.push(window.setTimeout(() => (w.style.opacity = "0"), 850));
      }, 600),
    );

    // 4) hand off to the cursor, then remove the overlay + remember we played it
    timers.push(window.setTimeout(() => dispatchEvent(new Event("capad:loaded")), 1150));
    timers.push(
      window.setTimeout(() => {
        try {
          sessionStorage.setItem("capad:introSeen", "1");
        } catch {}
        setGone(true);
      }, 1350),
    );

    return () => timers.forEach(clearTimeout);
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
      <div ref={wave} className="wave" style={{ bottom: 0, transform: "translateY(160px)" }} />
    </div>
  );
}
