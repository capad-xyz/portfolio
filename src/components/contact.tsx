import { LiquidButton } from "./liquid-button";
import { OpenContactButton } from "./open-contact-button";
import { Reveal } from "./reveal";

const EMAIL = "connect@capad.fyi";

/**
 * Peak-end: the close shapes memory and the decision to act. The friction
 * hierarchy is deliberate — a one-tap email is the primary, near-zero-friction
 * CTA (catches the impulsive, high-intent visitor before System 2 kicks in),
 * the message button opens the floating widget's guided form in place, and
 * GitHub is the quiet third. One canonical address everywhere: connect@capad.fyi
 * (the inbox /api/contact already delivers to).
 */
export function Contact() {
  return (
    <section
      id="contact"
      className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6 py-28 text-center"
    >
      <Reveal>
        <p className="reveal-up section-eyebrow mb-8">say hello</p>

        <h2 className="reveal-up max-w-2xl text-[clamp(34px,6vw,72px)] font-bold leading-[0.95] tracking-[-0.03em]">
          Building something? Let&apos;s talk.
        </h2>

        <p className="reveal-up mt-6 max-w-md text-[clamp(15px,1.5vw,18px)] leading-[1.55] text-[var(--muted)]">
          I&apos;m open to offers — roles, contracts, collaborations, good problems,
          and the occasional desktop oddity. The fastest way to reach me is email.
        </p>

        <div className="reveal-up mt-10 flex flex-wrap items-center justify-center gap-4">
          <LiquidButton
            href={`mailto:${EMAIL}`}
            className="px-8 py-[15px] text-[15px] font-semibold"
          >
            {EMAIL}
          </LiquidButton>
          <OpenContactButton variant="outline" className="px-6 py-[15px] text-[15px] font-medium">
            Send a message
          </OpenContactButton>
          <LiquidButton
            href="https://github.com/capad-xyz"
            external
            variant="outline"
            className="px-6 py-[15px] text-[15px] font-medium"
          >
            GitHub
          </LiquidButton>
        </div>

        {/* Personal sign-off. The hero keeps the giant capad wordmark; here the
            note lands harder, so the real name is signed by hand over the capad
            mark. The domain/tagline stays as a quiet final whisper beneath it. */}
        <div className="reveal-up mt-20 flex flex-col items-center gap-2">
          <span className="sig-name">Aadarsh Upadhyay</span>
          <span className="sig-mark">capad</span>
        </div>

        {/* Quiet footer spine: the dot-nav is desktop-only, so the close carries
            its own way back through the page (and up to the top). */}
        <nav
          aria-label="Site sections"
          className="reveal-up mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]"
        >
          <a className="transition hover:text-[var(--ink)]" href="#work">work</a>
          <a className="transition hover:text-[var(--ink)]" href="/projects">all projects</a>
          <a className="transition hover:text-[var(--ink)]" href="#about">about</a>
          <a className="transition hover:text-[var(--ink)]" href="#experience">experience</a>
          <a className="transition hover:text-[var(--ink)]" href="#stack">stack</a>
          <a className="transition hover:text-[var(--ink)]" href="#testimonials">words</a>
          <a className="transition hover:text-[var(--ink)]" href="#main">
            back to top <span aria-hidden>&uarr;</span>
          </a>
        </nav>

        <p className="reveal-up mt-6 font-mono text-[11px] tracking-[0.18em] text-[var(--muted)]">
          capad.fyi &nbsp;·&nbsp; built in glass
        </p>
      </Reveal>
    </section>
  );
}
