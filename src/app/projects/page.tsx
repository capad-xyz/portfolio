import Link from "next/link";
import type { Metadata } from "next";
import { getAllProjects, type Project } from "@/lib/sanity";
import { StatusPill } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { LiquidButton } from "@/components/liquid-button";
import { OpenContactButton } from "@/components/open-contact-button";

// ISR: regenerate at most every 5 min so CMS edits appear without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Every project by Aadarsh Upadhyay (capad): shipped, in progress, and archived — all open source, each with its build story.",
  alternates: { canonical: "/projects" },
  openGraph: {
    type: "website",
    url: "/projects",
    title: "Projects — capad",
    description:
      "Every project by Aadarsh Upadhyay (capad): shipped, in progress, and archived — all open source, each with its build story.",
    images: ["/opengraph-image"],
  },
};

/**
 * The reading room. Where the homepage grid sells at a glance, this index is
 * built for opening: every project is one full-width horizontal entry — index,
 * meta, headline, standfirst, reading time — and the whole row is the link to
 * its case study. New Sanity project documents (featured or not) appear here,
 * in the sitemap, and in the case-study prev/next loop with zero code changes;
 * counts and reading times are computed from the data on every revalidation.
 */
export default async function ProjectsPage() {
  const projects = await getAllProjects();
  const shipped = projects.filter((p) => p.status === "done").length;
  const ongoing = projects.filter((p) => p.status === "ongoing").length;

  return (
    <main id="main" className="relative z-10 mx-auto max-w-4xl px-6 py-28 md:py-36">
      <Reveal>
        <Link
          href="/#work"
          className="reveal-up section-eyebrow inline-flex items-center gap-2 transition hover:text-[var(--ink)]"
        >
          <span aria-hidden>&larr;</span> home
        </Link>

        <header className="reveal-title mt-8 mb-4 flex flex-col gap-4">
          <h1 className="text-[clamp(40px,7vw,76px)] font-bold leading-[0.92] tracking-[-0.03em]">
            The build stories.
          </h1>
          <p className="max-w-xl text-[clamp(15px,1.6vw,18px)] leading-[1.6] text-[var(--muted)]">
            {`Every project, written up the way it was built — problem, insight, architecture, honest ceiling. ${shipped} shipped, ${ongoing} in progress, all open source. Pick one and read.`}
          </p>
        </header>

        {projects.length > 0 ? (
          <div className="mt-10 flex flex-col gap-5">
            {projects.map((p, i) => (
              <ArticleRow key={p._id} p={p} index={i + 1} />
            ))}
          </div>
        ) : (
          <p className="reveal-up mt-10 text-[var(--muted)]">
            Nothing published yet — check back soon.
          </p>
        )}

        <div className="reveal-up mt-16 flex flex-wrap items-center gap-4">
          <OpenContactButton />
          <LiquidButton
            href="https://github.com/capad-xyz"
            external
            variant="outline"
            className="px-6 py-[14px] text-[15px] font-medium"
          >
            GitHub
          </LiquidButton>
        </div>
      </Reveal>
    </main>
  );
}

/**
 * One project as an article entry. The entire row is a single link to the case
 * study (repo/package links live there — this page has one job), so there are
 * no nested anchors and the click target is generous. Hover answers with the
 * glass brighten + the arrow inking forward; nothing slides.
 */
function ArticleRow({ p, index }: { p: Project; index: number }) {
  const inner = (
    <article className="glass lensable group relative rounded-[22px] px-7 py-7 md:px-9 md:py-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
        {/* index — the quiet folio number */}
        <span
          aria-hidden
          className="hidden shrink-0 font-mono text-[13px] tracking-[0.2em] text-[var(--muted)] md:block md:w-10"
        >
          {String(index).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
            <StatusPill status={p.status} />
            {p.year && <span>{p.year}</span>}
            {p.license && <span>{p.license}</span>}
            {p.readMinutes && (
              <span className="text-[var(--ink)]/60">{p.readMinutes} min read</span>
            )}
          </div>

          <h2 className="mt-3 text-[clamp(26px,4vw,38px)] font-bold leading-[1.02] tracking-[-0.02em]">
            {p.title}
          </h2>

          <p className="mt-2.5 max-w-2xl text-[15px] leading-[1.55] text-[var(--ink)]/80 md:text-base">
            {p.oneLiner}
          </p>

          {p.nowLine && p.status === "ongoing" && (
            <p className="mt-3 flex items-baseline gap-2 font-mono text-[11px] leading-[1.6] tracking-[0.04em] text-[var(--muted)]">
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 translate-y-px animate-pulse rounded-full bg-[var(--ink)]"
              />
              <span>
                <span className="text-[var(--ink)]/70">now:</span> {p.nowLine}
              </span>
            </p>
          )}

          {p.tags && p.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="chip px-3 py-1 text-[11px] lowercase">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* the "open the article" affordance — same ink flood as every liquid
            button (driven by the row's hover, since the row is the link) */}
        <div className="flex shrink-0 items-center gap-3 md:flex-col md:items-end md:gap-2">
          {p.hasStory ? (
            <>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ink)]/60 transition group-hover:text-[var(--ink)]">
                read the story
              </span>
              <span
                aria-hidden
                className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-black/10 bg-white/40"
              >
                <span className="absolute inset-0 scale-0 rounded-full bg-[var(--ink)] transition-transform duration-[550ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-100" />
                <svg
                  viewBox="0 0 16 16"
                  className="relative z-[1] h-4 w-4 text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--paper)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2.5 8h11" />
                  <path d="M8.5 3.5 13.5 8l-5 4.5" />
                </svg>
              </span>
            </>
          ) : (
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
              story coming soon
            </span>
          )}
        </div>
      </div>
    </article>
  );

  return p.hasStory ? (
    <Link href={`/work/${p.slug}`} className="reveal-up block">
      {inner}
    </Link>
  ) : (
    <div className="reveal-up">{inner}</div>
  );
}
