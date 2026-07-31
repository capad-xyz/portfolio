"use client";

import { useEffect, useRef } from "react";

/**
 * Gooey dark "liquid" cursor + dripping droplet trail.
 *
 * The persistent mercury cursor (a lead blob + two lagging blobs merged by the
 * #goo filter) tracks the pointer. The tails are springs, so they overshoot and
 * slosh on a flick, and the whole blob squashes-and-stretches along its
 * direction of travel — the cursor is the thing that answers your hand, and a
 * rigid one can't. As the pointer travels it sheds dark **droplets** evenly
 * along its path (Canva's magic-mouse-trailer idea — water instead of stars);
 * each droplet beads off with an elastic pop, inherits a real share of the
 * pointer's velocity (a whip throws them), then falls slowly under low gravity
 * with drag on both axes — so it reaches a terminal velocity and hangs like
 * syrup rather than dropping like a stone — swaying and wobbling as it goes. Droplets
 * shed only while the pointer is moving — at rest just the mercury cursor
 * remains, so idle frames stay cheap (no goo filter churn).
 * Droplets live under their own #goo-drip filter so neighbours fuse into one
 * running stream.
 *
 * All motion is direct DOM mutation inside one rAF loop (no React state) and the
 * droplet nodes are pooled. Hidden on touch / reduced-motion (CSS restores the
 * native cursor there).
 */
// Droplet count is nearly free: #goo-drip blurs the whole fixed layer, so its
// cost tracks the layer's area, not how many <i> nodes are inside it. Density is
// what makes a trail read as liquid rather than as specks, so we spend it here.
const POOL = 40; // max simultaneous droplets
const STEP = 26; // px of pointer travel between shed droplets
// Heavy, syrupy fall — low gravity plus drag on BOTH axes gives a terminal
// velocity (~5px/frame), which is what sells "thick liquid" over "falling rock".
const GRAV = 0.11; // downward acceleration (px / frame²)
const DRAG = 0.978; // air damping per frame, applied to vx and vy
const FLING = 0.4; // share of pointer velocity a droplet inherits when it sheds
const HOT_MS = 190; // over an interactive element, shed a drip this often even at rest
// anything that would normally flip the native cursor to grab / text / pointer
const INTERACTIVE =
  'a,button,[role="button"],input,textarea,select,label,summary,[data-grab],.lqbtn';

export function LiquidCursor() {
  const root = useRef<HTMLDivElement>(null);
  const lead = useRef<HTMLElement>(null);
  const t1 = useRef<HTMLElement>(null);
  const t2 = useRef<HTMLElement>(null);
  const dripRoot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const dripLayer = dripRoot.current;
    if (!dripLayer) return;

    let revealed = false;
    let mx = innerWidth / 2;
    let my = innerHeight * 0.9;
    // The lead blob rides a light lerp rather than the raw pointer. Mouse sensors
    // quantise position, so pinning a 16px blob straight to the raw signal
    // transmits every bit of that noise as visible jitter — and the tails, which
    // chase the lead, amplify it. ~1 frame of lag is imperceptible with the
    // native cursor hidden; the noise it removes is not.
    const p0 = { x: mx, y: my };
    // the trailing blobs are springs, not lerps — they overshoot the lead and
    // settle back, so a flick makes the cursor slosh instead of easing in flat
    const p1 = { x: mx, y: my, vx: 0, vy: 0 };
    const p2 = { x: mx, y: my, vx: 0, vy: 0 };
    let glassDirty = false;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    // ---- pooled droplets ----
    type Drip = {
      el: HTMLElement;
      on: boolean;
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      ttl: number;
      size: number;
      phase: number;
    };
    const drips: Drip[] = [];
    for (let i = 0; i < POOL; i++) {
      const el = document.createElement("i");
      dripLayer.appendChild(el); // starts display:none via CSS until first spawn
      drips.push({ el, on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, ttl: 0, size: 1, phase: 0 });
    }

    const spawn = (x: number, y: number, vx: number, vy: number) => {
      // Prefer a free slot. If the pool is saturated — which a fast flick now
      // does routinely, since droplets live ~2x longer — steal the one furthest
      // through its life instead of dropping the spawn. Silently skipping meant
      // the head of the trail starved during exactly the fast movement it should
      // feel best in; the oldest droplet is the most faded, so recycling it is
      // the least visible thing we can take.
      let d = drips.find((q) => !q.on);
      if (!d) {
        d = drips[0];
        for (const q of drips) if (q.life / q.ttl > d.life / d.ttl) d = q;
      }
      d.on = true;
      d.x = x;
      d.y = y;
      d.vx = vx;
      d.vy = vy;
      d.life = 0;
      d.ttl = rand(1150, 1850); // ~2x the old life: they hang around to be watched
      d.size = rand(0.6, 1.2);
      d.phase = rand(0, Math.PI * 2);
      d.el.style.opacity = "0";
      d.el.style.display = "block"; // rejoin the layer; parked nodes are display:none
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      glassDirty = true;
    };
    addEventListener("pointermove", onMove, { passive: true });

    // over anything interactive the blob swells (.hot) and keeps dripping, so
    // grab / text / pointer states all read as the same liquid cursor
    let hot = false;
    const onOver = (e: PointerEvent) => {
      const el = e.target as Element | null;
      const h = !!(el && el.closest && el.closest(INTERACTIVE));
      if (h !== hot) {
        hot = h;
        root.current?.classList.toggle("hot", h);
      }
    };
    addEventListener("pointerover", onOver, { passive: true });

    // reveal once the intro finishes building the page
    const reveal = () => {
      revealed = true;
      root.current?.classList.add("on");
      dripLayer.classList.add("on");
    };
    const revealTimer = window.setTimeout(reveal, 1150);
    addEventListener("capad:loaded", reveal);

    // path-walker + velocity state
    let hotScale = 0; // 0 = rest, 1 = fully swollen over an interactive target
    let vsx = 0; // smoothed pointer velocity — drives the squash-and-stretch
    let vsy = 0;
    let prevP0x = mx; // previous de-noised lead position, for velocity
    let prevP0y = my;
    let stretchAng = 0; // held while at rest so the blob doesn't spin on jitter
    let prevMx = mx;
    let prevMy = my;
    let walkX = mx;
    let walkY = my;
    let primed = false;
    let hotAcc = 0;
    let prev = 0;
    let raf = 0;

    // Critically-underdamped spring: the blob accelerates toward its target and
    // coasts past it before settling. That overshoot is the whole personality —
    // a lerp can only ever arrive, never wobble. Hoisted out of the rAF loop so
    // it isn't reallocated 100+ times a second.
    type Sp = { x: number; y: number; vx: number; vy: number };
    const spring = (p: Sp, tx: number, ty: number, stiff: number, damp: number, f: number) => {
      p.vx += (tx - p.x) * stiff * f;
      p.vy += (ty - p.y) * stiff * f;
      const d = Math.pow(damp, f);
      p.vx *= d;
      p.vy *= d;
      p.x += p.vx * f;
      p.y += p.vy * f;
    };

    const loop = (t: number) => {
      if (!prev) prev = t;
      const dt = Math.min(40, t - prev); // clamp big gaps (tab switch)
      prev = t;
      const f = dt / 16.67; // ≈ 1 at 60fps

      // pointer velocity (px this frame)
      const vx = mx - prevMx;
      const vy = my - prevMy;
      const speed = Math.hypot(vx, vy);
      prevMx = mx;
      prevMy = my;

      // ---- mercury cursor (lead + two lagging blobs) ----
      // de-noise the pointer once, then everything downstream inherits the clean
      // signal instead of each stage re-amplifying the sensor's steps
      const leadK = 1 - Math.pow(1 - 0.62, f);
      p0.x += (mx - p0.x) * leadK;
      p0.y += (my - p0.y) * leadK;
      // each tail chases the one ahead of it, overshoots, and sloshes back
      spring(p1, p0.x, p0.y, 0.14, 0.73, f);
      spring(p2, p1.x, p1.y, 0.10, 0.75, f);

      // Smoothed velocity → squash-and-stretch. This filter has to be SLOW: a
      // hand never holds a steady speed, so a fast filter passes that tremor
      // straight into the blob's size and it reads as pulsing. ~120ms of
      // averaging tracks real gestures and rejects the shake.
      // Measured from the DE-NOISED lead, not the raw pointer. p0 has already had
      // the sensor's quantisation lerped out of it, so the filter starts from a
      // clean signal instead of trying to average the noise back out afterwards.
      // At steady state a lerp tracks constant velocity exactly, so the magnitude
      // is unchanged — only the noise is gone.
      const pvx = p0.x - prevP0x;
      const pvy = p0.y - prevP0y;
      prevP0x = p0.x;
      prevP0y = p0.y;
      const velK = 1 - Math.pow(1 - 0.07, f);
      vsx += (pvx - vsx) * velK;
      vsy += (pvy - vsy) * velK;
      const vmag = Math.hypot(vsx, vsy);
      if (vmag > 1.5) stretchAng = (Math.atan2(vsy, vsx) * 180) / Math.PI;
      // Stretch along travel, squash across it (roughly volume-preserving, the way
      // a real droplet deforms under acceleration). Deadzone first so near-still
      // movement produces exactly zero deformation, then a saturating curve rather
      // than a hard clamp — Math.min() has a corner at the cap that snaps visibly
      // every time a fast flick crosses it.
      const vEff = Math.max(0, vmag - 1.5);
      const st = 0.75 * (vEff / (vEff + 22));
      // transform-only positioning: left/top writes invalidate layout every
      // frame (and force a reflow when the glass scan reads rects below);
      // composited transforms keep the whole loop off the layout path. The
      // interactive "hot" swell is lerped here too — a CSS transition on a
      // per-frame transform would drag the whole cursor behind the pointer.
      const hotK = 1 - Math.pow(1 - 0.18, f);
      hotScale += ((hot ? 1 : 0) - hotScale) * hotK;
      const sLead = 1 + 0.6 * hotScale;
      const sT1 = 1 + 0.32 * hotScale;
      // rotate into the direction of travel, then stretch along the local X — the
      // lead deforms most, the first tail follows at ~2/3, the far bead stays
      // round so the goo has something to neck down to.
      const rot = `rotate(${stretchAng.toFixed(1)}deg)`;
      if (lead.current) {
        const sx = sLead * (1 + st);
        const sy = sLead / (1 + st * 0.78);
        lead.current.style.transform = `translate3d(${p0.x.toFixed(2)}px,${p0.y.toFixed(2)}px,0) translate(-50%,-50%) ${rot} scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
      }
      if (t1.current) {
        const s1 = st * 0.65;
        const sx = sT1 * (1 + s1);
        const sy = sT1 / (1 + s1 * 0.78);
        t1.current.style.transform = `translate3d(${p1.x}px,${p1.y}px,0) translate(-50%,-50%) ${rot} scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
      }
      if (t2.current) {
        t2.current.style.transform = `translate3d(${p2.x}px,${p2.y}px,0) translate(-50%,-50%)`;
      }

      // ---- shed droplets evenly along the path the pointer just travelled ----
      if (revealed) {
        if (!primed) {
          walkX = mx;
          walkY = my;
          primed = true;
        }
        let dx = mx - walkX;
        let dy = my - walkY;
        let dist = Math.hypot(dx, dy);
        if (dist > 600) {
          // teleport / first frame — don't streak the whole gap with drips
          walkX = mx;
          walkY = my;
          dist = 0;
        }
        // a whip should actually throw the liquid — the old cap topped out at
        // ~3px/frame of inherited velocity, which damped every flick into a dribble
        const fling = Math.min(speed, 42) * FLING;
        while (dist >= STEP) {
          const ux = dx / dist;
          const uy = dy / dist;
          walkX += ux * STEP;
          walkY += uy * STEP;
          spawn(
            walkX + rand(-2, 2),
            walkY + rand(-2, 2),
            ux * fling + rand(-0.4, 0.4),
            uy * fling + rand(0.05, 0.4) + 0.2, // slight downward bias; the fling leads
          );
          dx = mx - walkX;
          dy = my - walkY;
          dist = Math.hypot(dx, dy);
        }
      }

      // ---- while hovering something interactive, keep beading a drip so the
      // cursor visibly drips even when the pointer is still ----
      if (revealed && hot) {
        hotAcc += dt;
        if (hotAcc >= HOT_MS) {
          hotAcc = 0;
          spawn(mx + rand(-3, 3), my + rand(4, 8), rand(-0.3, 0.3), rand(0.5, 1.1));
        }
      } else {
        hotAcc = 0;
      }

      // ---- advance droplets ----
      const drag = Math.pow(DRAG, f);
      for (const d of drips) {
        if (!d.on) continue;
        d.life += dt;
        d.vy += GRAV * f;
        // drag on BOTH axes now: vertical damping gives the droplet a terminal
        // velocity instead of accelerating forever, which is what reads as weight
        d.vx *= drag;
        d.vy *= drag;
        d.x += d.vx * f;
        d.y += d.vy * f;
        // lazy lateral sway, like a drop running down a pane of glass
        d.x += Math.sin(d.life / 240 + d.phase) * 0.3 * f;
        const p = d.life / d.ttl;
        if (p >= 1 || d.y > innerHeight + 60) {
          d.on = false;
          d.el.style.opacity = "0";
          d.el.style.display = "none"; // leave the layer's ink union entirely
          continue;
        }
        const fin = Math.min(1, d.life / 110); // quick fade-in
        const fout = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1; // ease-out tail
        const sp = Math.min(Math.hypot(d.vx, d.vy), 16);
        const shrink = 0.6 + 0.4 * fout; // drift smaller as it dies
        // elastic bead: the droplet bulges as it detaches, then relaxes round
        const pop = d.life < 160 ? 1 + 0.42 * Math.sin((d.life / 160) * Math.PI) : 1;
        const base = d.size * shrink * pop;
        const sy = (1 + sp * 0.05) * base;
        const sx = (1 / (1 + sp * 0.03)) * base;
        // stretch along actual travel (not just fall) so flung drops lie flat,
        // with a slower, wider wobble than before
        const dir = (Math.atan2(d.vy, d.vx) * 180) / Math.PI - 90;
        const ang = dir + Math.sin(d.life / 230 + d.phase) * 14;
        d.el.style.opacity = (fin * fout).toFixed(3);
        d.el.style.transform = `translate3d(${d.x.toFixed(2)}px,${d.y.toFixed(2)}px,0) rotate(${ang.toFixed(2)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
      }

      // ---- glass spotlight follows the cursor ----
      // Only panes actually on screen get written. There are ~11 .glass elements
      // on the home page and at most 2-4 are ever visible; the rest were being
      // restyled every frame the pointer moved for a highlight nobody could see.
      // The rect read is cheap (~0.06ms for all 11) — it's the WRITE that costs,
      // so the bounds check pays for itself several times over.
      if (glassDirty) {
        glassDirty = false;
        const vh = innerHeight;
        const vw = innerWidth;
        document.querySelectorAll<HTMLElement>(".glass").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh || r.right < 0 || r.left > vw) return;
          el.style.setProperty("--mx", `${mx - r.left}px`);
          el.style.setProperty("--my", `${my - r.top}px`);
        });
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerover", onOver);
      removeEventListener("capad:loaded", reveal);
      clearTimeout(revealTimer);
      cancelAnimationFrame(raf);
      drips.forEach((d) => d.el.remove());
    };
  }, []);

  return (
    <>
      <div ref={root} className="cursor" aria-hidden>
        <i ref={t2} className="t2" />
        <i ref={t1} className="t1" />
        <i ref={lead} className="lead" />
      </div>
      <div ref={dripRoot} className="drips" aria-hidden />
    </>
  );
}
