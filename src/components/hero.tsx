import Link from "next/link";

/**
 * The cover. T4 treatment: the picture whole, on the paper, chewed at the edge.
 *
 * Composition, not styling: there is no plate, no radius, no shadow and nothing
 * centred. The page IS the hero. The wordmark is a 23px masthead rather than the
 * monument it used to be - the statement is the strong thing, and the mark is a
 * handle.
 *
 * The left column is ONE flex stack with `justify-content: space-between`, not a
 * set of absolute percentages. With the picture whole and flush right it owns the
 * right ~46%, and percentage positioning kept colliding the availability line with
 * the last line of the statement. A flex stack makes that overlap structurally
 * impossible at any statement length, which is the only reason this survives an
 * 84px headline and a 390px viewport in the same component.
 *
 * `data-rise` staggers the pieces top-down in read order. There is no intro
 * overlay and no timed cascade: one motion system, and this is the top of it.
 */
export function Hero() {
  return (
    <section
      id="cover"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pb-[7.75rem] md:pb-0"
    >
      {/* The photograph. Absolutely placed and behind the type, so it never takes
          part in the column's vertical rhythm. `object-fit: contain` inside a
          right-hand box is what keeps it whole at its real aspect ratio at every
          width - never cropped, never stretched. The chew and the registration
          offset are applied in globals.css (`.hero-plate img`).

          `aria-hidden` because it is decoration: the same sentence the statement
          makes is what a screen reader should hear, not a file name. */}
      <div className="hero-plate" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- committed asset
            in /public; next/image would add a loader for one static plate whose
            size is already fixed by the aspect ratio above */}
        <img
          src="/hero-plate.webp"
          width={900}
          height={1187}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </div>

      {/* Masthead. Three facts, no advertising: the handle, the name, and the
          availability line. */}
      {/* Constrained to the left column rather than the full width. The picture is
          flush right and full height, so a full-width masthead puts the
          availability line on top of the photograph - where 12px muted grey on a
          bright white background is unreadable, and where it competes with the
          one thing on this page that is actually about him. The masthead is
          furniture; it sits in the paper, beside the type it belongs to. */}
      <header
        data-rise
        style={{ "--d": "0ms" } as React.CSSProperties}
        className="relative z-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 px-6 pt-8 md:w-[54%] md:px-10 md:pt-10"
      >
        <div className="flex items-baseline gap-3">
          <span className="text-[23px] font-bold leading-none tracking-[-0.05em]">
            capad
          </span>
          <span className="hidden text-[13px] tracking-[0.14em] text-[var(--muted)] sm:inline">
            Aadarsh Upadhyay
          </span>
        </div>

        {/* Availability is a FACT that happens to be a link, and it is styled as
            one. It does not roll over into "read the resume" and it does not
            change its label on hover - the arrow slides and the underline
            darkens. The old pill swapped its own words on hover, which made one
            object mean three things and made the string itself a CTA wearing a
            fact's clothes. `focus-visible` carries the same answer for keyboard. */}
        <Link
          href="/resume"
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink)]/80 transition-colors duration-300 hover:text-[var(--ink)] focus-visible:text-[var(--ink)] md:text-[12px]"
        >
          <span className="inline-flex items-center gap-2 underline decoration-[var(--ink)]/30 underline-offset-[6px] transition-[text-decoration-color,text-decoration-thickness] duration-300 group-hover:decoration-[var(--ink)] group-hover:[text-decoration-thickness:2px] group-focus-visible:decoration-[var(--ink)]">
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ink-accent)]"
            />
            open to relocate &middot; remote-first
          </span>
          <span
            aria-hidden
            className="transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none"
          >
            &rarr;
          </span>
          {/* The link's accessible name says where it goes, because the visible
              label is a statement about him rather than about the destination. */}
          <span className="sr-only">, read the resume</span>
        </Link>
      </header>

      {/* The floor: type on the left, the one action and the proof line beneath it. */}
      <div className="relative z-10 mt-auto flex w-full flex-col gap-10 px-6 pb-10 md:px-10 md:pb-14 lg:max-w-[54%] max-[560px]:pb-2">
        <p
          data-rise
          style={{ "--d": "120ms" } as React.CSSProperties}
          className="max-w-[15ch] text-[clamp(38px,8.4vw,84px)] font-bold leading-[1.02] tracking-[-0.04em]"
        >
          I build the tools that{" "}
          <em className="font-serif font-normal italic tracking-[-0.02em]">
            shouldn&rsquo;t need
          </em>{" "}
          to exist.
        </p>

        <div
          data-rise
          style={{ "--d": "220ms" } as React.CSSProperties}
          className="flex flex-col items-start gap-5"
        >
          <p className="max-w-[52ch] text-[clamp(14px,1.35vw,17px)] leading-[1.55] text-[var(--muted)]">
            The ones that do frustrated me into building better ones: fast, free,
            and yours to keep.
          </p>

          {/* ONE action. The availability line above is a fact, not a competing
              call to action, so the hero has exactly one thing to press. */}
          <a
            href="#work"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-7 py-[15px] text-[15px] font-semibold text-[var(--paper)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 focus-visible:-translate-y-0.5 motion-reduce:transition-none"
          >
            See the work
            <span aria-hidden>&rarr;</span>
          </a>

          {/* Proof line. Names framed as shipped open-source output, which is
              true. */}
          <p className="font-mono text-[12px] leading-[1.9] text-[var(--muted)]">
            <span className="text-[var(--ink)]/60">shipping in the open</span>
            <br />
            searchts &nbsp;&middot;&nbsp; glyphmaps &nbsp;&middot;&nbsp; grove
            &nbsp;&middot;&nbsp; beep-beep-oss
          </p>
        </div>
      </div>
    </section>
  );
}