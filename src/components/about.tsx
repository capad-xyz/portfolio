import Link from "next/link";

/**
 * The manifesto. Closes the experience timeline.
 *
 * This used to be its own section, further down the page, competing with the
 * timeline for attention. It is the reason to read past the last role — the voice,
 * not the chronology — so it now sits at the end of the history it belongs to.
 *
 * Both paragraphs are his own words and are NOT paraphrased or shortened. The
 * first is the whole argument in one line; the second is the taste statement that
 * explains every odd thing on the rest of the site, so cutting words off it
 * removes the explanation.
 *
 * `print-ink` is a print hook: on paper this block flattens to white with black
 * type rather than printing as a solid rectangle of ink.
 */
export function About() {
  return (
    <div data-rise className="print-ink mt-14 bg-[var(--ink)] px-6 py-8 md:mt-16 md:px-9 md:py-10">
      <p className="max-w-[62ch] text-[clamp(18px,2vw,21px)] font-bold leading-[1.42] tracking-[-0.02em] text-[var(--on-ink)]">
        Most people think &ldquo;that would be cool&rdquo; and move on. I build it.
      </p>
      <p className="mt-4 max-w-[72ch] text-[15px] leading-[1.6] tracking-[-0.005em] text-[var(--on-ink-muted)] md:text-[16.5px]">
        I like things that respond and feel a little alive. A turn arrow drawn in
        LEDs on the back of a phone. A music widget that breathes with the song.
        The things I build are maximal and full of motion; the words about them
        stay plain.
      </p>
      <p className="mt-4 max-w-[72ch] text-[15px] leading-[1.6] text-[var(--on-ink-muted)]">
        I use AI assistants to ship and review hard. Every number above has a place
        you can check it, which is the only review that counts.
      </p>
      <p className="mt-6">
        <Link
          href="/resume"
          className="group inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--on-ink)] transition-colors hover:text-white"
        >
          the resume
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            &rarr;
          </span>
        </Link>
      </p>
    </div>
  );
}