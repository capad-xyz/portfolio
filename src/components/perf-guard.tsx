"use client";

import { useEffect } from "react";
import { detectRaster, readPerfOverride } from "@/lib/raster";

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
const START_DELAY = 1000; // let the intro land — its cost isn't steady-state
const PROBE_MS = 1000;
const MIN_SAMPLES = 30;
const SLOW_FRAME_MS = 27; // ≈37fps; below this the refraction isn't worth its price
const GIVE_UP_MS = 20000; // stop trying if we never get an unthrottled window

export function PerfGuard() {
  useEffect(() => {
    // reduced-motion already strips the expensive layers, and a coarse pointer
    // gets the mobile treatment from CSS — nothing to decide in either case
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ---- software-rasteriser check, before anything costs anything ----------
    //
    // Runs first and, when it trips, short-circuits the rAF probe below. That
    // ordering matters: on a machine already rasterising on the CPU, the probe
    // is two seconds of guaranteed jank spent measuring a foregone conclusion.
    //
    // This is a different tier from `perf-lite` on purpose. `perf-lite` means
    // "this machine is slow"; `perf-soft` means "this machine is fine and
    // something between it and the GPU is not". Keeping them separate means a
    // DevTools inspection can tell you which diagnosis fired instead of collapsing
    // both into one indistinguishable class.
    const override = readPerfOverride();
    if (override === "off") {
      // Asked for full quality, no downgrades. Still record what we found so
      // the console answer is available for the A/B.
      const r = detectRaster();
      document.documentElement.dataset.raster = r.renderer;
      return;
    }

    const raster = detectRaster();
    // Exposed for exactly one reason: the reported bug is browser-specific and
    // the fix hinges on a fact only the browser knows. Read it from the console
    // or the Elements panel instead of re-deriving it from a guess.
    document.documentElement.dataset.raster = raster.renderer;
    if (override === "soft" || raster.software) {
      document.body.classList.add("perf-soft");
      document.documentElement.dataset.perfTier = "soft";
      // One line, so `console` in the slow browser answers the question directly.
      console.info(
        `[perf] software rasteriser${override === "soft" ? " (forced via ?perf=soft)" : ""}: ${raster.renderer}`,
      );
      return;
    }

    // Low-end hardware announces itself: skip the probe and its ~2s of full
    // quality jank, go straight to lite.
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    if (mem <= 4 || (navigator.hardwareConcurrency ?? 8) <= 4) {
      document.body.classList.add("perf-lite");
      return;
    }

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
        if (median > SLOW_FRAME_MS) {
          document.body.classList.add("perf-lite");
          document.documentElement.dataset.perfTier = "lite";
          console.info(
            `[perf] slow machine, median frame ${median.toFixed(1)}ms (budget ${SLOW_FRAME_MS}ms) on renderer: ${raster.renderer}`,
          );
        }
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

  // Scroll-calm: freeze the ambient drift once the reader leaves the hero.
  // While the clouds move, every backdrop-filter surface re-renders each
  // frame; parked, results become reusable. One-way by design.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.7) {
        document.body.classList.add("ambient-calm");
        removeEventListener("scroll", onScroll);
      }
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
