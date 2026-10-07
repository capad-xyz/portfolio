"use client";

import type { ReactNode } from "react";
import { ReactLenis } from "lenis/react";

// The Vivaldi branch that used to live here has been removed, and that is worth
// recording rather than silently reverting.
//
// It read:
//
//     const isVivaldi = navigator.userAgent.includes("Vivaldi");
//     if (isVivaldi) return <>{children}</>;   // skip Lenis, use native scroll
//
// Measured against Vivaldi 8.2.4133.80 on this machine, that condition is never
// true. Vivaldi no longer advertises itself:
//
//     navigator.userAgent            "... Chrome/152.0.0.0 Safari/537.36"   (no token)
//     navigator.userAgentData.brands ["Chromium/152", "Not?A_Brand/24", "Google Chrome/152"]
//     navigator.vivaldi              undefined
//     window.vivaldi                 undefined
//     window.preference              undefined
//
// So the guard was dead code: Lenis has been running in Vivaldi the whole time,
// and the "Vivaldi gets native scroll" behaviour never shipped. Keeping a branch
// like that is worse than not having it, because the next person reads the
// comment, believes Vivaldi is handled, and stops looking.
//
// It is also not obviously the right fix if it HAD worked. Native wheel scrolling
// is steppier than a lerp glide, so swapping Lenis out trades one kind of
// jank for another rather than removing work.
//
// If a Vivaldi-specific path is ever genuinely needed, it cannot be selected by
// sniffing the UA. Measure the symptom first (frame timings under load), then
// gate the remedy on the measured signal — that is what PerfGuard's `perf-lite`
// and `perf-soft` tiers are for, and both of those are reachable from any
// browser because they key off capability rather than identity.
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.09, smoothWheel: true, anchors: true }}>
      {children}
    </ReactLenis>
  );
}
