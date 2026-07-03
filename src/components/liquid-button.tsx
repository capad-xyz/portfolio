"use client";

import { useRef, type ReactNode } from "react";

/**
 * The signature liquid button: an ink drop floods out from wherever the pointer
 * enters, filling the pill while the label flips to paper — the same effect as
 * the hero "See the work" CTA, packaged so every call-to-action shares it.
 * `glass` is the primary (frosted) pill; `outline` is the quieter secondary.
 * Renders an `<a>` when given `href`, otherwise a `<button>` (submit/onClick).
 */
export function LiquidButton({
  children,
  variant = "glass",
  className = "",
  href,
  external = false,
  type = "button",
  onClick,
  disabled = false,
  block = false,
}: {
  children: ReactNode;
  variant?: "glass" | "outline";
  className?: string;
  href?: string;
  external?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  block?: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  // flood the liquid fill from where the pointer enters / leaves; the drop is
  // scaled to reach the farthest corner from that exact point (see --fill-scale)
  const placeFill = (e: React.PointerEvent) => {
    const el = root.current;
    const f = fill.current;
    if (!el || !f) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    f.style.left = `${x}px`;
    f.style.top = `${y}px`;
    const far = Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y));
    el.style.setProperty("--fill-scale", `${Math.ceil((far / 12) * 1.1)}`);
  };

  const surface = variant === "glass" ? "glass" : "lqbtn-outline";
  const cls = `lqbtn ${surface} ${block ? "lqbtn-block w-full " : ""}inline-flex items-center justify-center rounded-full ${className}`;
  const inner = (
    <>
      <span ref={fill} className="fill" aria-hidden />
      <span className="lbl">{children}</span>
    </>
  );

  if (href) {
    return (
      <a
        ref={root as React.RefObject<HTMLAnchorElement>}
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        onPointerEnter={placeFill}
        onPointerLeave={placeFill}
        className={cls}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      ref={root as React.RefObject<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onPointerEnter={placeFill}
      onPointerLeave={placeFill}
      className={cls}
    >
      {inner}
    </button>
  );
}
