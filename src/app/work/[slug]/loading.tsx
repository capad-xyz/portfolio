/**
 * Instant loading shell for a case study. Mirrors the real page's skeleton —
 * eyebrow, meta row, display title, standfirst, metrics plate, body lines — so
 * the navigation lands somewhere immediately and the content swaps in place.
 */
export default function Loading() {
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6 py-28 md:py-36" aria-busy>
      <span className="sr-only">Loading the build story…</span>
      <div className="skel h-3 w-36" />
      <div className="mt-9 flex items-center gap-3">
        <div className="skel h-3 w-20" />
        <div className="skel h-3 w-12" />
        <div className="skel h-3 w-12" />
      </div>
      <div className="skel mt-6 h-[clamp(40px,7vw,68px)] w-3/4 !rounded-[18px]" />
      <div className="mt-6 space-y-2.5">
        <div className="skel h-4 w-full" />
        <div className="skel h-4 w-2/3" />
      </div>
      <div className="glass mt-10 flex flex-wrap gap-x-12 gap-y-6 rounded-[20px] px-8 py-6">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="skel h-8 w-20 !rounded-[10px]" />
            <div className="skel mt-2 h-2.5 w-16" />
          </div>
        ))}
      </div>
      <div className="mt-14 space-y-3 border-t border-black/10 pt-12">
        <div className="skel h-3.5 w-full" />
        <div className="skel h-3.5 w-full" />
        <div className="skel h-3.5 w-5/6" />
        <div className="skel h-3.5 w-full" />
        <div className="skel h-3.5 w-3/4" />
      </div>
    </main>
  );
}
