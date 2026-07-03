/**
 * Instant loading shell for the build-stories index: header block plus three
 * glass article rows, so clicking "read the build stories" always lands
 * somewhere alive while the list streams in.
 */
export default function Loading() {
  return (
    <main className="relative z-10 mx-auto max-w-4xl px-6 py-28 md:py-36" aria-busy>
      <span className="sr-only">Loading the build stories…</span>
      <div className="skel h-3 w-24" />
      <div className="skel mt-9 h-[clamp(40px,7vw,68px)] w-2/3 !rounded-[18px]" />
      <div className="mt-5 space-y-2.5">
        <div className="skel h-4 w-full max-w-xl" />
        <div className="skel h-4 w-3/5 max-w-md" />
      </div>
      <div className="mt-10 flex flex-col gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass rounded-[22px] px-7 py-7 md:px-9 md:py-8">
            <div className="flex items-center gap-4">
              <div className="skel h-5 w-24" />
              <div className="skel h-3 w-12" />
            </div>
            <div className="skel mt-4 h-8 w-1/3 !rounded-[12px]" />
            <div className="mt-3 space-y-2">
              <div className="skel h-3.5 w-full max-w-2xl" />
              <div className="skel h-3.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
