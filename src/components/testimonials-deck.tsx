"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "motion/react";
import type { Testimonial } from "@/lib/sanity";

/**
 * Interactive testimonial deck. Cards overlap as glass plates; only the front
 * one shows its quote (the ones behind are blanked so their text never bleeds
 * through the translucent glass). The front card flips to the next in three
 * ways, each with its own motion + liquid "drip":
 *   - drag  → the card is sticky and resists; drag it past halfway and the
 *             next quote fades up underneath, then release to fling it off with
 *             the momentum of your throw (same physics as the contact bubble).
 *             A soft flick just springs it back home.
 *   - tap   → the card bursts into a radial spray of ink and the next card
 *             develops up in its place.
 *   - dots  → the deck reshuffles and the chosen card rises with a light splash.
 * A shared SVG goo filter fuses the drip blobs into stretching rivulets.
 * Reduced-motion ships a calm crossfade with no drag or drips.
 */

type Mode = "drag" | "tap" | "dot";
type Vec = { x: number; y: number };
type Throw = { from: Vec; to: Vec; vx: number; vy: number };

const OFFSET_Y = 18; // vertical peek of the card behind
const SCALE_STEP = 0.05;
const ELASTIC = 0.42; // <1 makes the card resist the drag — heavier, stickier
const SWIPE = 110; // release power (offset + velocity) needed to fling it away
const DRAG_FULL = 175; // drag distance at which the incoming quote is fully up
const FLING = 900; // how far past the release point a throw carries
// Tall enough for the schema's 400-char quote ceiling (with the adaptive type
// size below) — the attribution must never clip off the card's bottom edge.
const CARD_H = "clamp(320px, 50vh, 420px)";
const EXIT_MS = 700; // how long a thrown card stays alive in the exit layer

type Leaving = {
  key: string;
  t: Testimonial;
  mode: Mode;
  dir: number;
  throw?: Throw;
};

export function TestimonialsDeck({ items }: { items: Testimonial[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  // Every flip pushes onto this list and removes itself EXIT_MS later, so
  // spamming taps keeps flinging cards instead of going dead for a beat —
  // constant clicking always gets visible feedback.
  const [leaving, setLeaving] = useState<Leaving[]>([]);
  const exitSeq = useRef(0);
  const [splash, setSplash] = useState<{ key: number; mode: Mode; dir: number }>(
    { key: 0, mode: "tap", dir: 1 },
  );

  // reveal choreography (all stable refs — safe to omit from deps):
  //  · dragP     — 0..1 progress of the live drag
  //  · peekUp    — how far the card *behind* has surfaced its quote
  //  · frontUp   — the front card's quote opacity; eased 0→1 as a new one lands
  const dragP = useMotionValue(0);
  const peekUp = useTransform(dragP, [0.3, 0.85], [0, 1]);
  const frontUp = useMotionValue(1);

  const dragged = useRef(false); // suppress the click that trails a drag
  const n = items.length;

  const flip = useCallback(
    (target: number, mode: Mode, dir: number, thrown?: Throw) => {
      if (target === index) return;
      // dot navigation flips clean: no ink splash and no exit ghost (below) —
      // the burst + the leaving card's text smearing over the incoming quote
      // read as a glitch when triggered from the dots
      if (mode !== "dot") setSplash((s) => ({ key: s.key + 1, mode, dir }));

      // the incoming quote continues from wherever the drag surfaced it, or
      // eases up from nothing for a tap / dot — always a slow "develop", never a pop
      const start = mode === "drag" ? peekUp.get() : 0;
      dragP.set(0);
      if (reduce) {
        frontUp.set(1);
      } else {
        frontUp.set(start);
        animate(frontUp, 1, {
          // the incoming quote develops up as the old card leaves; dots land a
          // touch quicker so navigation still feels responsive
          duration: mode === "dot" ? 0.4 : 0.55,
          delay: mode === "tap" ? 0.12 : 0,
          ease: [0.4, 0, 0.2, 1],
        });
        // a drag flings the old card, a tap pops it into an edge burst; dots
        // skip the exit layer entirely (clean reshuffle). Exits stack — each
        // entry retires itself, so back-to-back flips never block the deck.
        if (mode !== "dot") {
          const key = `exit-${(exitSeq.current += 1)}`;
          setLeaving((ls) => [...ls, { key, t: items[index], mode, dir, throw: thrown }]);
          window.setTimeout(
            () => setLeaving((ls) => ls.filter((l) => l.key !== key)),
            EXIT_MS,
          );
        }
      }
      setIndex(target);
    },
    [index, items, reduce, dragP, peekUp, frontUp],
  );

  const next = useCallback(
    (mode: Mode, dir = 1, thrown?: Throw) => {
      flip((index + 1) % n, mode, dir, thrown);
    },
    [flip, index, n],
  );

  // keyboard: ←/→ to flip through the deck
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next("dot", 1);
      else if (e.key === "ArrowLeft") flip((index - 1 + n) % n, "dot", -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, flip, index, n]);

  const onDrag = (_e: unknown, info: PanInfo) => {
    dragP.set(Math.min(1, Math.hypot(info.offset.x, info.offset.y) / DRAG_FULL));
  };

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const power =
      Math.hypot(offset.x, offset.y) + Math.hypot(velocity.x, velocity.y) * 0.18;
    if (power <= SWIPE) {
      animate(dragP, 0, { duration: 0.3, ease: "easeOut" }); // sink the peek back
      return; // soft flick — motion springs the card back home
    }

    // fling in the direction of the throw: prefer the release velocity, fall
    // back to the drag offset for slow-but-far drags. Scale distance a touch
    // with speed so a hard flick carries further, like the contact bubble. The
    // card was drag-damped by ELASTIC, so start the exit from that visual spot.
    const speed = Math.hypot(velocity.x, velocity.y);
    const dx = speed > 60 ? velocity.x : offset.x;
    const dy = speed > 60 ? velocity.y : offset.y;
    const len = Math.hypot(dx, dy) || 1;
    const reach = FLING + Math.min(speed, 3000) * 0.14;
    const fromX = offset.x * ELASTIC;
    const fromY = offset.y * ELASTIC;
    const thrown: Throw = {
      from: { x: fromX, y: fromY },
      to: { x: fromX + (dx / len) * reach, y: fromY + (dy / len) * reach },
      vx: velocity.x,
      vy: velocity.y,
    };
    next("drag", offset.x < 0 ? -1 : 1, thrown);
  };

  return (
    <div className="reveal-up">
      <GooFilter />

      <div
        className="relative mx-auto w-full select-none"
        style={{ height: `calc(${CARD_H} + ${OFFSET_Y * 2}px)` }}
      >
        {/* the peek stack — front card is live, the one behind surfaces its
            quote as you drag the front one away */}
        {items.map((t, i) => {
          // a card mid-exit doesn't also sit in the stack — unless the deck has
          // already cycled it back to the front (fast spam on a short deck)
          if (pos_isExiting(leaving, t._id) && (i - index + n) % n !== 0) return null;
          const pos = (i - index + n) % n; // 0 = front, 1 = peek
          const front = pos === 0;
          const visible = pos <= 1;
          const reveal: MotionValue<number> | number = front
            ? frontUp
            : pos === 1
              ? peekUp
              : 0;

          return (
            <motion.div
              key={t._id}
              className="absolute inset-x-0 top-0"
              style={{
                zIndex: n - pos,
                pointerEvents: front ? "auto" : "none",
              }}
              initial={false}
              animate={{
                x: 0,
                y: pos * OFFSET_Y,
                scale: 1 - pos * SCALE_STEP,
                rotate: 0,
                opacity: visible ? 1 : 0,
              }}
              transition={
                reduce
                  ? { duration: 0.25 }
                  : { type: "spring", stiffness: 260, damping: 30, mass: 0.9 }
              }
              drag={front && !reduce}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={ELASTIC}
              whileDrag={{ scale: 1.03 }}
              onDragStart={() => {
                dragged.current = true;
              }}
              onDrag={onDrag}
              onDragEnd={onDragEnd}
              onClick={() => {
                if (!front) {
                  dragged.current = false; // swallow the click that trails a committed drag
                  return;
                }
                if (dragged.current) {
                  dragged.current = false; // trailing click after a sub-threshold drag
                  return;
                }
                next("tap", 1);
              }}
            >
              <Card t={t} interactive={front} reveal={reveal} />
            </motion.div>
          );
        })}

        {/* exit layer — every thrown card carries its release momentum
            off-screen (drag) or melts down (tap); several can fly at once */}
        <AnimatePresence>
          {!reduce &&
            leaving.map((l) => <ExitCard key={l.key} leaving={l} />)}
        </AnimatePresence>

        {/* liquid drip — one-shot, remounted per swap, styled by interaction.
            splash.key stays 0 until the first flip, so nothing drips on load. */}
        {!reduce && splash.key > 0 && (
          <Drip key={splash.key} mode={splash.mode} dir={splash.dir} />
        )}
      </div>

      {/* progress dots + hint */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {items.map((t, i) => {
            const active = i === index;
            return (
              <button
                key={t._id}
                type="button"
                aria-label={`Show testimonial ${i + 1}`}
                aria-current={active}
                onClick={() => flip(i, "dot", i > index ? 1 : -1)}
                className="group grid place-items-center p-1.5"
              >
                <span
                  className="block h-1.5 rounded-full bg-[var(--ink)] transition-all duration-300 group-hover:opacity-60"
                  style={{ width: active ? 26 : 6, opacity: active ? 0.85 : 0.22 }}
                />
              </button>
            );
          })}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--muted)] opacity-70">
          fling, tap or use the dots
        </p>
      </div>
    </div>
  );
}

/** True when this testimonial currently has a ghost flying in the exit layer. */
function pos_isExiting(leaving: Leaving[], id: string) {
  return leaving.some((l) => l.t._id === id);
}

/**
 * The card being thrown away. For a drag it starts at the release point and
 * springs to a far target with the throw's own velocity fed into the spring, so
 * fast flicks fly fast and hard ones fly far. For a tap it pours straight down.
 */
function ExitCard({ leaving }: { leaving: Leaving }) {
  const { t, mode, dir, throw: thr } = leaving;
  const isDrag = mode === "drag" && thr;

  const spring = { type: "spring" as const, stiffness: 90, damping: 16 };

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-0"
      style={{ zIndex: 50 }}
      initial={
        isDrag
          ? { x: thr!.from.x, y: thr!.from.y, scale: 1.03, rotate: 0, opacity: 1 }
          : { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }
      }
      animate={
        isDrag
          ? { x: thr!.to.x, y: thr!.to.y, rotate: dir * 22, scale: 0.9, opacity: 0 }
          : { x: 0, y: [0, 4, 14], scale: [1, 1.06, 0.78], opacity: [1, 0.9, 0] }
      }
      transition={
        isDrag
          ? {
              x: { ...spring, velocity: thr!.vx },
              y: { ...spring, velocity: thr!.vy },
              rotate: { type: "spring", stiffness: 70, damping: 14 },
              scale: { duration: EXIT_MS / 1000 },
              opacity: { duration: 0.42, ease: "easeIn" },
            }
          : { duration: 0.42, ease: [0.34, 0, 0.3, 1], times: [0, 0.35, 1] }
      }
    >
      <Card t={t} interactive={false} reveal={1} />
    </motion.div>
  );
}

function Card({
  t,
  interactive,
  reveal,
}: {
  t: Testimonial;
  interactive: boolean;
  reveal: MotionValue<number> | number;
}) {
  // Adaptive measure: quotes near the schema's 400-char ceiling step down a
  // size so the attribution always fits inside the fixed-height plate.
  const len = t.quote.length;
  const quoteSize =
    len > 260
      ? "text-[clamp(15px,1.5vw,18px)]"
      : len > 170
        ? "text-[clamp(16px,1.7vw,20px)]"
        : "text-[clamp(18px,2vw,24px)]";

  return (
    <figure
      data-grab={interactive ? "" : undefined}
      className={`glass ${interactive ? "lensable" : ""} flex flex-col rounded-[28px] p-8 md:p-10`}
      style={{ height: CARD_H }}
    >
      {/* quote develops in as the card lands / surfaces, so text never shows
          through the plates behind the front one */}
      <motion.div className="flex h-full min-h-0 flex-col" style={{ opacity: reveal }}>
        <div
          aria-hidden
          className="font-serif text-[44px] leading-none text-[var(--ink)]/15"
        >
          &ldquo;
        </div>
        <blockquote
          className={`mt-1 min-h-0 flex-1 overflow-hidden ${quoteSize} font-medium leading-[1.45] tracking-[-0.005em] text-[var(--ink)]/90`}
        >
          {t.quote}
        </blockquote>
        <figcaption className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 pt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
          <span className="text-[var(--ink)]">{t.name}</span>
          {(t.role || t.company) && <span className="opacity-30">/</span>}
          {t.role && <span>{t.role}</span>}
          {t.role && t.company && <span className="opacity-30">at</span>}
          {t.company && <span>{t.company}</span>}
        </figcaption>
      </motion.div>
    </figure>
  );
}

/**
 * One-shot liquid drip, remounted (via a changing key) on every swap so its
 * animation replays. A tap detonates a radial ink burst from the card body; a
 * drag slings a stream in the throw direction; a dot jump leaves a light splash
 * off the lower edge. The shared goo filter fuses the blobs into liquid.
 */
function Drip({ mode, dir }: { mode: Mode; dir: number }) {
  if (mode !== "drag") return <Burst />; // tap & dot pop from the edges

  const base = [
    { x: 0, s: 20, delay: 0.0, fall: 100, drift: dir * 120 },
    { x: 26 * dir, s: 15, delay: 0.05, fall: 84, drift: dir * 190 },
    { x: 54 * dir, s: 11, delay: 0.1, fall: 66, drift: dir * 260 },
    { x: 14 * dir, s: 17, delay: 0.03, fall: 128, drift: dir * 90 },
  ];

  const dur = 0.75;
  const peak = 0.36;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 flex justify-center overflow-visible"
      style={{
        top: `calc(${CARD_H} - 22px)`,
        height: 300, // keep the goo filter region tall enough for the falling blobs
        zIndex: 1,
        filter: "url(#drip-goo)",
      }}
    >
      <div className="relative h-0 w-0">
        {base.map((d, i) => (
          <motion.span
            key={i}
            className="absolute block rounded-full bg-[var(--ink)]"
            style={{ width: d.s, height: d.s, left: d.x, top: 0 }}
            initial={{ x: 0, y: -8, scale: 0.5, opacity: 0 }}
            animate={{
              x: [0, d.drift * 0.5, d.drift],
              y: [-8, 10, d.fall],
              scale: [0.5, 1.2, 0.12],
              opacity: [0, peak, 0],
            }}
            transition={{
              duration: dur,
              delay: d.delay,
              ease: [0.4, 0, 0.5, 1],
              times: [0, 0.24, 1],
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Edge ink burst for a tapped card: blobs spawn all around the card's perimeter
 * and fling outward (away from centre) then rain down under gravity, so the card
 * looks like it shatters into liquid from its edges rather than its middle. The
 * overlay is sized to the front card so the blobs sit on its border; positions
 * are deterministic (no RNG) so they're SSR-stable.
 */
function Burst() {
  const N = 22;
  const drops = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const m = Math.max(Math.abs(cos), Math.abs(sin)) || 1;
    const nx = cos / m; // −1..1 across the card's border
    const ny = sin / m; // −1..1 down the card's border
    return {
      lx: 50 + nx * 47, // % across → sits on the edge
      ty: 50 + ny * 47, // % down
      ox: nx, // outward direction
      oy: ny,
      size: 9 + ((i * 13) % 5) * 3,
      spread: 54 + ((i * 29) % 3) * 34,
      fall: 60 + ((i * 17) % 4) * 46,
      delay: ((i * 7) % 5) * 0.014,
    };
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 overflow-visible"
      style={{
        height: CARD_H, // match the front card so blobs land on its edges
        zIndex: 51, // over the bursting card so the spray reads on top
        filter: "url(#drip-goo)",
      }}
    >
      {drops.map((d, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-full bg-[var(--ink)]"
          style={{
            width: d.size,
            height: d.size,
            left: `${d.lx}%`,
            top: `${d.ty}%`,
            marginLeft: -d.size / 2,
            marginTop: -d.size / 2,
          }}
          initial={{ x: 0, y: 0, scale: 0.3, opacity: 0 }}
          animate={{
            x: [0, d.ox * d.spread * 0.5, d.ox * d.spread],
            y: [0, d.oy * d.spread * 0.5, d.oy * d.spread + d.fall],
            scale: [0.3, 1.15, 0.1],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 0.9,
            delay: d.delay,
            ease: [0.25, 0, 0.35, 1],
            times: [0, 0.3, 1],
          }}
        />
      ))}
    </div>
  );
}

/** Gooey SVG filter that fuses nearby blobs into liquid — shared by all drips. */
function GooFilter() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <filter
          id="drip-goo"
          x="-30%"
          y="-20%"
          width="160%"
          height="150%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b" />
          <feColorMatrix
            in="b"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  );
}
