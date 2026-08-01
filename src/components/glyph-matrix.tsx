"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  composeFrame,
  maskCells,
  measure,
  MANEUVER_LABELS,
  SIZE,
  type Maneuver,
} from "@/lib/glyph-matrix";

/**
 * The product, running.
 *
 * A static screenshot cannot show what GlyphMaps is — the whole point is that
 * the panel *changes* as a route unfolds. So this renders the real 13x13
 * circular matrix from the app's own composer and plays a drive through it:
 * the arrow switches as the maneuver changes, the distance counts down beneath
 * it, and readouts too wide for 13 cells marquee exactly as they do on the
 * phone.
 *
 * The LEDs are drawn at the two brightnesses the app actually uses (255 head /
 * 178 tail), on a panel the colour of the device's back. Reduced motion holds
 * the first frame instead of cycling.
 */

export type Step = { maneuver: Maneuver; distances: string[] };

/** A plausible drive: approach, turn, roundabout, arrive. */
const DEFAULT_SEQUENCE: Step[] = [
  { maneuver: "STRAIGHT", distances: ["1.2k", "800", "400"] },
  { maneuver: "LEFT", distances: ["200", "90m", "30m"] },
  { maneuver: "ROUNDABOUT", distances: ["300", "120", "40m"] },
  { maneuver: "KEEP_RIGHT", distances: ["600", "250"] },
  { maneuver: "ARRIVE", distances: [""] },
];

const CELL = 10;
const R = 3.4;
const VIEW = SIZE * CELL;

function levelToOpacity(level: number) {
  return level / 255;
}

export function GlyphMatrix({
  sequence,
  maneuver,
  distance = "",
  className = "",
  stepMs = 1100,
  showCaption = true,
}: {
  /** Animated drive. Ignored when `maneuver` is given. */
  sequence?: Step[];
  /** Hold a single maneuver instead of animating. */
  maneuver?: Maneuver;
  distance?: string;
  className?: string;
  stepMs?: number;
  showCaption?: boolean;
}) {
  const steps = useMemo(
    () => (maneuver ? [{ maneuver, distances: [distance] }] : (sequence ?? DEFAULT_SEQUENCE)),
    [maneuver, distance, sequence],
  );

  // Flatten to frames so the ticker is a single index — no nested counters.
  const frames = useMemo(
    () =>
      steps.flatMap((s) =>
        (s.distances.length ? s.distances : [""]).map((d) => ({
          maneuver: s.maneuver,
          distance: d,
        })),
      ),
    [steps],
  );

  const [i, setI] = useState(0);
  const [scroll, setScroll] = useState(0);
  const frameRef = useRef(0);

  // Read the preference where it is used rather than mirroring it into state:
  // holding it in state would mean a setState in an effect body (cascading
  // render), and the only thing either effect needs to know is whether to start
  // its interval at all. Reduced motion therefore just holds frame 0.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (frames.length < 2) return;
    const id = window.setInterval(() => {
      frameRef.current = (frameRef.current + 1) % frames.length;
      setI(frameRef.current);
      setScroll(0);
    }, stepMs);
    return () => window.clearInterval(id);
  }, [frames.length, stepMs]);

  // Marquee for readouts wider than the panel (e.g. "1.2k" is 15 cells).
  const current = frames[Math.min(i, frames.length - 1)] ?? frames[0];
  const overflow = Math.max(measure(current.distance) - SIZE, 0);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!overflow) return;
    const id = window.setInterval(() => {
      setScroll((s) => (s >= overflow + 2 ? 0 : s + 1));
    }, 220);
    return () => window.clearInterval(id);
  }, [overflow, i]);

  const grid = useMemo(
    () => composeFrame(current.maneuver, current.distance, scroll),
    [current.maneuver, current.distance, scroll],
  );

  const cells = useMemo(() => maskCells(), []);

  return (
    <figure className={`gm-matrix ${className}`}>
      <div className="gm-matrix-panel">
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          role="img"
          aria-label={`Glyph Matrix showing ${MANEUVER_LABELS[current.maneuver].toLowerCase()}${
            current.distance ? ` in ${current.distance}` : ""
          }`}
        >
          {/* the unlit panel: all 137 LEDs, always present, barely visible */}
          {cells.map(({ x, y }) => (
            <circle
              key={`off-${x}-${y}`}
              cx={x * CELL + CELL / 2}
              cy={y * CELL + CELL / 2}
              r={R}
              className="gm-led-off"
            />
          ))}
          {/* the lit frame on top */}
          {cells.map(({ x, y }) => {
            const level = grid[y][x];
            if (!level) return null;
            return (
              <circle
                key={`on-${x}-${y}`}
                cx={x * CELL + CELL / 2}
                cy={y * CELL + CELL / 2}
                r={R}
                className="gm-led-on"
                style={{ opacity: levelToOpacity(level) }}
              />
            );
          })}
        </svg>
      </div>
      {showCaption && (
        <figcaption className="gm-matrix-caption">
          <span className="gm-matrix-label">{MANEUVER_LABELS[current.maneuver]}</span>
          {current.distance && <span className="gm-matrix-dist">in {current.distance}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * The matrix seated in the back of a phone, which is the only way the product
 * makes sense at a glance: the panel sits high-left on the rear shell, where
 * it lands in view when the phone is face-down on a mount.
 */
export function GlyphDevice({
  sequence,
  className = "",
  stepMs,
}: {
  sequence?: Step[];
  className?: string;
  stepMs?: number;
}) {
  return (
    <div className={`gm-device ${className}`}>
      <div className="gm-device-shell">
        <div className="gm-device-glass" aria-hidden />
        <GlyphMatrix sequence={sequence} stepMs={stepMs} showCaption={false} className="gm-device-matrix" />
        <div className="gm-device-lens" aria-hidden>
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
