import { LiquidButton } from "@/components/liquid-button";

/**
 * Glass-styled 404. Rendered inside SiteShell (cursor, scroll, ambient), and
 * since the path isn't "/", the homepage dot-nav stays hidden. Covers bad
 * /work/[slug] slugs and any other unknown route.
 */
export default function NotFound() {
  return (
    <main id="main" className="relative z-10 flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <p className="section-eyebrow mb-6">404</p>

      <h1 className="lensable text-[clamp(40px,8vw,96px)] font-bold leading-[0.9] tracking-[-0.04em]">
        Lost in the glass.
      </h1>

      <p className="mt-6 max-w-md text-[clamp(15px,1.5vw,18px)] leading-[1.55] text-[var(--muted)]">
        That page slipped through. Let&apos;s get you back to the work.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <LiquidButton href="/" className="px-8 py-[15px] text-[15px] font-semibold">
          Back home
        </LiquidButton>
        <LiquidButton
          href="/#work"
          variant="outline"
          className="px-6 py-[15px] text-[15px] font-medium"
        >
          See the work
        </LiquidButton>
      </div>
    </main>
  );
}
