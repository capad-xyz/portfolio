import { LiquidButton } from "./liquid-button";
import { OpenContactButton } from "./open-contact-button";
import { CONTACT_EMAIL } from "@/lib/canonical";

/**
 * The colophon, and the exit.
 *
 * Reframed from "contact" into what the sheet calls a colophon: the credits are
 * on the page, and the page ends here. It behaves like an exit rather than a
 * pitch — the credits are present, the email is the largest single thing on it,
 * and there is nothing after it to scroll to.
 *
 * The dark plate here is the second one on the page (the manifesto is the first),
 * and both use `print-ink` so they flatten to black-on-white rather than printing
 * as two solid rectangles of ink.
 */
export function Contact() {
  return (
    <section
      id="colophon"
      className="print-ink relative z-10 bg-[var(--ink)] px-6 py-24 text-[var(--on-ink)] md:py-28"
      aria-labelledby="colophon-h"
    >
      <div className="mx-auto max-w-4xl">
        <p data-rise className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--on-ink-muted)]">
          colophon
        </p>

        <h2
          id="colophon-h"
          data-rise
          style={{ "--d": "60ms" } as React.CSSProperties}
          className="max-w-[16ch] text-[clamp(32px,5vw,56px)] font-bold leading-[1.02] tracking-[-0.045em]"
        >
          Building something? Let&apos;s talk.
        </h2>

        <p
          data-rise
          style={{ "--d": "120ms" } as React.CSSProperties}
          className="mt-6 max-w-[52ch] text-[15px] leading-[1.6] text-[var(--on-ink-muted)] md:text-[17px]"
        >
          I&apos;m open to roles, contracts, collaborations, and the occasional
          desktop oddity. Email is the fastest way to reach me.
        </p>

        <div
          data-rise
          style={{ "--d": "180ms" } as React.CSSProperties}
          className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4"
        >
          {/* The email is the primary and the largest thing here: a recruiter's
              fastest path to a human, and the reason the section exists. All
              three carry `onInk` — this plate is `--ink`, and the default glass
              and outline surfaces are dark-on-dark against it. */}
          <LiquidButton
            href={`mailto:${CONTACT_EMAIL}`}
            onInk
            className="px-7 py-[15px] text-[17px] font-semibold"
          >
            {CONTACT_EMAIL}
          </LiquidButton>
          <OpenContactButton
            variant="outline"
            onInk
            className="px-6 py-[15px] text-[15px] font-medium"
          >
            Send a message
          </OpenContactButton>
          <LiquidButton
            href="https://github.com/capad-xyz"
            external
            variant="outline"
            onInk
            className="px-6 py-[15px] text-[15px] font-medium"
          >
            GitHub
          </LiquidButton>
        </div>

        {/* Personal sign-off, over the capad mark. */}
        <div data-rise className="mt-20 flex flex-col items-start gap-2">
          <span className="text-[clamp(30px,4vw,44px)] font-bold leading-none tracking-[-0.03em]">
            Aadarsh Upadhyay
          </span>
          <span className="font-mono text-[13px] tracking-[0.14em] text-[var(--on-ink-muted)]">
            capad
          </span>
        </div>

        {/* The credits. A colophon earns its name here: this is who made it and
            what it is made of, stated plainly, in the same place as the ask. */}
        <dl
          data-rise
          className="mt-14 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-[var(--on-ink)]/20 pt-8 md:grid-cols-4 md:gap-8"
        >
          {CREDITS.map((c) => (
            <div key={c.label}>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[var(--on-ink-muted)]">
                {c.label}
              </dt>
              <dd className="mt-2 text-[14px] leading-[1.45] text-[var(--on-ink)]/90">{c.value}</dd>
            </div>
          ))}
        </dl>

        {/* Quiet footer spine: the dot-nav is desktop-only, so the close carries
            its own way back through the page (and up to the top). Four stops,
            matching the rail. */}
        <nav
          data-rise
          aria-label="Site sections"
          className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--on-ink-muted)]"
        >
          <a className="transition hover:text-[var(--on-ink)]" href="#work">
            work
          </a>
          <a className="transition hover:text-[var(--on-ink)]" href="#ledger">
            ledger
          </a>
          <a className="transition hover:text-[var(--on-ink)]" href="#experience">
            experience
          </a>
          <a className="transition hover:text-[var(--on-ink)]" href="/projects">
            all projects
          </a>
          {/* the one link a recruiter is actually hunting for */}
          <a className="transition hover:text-[var(--on-ink)]" href="/resume">
            resume
          </a>
          <a className="transition hover:text-[var(--on-ink)]" href="#main">
            back to top <span aria-hidden>&uarr;</span>
          </a>
        </nav>

        <p
          data-rise
          className="mt-6 font-mono text-[11px] tracking-[0.18em] text-[var(--on-ink-muted)]"
        >
          capad.fyi &nbsp;&middot;&nbsp; built in glass
        </p>
      </div>
    </section>
  );
}

/** What this site is made of. Kept next to the email so the exit carries both. */
const CREDITS = [
  { label: "paper", value: "one warm ink on warm stock" },
  { label: "ink", value: "terracotta, one plate, deliberately off register" },
  { label: "type", value: "Geist Sans, Geist Mono" },
  { label: "built with", value: "Next.js, Sanity, Cloudflare" },
];