import { Fragment } from "react";
import Link from "next/link";
import {
  attachTestimonialsToProjects,
  getAlsoShipped,
  getFeaturedProjects,
  getTestimonials,
  type AlsoShipped,
  type Project,
  type Testimonial,
} from "@/lib/sanity";

/**
 * Selected work. Server component.
 *
 * Rows, not cards: this section is a list of things with numbers attached, and a
 * grid of rounded glass tiles turns each one into an equal-weight thumbnail. A
 * row can be as tall as its evidence needs and the eye reads down the left edge
 * as a sequence.
 *
 * THE HEADINGS ARE DERIVED, deliberately. "Four things I'm building." and "Two
 * shipped, two in progress." are computed from the CMS list, which means flipping
 * a project's `featured` flag or changing a `status` from `done` to `ongoing`
 * REWRITES VISIBLE COPY on this page without anyone editing a word of it. That is
 * the intended behaviour - the claims cannot go stale - but it also means the
 * count is only true if the CMS is. `contributed` projects are excluded from the
 * shipped tally on purpose: a fix to somebody else's repo is not something he
 * shipped, and the badge already says which is which.
 */
const COUNT_WORDS = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve",
];
const countWord = (n: number) => COUNT_WORDS[n] ?? String(n);

/** "shipped" / "in progress" / "contributed" as the sheet words them. */
function statusWord(p: Project) {
  if (p.status === "done") return "shipped";
  if (p.status === "contributed") return "contributed";
  return "in progress";
}

export async function FeaturedWork() {
  const [projects, also, rawQuotes] = await Promise.all([
    getFeaturedProjects(),
    getAlsoShipped(),
    getTestimonials(),
  ]);

  const shipped = projects.filter((p) => p.status === "done").length;
  const ongoing = projects.filter((p) => p.status === "ongoing").length;

  // Peer review is grouped by project and rendered on that project's row. The
  // grouping happens once, here, so a row never has to know how quotes work.
  //
  // `attachTestimonialsToProjects` runs BEFORE the split, and the same call runs
  // in the experience section against the same project list. If either side did
  // its own matching the two could disagree and print the same quote twice, so
  // the decision lives in one function called by both.
  const quotes = attachTestimonialsToProjects(rawQuotes, projects);

  const byProject = new Map<string, Testimonial[]>();
  for (const q of quotes) {
    if (!q.projectSlug) continue;
    const list = byProject.get(q.projectSlug) ?? [];
    list.push(q);
    byProject.set(q.projectSlug, list);
  }

  // Two lines, not one, because they make different claims. `built` is his work;
  // `contributed` is somebody else's project he fixed, and that distinction is
  // not something a reader should have to infer from a verb.
  const built = also.filter((a) => a.kind !== "contributed");
  const contributed = also.filter((a) => a.kind === "contributed");

  return (
    <section
      id="work"
      className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:pb-28"
      aria-labelledby="work-h"
    >
      <p data-rise className="section-eyebrow mb-4">
        selected work
      </p>

      {/* whole sentences as template strings: this JSX compiler drops the space
          between an expression and adjacent text */}
      <h2
        id="work-h"
        data-rise
        style={{ "--d": "60ms" } as React.CSSProperties}
        className="text-[clamp(30px,4vw,54px)] font-bold leading-[1.02] tracking-[-0.035em]"
      >
        {`${countWord(projects.length)} things I’m building.`}
      </h2>

      <p
        data-rise
        style={{ "--d": "110ms" } as React.CSSProperties}
        className="mt-5 max-w-[60ch] text-[15px] leading-[1.6] text-[var(--muted)] md:text-[17px]"
      >
        {`${countWord(shipped)} shipped, ${countWord(ongoing).toLowerCase()} in progress. Status updates live, straight from the CMS.`}
      </p>

      <div className="mt-10 md:mt-11">
        {projects.map((p, i) => (
          <Row key={p._id} p={p} n={i + 1} quotes={byProject.get(p.slug) ?? []} />
        ))}
      </div>

      {/* The smaller shipped delights — real, just not flagship-sized. A quiet
          footnote keeps the grid honest about the four while showing range.
          Content is CMS-driven (`alsoShipped`); the two lead-ins below are not,
          because they are the authorship claim, not a caption. */}
      {(built.length > 0 || contributed.length > 0) && (
        <div
          data-rise
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-1.5 text-center font-mono text-[12px] leading-[2] tracking-[0.04em] text-[var(--muted)]"
        >
          {built.length > 0 && (
            <p>
              {"also shipped, smaller: "}
              <Footnote items={built} />
            </p>
          )}
          {contributed.length > 0 && (
            <p>
              {"not mine, I just fixed it: "}
              <Footnote items={contributed} />
            </p>
          )}
        </div>
      )}

      {/* The resume lives on the hero availability line, where someone who
          arrived from an application finds it without scrolling. This exit stays
          about the work. */}
      <div data-rise className="mt-8 text-center">
        <Link
          href="/projects"
          className="group inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--ink)]/70 transition hover:text-[var(--ink)]"
        >
          read the build stories
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            &rarr;
          </span>
        </Link>
      </div>
    </section>
  );
}

/**
 * One project as a numbered row: index, title + status, the one-liner, metrics,
 * tags, and any peer review attached to this project specifically.
 *
 * The row is a grid with a narrow index column, which is what keeps the index on
 * a single left rail down the whole section instead of drifting back to the
 * content edge under each title.
 */
function Row({
  p,
  n,
  quotes,
}: {
  p: Project;
  n: number;
  quotes: Testimonial[];
}) {
  return (
    <article
      data-rise
      className="grid grid-cols-1 gap-x-8 gap-y-3 border-t border-[var(--rule)] py-8 md:grid-cols-[64px_1fr] md:py-9"
    >
      <p className="font-mono text-[13px] tracking-[0.1em] text-[var(--muted)] md:pt-2">
        {String(n).padStart(2, "0")}
      </p>

      <div className="min-w-0">
        <h3 className="flex flex-wrap items-baseline gap-x-3 gap-y-2 text-[clamp(22px,2.4vw,27px)] font-bold leading-[1.15] tracking-[-0.035em]">
          {p.title}
          <StatusPill status={statusWord(p)} />
        </h3>

        <p className="mt-2.5 max-w-[74ch] text-[15px] leading-[1.6] text-[var(--ink)]/80 md:text-[16.5px]">
          {p.oneLiner}
        </p>

        {p.nowLine && (
          <p className="mt-2.5 font-mono text-[12px] text-[var(--muted)]">
            <span className="text-[var(--ink-accent)]">now:</span> {p.nowLine}
          </p>
        )}

        {p.metrics && p.metrics.length > 0 && (
          <dl className="mt-4 flex flex-wrap gap-x-7 gap-y-3">
            {p.metrics.map((m) => (
              <div key={`${m.value}-${m.label}`}>
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <span className="block text-[19px] font-bold leading-none tracking-[-0.03em]">
                    {m.value}
                  </span>
                  <span className="mt-1.5 block font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    {m.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}

        {p.tags && p.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-[var(--rule)] px-2.5 py-[3px] font-mono text-[11px] tracking-[0.04em] text-[var(--muted)]"
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        {p.hasStory && (
          <Link
            href={`/work/${p.slug}`}
            className="group mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--ink)]/80 transition-colors hover:text-[var(--ink)]"
          >
            read the build story
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              &rarr;
            </span>
          </Link>
        )}

        {/* Peer review, inline, on the project it is about. */}
        {quotes.length > 0 && (
          <div className="mt-6 max-w-[82ch] border-l-2 border-[var(--ink-accent)] bg-[var(--ink)]/[0.045] px-4 py-3.5">
            {quotes.map((q, i) => (
              <figure key={q._id} className={i > 0 ? "mt-4 border-t border-[var(--rule)] pt-4" : undefined}>
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
        )}
      </div>
    </article>
  );
}

/**
 * The status as a small outlined pill. Three states, and they are claims about
 * authorship rather than progress, so they are worded the way the sheet words
 * them: something he finished, something still going, and somebody else's repo he
 * shipped a fix into.
 */
function StatusPill({ status }: { status: string }) {
  return (
    <span className="shrink-0 rounded-full border border-[var(--rule)] px-2.5 py-[3px] font-mono text-[10.5px] font-normal uppercase tracking-[0.16em] text-[var(--muted)]">
      {status}
    </span>
  );
}

/**
 * One footnote line: `name · what it is`, joined by middots. The name links out
 * only when the CMS entry actually carries a URL; otherwise it stays plain text
 * rather than becoming a dead affordance.
 *
 * Every gap is either inside a template string or inside its own element: this
 * JSX compiler drops the whitespace between an expression and adjacent text, so
 * a bare `{x} · {y}` would render glued together. The name-to-note separator is
 * a middot rather than the em dash this used to be, which would set the name and
 * its description as one run-on word.
 */
function Footnote({ items }: { items: AlsoShipped[] }) {
  return (
    <>
      {items.map((a, i) => (
        <Fragment key={a._id}>
          {i > 0 && (
            <span aria-hidden className="px-1.5 opacity-50">
              &middot;
            </span>
          )}
          {a.href ? (
            <a
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--ink)]/75 underline decoration-[var(--muted)]/40 underline-offset-4 transition hover:text-[var(--ink)] hover:decoration-[var(--ink)]"
            >
              {a.name}
            </a>
          ) : (
            <span className="text-[var(--ink)]/75">{a.name}</span>
          )}
          {` · ${a.note}`}
        </Fragment>
      ))}
    </>
  );
}