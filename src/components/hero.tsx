"use client";

import { useEffect, useRef } from "react";

/**
 * Mono liquid-glass hero. Each piece starts "undeveloped" and is revealed in
 * sequence (bottom -> top) timed to the intro's develop-wave. The CTA reveal
 * lives on a wrapper so the magnetic/flood transform on the button never fights
 * the reveal transition. Reduced-motion shows everything instantly.
 */
export function Hero() {
  const plate = useRef<HTMLDivElement>(null);
  const eyebrow = useRef<HTMLSpanElement>(null);
  const wordmark = useRef<HTMLHeadingElement>(null);
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
      [plate, eyebrow, tag, ctaWrap, proof].forEach((r) => r.current?.classList.add("in"));
      wordmark.current?.classList.add("in");
    } else {
      timers.push(window.setTimeout(() => wordmark.current?.classList.add("ghost"), 100));
      // Value-prop first: the tagline (what we do) reveals right after the plate,
      // before the wordmark, so a scanner reads the offer early; the wordmark
      // lands later as the flourish. Timing stays synced to the full intro wave.
      const seq: [React.RefObject<HTMLElement | null>, number, boolean][] = [
        [plate, 560, false],
        [tag, 640, false],
        [proof, 730, false],
        [ctaWrap, 840, false],
        [wordmark, 980, true],
        [eyebrow, 1120, false],
      ];
      seq.forEach(([r, t, isWord]) =>
        timers.push(
          window.setTimeout(() => {
            if (isWord) r.current?.classList.remove("ghost");
            r.current?.classList.add("in");
          }, t),
        ),
      );
      // cache the CTA rect once revealed so the magnetic loop never reads layout per move
      timers.push(
        window.setTimeout(() => {
          magnetic = true;
          rect = cta.current?.getBoundingClientRect() ?? null;
        }, 1400),
      );
    }

    // magnetic pull on the CTA (rect cached; no per-move layout read)
    const onMove = (e: PointerEvent) => {
      const el = cta.current;
      if (!el || !magnetic || !rect) return;
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = Math.hypot(dx, dy) < 150 ? `translate(${dx * 0.3}px, ${dy * 0.4}px)` : "";
    };
    const onResize = () => (rect = cta.current?.getBoundingClientRect() ?? null);
    if (!reduce) {
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("resize", onResize, { passive: true });
    }

    return () => {
      timers.forEach(clearTimeout);
      removeEventListener("pointermove", onMove);
      removeEventListener("resize", onResize);
    };
  }, []);

  // flood the liquid fill from where the pointer enters / leaves
  const placeFill = (e: React.PointerEvent) => {
    const el = cta.current;
    const f = fill.current;
    if (!el || !f) return;
    const r = el.getBoundingClientRect();
    f.style.left = `${e.clientX - r.left}px`;
    f.style.top = `${e.clientY - r.top}px`;
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div ref={plate} className="plate dev absolute h-[min(56vh,440px)] w-[min(78vw,820px)]" />

      <span
        ref={eyebrow}
        className="glass dev mb-7 rounded-full px-[18px] py-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-[#46453f]"
      >
        developer tools · desktop apps
      </span>

      <h1
        ref={wordmark}
        className="wordmark lensable text-[clamp(86px,15vw,220px)] font-bold leading-[0.84] tracking-[-0.05em]"
      >
        capad
      </h1>

      <p
        ref={tag}
        className="dev mt-5 max-w-[440px] text-[clamp(15px,1.5vw,19px)] leading-[1.55] text-[var(--muted)]"
      >
        I build fast, genuinely-free tools for people who live in a terminal and an editor.
      </p>

      <div ref={ctaWrap} className="dev mt-9">
        <a
          href="#work"
          ref={cta}
          className="glass lqbtn inline-block rounded-full px-8 py-[15px] text-[15px] font-semibold transition-transform duration-300 ease-out"
          onPointerEnter={placeFill}
          onPointerLeave={placeFill}
        >
          <span ref={fill} className="fill" />
          <span className="lbl">See the work</span>
        </a>
      </div>

      {/* Authority strip. Names are framed as shipped, open-source output (true)
          rather than bare labels. Swap in real numbers (GitHub stars / installs)
          here when you have them — never placeholder figures. */}
      <div
        ref={proof}
        className="dev fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap font-mono text-[11px] tracking-[0.18em] text-[#8c8b86]"
      >
        <span className="text-[var(--ink)]/55">shipping in the open:</span>
        <span>searchts &nbsp;·&nbsp; grove &nbsp;·&nbsp; glyphmaps</span>
      </div>
    </section>
  );
}
