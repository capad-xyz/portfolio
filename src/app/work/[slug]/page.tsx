import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllProjects,
  getProjectBySlug,
  getProjectSlugs,
  type ProjectStatus,
} from "@/lib/sanity";
import { CaseStudyBody } from "@/components/portable-text";
import { LiquidButton } from "@/components/liquid-button";
import { OpenContactButton } from "@/components/open-contact-button";
import { Reveal } from "@/components/reveal";

// ISR: regenerate at most every 5 min so CMS edits appear without a redeploy.
export const revalidate = 300;

/**
 * Project case study (`/work/[slug]`). The card grid surfaces the hook + metrics
 * and links here for the full Conflict -> Solution -> Impact narrative held in
 * the Sanity `body`. Statically generated per project; new CMS slugs render
 * on-demand (default dynamicParams). Wrapped by SiteShell, so it keeps the
 * liquid-glass chrome but drops the homepage section spine (see site-shell).
 */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Work" };
  return {
    title: project.title,
    description: project.oneLiner,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      type: "article",
      url: `/work/${slug}`,
      title: `${project.title} — capad`,
      description: project.oneLiner,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — capad`,
      description: project.oneLiner,
      images: ["/opengraph-image"],
    },
  };
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  done: "shipped",
  ongoing: "in progress",
  archived: "archived",
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  // Keep the reader in the work loop: circular prev/next through every project
  // (same order as /projects), so a case study never dead-ends.
  const all = await getAllProjects();
  const at = all.findIndex((p) => p.slug === slug);
  const prev = at > -1 && all.length > 1 ? all[(at - 1 + all.length) % all.length] : null;
  const next = at > -1 && all.length > 1 ? all[(at + 1) % all.length] : null;

  return (
    <main id="main" className="relative z-10 mx-auto max-w-3xl px-6 py-28 md:py-36">
      <Reveal>
        <Link
          href="/projects"
          className="reveal-up section-eyebrow inline-flex items-center gap-2 transition hover:text-[var(--ink)]"
        >
          <span aria-hidden>&larr;</span> the build stories
        </Link>

        <div className="reveal-up mt-8 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
          <span className="text-[var(--ink)]">{STATUS_LABEL[project.status]}</span>
          {project.year && (
            <>
              <span className="opacity-30">/</span>
              <span>{project.year}</span>
            </>
          )}
          {project.license && (
            <>
              <span className="opacity-30">/</span>
              <span>{project.license}</span>
            </>
          )}
        </div>

        <h1 className="reveal-up mt-4 text-[clamp(40px,7vw,76px)] font-bold leading-[0.92] tracking-[-0.03em]">
          {project.title}
        </h1>

        <p className="reveal-up mt-5 max-w-2xl text-[clamp(17px,2vw,21px)] leading-[1.5] text-[var(--ink)]/85">
          {project.oneLiner}
        </p>

        {project.metrics && project.metrics.length > 0 && (
          <dl className="reveal-up glass lensable mt-10 flex flex-wrap gap-x-12 gap-y-6 rounded-[20px] px-8 py-6">
            {project.metrics.map((m) => (
              <div key={`${m.value}-${m.label}`}>
                <dt className="text-[clamp(28px,4vw,40px)] font-bold leading-none tracking-[-0.02em]">
                  {m.value}
                </dt>
                <dd className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  {m.label}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {project.links && project.links.length > 0 && (
          <div className="reveal-up mt-9 flex flex-wrap gap-3">
            {project.links.map((l) => (
              <LiquidButton
                key={l.href}
                href={l.href}
                external
                variant="outline"
                className="px-5 py-2.5 text-sm font-medium"
              >
                {l.label}
              </LiquidButton>
            ))}
          </div>
        )}

        {project.body && project.body.length > 0 && (
          <div className="case-body reveal-up mt-14 border-t border-black/10 pt-12">
            <CaseStudyBody value={project.body} />
          </div>
        )}

        {project.tags && project.tags.length > 0 && (
          <div className="reveal-up mt-14 flex flex-wrap gap-2 border-t border-black/10 pt-8">
            {project.tags.map((t) => (
              <span key={t} className="chip px-3 py-1 text-[11px] lowercase">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="reveal-up mt-16">
          <OpenContactButton />
        </div>

        {prev && next && (
          <nav
            aria-label="More work"
            className="reveal-up mt-16 flex items-center justify-between gap-6 border-t border-black/10 pt-8"
          >
            <Link
              href={`/work/${prev.slug}`}
              className="group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--ink)]/70 transition hover:text-[var(--ink)]"
            >
              <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
                &larr;
              </span>
              {prev.title}
            </Link>
            <Link
              href={`/work/${next.slug}`}
              className="group inline-flex items-center gap-2 text-right font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--ink)]/70 transition hover:text-[var(--ink)]"
            >
              {next.title}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
          </nav>
        )}
      </Reveal>
    </main>
  );
}
