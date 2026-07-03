"use client";

import { useEffect, useRef } from "react";

/**
 * Mono liquid-glass hero. Each piece starts "undeveloped" and is revealed in
 * sequence (bottom -> top) timed to the intro's develop-wave. The CTA reveal
 * lives on a wrapper so the magnetic/flood transform on the button never fights
 * the reveal transition. Reduced-motion shows everything instantly.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const eyebrow = useRef<HTMLSpanElement>(null);
  const wordmark = useRef<HTMLHeadingElement>(null);
  const sig = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLParagraphElement>(null);
  const ctaWrap = useRef<HTMLDivElement>(null);
  const proof = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    let magnetic = false;
    let rect: DOMRect | null = null;

    if (reduce) {
      [plate, eyebrow, sig, tag, ctaWrap, proof].forEach((r) => r.current?.classList.add("in"));
      wordmark.current?.classList.add("in");
    } else {
      timers.push(window.setTimeout(() => wordmark.current?.classList.add("ghost"), 100));
      // Top-down cascade matching the read order of a name-led hero: role
      // (eyebrow) -> the name (headline) -> capad signature -> story -> CTA,
      // with the fixed proof strip last. Timing stays synced to the intro wave.
      const seq: [React.RefObject<HTMLElement | null>, number, boolean][] = [
        [plate, 560, false],
        [eyebrow, 660, false],
        [wordmark, 800, true],
        [sig, 940, false],
        [tag, 1040, false],
        [ctaWrap, 1160, false],
        [proof, 1240, false],
      ];
      seq.forEach(([r, t, isWord]) =>
        timers.push(
          window.setTimeout(() => {
            if (isWord) r.current?.classList.remove("ghost");
            r.current?.classList.add("in");
          }, t),
        ),
      );
      timers.push(window.setTimeout(() => (magnetic = true), 1400));
    }

    // Magnetic pull on the CTA. The rect is cached lazily and dropped on any
    // scroll/resize — a stale rect after scrolling away and back left the pull
    // zone pointing at where the button USED to be, so it never engaged.
    const onMove = (e: PointerEvent) => {
      const el = cta.current;
      if (!el || !magnetic) return;
      if (!rect) rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = Math.hypot(dx, dy) < 150 ? `translate(${dx * 0.3}px, ${dy * 0.4}px)` : "";
    };
    const invalidate = () => (rect = null);
    if (!reduce) {
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("resize", invalidate, { passive: true });
      addEventListener("scroll", invalidate, { passive: true });
    }

    // The proof strip is viewport-fixed so it anchors the first impression, but
    // past the hero it would sit on top of the deck and the sign-off — fade it
    // out as soon as the hero leaves the viewport, back in on return.
    const heroIo = new IntersectionObserver(
      ([en]) => proof.current?.classList.toggle("gone", !en.isIntersecting),
      { threshold: 0.15 },
    );
    if (root.current) heroIo.observe(root.current);

    return () => {
      timers.forEach(clearTimeout);
      heroIo.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", invalidate);
      removeEventListener("scroll", invalidate);
    };
  }, []);

  // flood the liquid fill from where the pointer enters / leaves; the drop is
  // scaled to reach the farthest corner from that exact point (see --fill-scale)
  const placeFill = (e: React.PointerEvent) => {
    const el = cta.current;
    const f = fill.current;
    if (!el || !f) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    f.style.left = `${x}px`;
    f.style.top = `${y}px`;
    el.style.setProperty("--fill-scale", `${Math.ceil((Math.hypot(Math.max(x, r.width - x), Math.max(y, r.height - y)) / 12) * 1.1)}`);
  };

  return (
    <section ref={root} className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* the plate hugs the content column itself (negative insets), so the
          eyebrow → CTA stack is always centered on the glass with an even
          margin — no viewport-height guessing, no spill on short screens */}
      <div className="relative flex flex-col items-center">
        {/* Horizontal edges stay pushed out past the column; the top/bottom edges
            are pulled inward to the vertical centers of the eyebrow pill and the
            CTA button, so both straddle the glass edge instead of sitting inside it. */}
        <div
          ref={plate}
          className="plate dev absolute -left-[clamp(28px,7vw,84px)] -right-[clamp(28px,7vw,84px)] top-[18px] bottom-[26px]"
        />

      <span
        ref={eyebrow}
        className="glass dev mb-7 rounded-full px-[18px] py-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-[#46453f]"
      >
        developer tools · desktop apps
      </span>

      {/* Brand-led: the capad wordmark is the monument; the name signs it just
          beneath. Keeps the searchable brand loud while still naming the maker. */}
      <h1
        ref={wordmark}
        className="wordmark lensable text-[clamp(86px,15vw,220px)] font-bold leading-[0.84] tracking-[-0.05em]"
      >
        capad
      </h1>

      <div ref={sig} className="dev mt-6 flex items-center gap-3">
        <span aria-hidden className="wm-sig-rule" />
        <span className="font-mono text-[13px] tracking-[0.14em] text-[var(--muted)]">
          Aadarsh Upadhyay
        </span>
        <span aria-hidden className="wm-sig-rule" />
      </div>

      <p
        ref={tag}
        className="dev mt-5 max-w-[440px] text-[clamp(15px,1.5vw,19px)] leading-[1.55] text-[var(--muted)]"
      >
        I build the tools that shouldn&apos;t need to exist. The ones that do frustrated me into
        building better ones: fast, free, and yours to keep.
      </p>

      {/* Availability sits between the promise and the action: the reader has
          just decided they like the work; "he's reachable" is the nudge that
          converts. Primary CTA stays the work (proof first), contact is the
          quiet second door. */}
      <div ref={ctaWrap} className="dev mt-8 flex flex-col items-center gap-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/40 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink)]/80">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ink)]" />
          open to offers
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="#work"
            ref={cta}
            className="glass lqbtn lqbtn-magnetic inline-block rounded-full px-8 py-[15px] text-[15px] font-semibold"
            onPointerEnter={placeFill}
            onPointerLeave={placeFill}
          >
            <span ref={fill} className="fill" />
            <span className="lbl">See the work</span>
          </a>
        </div>
      </div>
      </div>

      {/* Authority strip. Names are framed as shipped, open-source output (true)
          rather than bare labels. Swap in real numbers (GitHub stars / installs)
          here when you have them — never placeholder figures. */}
      <div
        ref={proof}
        className="dev proof-strip fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap font-mono text-[11px] tracking-[0.18em] text-[#8c8b86]"
      >
        <span className="text-[var(--ink)]/55">shipping in the open:</span>
        <span>searchts &nbsp;·&nbsp; glyphmaps &nbsp;·&nbsp; grove &nbsp;·&nbsp; beep-beep-oss</span>
      </div>
    </section>
  );
}
