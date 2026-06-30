"use client";

import { useEffect, useRef } from "react";

/**
 * Gooey dark "liquid" cursor + dripping droplet trail.
 *
 * The persistent mercury cursor (a lead blob + two lagging blobs merged by the
 * #goo filter) tracks the pointer. As the pointer travels it sheds dark
 * **droplets** evenly along its path (Canva's magic-mouse-trailer idea — water
 * instead of stars); each droplet detaches, falls under gravity with drift and
 * a gentle wobble, stretches into a teardrop with speed, and fades. Droplets
 * shed only while the pointer is moving — at rest just the mercury cursor
 * remains, so idle frames stay cheap (no goo filter churn).
 * Droplets live under their own #goo-drip filter so neighbours fuse into one
 * running stream.
 *
 * All motion is direct DOM mutation inside one rAF loop (no React state) and the
 * droplet nodes are pooled. Hidden on touch / reduced-motion (CSS restores the
 * native cursor there).
 */
const POOL = 16; // max simultaneous droplets (kept low so the goo filter stays cheap)
const STEP = 30; // px of pointer travel between shed droplets
const GRAV = 0.3; // downward acceleration (px / frame²)
const DRAG = 0.985; // horizontal damping per frame

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
    const p1 = { x: mx, y: my };
    const p2 = { x: mx, y: my };
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
      el.style.transform = "translate3d(-9999px,-9999px,0)";
      dripLayer.appendChild(el);
      drips.push({ el, on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, ttl: 0, size: 1, phase: 0 });
    }

    const spawn = (x: number, y: number, vx: number, vy: number) => {
      const d = drips.find((q) => !q.on);
      if (!d) return; // pool exhausted on a fast flick — density just caps
      d.on = true;
      d.x = x;
      d.y = y;
      d.vx = vx;
      d.vy = vy;
      d.life = 0;
      d.ttl = rand(560, 900);
      d.size = rand(0.5, 0.92);
      d.phase = rand(0, Math.PI * 2);
      d.el.style.opacity = "0";
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      glassDirty = true;
    };
    addEventListener("pointermove", onMove, { passive: true });

    // reveal once the intro finishes building the page
    const reveal = () => {
      revealed = true;
      root.current?.classList.add("on");
      dripLayer.classList.add("on");
    };
    const revealTimer = window.setTimeout(reveal, 1150);
    addEventListener("capad:loaded", reveal);

    // path-walker + velocity state
    let prevMx = mx;
    let prevMy = my;
    let walkX = mx;
    let walkY = my;
    let primed = false;
    let prev = 0;
    let raf = 0;

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
      const k1 = 1 - Math.pow(1 - 0.32, f);
      const k2 = 1 - Math.pow(1 - 0.2, f);
      p1.x += (mx - p1.x) * k1;
      p1.y += (my - p1.y) * k1;
      p2.x += (p1.x - p2.x) * k2;
      p2.y += (p1.y - p2.y) * k2;
      if (lead.current) {
        lead.current.style.left = `${mx}px`;
        lead.current.style.top = `${my}px`;
      }
      if (t1.current) {
        t1.current.style.left = `${p1.x}px`;
        t1.current.style.top = `${p1.y}px`;
      }
      if (t2.current) {
        t2.current.style.left = `${p2.x}px`;
        t2.current.style.top = `${p2.y}px`;
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
        const fling = Math.min(speed, 26) * 0.13;
        while (dist >= STEP) {
          const ux = dx / dist;
          const uy = dy / dist;
          walkX += ux * STEP;
          walkY += uy * STEP;
          spawn(
            walkX + rand(-2, 2),
            walkY + rand(-2, 2),
            ux * fling + rand(-0.4, 0.4),
            uy * fling + rand(0.1, 0.6) + 0.3, // bias downward — it's falling
          );
          dx = mx - walkX;
          dy = my - walkY;
          dist = Math.hypot(dx, dy);
        }
      }

      // ---- advance droplets ----
      const drag = Math.pow(DRAG, f);
      for (const d of drips) {
        if (!d.on) continue;
        d.life += dt;
        d.vy += GRAV * f;
        d.vx *= drag;
        d.x += d.vx * f;
        d.y += d.vy * f;
        const p = d.life / d.ttl;
        if (p >= 1 || d.y > innerHeight + 60) {
          d.on = false;
          d.el.style.opacity = "0";
          d.el.style.transform = "translate3d(-9999px,-9999px,0)";
          continue;
        }
        const fin = Math.min(1, d.life / 90); // quick fade-in
        const fout = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1; // ease-out tail
        const sp = Math.min(Math.abs(d.vy), 14);
        const shrink = 0.6 + 0.4 * fout; // drift smaller as it dies
        const sy = (1 + sp * 0.05) * d.size * shrink;
        const sx = (1 / (1 + sp * 0.03)) * d.size * shrink;
        const dir = (Math.atan2(d.vy, d.vx) * 180) / Math.PI - 90;
        const ang = dir + Math.sin(d.life / 120 + d.phase) * 6; // gentle wobble
        d.el.style.opacity = (fin * fout).toFixed(3);
        d.el.style.transform = `translate3d(${d.x.toFixed(2)}px,${d.y.toFixed(2)}px,0) rotate(${ang.toFixed(2)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
      }

      // ---- glass spotlight follows the cursor ----
      if (glassDirty) {
        glassDirty = false;
        document.querySelectorAll<HTMLElement>(".glass").forEach((el) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${mx - r.left}px`);
          el.style.setProperty("--my", `${my - r.top}px`);
        });
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      removeEventListener("pointermove", onMove);
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
