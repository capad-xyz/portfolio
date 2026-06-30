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

function makeEnvelopeIcon() {
  const wrap = document.createElement("div");
  // paper-coloured glyph so it reads on the dark mercury bubble (currentColor
  // otherwise resolved to ink — invisible on near-black)
  wrap.style.cssText =
    "display:flex; align-items:center; justify-content:center; width:24px; height:24px; color:#f1f0ec;";
  wrap.innerHTML =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5h16v11H4z"/><path d="m4 7.5 8 5.5 8-5.5"/></svg>';
  return wrap;
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

    manager.add({
      id: "contact",
      label: "Send a message",
      icon: makeEnvelopeIcon(),
      content: (host) => {
        host.style.color = "#0b0b0d";
        // the panel paints above the custom-cursor layer, so use the native cursor
        host.style.cursor = "auto";
        panelRoot = createRoot(host);
        panelRoot.render(<ContactPanel onSent={() => {}} />);
        return () => {
          panelRoot?.unmount();
          panelRoot = null;
        };
      },
    });

    managerRef.current = manager;

    return () => {
      manager.destroy();
      managerRef.current = null;
    };
  }, []);

  return null;
}
