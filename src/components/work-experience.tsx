import {
  attachTestimonialsToProjects,
  getFeaturedProjects,
  getTestimonials,
  getWorkExperience,
  type Testimonial,
  type WorkExperience as WE,
} from "@/lib/sanity";
import { About } from "./about";

/**
 * Experience, with the manifesto closing it.
 *
 * These used to be two sections: a timeline, then an "about" further down that
 * repeated half the same voice. The manifesto is the reason to read past the last
 * role, so it belongs AT the end of the timeline rather than competing with it
 * somewhere else on the page - and putting it here means the reader finishes the
 * history already in his voice before they reach the ask.
 *
 * This is also the ONE seam in the document. The paper changes value here, once,
 * and that carries the boundary. No animation announces it, because the sheet
 * itself says boundaries are carried by paper value rather than by motion.
 *
 * Peer review that is about an employer rather than a project has no project row
 * to sit on, so it lands here instead. See the note in demo-content.ts: three of
 * the quotes are unattached by nature and none of them are dropped.
 */
export async function WorkExperience() {
  const [items, projects, rawQuotes] = await Promise.all([
    getWorkExperience(),
    // Fetched only so the quote->project attachment is decided against the SAME
    // list the work section uses. Without it this section would attach quotes on
    // its own and the two sections could disagree about which quotes belong to a
    // project row, printing one in both places.
    getFeaturedProjects(),
    getTestimonials(),
  ]);

  // Nothing to say and nothing to say about him: no timeline, no unattached
  // praise, no manifesto worth printing.
  if (!items.length) return null;

  const quotes = attachTestimonialsToProjects(rawQuotes, projects);
  const unattached = quotes.filter((q) => !q.projectSlug);

  // Decide each unattached quote's home ONCE, here, and hand the same decision to
  // both the roles and the fallback block. Doing the match in two places is how
  // the same quote ends up printed twice: once under its role and again in the
  // fallback row, because each side only knew about its own match.
  const assigned = new Map<string, Testimonial[]>();
  for (const w of items) assigned.set(w._id, quotesFor(unattached, w));
  const placed = new Set([...assigned.values()].flat().map((q) => q._id));
  const orphans = unattached.filter((q) => !placed.has(q._id));

  return (
    <section
      id="experience"
      className="relative z-10 bg-[var(--paper-deep)] py-24 md:py-28"
      aria-labelledby="exp-h"
    >
      <div className="mx-auto max-w-5xl px-6">
        <p data-rise className="section-eyebrow mb-4">
          experience
        </p>

        <h2
          id="exp-h"
          data-rise
          style={{ "--d": "60ms" } as React.CSSProperties}
          className="text-[clamp(30px,4vw,54px)] font-bold leading-[1.02] tracking-[-0.035em]"
        >
          Where the hours went.
        </h2>

        <div className="mt-10 md:mt-12">
          {items.map((w) => (
            <Role key={w._id} w={w} quotes={assigned.get(w._id) ?? []} />
          ))}
        </div>

        {orphans.length > 0 && <EmployerQuotes quotes={orphans} />}

        <About />
      </div>
    </section>
  );
}

/**
 * Attach an employer quote to the role it is about, by matching the company name
 * inside the role's own `company` string.
 *
 * The roles are worded "Wordibly · Appson Technologies" and "ComplyV (formerly
 * Compliance Sarathi) · Appson Technologies", so a substring match on the
 * employer the quote names is enough - no new CMS field, and no second list of
 * role ids to keep in sync. Returns nothing for a role with no matching quote,
 * which is the common case.
 */
function quotesFor(all: Testimonial[], w: WE): Testimonial[] {
  if (!all.length || !w.company) return [];
  const named = w.company.split("·")[0]?.trim().toLowerCase() ?? "";
  if (!named) return [];
  return all.filter((q) => {
    const hay = `${q.name} ${q.company ?? ""} ${q.quote}`.toLowerCase();
    return hay.includes(named);
  });
}

function formatPeriod(w: WE) {
  if (w.current) return { primary: w.startYear, suffix: "- now" };
  if (w.endYear && w.endYear !== w.startYear)
    return { primary: w.endYear, suffix: `from ${w.startYear}` };
  return { primary: w.startYear, suffix: null };
}

/**
 * One role: a big year on the left, position + company on the right, the summary
 * beneath, and any quote from that employer underneath it.
 *
 * The year is the visual anchor and the summary is deliberately long-form: this
 * is the one section where the specifics (commit share, the audit log, the LOC
 * count) are the argument, so nothing here is truncated.
 */
function Role({ w, quotes }: { w: WE; quotes: Testimonial[] }) {
  const period = formatPeriod(w);
  return (
    <div
      data-rise
      className="grid grid-cols-1 gap-x-8 gap-y-3 border-t border-[var(--rule)] py-8 md:grid-cols-[190px_1fr] md:py-9"
    >
      <div className="md:pt-1">
        <div className="text-[clamp(40px,6vw,72px)] font-bold leading-[0.85] tracking-[-0.05em]">
          {period.primary}
        </div>
        {period.suffix && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            {period.suffix}
          </p>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="text-[clamp(19px,2.1vw,26px)] font-bold leading-[1.15] tracking-[-0.02em]">
          {w.position}
        </h3>
        <p className="mt-1.5 text-[14px] leading-[1.4] text-[var(--muted)]">
          {w.company}
        </p>
        {w.summary && (
          <p className="mt-4 max-w-[68ch] text-[15px] leading-[1.65] text-[var(--ink)]/80">
            {w.summary}
          </p>
        )}

        {quotes.map((q) => (
          <figure
            key={q._id}
            className="mt-5 max-w-[68ch] border-l-2 border-[var(--ink-accent)] bg-[var(--ink)]/[0.045] px-4 py-3.5"
          >
            <blockquote className="text-[15px] italic leading-[1.55] text-[var(--ink)]/85">
              &ldquo;{q.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-2.5 text-[12px] tracking-[0.06em] text-[var(--muted)]">
              {q.link ? (
                <a
                  href={q.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[var(--ink)] underline decoration-[var(--muted)]/40 underline-offset-4 transition-colors hover:decoration-[var(--ink)]"
                >
                  {q.name}
                </a>
              ) : (
                <span className="font-semibold text-[var(--ink)]">{q.name}</span>
              )}
              {q.role ? ` · ${q.role}` : ""}
              {q.company ? ` · ${q.company}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

/**
 * Quotes that match no single role — the wmux maintainer note and anything about
 * an employer with no matching row. Rendered once, after the timeline, rather than
 * forced onto a role they are not about.
 *
 * This block is the reason the standalone testimonials section could be removed
 * without losing anything: every quote either lands on its project, lands on its
 * role, or lands here.
 *
 * It only ever receives quotes already known to be unplaced, which is why it does
 * no matching of its own — the caller owns that decision (see `placed` above).
 */
function EmployerQuotes({ quotes }: { quotes: Testimonial[] }) {
  if (!quotes.length) return null;

  return (
    <div data-rise className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
      {quotes.map((q) => (
        <figure
          key={q._id}
          className="border-l-2 border-[var(--ink-accent)] bg-[var(--ink)]/[0.045] px-4 py-3.5"
        >
          <blockquote className="text-[15px] italic leading-[1.55] text-[var(--ink)]/85">
            &ldquo;{q.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-2.5 text-[12px] tracking-[0.06em] text-[var(--muted)]">
            {q.link ? (
              <a
                href={q.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[var(--ink)] underline decoration-[var(--muted)]/40 underline-offset-4 transition-colors hover:decoration-[var(--ink)]"
              >
                {q.name}
              </a>
            ) : (
              <span className="font-semibold text-[var(--ink)]">{q.name}</span>
            )}
            {q.role ? ` · ${q.role}` : ""}
            {q.company ? ` · ${q.company}` : ""}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

