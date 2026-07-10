import { getStackGroups } from "@/lib/sanity";
import { Reveal } from "./reveal";

/**
 * The toolbox, categorized. Server component fetching grouped chips from
 * Sanity; each group is a label on the left + a wrap of glass chips on the
 * right. Edits in Sanity Studio reflect on the next render.
 */
export async function Stack() {
  const groups = await getStackGroups();
  if (!groups.length) return null;

  return (
    <section
      id="stack"
      className="relative z-10 mx-auto max-w-5xl px-6 py-24 md:py-32"
    >
      <Reveal>
        <header className="reveal-title mb-16 flex flex-col items-center gap-4 text-center md:mb-20">
          <p className="section-eyebrow">the stack</p>
          <h2 className="text-[clamp(28px,4vw,46px)] font-bold leading-[1] tracking-[-0.02em]">
            What I reach for.
          </h2>
          <p className="max-w-lg text-[15px] leading-[1.6] text-[var(--muted)]">
            The deepest current groove is AI systems: multi-provider LLM platforms,
            agentic assistants whose write-actions are safety-gated and audited, and
            the Claude ecosystem end to end — API, MCP servers, Code skills.
          </p>
        </header>

        <div className="flex flex-col gap-10">
          {groups.map((g) => (
            <div
              key={g._id}
              className="reveal-up grid gap-4 md:grid-cols-[160px_1fr] md:items-start"
            >
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--muted)] md:pt-1">
                {g.label}
              </p>
              {/* lighter cut than before (px-4/py-2 read heavy once the list
                  grew to seven groups): smaller pill, tighter gap, one line
                  per row at this column width with ≤5 chips per group */}
              <div className="flex flex-wrap gap-2">
                {g.items?.map((t) => (
                  <span
                    key={t}
                    className="chip lensable px-3.5 py-1.5 text-[12px] lowercase tracking-[0.04em]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
