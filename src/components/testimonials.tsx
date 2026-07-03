import { getTestimonials } from "@/lib/sanity";
import { Reveal } from "./reveal";
import { TestimonialsDeck } from "./testimonials-deck";

/**
 * Testimonials. One big quote per card, presented as an interactive stack: the
 * cards overlap, and the front one can be dragged or tapped to flip to the next
 * with a liquid drip transition (see {@link TestimonialsDeck}). Returns null if
 * no testimonials are featured.
 */
export async function Testimonials() {
  const items = await getTestimonials();
  if (!items.length) return null;

  return (
    <section
      id="testimonials"
      className="relative z-10 mx-auto max-w-2xl px-6 py-24 md:py-32"
    >
      <Reveal>
        <header className="reveal-title mb-14 flex flex-col items-center gap-3 text-center">
          <p className="section-eyebrow">kind words</p>
          <h2 className="text-[clamp(28px,4vw,46px)] font-bold leading-[1] tracking-[-0.02em]">
            What people say.
          </h2>
        </header>

        <TestimonialsDeck items={items} />
      </Reveal>
    </section>
  );
}
