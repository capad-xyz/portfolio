import { Fragment } from "react";
import Link from "next/link";
import { getAlsoShipped, getFeaturedProjects, type AlsoShipped } from "@/lib/sanity";
import { ProjectCard } from "./project-card";
import { Reveal } from "./reveal";

/**
 * Featured work. Server component; fetches projects from Sanity at request time
 * (CDN-cached). The four flagships get the big grid; everything else lives at
 * /projects (linked below the grid), so adding a fifth project in the CMS never
 * crowds the homepage.
 */
const COUNT_WORDS = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
];
const countWord = (n: number) => COUNT_WORDS[n] ?? String(n);

export async function FeaturedWork() {
  const [projects, also] = await Promise.all([getFeaturedProjects(), getAlsoShipped()]);
  const shipped = projects.filter((p) => p.status === "done").length;
  const ongoing = projects.filter((p) => p.status === "ongoing").length;
  // Two lines, not one, because they make different claims. `built` is his work;
  // `contributed` is somebody else's project he fixed, and that distinction is
  // not something a reader should have to infer from a verb.
  const built = also.filter((a) => a.kind !== "contributed");
  const contributed = also.filter((a) => a.kind === "contributed");

  return (
    <section id="work" className="relative z-10 mx-auto max-w-6xl px-6 py-28 md:py-36">
      <Reveal>
        <header className="reveal-title mb-14 flex flex-col items-center gap-4 text-center">
          <p className="section-eyebrow">selected work</p>
          {/* whole sentences as template strings: this JSX compiler drops the
              space between an expression and adjacent text */}
          <h2 className="text-[clamp(34px,5vw,58px)] font-bold leading-[0.95] tracking-[-0.03em]">
            {`${countWord(projects.length)} things I’m building.`}
          </h2>
          <p className="max-w-md text-[var(--muted)]">
            {`${countWord(shipped)} shipped, ${countWord(ongoing).toLowerCase()} in progress. Status updates live, straight from the CMS.`}
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 md:gap-7">
          {projects.map((p, i) => (
            <ProjectCard key={p._id} p={p} index={i + 1} />
          ))}
        </div>

        {/* The smaller shipped delights — real, just not flagship-sized. A quiet
            footnote keeps the grid honest about the four while showing range.
            Content is CMS-driven (`alsoShipped`); the two lead-ins below are not,
            because they are the authorship claim, not a caption. */}
        {(built.length > 0 || contributed.length > 0) && (
          <div className="reveal-up mx-auto mt-10 flex max-w-2xl flex-col gap-1.5 text-center font-mono text-[12px] leading-[2] tracking-[0.04em] text-[var(--muted)]">
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

        {/* The resume lives on the hero availability pill, where someone who
            arrived from an application finds it without scrolling. This exit
            stays about the work. */}
        <div className="reveal-up mt-8 text-center">
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
      </Reveal>
    </section>
  );
}

/**
 * One footnote line: `name — what it is`, joined by middots. The name links out
 * only when the CMS entry actually carries a URL; otherwise it stays plain text
 * rather than becoming a dead affordance.
 *
 * Every gap is either inside a template string or inside its own element: this
 * JSX compiler drops the whitespace between an expression and adjacent text (see
 * the header comment above), so a bare `{x} — {y}` would render glued together.
 */
function Footnote({ items }: { items: AlsoShipped[] }) {
  return (
    <>
      {items.map((a, i) => (
        <Fragment key={a._id}>
          {i > 0 && (
            <span aria-hidden className="px-1.5 opacity-50">
              ·
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
          {` — ${a.note}`}
        </Fragment>
      ))}
    </>
  );
}
