"use client";

import { useEffect, useRef } from "react";
import { LiquidButton } from "@/components/liquid-button";
import { GlyphDevice } from "@/components/glyph-matrix";
import type { Maneuver } from "@/lib/glyph-matrix";
import type { GmCta, GmMetric } from "@/lib/glyphmaps-content";

/**
 * Product hero, running the same reveal choreography as the capad.fyi hero —
 * the identical `.dev` / `.wordmark` classes and the same bottom-up cascade
 * timed to the liquid intro's develop-wave, so both sites open the same way.
 * The one addition is the device, which reveals last and then never stops
 * moving: it is the only part of the page that shows what the app does.
 */
export function GlyphmapsHero({
  eyebrow,
  title,
  tagline,
  note,
  ctas,
  metrics,
  maneuvers,
}: {
  eyebrow?: string;
  title: string;
  tagline: string;
  note?: string;
  ctas?: GmCta[];
  metrics?: GmMetric[];
  maneuvers?: Maneuver[];
}) {
  const plate = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const wordmark = useRef<HTMLHeadingElement>(null);
  const tag = useRef<HTMLParagraphElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const ctaWrap = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const device = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    const all = [plate, eyebrowRef, tag, noteRef, ctaWrap, metricsRef, device];

    if (reduce) {
      all.forEach((r) => r.current?.classList.add("in"));
      wordmark.current?.classList.add("in");
      return;
    }

    timers.push(window.setTimeout(() => wordmark.current?.classList.add("ghost"), 100));
    // Same contract as hero.tsx: 0.56s impact, 1.15s loaded, 1.35s teardown.
    const seq: [React.RefObject<HTMLElement | null>, number, boolean][] = [
      [plate, 560, false],
      [eyebrowRef, 660, false],
      [wordmark, 800, true],
      [tag, 960, false],
      [noteRef, 1040, false],
      [ctaWrap, 1140, false],
      [device, 1180, false],
      [metricsRef, 1280, false],
    ];
    seq.forEach(([r, t, isWord]) =>
      timers.push(
        window.setTimeout(() => {
          if (isWord) r.current?.classList.remove("ghost");
          r.current?.classList.add("in");
        }, t),
      ),
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const sequence = maneuvers?.length
    ? maneuvers.map((m) => ({ maneuver: m, distances: DISTANCES[m] ?? ["300", "90m"] }))
    : undefined;

  return (
    <section className="relative flex min-h-screen items-center px-6 py-24">
      <div className="gm-wrap grid items-center gap-x-16 gap-y-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
          <div
            ref={plate}
            className="plate dev absolute -left-[clamp(24px,5vw,64px)] -right-[clamp(24px,5vw,64px)] top-[6px] bottom-[10px]"
          />

          {eyebrow && (
            <span
              ref={eyebrowRef}
              className="glass dev mb-7 rounded-full px-[18px] py-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-[#46453f]"
            >
              {eyebrow}
            </span>
          )}

          <h1
            ref={wordmark}
            className="wordmark lensable text-[clamp(58px,9vw,132px)] font-bold leading-[0.86] tracking-[-0.05em]"
          >
            {title}
          </h1>

          <p
            ref={tag}
            className="dev mt-6 max-w-[520px] text-[clamp(15px,1.6vw,19px)] leading-[1.6] text-[var(--muted)]"
          >
            {tagline}
          </p>

          {note && (
            <div ref={noteRef} className="dev mt-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/40 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/80">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--ink)]" />
                {note}
              </span>
            </div>
          )}

          {!!ctas?.length && (
            <div
              ref={ctaWrap}
              className="dev mt-9 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              {ctas.map((c) => (
                <LiquidButton
                  key={c.href + c.label}
                  href={c.href}
                  external={/^https?:\/\//.test(c.href)}
                  variant={c.variant === "outline" ? "outline" : "glass"}
                  className="px-8 py-[15px] text-[15px] font-semibold"
                >
                  {c.label}
                </LiquidButton>
              ))}
            </div>
          )}

          {!!metrics?.length && (
            <div
              ref={metricsRef}
              className="dev gm-metrics mt-11 lg:justify-start"
            >
              {metrics.map((m) => (
                <div key={m.label} className="glass flat gm-metric">
                  <div className="gm-metric-value">{m.value}</div>
                  <div className="gm-metric-label">{m.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div ref={device} className="dev">
          <GlyphDevice sequence={sequence} />
        </div>
      </div>
    </section>
  );
}

/** Plausible countdowns per maneuver, so the hero reads like an actual drive. */
const DISTANCES: Partial<Record<Maneuver, string[]>> = {
  STRAIGHT: ["1.2k", "800", "400"],
  KEEP_LEFT: ["500", "180"],
  KEEP_RIGHT: ["600", "250"],
  LEFT: ["200", "90m", "30m"],
  RIGHT: ["200", "90m", "30m"],
  SHARP_LEFT: ["150", "50m"],
  SHARP_RIGHT: ["150", "50m"],
  FORWARD_LEFT: ["400", "150"],
  FORWARD_RIGHT: ["400", "150"],
  ROUNDABOUT: ["300", "120", "40m"],
  UTURN: ["250", "80m"],
  ARRIVE: [""],
};
