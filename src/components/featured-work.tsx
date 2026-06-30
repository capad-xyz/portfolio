import Link from "next/link";
import { getFeaturedProjects, type Project, type ProjectStatus } from "@/lib/sanity";
import { LiquidButton } from "./liquid-button";
import { Reveal } from "./reveal";

/**
 * Featured work. Server component; fetches projects from Sanity at request time
 * (CDN-cached). Layout adapted from the old portfolio's grid-of-cards vocabulary
 * but scaled for the four flagship projects: 2-up on desktop, generous cards,
 * status pill, mono palette, glass.
 */
export async function FeaturedWork() {
  const projects = await getFeaturedProjects();

  return (
    <section id="work" className="relative z-10 mx-auto max-w-6xl px-6 py-28 md:py-36">
      <Reveal>
        <header className="reveal-up mb-14 flex flex-col items-center gap-4 text-center">
          <p className="section-eyebrow">selected work</p>
          <h2 className="text-[clamp(34px,5vw,58px)] font-bold leading-[0.95] tracking-[-0.03em]">
            Four things I&apos;m building.
          </h2>
          <p className="max-w-md text-[var(--muted)]">
            Two shipped, two in progress. Status updates live, straight from the
            CMS.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 md:gap-7">
          {projects.map((p, i) => (
            <ProjectCard key={p._id} p={p} index={i + 1} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function ProjectCard({ p, index }: { p: Project; index: number }) {
  const hasFooter = (p.links && p.links.length > 0) || p.hasStory;
  return (
    <article className="reveal-up glass lensable relative flex flex-col rounded-[24px] p-7 md:p-9">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
          <span className="text-[var(--ink)]">{String(index).padStart(2, "0")}</span>
          <span className="opacity-30">/</span>
          {p.year && <span>{p.year}</span>}
          {p.year && p.license && <span className="opacity-30">/</span>}
          {p.license && <span>{p.license}</span>}
        </div>
        <StatusPill status={p.status} />
      </div>

      <h3 className="mt-5 text-[clamp(28px,3.4vw,40px)] font-bold leading-[1] tracking-[-0.02em]">
        <Link href={`/work/${p.slug}`} className="transition-opacity hover:opacity-70">
          {p.title}
        </Link>
      </h3>

      <p className="mt-4 text-[15px] leading-[1.55] text-[var(--ink)]/85 md:text-base">
        {p.oneLiner}
      </p>

      {p.metrics && p.metrics.length > 0 && (
        <dl className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
          {p.metrics.map((m) => (
            <div key={`${m.value}-${m.label}`}>
              <dt className="text-[22px] font-bold leading-none tracking-[-0.02em] md:text-[26px]">
                {m.value}
              </dt>
              <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                {m.label}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {p.tags && p.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 font-mono text-[11px] text-[#46453f]"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {hasFooter && (
        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-7">
          {p.links?.map((l) => (
            <LiquidButton
              key={l.href}
              href={l.href}
              external
              variant="outline"
              className="px-5 py-2 text-sm font-medium"
            >
              {l.label}
            </LiquidButton>
          ))}
          {p.hasStory && (
            <Link
              href={`/work/${p.slug}`}
              className="group inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--ink)]/70 transition hover:text-[var(--ink)]"
            >
              read the case study
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                &rarr;
              </span>
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  done: "shipped",
  ongoing: "in progress",
  archived: "archived",
};

function StatusPill({ status }: { status: ProjectStatus }) {
  const dot =
    status === "done"
      ? "bg-[var(--ink)]"
      : status === "ongoing"
        ? "bg-[var(--ink)] animate-pulse"
        : "bg-[var(--muted)]";
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-black/10 bg-white/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/80">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}
