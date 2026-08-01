"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { GlassFilters } from "./glass-filters";
import { LiquidCursor } from "./liquid-cursor";
import { SmoothScroll } from "./smooth-scroll";
import { ContactWidget } from "./contact-widget";

/**
 * The main-site chrome (liquid cursor, smooth scroll, ambient clouds, grain,
 * SVG filters) wraps every page except `/studio`. The studio is its own SPA
 * and must feel native (real cursor, native scroll, no overlays).
 *
 * The dot-nav is deliberately NOT mounted here. It is the homepage section
 * spine, and deciding "am I the homepage?" from `usePathname()` is unsafe once
 * a hostname rewrite is in play: on glyphmaps.capad.fyi the server resolves the
 * path to `/glyphmaps` while the client sees the browser's `/`, so the rail
 * rendered on the client only and pointed at sections (#work, #experience…)
 * that page does not have. The owning page renders it instead — a server-side
 * decision that cannot disagree with itself. See `src/app/page.tsx`.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const isStudio = path?.startsWith("/studio") ?? false;

  useEffect(() => {
    if (isStudio) document.body.classList.add("studio-mode");
    else document.body.classList.remove("studio-mode");
    return () => document.body.classList.remove("studio-mode");
  }, [isStudio]);

  if (isStudio) return <>{children}</>;

  return (
    <>
      <GlassFilters />
      <div className="ambient" aria-hidden>
        <span className="a1" />
        <span className="a2" />
        <span className="a3" />
      </div>
      <div className="grain" />
      <LiquidCursor />
      <SmoothScroll>{children}</SmoothScroll>
      <ContactWidget />
    </>
  );
}
