import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllProjects,
  getAlsoShipped,
  getProjectBySlug,
  getProjectSlugs,
} from "@/lib/sanity";
import { CaseStudyBody } from "@/components/portable-text";
import { OpenContactButton } from "@/components/open-contact-button";
import { ReadingProgress } from "@/components/reading-progress";
import { Reveal } from "@/components/reveal";
import { LICENSE_URL, ProjectHeader, ProjectTags } from "@/components/project-header";
import { CANONICAL_ELSEWHERE } from "@/lib/canonical";
import { projectNode, jsonLdHtml } from "@/lib/jsonld";

// ISR: regenerate at most every 5 min so CMS edits appear without a redeploy.
export const revalidate = 300;

const SITE_URL = "https://capad.fyi";

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
    alternates: { canonical: CANONICAL_ELSEWHERE[slug] ?? `/work/${slug}` },
    openGraph: {
      type: "article",
      url: `/work/${slug}`,
      title: `${project.title} — capad`,
      description: project.oneLiner,
      images: ["/opengraph-image.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — capad`,
      description: project.oneLiner,
      images: ["/opengraph-image.png"],
    },
  };
}

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
  const [all, alsoShipped] = await Promise.all([getAllProjects(), getAlsoShipped()]);
  const at = all.findIndex((p) => p.slug === slug);
  const prev = at > -1 && all.length > 1 ? all[(at - 1 + all.length) % all.length] : null;
  const next = at > -1 && all.length > 1 ? all[(at + 1) % all.length] : null;

  // Each shipped project is a free, open-source SoftwareApplication — emit that
  // machine-readably so search engines can surface it as a distinct work with
  // its repo, license, and "$0" offer, not just a page under the site.
  // Shape lives in lib/jsonld.ts so this page and the homepage list emit the
  // same node under the same @id, with `author` pointing at the one Person
  // rather than each page inventing its own copy of him.
  // wmux is someone else's project he contributed a fix to. Its `alsoShipped`
  // entry is the source of truth for that, so the markup claims `contributor`
  // rather than `author` and cannot drift from what the footnote says.
  const isContribution = alsoShipped.some(
    (a) => a.kind === "contributed" && a.name.toLowerCase() === project.title.toLowerCase(),
  );

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@graph": [projectNode(project, slug, LICENSE_URL, isContribution)],
  };

  return (
    <main id="main" className="relative z-10 mx-auto max-w-3xl px-6 py-28 md:py-36">
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(projectJsonLd) }}
      />
      <Reveal>
        <Link
          href="/projects"
          className="reveal-up section-eyebrow inline-flex items-center gap-2 transition hover:text-[var(--ink)]"
        >
          <span aria-hidden>&larr;</span> the build stories
        </Link>

        <ProjectHeader project={project} slug={slug} />

        {project.body && project.body.length > 0 && (
          <div className="case-body reveal-up mt-14 border-t border-black/10 pt-12">
            <CaseStudyBody value={project.body} />
          </div>
        )}

        <ProjectTags tags={project.tags} />

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
