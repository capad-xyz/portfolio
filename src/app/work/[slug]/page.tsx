import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProjectBySlug,
  getProjectSlugs,
  type ProjectStatus,
} from "@/lib/sanity";
import { CaseStudyBody } from "@/components/portable-text";
import { LiquidButton } from "@/components/liquid-button";
import { Reveal } from "@/components/reveal";

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
  if (!project) return { title: "Work — capad" };
  return {
    title: `${project.title} — capad`,
    description: project.oneLiner,
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

  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6 py-28 md:py-36">
      <Reveal>
        <Link
          href="/#work"
          className="reveal-up section-eyebrow inline-flex items-center gap-2 transition hover:text-[var(--ink)]"
        >
          <span aria-hidden>&larr;</span> all work
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
          <dl className="reveal-up mt-10 flex flex-wrap gap-x-10 gap-y-6">
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
          <div className="reveal-up mt-14 border-t border-black/10 pt-12">
            <CaseStudyBody value={project.body} />
          </div>
        )}

        {project.tags && project.tags.length > 0 && (
          <div className="reveal-up mt-14 flex flex-wrap gap-2 border-t border-black/10 pt-8">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 font-mono text-[11px] text-[#46453f]"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="reveal-up mt-16">
          <LiquidButton
            href="/#contact"
            className="px-7 py-[14px] text-[15px] font-semibold"
          >
            Start a conversation
          </LiquidButton>
        </div>
      </Reveal>
    </main>
  );
}
