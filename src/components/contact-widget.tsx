"use client";

import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { createBubbles, type BubbleManager } from "@hyperplexed/bubbles";
import { LiquidButton } from "./liquid-button";
import { useLiquidTyping } from "./use-liquid-typing";

type Status = "idle" | "sending" | "ok" | "error";

function ContactPanel({ onSent }: { onSent: () => void }) {
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

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
    // occasional: winking smiley (big, bold features)
    '<g class="g-smiley">' +
    '<g class="eyes" fill="#f1f0ec"><circle class="eye eye-l" cx="8.4" cy="9.2" r="2.3"/><circle class="eye eye-r" cx="15.6" cy="9.2" r="2.3"/></g>' +
    '<path d="M6.6 13.2 Q12 19 17.4 13.2" stroke="#f1f0ec" stroke-width="2.3" stroke-linecap="round"/>' +
    "</g>" +
    // hover / press: open-mouthed grin
    '<g class="g-grin">' +
    '<g fill="#f1f0ec"><circle cx="8.4" cy="8.8" r="2.1"/><circle cx="15.6" cy="8.8" r="2.1"/></g>' +
    '<path d="M6.8 12.9 Q12 13.5 17.2 12.9 Q16 19.2 12 19.2 Q8 19.2 6.8 12.9 Z" fill="#f1f0ec"/>' +
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
      side: "right",
      // dock at the bottom-edge rest (viewportHeight - bubbleHeight - 12px):
      // vertical >= 1 clamps to maxRestTop, the spot the bubble springs to
      // when flung off the bottom of the page.
      vertical: 1,
      panelWidth: 500,
      panelMaxHeight: "86%",
      maxBubbles: 1,
    });

    let panelRoot: Root | null = null;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const face = makeFaceIcon();
    const ctrl = makeFaceController(face, reduce);

    manager.add({
      id: "contact",
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
      window.setTimeout(() => managerRef.current?.activate("contact"), 0);
    };
    addEventListener("capad:open-contact", onOpenRequest);

    return () => {
      removeEventListener("capad:open-contact", onOpenRequest);
      stopHover();
      stopSmile();
      stopProximity();
      manager.destroy();
      managerRef.current = null;
    };
  }, []);

  return null;
}
