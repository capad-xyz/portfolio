import { getWorkExperience, type WorkExperience as WE } from "@/lib/sanity";
import { Reveal } from "./reveal";

/**
 * Work experience as a true timeline: big year on the left, a vertical rail
 * between, role+company branching right, with node dots aligned to the rail.
 * Composed for the "art piece" feel - big typographic year moment, generous
 * spacing, the current role's node pulses.
 */
export async function WorkExperience() {
  const items = await getWorkExperience();
  if (!items.length) return null;

  return (
    <section
      id="experience"
      className="relative z-10 mx-auto max-w-5xl px-6 py-24 md:py-32"
    >
      <Reveal>
        <header className="reveal-title mb-16 flex flex-col items-center gap-3 text-center md:mb-20">
          <p className="section-eyebrow">experience</p>
          <h2 className="text-[clamp(32px,5vw,56px)] font-bold leading-[0.95] tracking-[-0.03em]">
            A short timeline.
          </h2>
        </header>

        <ol className="relative grid grid-cols-1 gap-12 md:grid-cols-[200px_1fr] md:gap-x-14 md:gap-y-16">
          {items.map((w) => (
            <TimelineRow key={w._id} w={w} />
          ))}
        </ol>
      </Reveal>
    </section>
  );
}

function formatPeriod(w: WE) {
  if (w.current) return { primary: w.startYear, suffix: "- now" };
  if (w.endYear && w.endYear !== w.startYear)
    return { primary: w.endYear, suffix: `from ${w.startYear}` };
  return { primary: w.startYear, suffix: null };
}

function TimelineRow({ w }: { w: WE }) {
  const period = formatPeriod(w);
  return (
    <>
      <div className="reveal-up md:pt-1">
        <div className="text-[clamp(48px,7vw,84px)] font-bold leading-[0.85] tracking-[-0.05em]">
          {period.primary}
        </div>
        {period.suffix && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
            {period.suffix}
          </p>
        )}
        {w.current && (
          <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ink)]" />
            current
          </span>
        )}
      </div>

      <div className="reveal-up relative md:border-l md:border-black/10 md:pl-12">
        <span
          aria-hidden
          className={`absolute -left-[7px] top-2 hidden h-3.5 w-3.5 rounded-full border-2 border-[var(--paper)] md:block ${
            w.current ? "bg-[var(--ink)] shadow-[0_0_0_4px_rgba(11,11,13,0.08)]" : "bg-[var(--ink)]"
          }`}
        />
        <h3 className="text-[clamp(22px,2.4vw,30px)] font-bold leading-[1.1] tracking-[-0.015em]">
          {w.position}
        </h3>
        <p className="mt-1 text-[clamp(15px,1.5vw,18px)] text-[var(--muted)]">
          {w.company}
        </p>
        {w.summary && (
          <p className="mt-4 max-w-xl text-[15px] leading-[1.6] text-[var(--ink)]/75">
            {w.summary}
          </p>
        )}
      </div>
    </>
  );
}
