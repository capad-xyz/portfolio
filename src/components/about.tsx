import { Reveal } from "./reveal";

/**
 * Who I am. The work grid shows the what; this says the who, in the profile's
 * own plain voice: the day/night split, the taste (maximal things, plain
 * words), and the constraint story. Content mirrors the "Who I Am" section of
 * the capad profile write-up — real, not persona copy.
 */
const PRINCIPLES = [
  "free & open by default",
  "proof-first prototypes",
  "reverse-engineer when there's no API",
  "maximal things, plain words",
  "always a next thing",
];

export function About() {
  return (
    <section id="about" className="relative z-10 mx-auto max-w-3xl px-6 py-24 md:py-32">
      <Reveal>
        <header className="reveal-title mb-12 flex flex-col items-center gap-3 text-center">
          <p className="section-eyebrow">who i am</p>
          <h2 className="text-[clamp(28px,4.6vw,52px)] font-bold leading-[1] tracking-[-0.025em]">
            Small, glowing, useful things
            <br />
            nobody asked for.
          </h2>
        </header>

        <div className="flex flex-col gap-6 text-center text-[clamp(15px,1.6vw,18px)] leading-[1.65] text-[var(--ink)]/80">
          <p className="reveal-up">
            I architect and ship AI platforms: agentic assistants with governed
            writes, multi-provider LLM systems, the hard parts. That was the day job
            through July 2026, and it is the work I am looking for next. As capad, I
            ship small, genuinely free tools and desktop apps nobody asked me to
            make. I cannot leave a good idea alone. Most people think &ldquo;that
            would be cool&rdquo; and move on. I build it.
          </p>
          <p className="reveal-up">
            The pattern across all of it: I like things that respond and feel a little
            alive. A turn arrow drawn in LEDs on the back of a phone. A music widget
            that breathes with the song. The things I build are maximal and full of
            motion; the words about them stay plain.
          </p>
          <p className="reveal-up">
            All of it comes off one hard-working laptop that is usually running the
            whole show at once: agents, builds, emulators, a dozen dev servers. I
            push it hard, and things ship.
          </p>
          <p className="reveal-up">
            And I can build for you, too. I am open to roles, contracts, and
            collaborations. If something here feels like your kind of problem,{" "}
            <a
              href="#contact"
              className="text-[var(--ink)] underline decoration-[var(--muted)] underline-offset-4 transition hover:decoration-[var(--ink)]"
            >
              say hello
            </a>
            {" or take "}
            <a
              href="/resume"
              className="text-[var(--ink)] underline decoration-[var(--muted)] underline-offset-4 transition hover:decoration-[var(--ink)]"
            >
              the resume
            </a>
            .
          </p>
        </div>

        <div className="reveal-up mt-10 flex flex-wrap items-center justify-center gap-2.5">
          {PRINCIPLES.map((t) => (
            <span
              key={t}
              className="chip lensable px-4 py-2 text-[12px] lowercase tracking-[0.06em]"
            >
              {t}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
