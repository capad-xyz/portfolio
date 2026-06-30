"use client";

import { useEffect, type RefObject } from "react";

/**
 * Liquid typing feedback for the contact form — two coordinated micro-
 * interactions, both tuned to the site's mercury motif:
 *
 *  - **caret drip** — editing the name/email fields beads dark liquid at the
 *    caret, which detaches and falls under gravity, stretching into a teardrop
 *    and fading. Same teardrop geometry, #goo-drip fuse and physics as the
 *    cursor trail, so it reads as the same substance. Three flavours: a bead
 *    that wells up on insert, a smaller fleck flicked sideways on a single
 *    delete, and a scattering burst when a chunk goes at once (select-all,
 *    word- or line-delete, cut). The message box drips ONLY on that mass-delete
 *    burst — a bead per character on long prose would be noise; off under
 *    reduced-motion.
 *
 *  - **type pulse** — name/email give a tiny GPU-cheap scale "give" (190ms, the
 *    120–220ms micro-interaction band) per keystroke so typing feels physical.
 *    The textarea is deliberately left out: it scrolls, and scaling a scrolling
 *    box visibly shakes it.
 *
 * The drip layer is appended to <body> ABOVE the contact panel's near-max
 * z-index — the global cursor-trail layer paints far below the panel, so it
 * can't be reused here. One rAF loop runs only while droplets are alive; with
 * none on screen there is no idle cost.
 */

const POOL = 18; // max simultaneous droplets (a mass-delete burst claims several)
const GRAV = 0.26; // downward acceleration (px / frame²)
const DRAG = 0.985; // horizontal damping per frame
const MIN_SPAWN_GAP = 45; // ms between single beads so key-repeat can't flood
const BURST_GAP = 140; // ms between mass-delete splashes (held word-delete)
const MASS_DELETE = 4; // chars gone in one edit to count as a "mass" remove

// Only these fields drip. The message textarea deliberately does not.
const DRIP_FIELDS = new Set(["name", "email"]);

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

export function useLiquidTyping(formRef: RefObject<HTMLFormElement | null>) {
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ---- drip layer, above the panel; own #goo-drip so beads fuse into liquid ----
    const layer = document.createElement("div");
    layer.className = "type-drips";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    const drips: Drip[] = [];
    for (let i = 0; i < POOL; i++) {
      const el = document.createElement("i");
      el.style.transform = "translate3d(-9999px,-9999px,0)";
      layer.appendChild(el);
      drips.push({ el, on: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, ttl: 0, size: 1, phase: 0 });
    }

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    // ---- caret → viewport point, via canvas text metrics ----
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const caretPoint = (input: HTMLInputElement | HTMLTextAreaElement) => {
      const cs = getComputedStyle(input);
      const rect = input.getBoundingClientRect();
      // type="email" doesn't expose the selection API (null, and historically
      // throws) — while typing the caret is at the end, so that's the fallback.
      let sel = input.value.length;
      try {
        if (input.selectionStart != null) sel = input.selectionStart;
      } catch {
        /* selection unsupported on this input type */
      }
      let textW = 0;
      if (ctx) {
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const slice = input.value.slice(0, sel);
        textW = ctx.measureText(slice).width;
        const ls = parseFloat(cs.letterSpacing);
        if (ls) textW += ls * slice.length;
      }
      const padL = parseFloat(cs.paddingLeft) || 0;
      const padR = parseFloat(cs.paddingRight) || 0;
      const bL = parseFloat(cs.borderLeftWidth) || 0;
      const innerLeft = rect.left + bL + padL;
      const innerRight = rect.right - padR;
      // clamp to the field so an over-long value beads at the visible edge
      const x = Math.min(innerLeft + textW - input.scrollLeft, innerRight);
      const y = rect.top + rect.height * 0.58; // just below the text baseline
      return { x, y };
    };

    let prev = 0;
    let raf = 0;

    function loop(t: number) {
      if (!prev) prev = t;
      const dt = Math.min(40, t - prev); // clamp big gaps (tab switch)
      prev = t;
      const f = dt / 16.67; // ≈ 1 at 60fps
      const drag = Math.pow(DRAG, f);
      let alive = 0;
      for (const d of drips) {
        if (!d.on) continue;
        alive++;
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
          alive--;
          continue;
        }
        const fin = Math.min(1, d.life / 90); // quick well-up
        const fout = p > 0.68 ? 1 - (p - 0.68) / 0.32 : 1; // ease-out tail
        const sp = Math.min(Math.abs(d.vy), 14);
        const shrink = 0.62 + 0.38 * fout;
        const sy = (1 + sp * 0.05) * d.size * shrink; // stretch with fall speed
        const sx = (1 / (1 + sp * 0.03)) * d.size * shrink;
        const dir = (Math.atan2(d.vy, d.vx) * 180) / Math.PI - 90;
        const ang = dir + Math.sin(d.life / 120 + d.phase) * 6; // gentle wobble
        d.el.style.opacity = (fin * fout).toFixed(3);
        d.el.style.transform = `translate3d(${d.x.toFixed(2)}px,${d.y.toFixed(2)}px,0) rotate(${ang.toFixed(2)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
      }
      raf = alive > 0 ? requestAnimationFrame(loop) : 0;
    }

    const spawnAt = (x: number, y: number, vx: number, vy: number, size: number) => {
      const d = drips.find((q) => !q.on);
      if (!d) return; // pool exhausted — density just caps
      d.on = true;
      d.x = x;
      d.y = y;
      d.vx = vx;
      d.vy = vy;
      d.life = 0;
      d.ttl = rand(620, 980);
      d.size = size;
      d.phase = rand(0, Math.PI * 2);
      d.el.style.opacity = "0";
      if (!raf) {
        prev = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    // insertion — a bead wells up at the caret, barely moving, then gravity
    const dripInsert = (x: number, y: number) =>
      spawnAt(x + rand(-1, 1), y, rand(-0.25, 0.25), rand(0.1, 0.5), rand(0.42, 0.72));

    // single delete — a smaller fleck flicked left (toward the vanished glyph)
    // and popped up a touch before it falls, so backspace reads unlike typing
    const dripDelete = (x: number, y: number) =>
      spawnAt(x, y, rand(-1.3, -0.4), rand(-0.7, -0.1), rand(0.34, 0.56));

    // mass delete (select-all / word / cut) — a scatter of droplets bursts from
    // the edit point and rains down, so wiping a chunk feels unlike one char
    const dripBurst = (x: number, y: number, removed: number) => {
      const n = Math.min(10, 3 + Math.round(removed / 6));
      for (let i = 0; i < n; i++) {
        spawnAt(x + rand(-8, 8), y + rand(-3, 3), rand(-2.6, 2.6), rand(-1.6, 1.2), rand(0.4, 0.85));
      }
    };

    // ---- per-keystroke "give": a tiny scale pulse, GPU-cheap, self-cancelling ----
    const pulses = new WeakMap<HTMLElement, Animation>();
    const pulse = (el: HTMLElement) => {
      if (typeof el.animate !== "function") return;
      pulses.get(el)?.cancel();
      pulses.set(
        el,
        el.animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.006)" }, { transform: "scale(1)" }],
          { duration: 190, easing: "cubic-bezier(0.2,0.8,0.2,1)" },
        ),
      );
    };

    // remembered value-length per field, so a delete's magnitude is known
    const lengths = new WeakMap<HTMLElement, number>();
    const onFocusIn = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
        lengths.set(el, (el as HTMLInputElement).value.length);
      }
    };

    let lastSpawn = -Infinity;
    let lastBurst = -Infinity;

    const onInput = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (!el || (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA")) return;
      // the message box stays still — it has a scrollbar, so a scale "give"
      // would jitter it; only name/email get the subtle press
      if (el.tagName !== "TEXTAREA") pulse(el);

      const input = el as HTMLInputElement | HTMLTextAreaElement;
      const newLen = input.value.length;
      const oldLen = lengths.get(el) ?? newLen;
      lengths.set(el, newLen);

      // name/email get every flavour; the message box only ever drips on a mass
      // delete (so typing/single-backspace there stays calm); honeypot: nothing
      const isDrip = DRIP_FIELDS.has(input.name);
      const isBurstOnly = el.tagName === "TEXTAREA";
      if (!isDrip && !isBurstOnly) return;

      const inputType = (e as InputEvent).inputType;
      const now = performance.now();

      if (inputType && inputType.startsWith("delete")) {
        const removed = Math.max(1, oldLen - newLen);
        if (removed >= MASS_DELETE) {
          if (now - lastBurst >= BURST_GAP) {
            lastBurst = now;
            lastSpawn = now;
            const { x, y } = caretPoint(input);
            dripBurst(x, y, removed);
          }
        } else if (isDrip && now - lastSpawn >= MIN_SPAWN_GAP) {
          lastSpawn = now;
          const { x, y } = caretPoint(input);
          dripDelete(x, y);
        }
        return;
      }

      // insertion (incl. paste / IME composition) — full-drip fields only
      if (isDrip && now - lastSpawn >= MIN_SPAWN_GAP) {
        lastSpawn = now;
        const { x, y } = caretPoint(input);
        dripInsert(x, y);
      }
    };

    form.addEventListener("input", onInput);
    form.addEventListener("focusin", onFocusIn);

    return () => {
      form.removeEventListener("input", onInput);
      form.removeEventListener("focusin", onFocusIn);
      if (raf) cancelAnimationFrame(raf);
      layer.remove();
    };
  }, [formRef]);
}
