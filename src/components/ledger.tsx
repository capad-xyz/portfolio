import Link from "next/link";
import { getLedger, type LedgerEntry } from "@/lib/sanity";

/**
 * The ledger. Aggregates numbers he ALREADY publishes into one strip, each cell
 * naming where it came from.
 *
 * The heading is the section's whole argument: everything below it is checkable.
 * That is a claim about the REST of the page, so the numbers have to earn it -
 * which is why each one carries its source and, where there is somewhere to
 * check, links to it. A strip of bare statistics would make the opposite claim.
 *
 * Nothing here is invented. Every entry is seeded from a figure already published
 * on a project page or in the committed resume, and the CMS type exists so each
 * one can be chosen deliberately rather than harvested from whatever a card
 * happens to say this month.
 *
 * Renders nothing at all when the ledger is empty rather than a placeholder: a
 * section of invented filler under a heading about honesty would be the single
 * worst thing on the page.
 */
export async function Ledger() {
  const entries = await getLedger();
  if (!entries.length) return null;

  return (
    <section
      id="ledger"
      className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:py-28"
      aria-labelledby="ledger-h"
    >
      <p data-rise className="section-eyebrow mb-4">
        the ledger
      </p>

      <h2
        id="ledger-h"
        data-rise
        style={{ "--d": "60ms" } as React.CSSProperties}
        className="max-w-[19ch] text-[clamp(30px,4.4vw,62px)] font-bold leading-[1.02] tracking-[-0.04em]"
      >
        Everything below is checkable.
      </h2>

      <p
        data-rise
        style={{ "--d": "120ms" } as React.CSSProperties}
        className="mt-5 max-w-[62ch] text-[15px] leading-[1.6] text-[var(--muted)] md:text-[17px]"
      >
        Every number here is one I already publish, and each one says where it
        came from. Nothing in this section is a claim I wrote today.
      </p>

      {/* The grid rule is drawn by the cells themselves (top + bottom border on
          each) rather than by a wrapper, so a partial last row still reads as
          part of the same table instead of needing a matching border hack. */}
      <div className="mt-10 grid grid-cols-2 border-t border-[var(--rule)] md:mt-12 md:grid-cols-3 lg:grid-cols-5">
        {entries.map((e, i) => (
          <Cell key={e._id} entry={e} index={i} />
        ))}
      </div>
    </section>
  );
}

/**
 * One cell: the number (with its unit set smaller, on the same baseline), what it
 * is about, and where it came from.
 *
 * The source is a link when there is a page to check, plain text otherwise -
 * "resume" with no destination would otherwise be a dead affordance.
 */
function Cell({ entry, index }: { entry: LedgerEntry; index: number }) {
  const { value, unit, label, source, href } = entry;
  return (
    <div
      data-rise
      style={{ "--d": `${160 + index * 45}ms` } as React.CSSProperties}
      className="border-b border-[var(--rule)] py-6 pr-5 md:py-7"
    >
      <p className="text-[clamp(30px,3.4vw,52px)] font-bold leading-none tracking-[-0.05em]">
        {value}
        {unit && (
          <span className="ml-0.5 align-baseline text-[0.5em] font-bold tracking-[-0.02em]">
            {unit}
          </span>
        )}
      </p>
      <p className="mt-2.5 text-[13px] leading-[1.45] text-[var(--muted)]">{label}</p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]/70">
        {href ? (
          <Link
            href={href}
            className="underline decoration-[var(--muted)]/40 underline-offset-4 transition-colors hover:text-[var(--ink)] hover:decoration-[var(--ink)]"
          >
            {source}
          </Link>
        ) : (
          source
        )}
      </p>
    </div>
  );
}