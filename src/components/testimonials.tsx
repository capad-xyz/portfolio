import { getTestimonials, type Testimonial } from "@/lib/sanity";
import { Reveal } from "./reveal";

/**
 * Testimonials. One big quote per card, attribution underneath. Composed as a
 * single column of generously-spaced cards (when 1-3) so each quote gets its
 * own moment rather than fighting for attention in a grid. Returns null if no
 * testimonials are featured.
 */
export async function Testimonials() {
  const items = await getTestimonials();
  if (!items.length) return null;

  return (
    <section
      id="testimonials"
      className="relative z-10 mx-auto max-w-4xl px-6 py-24 md:py-32"
    >
      <Reveal>
        <header className="reveal-up mb-14 flex flex-col items-center gap-3 text-center">
          <p className="section-eyebrow">kind words</p>
          <h2 className="text-[clamp(28px,4vw,46px)] font-bold leading-[1] tracking-[-0.02em]">
            What people say.
          </h2>
        </header>

        <ul className="flex flex-col gap-7">
          {items.map((t) => (
            <Quote key={t._id} t={t} />
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

function Quote({ t }: { t: Testimonial }) {
  return (
    <li className="reveal-up glass lensable rounded-[28px] p-8 md:p-12">
      <div
        aria-hidden
        className="font-serif text-[64px] leading-none text-[var(--ink)]/15"
      >
        &ldquo;
      </div>
      <blockquote className="mt-2 text-[clamp(18px,2vw,24px)] font-medium leading-[1.45] tracking-[-0.005em] text-[var(--ink)]/90">
        {t.quote}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
        <span className="text-[var(--ink)]">{t.name}</span>
        {(t.role || t.company) && <span className="opacity-30">/</span>}
        {t.role && <span>{t.role}</span>}
        {t.role && t.company && <span className="opacity-30">at</span>}
        {t.company && <span>{t.company}</span>}
      </figcaption>
    </li>
  );
}
