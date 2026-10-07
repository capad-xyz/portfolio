"use client";

import { useEffect, useRef } from "react";
import type { ResumeDownload } from "@/lib/sanity";
import { LiquidButton } from "./liquid-button";

/**
 * The download control on /resume: one primary button plus a small menu of the
 * other formats.
 *
 * Shape first. A recruiter with thirty tabs open wants the PDF, so the PDF is a
 * button they hit once — the menu never stands between them and it. Only the
 * secondary formats live behind the chevron.
 *
 * Mechanism second, and deliberately boring: a native `<details>`/`<summary>`
 * disclosure. The browser already owns the open/closed state, Enter and Space,
 * the exposed expanded/collapsed semantics, and — the part hand-rolled menus
 * usually lose — it all still works before (or without) hydration. What is added
 * here is only what `<details>` genuinely lacks: Escape, arrow keys, a click
 * outside, and closing once focus has left. Everything is driven straight off
 * the DOM node rather than React state, so there is no open/closed value that
 * can disagree with what the browser is actually showing.
 *
 * The list comes from Sanity (`resume.downloads`) — adding a format, renaming
 * one, or swapping a file is a CMS edit, not a deploy.
 */
export function ResumeDownloads({
  options,
  variant = "split",
  label = "Download",
  className = "",
}: {
  options: ResumeDownload[];
  /**
   * `split` (the header): the first format is a one-click button, the rest sit
   * behind the chevron. `menu` (the closing CTA): a single "Download" that opens
   * every format. By then the reader has finished the page and is choosing on
   * purpose, so making them pick costs nothing — and it stops a second identical
   * "Download the PDF" from reading as a duplicate of the one at the top.
   */
  variant?: "split" | "menu" | "single";
  label?: string;
  className?: string;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // A press anywhere else dismisses the menu. `pointerdown` rather than `click`
  // so it closes the moment the press lands, the same as every native menu.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = details.current;
      if (!el?.open) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      el.open = false;
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  /**
   * Decide which way the panel opens, before paint, while the menu is closed.
   *
   * The closing CTA on /resume is the last thing on the page, so a panel pinned
   * below its button hangs off the bottom of the screen: 267px of formats with
   * 277px of it past a 844px phone viewport. Reading layout on close and
   * writing the class on open is what makes the flip land without a frame of
   * the panel hanging downwards first.
   *
   * A `toggle` listener would fire after the browser had already painted the
   * open state, so the measurement there happens too late to matter. This
   * listens on the capturing phase for the `open` attribute change instead,
   * which is still before layout is committed for the new state.
   */
  useEffect(() => {
    const el = details.current;
    const p = panel;
    if (!el) return;

    const GAP = 10;
    const pick = () => {
      // Read while open (the toggle handler guarantees it), so offsetHeight is a
      // real height rather than the 0 a closed <details> reports.
      const vh = window.innerHeight;
      const triggerBottom = el.getBoundingClientRect().bottom + GAP;
      el.classList.toggle("drop-up", triggerBottom + p.current!.offsetHeight > vh);
    };

    // A scroll or rotate can flip the answer while the menu is open. Coalesced
    // onto a frame: this site already demotes itself on forced synchronous
    // layout during scroll, and reading geometry per scroll event is exactly
    // that cost. Nothing to do when the menu is closed.
    let queued = 0;
    const onViewportChange = () => {
      if (!el.open || queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        if (el.open) pick();
      });
    };

    document.addEventListener("toggle", pick, true);
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, { passive: true });
    return () => {
      document.removeEventListener("toggle", pick, true);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange);
      if (queued) cancelAnimationFrame(queued);
    };
  }, []);

  const [primary, ...rest] = options;
  if (!primary) return null;

  const items = () =>
    Array.from(panel.current?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []);

  /** Move focus within the menu, wrapping at both ends. */
  const focusAt = (i: number) => {
    const list = items();
    if (list.length) list[((i % list.length) + list.length) % list.length].focus();
  };

  const close = (returnFocus: boolean) => {
    const el = details.current;
    if (!el?.open) return;
    el.open = false;
    if (returnFocus) el.querySelector("summary")?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDetailsElement>) => {
    const el = details.current;
    if (!el) return;

    if (e.key === "Escape") {
      if (!el.open) return;
      e.preventDefault();
      close(true);
      return;
    }

    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "Home" && e.key !== "End") {
      return;
    }

    const down = e.key === "ArrowDown";

    // Arrowing off the closed toggle opens the menu and steps straight in —
    // the same reflex a native select answers to.
    if (!el.open) {
      if (e.key === "Home" || e.key === "End") return;
      e.preventDefault();
      el.open = true;
      // A closed <details> hides its contents, and a hidden element cannot take
      // focus. Reading a layout property forces the new open state to be styled
      // first — synchronously, so this does not depend on a frame being painted
      // (a backgrounded tab never paints one).
      void panel.current?.offsetHeight;
      focusAt(down ? 0 : -1);
      return;
    }

    const list = items();
    const at = list.indexOf(document.activeElement as HTMLAnchorElement);
    e.preventDefault();

    if (e.key === "Home") focusAt(0);
    else if (e.key === "End") focusAt(-1);
    else if (at < 0) focusAt(down ? 0 : -1); // focus still on the toggle
    else focusAt(at + (down ? 1 : -1));
  };

  // Tabbing past the menu should not leave it hanging open over the page.
  const onBlur = (e: React.FocusEvent<HTMLDetailsElement>) => {
    const el = details.current;
    if (!el?.open) return;
    if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return;
    el.open = false;
  };

  const chevron = (
    <svg
      className="dl-chevron"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9.5 12 15.5 18 9.5" />
    </svg>
  );

  /** The format list. Shared so both variants stay in step by construction. */
  const menu = (shown: ResumeDownload[], heading: string) => (
    // `flat`: the specular bloom is sized for large panes (220px), and this
    // panel is 252px wide — it lands as a wash across the middle rather than a
    // highlight on an edge. Flat keeps the bevel, shadow and geometry and drops
    // only the bloom, which is what a menu wants: a surface you read, not one
    // that performs.
    // Wide enough that the longest label ("Download the Word file") stays on one
    // line — see `whitespace-nowrap` below. A wrapped label makes that row
    // taller than its siblings, and a menu of unequal rows reads as broken.
    <div ref={panel} className="dl-panel glass flat min-w-[280px] rounded-[18px] p-2">
      <p className="px-3 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
        {heading}
      </p>
      <ul className="flex flex-col gap-1">
        {shown.map((o) => (
          <li key={o.href}>
            <a
              href={o.href}
              {...(o.filename ? { download: o.filename } : {})}
              onClick={() => close(false)}
              className="group flex items-center justify-between gap-8 rounded-[12px] px-3 py-2.5 transition-colors hover:bg-[var(--ink)]"
            >
              <span className="whitespace-nowrap text-[14px] leading-none text-[var(--ink)] transition-colors group-hover:text-[var(--paper)]">
                {o.label}
              </span>
              <span className="font-mono text-[10px] uppercase leading-none tracking-[0.2em] text-[var(--muted)] transition-colors group-hover:text-[var(--paper)]/70">
                {o.format}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  // Every format behind one button. The label is the whole toggle, so there is
  // no primary link to miss — and with a single format configured it still
  // opens to that one rather than pretending to be a choice.
  if (variant === "menu") {
    return (
      <div className={`inline-flex print:hidden ${className}`}>
        <details ref={details} className="dl-menu relative" onKeyDown={onKeyDown} onBlur={onBlur}>
          <LiquidButton
            as="summary"
            ariaLabel="Download the resume"
            className="px-7 py-[14px] text-[15px] font-semibold"
          >
            {/* One inline-flex row: the label span is inline-block, and an SVG
                sibling drops to its own line without this. */}
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              {label}
              {chevron}
            </span>
          </LiquidButton>
          {menu(options, "choose a format")}
        </details>
      </div>
    );
  }

  const button = (
    <LiquidButton
      href={primary.href}
      download={primary.filename}
      className="px-7 py-[14px] text-[15px] font-semibold"
    >
      {primary.label}
    </LiquidButton>
  );

  // `single` is the header: the PDF, one click, nothing beside it. The other
  // formats are not lost — the closing CTA offers all of them. Also the natural
  // shape when only one format is configured at all.
  if (variant === "single" || !rest.length) {
    return <div className={`inline-flex print:hidden ${className}`}>{button}</div>;
  }

  return (
    <div className={`inline-flex items-stretch gap-2 print:hidden ${className}`}>
      {button}

      <details ref={details} className="dl-menu relative" onKeyDown={onKeyDown} onBlur={onBlur}>
        <LiquidButton as="summary" variant="outline" ariaLabel="Other formats" className="px-4">
          {chevron}
        </LiquidButton>

        {/* Placement lives in globals.css, not here — see .dl-menu > .dl-panel. */}
        {menu(rest, "other formats")}
      </details>
    </div>
  );
}
