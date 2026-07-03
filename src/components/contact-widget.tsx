"use client";

import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createBubbles, type BubbleManager } from "@hyperplexed/bubbles";
import { LiquidButton } from "./liquid-button";
import { useLiquidTyping } from "./use-liquid-typing";

type Status = "idle" | "sending" | "ok" | "error";

// The message face is the flock's permanent front bubble: it's added last (so
// the library seeds it as the front/active one) and every collapse re-leads
// with it, so the docked stack always re-forms in the same order.
const FRONT_ID = "contact";

// --- Cloudflare Turnstile (bot check) ---------------------------------------
// The sitekey is public by design (it's visible in every page source); the
// matching SECRET key lives only on the worker, which is what actually
// validates tokens. Inlined at build time - when unset, the widget simply
// doesn't render and the API skips verification (local dev, previews).
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "flexible" | "compact";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

let turnstileLoader: Promise<void> | null = null;
function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!turnstileLoader) {
    turnstileLoader = new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        turnstileLoader = null; // allow a retry on the next panel open
        reject(new Error("turnstile script failed to load"));
      };
      document.head.appendChild(s);
    });
  }
  return turnstileLoader;
}

function ContactPanel({ onSent }: { onSent: () => void }) {
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const turnstileHostRef = useRef<HTMLDivElement>(null);
  const turnstileIdRef = useRef<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Mount the Turnstile widget when the panel opens. The widget is created in
  // INVISIBLE mode (set on the widget in the Cloudflare dash), so nothing ever
  // renders - no checkbox, no badge. The behavioural check runs silently and
  // hands us a token via the callback. A visitor who fails the silent check
  // (rare: hardened privacy setups) gets the form's error state, which already
  // offers the direct-email fallback.
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    let cancelled = false;
    loadTurnstile()
      .then(() => {
        const host = turnstileHostRef.current;
        if (cancelled || !host || !window.turnstile || turnstileIdRef.current) return;
        turnstileIdRef.current = window.turnstile.render(host, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "light",
          callback: (token) => setTurnstileToken(token),
          // tokens live ~5 min; if the visitor composes slowly, silently mint
          // a fresh one instead of letting the submit fail
          "expired-callback": () => {
            setTurnstileToken(null);
            if (turnstileIdRef.current) window.turnstile?.reset(turnstileIdRef.current);
          },
          "error-callback": () => setTurnstileToken(null),
        });
      })
      .catch(() => {
        // script blocked/unreachable - the server will explain if it matters
      });
    return () => {
      cancelled = true;
      if (turnstileIdRef.current && window.turnstile) {
        window.turnstile.remove(turnstileIdRef.current);
        turnstileIdRef.current = null;
      }
    };
  }, []);

  // caret-drip on name/email + a per-keystroke "give" on every field
  useLiquidTyping(formRef);

  useEffect(() => {
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      email: fd.get("email"),
      message: fd.get("message"),
      website: fd.get("website"),
      turnstileToken,
    };
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong.");
        // Turnstile tokens are single-use: after any server round-trip that
        // consumed (or rejected) one, ask the widget for a fresh token so the
        // retry doesn't fail with an "already used" verification error.
        if (turnstileIdRef.current && window.turnstile) {
          setTurnstileToken(null);
          window.turnstile.reset(turnstileIdRef.current);
        }
        return;
      }
      setStatus("ok");
      onSent();
    } catch {
      setStatus("error");
      setError("Network hiccup. Try again or email directly.");
    }
  }

  if (status === "ok") {
    return (
      <div className="contact-panel px-8 py-12 text-center">
        <p className="mb-2 text-[20px] font-semibold">Sent. Talk soon.</p>
        <p className="text-[14px] text-[var(--muted)]">Reply usually within a day.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="contact-panel space-y-3.5 px-7 pb-7 pt-6">
      <div>
        <p className="section-eyebrow mb-1">say hello</p>
        <h2 className="text-[23px] font-bold leading-tight tracking-tight">Send a message</h2>
      </div>

      <label className="block">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Name
        </span>
        <input
          ref={firstFieldRef}
          name="name"
          type="text"
          required
          maxLength={120}
          autoComplete="name"
          className="cap-field w-full rounded-2xl border border-black/15 bg-white/60 px-4 py-3 text-[15px] outline-none transition focus:border-black/40 focus:bg-white"
        />
      </label>
      <label className="block">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          className="cap-field w-full rounded-2xl border border-black/15 bg-white/60 px-4 py-3 text-[15px] outline-none transition focus:border-black/40 focus:bg-white"
        />
      </label>
      <label className="block">
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Message
        </span>
        <textarea
          name="message"
          required
          maxLength={4000}
          rows={5}
          className="cap-field w-full resize-none rounded-xl border border-black/15 bg-white/60 px-3 py-2.5 text-[14px] outline-none transition focus:border-black/40 focus:bg-white"
        />
      </label>

      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {/* invisible-mode Turnstile renders nothing; the host just needs to exist */}
      {TURNSTILE_SITE_KEY && <div ref={turnstileHostRef} aria-hidden />}

      {error && (
        <p role="alert" className="text-[12px] text-red-700">
          {error}
        </p>
      )}

      <LiquidButton
        type="submit"
        block
        disabled={status === "sending"}
        className="mt-1 px-6 py-[13px] text-[14px] font-semibold disabled:opacity-60"
      >
        {status === "sending" ? "Sending..." : "Send"}
      </LiquidButton>
      <p className="text-center text-[11px] text-[var(--muted)]">
        or email{" "}
        <a
          href="mailto:connect@capad.fyi"
          className="underline decoration-[var(--muted)] underline-offset-2 hover:text-[var(--ink)]"
        >
          connect@capad.fyi
        </a>{" "}
        directly
        {TURNSTILE_SITE_KEY && (
          // invisible widgets must disclose themselves somewhere on the page
          <span className="opacity-70"> · spam-checked by Cloudflare Turnstile</span>
        )}
      </p>
    </form>
  );
}

// The bubble face: an envelope by default, with a hidden smiley and a scared
// face layered in. CSS crossfades between the three groups; the `.happy` /
// `.scared` classes are driven from ContactWidget. Paper-coloured so it reads
// on the dark mercury bubble.
function makeFaceIcon() {
  const wrap = document.createElement("div");
  wrap.className = "cap-face";
  wrap.style.cssText =
    "display:flex; align-items:center; justify-content:center; width:24px; height:24px; color:#f1f0ec;";
  wrap.innerHTML =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none">' +
    // default: envelope
    '<g class="g-envelope" stroke="#f1f0ec" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M4 6.5h16v11H4z"/><path d="m4 7.5 8 5.5 8-5.5"/>' +
    "</g>" +
    // occasional: blissful smiley — closed squint-arc eyes, soft blush, a wide
    // warm smile (the round-eyed look now belongs to the hover grin alone)
    '<g class="g-smiley">' +
    '<g class="eyes" stroke="#f1f0ec" stroke-width="2.2" stroke-linecap="round" fill="none">' +
    '<path class="eye eye-l" d="M6.2 9.7 Q8.2 6.9 10.2 9.7"/>' +
    '<path class="eye eye-r" d="M13.8 9.7 Q15.8 6.9 17.8 9.7"/>' +
    "</g>" +
    '<circle cx="4.9" cy="12.6" r="1.2" fill="#f1f0ec" opacity="0.45"/>' +
    '<circle cx="19.1" cy="12.6" r="1.2" fill="#f1f0ec" opacity="0.45"/>' +
    '<path d="M7 13.6 Q12 18.8 17 13.6" stroke="#f1f0ec" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
    "</g>" +
    // hover / press: a bright, eager grin drawn in the same stroke language as
    // the envelope and the blissful smiley (the old filled open-mouth read as a
    // different species) — round lit eyes + one wide smile arc
    '<g class="g-grin">' +
    '<g fill="#f1f0ec"><circle cx="8.4" cy="9" r="1.9"/><circle cx="15.6" cy="9" r="1.9"/></g>' +
    '<path d="M6.8 13.4 Q12 19 17.2 13.4" stroke="#f1f0ec" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
    "</g>" +
    // near the remove target: scared/sad with a teardrop (parts scale with --fear)
    '<g class="g-scared">' +
    '<g class="s-eyes" fill="#f1f0ec"><circle cx="8.6" cy="9" r="2.7"/><circle cx="15.4" cy="9" r="2.7"/></g>' +
    '<path class="s-frown" d="M7.2 16.4 Q12 11.8 16.8 16.4" stroke="#f1f0ec" stroke-width="2.3" stroke-linecap="round"/>' +
    '<path class="tear" d="M17.6 11 q1.5 2.5 0 3.7 q-1.5 -1.2 0 -3.7 z" fill="#f1f0ec"/>' +
    "</g>" +
    "</svg>";
  return wrap;
}

/**
 * The rest of the flock: real channels only, stacked behind the message face.
 * Each keeps the mercury glare (the shared bubbleShadow gloss) but carries its
 * own light — the gradient's origin and depth shift per bubble, so the stack
 * reads as siblings, not clones. Add a channel = add one entry here.
 */
type SocialBubble = {
  id: string;
  label: string;
  href: string;
  /** Same mercury family, individually lit. */
  surface: string;
  /** Paper-coloured glyph, 24×24 viewBox. */
  svg: string;
};

const SOCIAL_BUBBLES: SocialBubble[] = [
  {
    id: "github",
    label: "GitHub — capad-xyz",
    href: "https://github.com/capad-xyz",
    surface:
      "radial-gradient(circle at 30% 22%, #8b8b95 0%, #26262c 52%, #08080a 100%)",
    svg:
      '<svg viewBox="0 0 16 16" width="21" height="21" fill="#f1f0ec" aria-hidden="true">' +
      '<path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>' +
      "</svg>",
  },
  {
    // the message face already covers email (panel + mailto fallback), so the
    // second social slot belongs to X rather than a duplicate email door
    id: "x",
    label: "X — @aadarsh_io",
    href: "https://x.com/aadarsh_io",
    surface:
      "radial-gradient(circle at 42% 32%, #6d6d77 0%, #17171c 48%, #030304 100%)",
    svg:
      '<svg viewBox="0 0 24 24" width="19" height="19" fill="#f1f0ec" aria-hidden="true">' +
      '<path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z"/>' +
      "</svg>",
  },
];

function makeSocialIcon(svg: string) {
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "display:flex; align-items:center; justify-content:center; width:24px; height:24px; color:#f1f0ec;";
  wrap.innerHTML = svg;
  return wrap;
}

/**
 * A social bubble is a launcher, not a panel. The FIRST click on a docked flock
 * belongs to the library — it fans the stack open — so the link must not fire
 * on it. The library commits that tap on pointerup and the DOM `click` lands
 * after, by which point state() already reads "open"; so we sample the state at
 * pointerdown instead. A clean tap on an already-open flock opens the link and
 * tucks the stack home; a drag past the guard distance stays a drag. Returns a
 * teardown.
 */
function wireSocialBubble(icon: HTMLElement, s: SocialBubble, manager: BubbleManager) {
  const surface = icon.parentElement;
  if (surface) surface.style.background = s.surface;
  const btn = icon.closest<HTMLElement>('[role="button"]') ?? surface;
  if (!btn) return () => {};
  let downX = 0;
  let downY = 0;
  let openOnDown = false;
  const onDown = (e: PointerEvent) => {
    downX = e.clientX;
    downY = e.clientY;
    openOnDown = manager.state() === "open";
  };
  const onClick = (e: MouseEvent) => {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) >= 8) return; // it was a drag
    // Docked when pressed → this gesture only fanned the flock open; leave the
    // link for the next, deliberate click.
    if (!openOnDown) return;
    if (s.href.startsWith("mailto:")) location.href = s.href;
    else window.open(s.href, "_blank", "noopener");
    // Launched — tuck the stack home. Tapping this social just made IT the
    // active bubble, and the library makes the active bubble topmost on
    // collapse, so the docked order would change with whichever channel you
    // last clicked. Hand the lead back to the message face first, in the SAME
    // tick as the collapse so its panel shows-then-hides within one frame and
    // never actually paints — the stack always re-forms with the face on top.
    window.setTimeout(() => {
      if (manager.state() !== "open") return;
      if (manager.active() !== FRONT_ID) manager.activate(FRONT_ID);
      manager.toggle();
    }, 60);
  };
  btn.addEventListener("pointerdown", onDown);
  btn.addEventListener("click", onClick);
  return () => {
    btn.removeEventListener("pointerdown", onDown);
    btn.removeEventListener("click", onClick);
  };
}

type FaceController = {
  setHover: (v: boolean) => void;
  setPress: (v: boolean) => void;
  setOccasional: (v: boolean) => void;
  setFear: (v: number) => void;
};

/**
 * Central face state:
 *   - hover / press → an open-mouthed grin (`.grin`), a plain crossfade, no spin
 *   - occasional timer → a winking smiley (`.happy`) that DOES spin the bubble
 *   - scared (fear > 0) always wins, its intensity driven by --fear
 * The spin is reserved for the occasional smiley: the mercury surface (the
 * face's parent) uses the CSS `scale` property for its hover feedback, so we
 * drive the independent `rotate` property, which composes cleanly.
 */
function makeFaceController(face: HTMLElement, reduce: boolean): FaceController {
  let hovered = false;
  let pressed = false;
  let occasional = false;
  let fear = 0;
  let happyNow = false;
  let spin = 0;

  const flip = () => {
    if (reduce) return;
    // Spin the face itself, not the mercury circle: the circle carries the
    // bubble's drop shadow, and rotating it swings the shadow around the
    // button — only the artwork should turn.
    if (!face.dataset.capSpin) {
      face.style.transition = "rotate 0.62s cubic-bezier(0.3, 0.8, 0.25, 1)";
      face.dataset.capSpin = "1";
    }
    spin += 360;
    face.style.rotate = `${spin}deg`;
  };

  const apply = () => {
    const scared = fear > 0.02;
    face.classList.toggle("scared", scared);
    face.style.setProperty("--fear", fear.toFixed(3));

    // hover / press → open-mouthed grin: a plain crossfade, deliberately no spin
    const grin = !scared && (hovered || pressed);
    face.classList.toggle("grin", grin);

    // occasional winking smiley → spins the bubble on/off; yields to the grin
    // while the user is interacting, and to the scared face
    const happy = !scared && !grin && occasional;
    if (happy !== happyNow) {
      happyNow = happy;
      face.classList.toggle("happy", happy);
      flip(); // spin only for the occasional smiley
    }
  };

  return {
    setHover: (v) => {
      hovered = v;
      apply();
    },
    setPress: (v) => {
      pressed = v;
      apply();
    },
    setOccasional: (v) => {
      occasional = v;
      apply();
    },
    setFear: (v) => {
      fear = v;
      apply();
    },
  };
}

/** Makes the bubble smile on hover and while pressed. Returns a teardown. */
function watchHoverPress(face: HTMLElement, ctrl: FaceController) {
  const btn = face.closest<HTMLElement>('[role="button"]');
  if (!btn) return () => {};
  const onEnter = () => ctrl.setHover(true);
  const onLeave = () => ctrl.setHover(false);
  const onDown = () => ctrl.setPress(true);
  const onUp = () => ctrl.setPress(false);
  btn.addEventListener("pointerenter", onEnter);
  btn.addEventListener("pointerleave", onLeave);
  btn.addEventListener("pointerdown", onDown);
  addEventListener("pointerup", onUp, { passive: true });
  addEventListener("pointercancel", onUp, { passive: true });
  return () => {
    btn.removeEventListener("pointerenter", onEnter);
    btn.removeEventListener("pointerleave", onLeave);
    btn.removeEventListener("pointerdown", onDown);
    removeEventListener("pointerup", onUp);
    removeEventListener("pointercancel", onUp);
  };
}

/**
 * Every so often (4–9s), flashes the winking smiley for a couple of seconds — a
 * small, fairly frequent delight on top of the hover/press smile. Skipped under
 * reduced-motion. Returns a teardown.
 */
function scheduleOccasionalSmile(ctrl: FaceController, reduce: boolean) {
  if (reduce) return () => {};
  let showT = 0;
  let hideT = 0;
  const loop = () => {
    showT = window.setTimeout(
      () => {
        ctrl.setOccasional(true);
        hideT = window.setTimeout(() => ctrl.setOccasional(false), 2400);
        loop();
      },
      4000 + Math.random() * 5000,
    );
  };
  loop();
  return () => {
    window.clearTimeout(showT);
    window.clearTimeout(hideT);
  };
}

/**
 * Turns the face scared while the bubble is dragged toward the dismiss
 * ("remove") target and calm again as it pulls away. The library doesn't expose
 * the live drag position, so we watch its dismiss target — a position:fixed div
 * on <body> at z-index 2147483610, shown (display ≠ none) only during a drag —
 * and compare its centre to the face's while a pointer is down. Returns a
 * teardown.
 */
const DISMISS_Z = "2147483610";
function watchDismissProximity(face: HTMLElement, ctrl: FaceController) {
  let down = false;
  let raf = 0;
  let dismissEl: HTMLElement | null = null;

  const findDismiss = () =>
    (Array.from(document.body.children) as HTMLElement[]).find(
      (el) => getComputedStyle(el).zIndex === DISMISS_Z,
    ) ?? null;

  const tick = () => {
    raf = 0;
    if (!dismissEl) dismissEl = findDismiss();
    const b = dismissEl?.getBoundingClientRect();
    const showing =
      !!dismissEl && !!b && b.width > 0 && getComputedStyle(dismissEl).display !== "none";
    if (showing && b) {
      const a = face.getBoundingClientRect();
      const dist = Math.hypot(
        a.left + a.width / 2 - (b.left + b.width / 2),
        a.top + a.height / 2 - (b.top + b.height / 2),
      );
      // the scared face shows once within ~2 target-widths, and fear ramps to
      // full by the time it's over the centre
      const near = b.width * 0.5;
      const far = b.width * 2;
      const fear = Math.max(0, Math.min(1, (far - dist) / (far - near)));
      ctrl.setFear(fear);
    } else {
      ctrl.setFear(0);
    }
    if (down) raf = requestAnimationFrame(tick);
    else ctrl.setFear(0);
  };

  const onDown = () => {
    down = true;
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const onUp = () => {
    down = false;
  };
  addEventListener("pointerdown", onDown, { passive: true });
  addEventListener("pointerup", onUp, { passive: true });
  addEventListener("pointercancel", onUp, { passive: true });

  return () => {
    removeEventListener("pointerdown", onDown);
    removeEventListener("pointerup", onUp);
    removeEventListener("pointercancel", onUp);
    if (raf) cancelAnimationFrame(raf);
  };
}

export function ContactWidget() {
  const managerRef = useRef<BubbleManager | null>(null);

  useEffect(() => {
    if (managerRef.current) return;

    const manager = createBubbles({
      theme: "light",
      colors: {
        // glossy liquid-mercury bubble, lit top-left — matches the cursor + intro drop
        bubbleSurface:
          "radial-gradient(circle at 35% 28%, #76767f 0%, #1d1d23 48%, #050506 100%)",
        bubbleIcon: "#f1f0ec",
        // a real float + inset gloss; the bare-colour default was an invalid box-shadow
        bubbleShadow:
          "0 16px 34px -10px rgba(20,20,30,0.55), 0 6px 14px -6px rgba(20,20,30,0.45), inset 0 2px 3px rgba(255,255,255,0.45), inset 0 -8px 13px rgba(0,0,0,0.55)",
        focusRing: "#0b0b0d",
        panelSurface: "#f1f0ec",
        panelText: "#0b0b0d",
        panelShadow:
          "0 30px 80px -24px rgba(20,20,30,0.5), 0 12px 28px -14px rgba(20,20,30,0.35)",
        dismissSurface: "#0b0b0d",
        dismissBorder: "#0b0b0d",
        dismissIcon: "#f1f0ec",
      },
      // the flock docks hard in the bottom-right corner — vertical: 1 lands
      // past the clampable range, so clampCenter settles it against the bottom
      // margin (the resting spot a flung stack glides back to). The social
      // stack rises from behind the face above it.
      side: "right",
      vertical: 1,
      panelWidth: 500,
      panelMaxHeight: "86%",
      maxBubbles: 1 + SOCIAL_BUBBLES.length,
    });

    let panelRoot: Root | null = null;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const face = makeFaceIcon();
    const ctrl = makeFaceController(face, reduce);

    // Socials enter first (walked face-outward, hence reversed); the message
    // face is added last, so the library makes it the front bubble. With the
    // patched dock geometry the front bubble sits at the BOTTOM of the spread,
    // the email face as the bottom overlay and the socials rising behind it.
    const socialStops: (() => void)[] = [];
    for (const s of [...SOCIAL_BUBBLES].reverse()) {
      const icon = makeSocialIcon(s.svg);
      manager.add({ id: s.id, label: s.label, icon });
      socialStops.push(wireSocialBubble(icon, s, manager));
    }

    manager.add({
      id: FRONT_ID,
      label: "Send a message",
      icon: face,
      content: (host) => {
        host.style.color = "#0b0b0d";
        // the panel paints above the custom-cursor layer, so use the native cursor
        host.style.cursor = "auto";
        panelRoot = createRoot(host);
        // a successful send earns the winking smiley + a spin — the clearest
        // "got it, talk soon" the face can give
        panelRoot.render(
          <ContactPanel
            onSent={() => {
              ctrl.setOccasional(true);
              window.setTimeout(() => ctrl.setOccasional(false), 3200);
            }}
          />,
        );
        return () => {
          // The manager tears content down during a React render/commit, and
          // React forbids synchronously unmounting a root from inside one —
          // defer a tick so the outer render finishes first.
          const r = panelRoot;
          panelRoot = null;
          setTimeout(() => r?.unmount(), 0);
        };
      },
    });

    managerRef.current = manager;

    // the icon is mounted now, so the bubble button exists for hover/press wiring
    const stopHover = watchHoverPress(face, ctrl);
    const stopProximity = watchDismissProximity(face, ctrl);
    const stopSmile = scheduleOccasionalSmile(ctrl, reduce);

    // "Start a conversation" buttons anywhere on the site open this panel via a
    // custom event. Deferred a tick so the manager's own tap-away handling for
    // the same click has finished before the group expands.
    const onOpenRequest = () => {
      window.setTimeout(() => managerRef.current?.activate(FRONT_ID), 0);
    };
    addEventListener("capad:open-contact", onOpenRequest);

    return () => {
      removeEventListener("capad:open-contact", onOpenRequest);
      socialStops.forEach((stop) => stop());
      stopHover();
      stopSmile();
      stopProximity();
      manager.destroy();
      managerRef.current = null;
    };
  }, []);

  return null;
}
