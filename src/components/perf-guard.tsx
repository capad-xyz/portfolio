"use client";

import { useEffect } from "react";

/**
 * Adaptive quality tier.
 *
 * The liquid-glass material costs what it costs: every `.glass` pane runs
 * `feDisplacementMap` over its backdrop, and the drifting ambient clouds behind
 * them guarantee that backdrop changes every single frame — so no pane's filter
 * result can ever be cached. On a machine (or a browser) that rasterises any of
 * that on the CPU instead of the GPU, the page falls off a cliff.
 *
 * Rather than cheapen the design for everyone to rescue one browser, measure the
 * machine and let it opt itself down. A short rAF probe samples steady-state
 * frame times after the intro has finished; if the median can't hold ~37fps we
 * add `perf-lite`, which freezes the clouds and drops the SVG reference filters
 * from the backdrop chains (see globals.css). The blur/saturate/brightness stay
 * — those map to native compositor operations and are comparatively cheap, so
 * the panes still read as glass, just without the edge refraction.
 *
 * The probe deliberately restarts whenever the tab is hidden: background frames
 * are throttled to ~1fps, and reading those as "slow machine" would demote a
 * perfectly capable one for the rest of the session.
 */
const START_DELAY = 1800; // let the intro land — its cost isn't steady-state
const PROBE_MS = 1400;
const MIN_SAMPLES = 30;
const SLOW_FRAME_MS = 27; // ≈37fps; below this the refraction isn't worth its price
const GIVE_UP_MS = 20000; // stop trying if we never get an unthrottled window

export function PerfGuard() {
  useEffect(() => {
    // reduced-motion already strips the expensive layers, and a coarse pointer
    // gets the mobile treatment from CSS — nothing to decide in either case
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let start = 0;
    let prev = 0;
    let giveUpAt = 0;
    let frames: number[] = [];

    const sample = (t: number) => {
      // a tab that stays hidden would restart the window forever, so cap the
      // whole attempt in wall-clock time and just keep full quality if we never
      // get a clean read
      if (!giveUpAt) giveUpAt = t + GIVE_UP_MS;

      if (document.hidden) {
        // throttled — discard everything measured so far and start the window over
        frames = [];
        prev = 0;
        start = t;
      } else {
        if (prev) frames.push(t - prev);
        prev = t;
        if (!start) start = t;
      }

      if (t > giveUpAt) return;

      if (!start || t - start < PROBE_MS) {
        raf = requestAnimationFrame(sample);
        return;
      }

      if (frames.length >= MIN_SAMPLES) {
        frames.sort((a, b) => a - b);
        const median = frames[frames.length >> 1];
        if (median > SLOW_FRAME_MS) document.body.classList.add("perf-lite");
      }
    };

    const kickoff = window.setTimeout(() => {
      raf = requestAnimationFrame(sample);
    }, START_DELAY);

    return () => {
      clearTimeout(kickoff);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
