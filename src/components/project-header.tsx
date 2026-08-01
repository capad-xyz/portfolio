import { LiquidButton } from "@/components/liquid-button";
import type { Project, ProjectStatus } from "@/lib/sanity";

/**
 * The masthead of a project page: status line, title, one-liner, metrics, links.
 *
 * Extracted because two routes render it. `/work/[slug]` shows it above the
 * build story; `glyphmaps.capad.fyi` shows it as the whole page, with the story
 * and the prev/next rail omitted — a product landing has no business carrying
 * portfolio navigation. Parameterised rather than duplicated so the two can
 * never drift.
 */

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  done: "shipped",
  ongoing: "in progress",
  archived: "archived",
};

// SPDX id -> canonical license URL, so structured data points at the real
// license text rather than a bare string.
export const LICENSE_URL: Record<string, string> = {
  MIT: "https://opensource.org/license/mit",
  "GPL-3.0": "https://www.gnu.org/licenses/gpl-3.0.html",
  "AGPL-3.0": "https://www.gnu.org/licenses/agpl-3.0.html",
};

export function ProjectHeader({
  project,
  slug,
  morph = true,
}: {
  project: Project;
  slug: string;
  /**
   * Receive the card->headline view transition. Only true on /work/[slug],
   * which is the only place a card can morph from; naming the transition on a
   * page with no morph source just adds a no-op.
   */
  morph?: boolean;
}) {
  return (
    <>
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

      {/* Receiving end of the card morph — the name matches project-card.tsx.
          Deliberately WITHOUT `reveal-title`: that class starts at opacity 0 /
          blur(14px) and is promoted to `.in` by an IntersectionObserver, so a
          morph arriving here would land on an invisible element and then blur
          itself back in. The morph IS this title's entrance; on a cold load
          (no transition to morph from) it simply renders present, which is the
          right hierarchy anyway — the headline anchors while the body develops
          in around it. */}
      <h1
        className={`${morph ? "work-morph " : ""}mt-4 text-[clamp(40px,7vw,76px)] font-bold leading-[0.92] tracking-[-0.03em]`}
        {...(morph ? { style: { viewTransitionName: `work-title-${slug}` } } : {})}
      >
        {project.title}
      </h1>

      <p className="reveal-up mt-5 max-w-2xl text-[clamp(17px,2vw,21px)] leading-[1.5] text-[var(--ink)]/85 [text-wrap:pretty]">
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
    </>
  );
}

export function ProjectTags({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;
  return (
    <div className="reveal-up mt-14 flex flex-wrap gap-2 border-t border-black/10 pt-8">
      {tags.map((t) => (
        <span key={t} className="chip px-3 py-1 text-[11px] lowercase">
          {t}
        </span>
      ))}
    </div>
  );
}
