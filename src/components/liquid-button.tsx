"use client";

import { useRef, type ReactNode } from "react";

/**
 * The signature liquid button: an ink drop floods out from wherever the pointer
 * enters, filling the pill while the label flips to paper — the same effect as
 * the hero "See the work" CTA, packaged so every call-to-action shares it.
 * `glass` is the primary (frosted) pill; `outline` is the quieter secondary.
 * Renders an `<a>` when given `href`, otherwise a `<button>` (submit/onClick) —
 * or a `<summary>` with `as="summary"`, so the toggle half of a `<details>`
 * disclosure wears the same material instead of inventing a second one.
 */
export function LiquidButton({
  children,
  variant = "glass",
  className = "",
  href,
  external = false,
  download,
  type = "button",
  onClick,
  disabled = false,
  block = false,
  as,
  ariaLabel,
}: {
  children: ReactNode;
  variant?: "glass" | "outline";
  className?: string;
  href?: string;
  external?: boolean;
  /**
   * Filename to save as. Same-origin only — browsers ignore `download` on a
   * cross-origin URL, so a CMS-hosted file has to ask its own host for the
   * attachment header instead (see /resume).
   */
  download?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  block?: boolean;
  /**
   * Render as the `<summary>` of a `<details>`. The browser then owns the
   * open/closed state, the Enter/Space handling and the exposed ARIA — none of
   * which a hand-rolled menu button gets right for free.
   */
  as?: "summary";
  /** Accessible name, for when the label is an icon rather than words. */
  ariaLabel?: string;
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

  if (as === "summary") {
    return (
      <summary
        ref={root as React.RefObject<HTMLElement>}
        aria-label={ariaLabel}
        onPointerEnter={placeFill}
        onPointerLeave={placeFill}
        className={`lqbtn-summary ${cls}`}
      >
        {inner}
      </summary>
    );
  }

  if (href) {
    return (
      <a
        ref={root as React.RefObject<HTMLAnchorElement>}
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        {...(download ? { download } : {})}
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
