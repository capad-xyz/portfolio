import Link from "next/link";
import type { Project, ProjectStatus } from "@/lib/sanity";
import { LiquidButton } from "./liquid-button";

/**
 * One project as a glass plate — shared by the homepage featured grid and the
 * /projects index so both always look the same. Card shows the hook (title,
 * one-liner, metrics, tags); the case study holds the full story. Ongoing
 * projects can carry a pulsing "now" line straight from the CMS.
 */
export function ProjectCard({ p, index }: { p: Project; index: number }) {
  const hasFooter = (p.links && p.links.length > 0) || p.hasStory;
  return (
    <article className="reveal-up card-lift glass lensable relative flex flex-col rounded-[24px] p-7 md:p-9">
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

      {p.nowLine && p.status === "ongoing" && (
        <p className="mt-4 flex items-baseline gap-2 font-mono text-[11px] leading-[1.6] tracking-[0.04em] text-[var(--muted)]">
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 translate-y-px animate-pulse rounded-full bg-[var(--ink)]"
          />
          <span>
            <span className="text-[var(--ink)]/70">now:</span> {p.nowLine}
          </span>
        </p>
      )}

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
            <span key={t} className="chip px-3 py-1 text-[11px] lowercase">
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

export function StatusPill({ status }: { status: ProjectStatus }) {
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
