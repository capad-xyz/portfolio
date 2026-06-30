"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { GlassFilters } from "./glass-filters";
import { LiquidCursor } from "./liquid-cursor";
import { SmoothScroll } from "./smooth-scroll";
import { ContactWidget } from "./contact-widget";
import { DotNav } from "./dot-nav";

/**
 * The main-site chrome (liquid cursor, smooth scroll, ambient clouds, grain,
 * SVG filters) wraps every page except `/studio`. The studio is its own SPA
 * and must feel native (real cursor, native scroll, no overlays).
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const isStudio = path?.startsWith("/studio") ?? false;
  // The dot-nav is the homepage section spine; its targets (#work, #experience…)
  // don't exist on other routes, so only mount it on "/".
  const isHome = path === "/";

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
      <SmoothScroll>
        {children}
        {isHome && <DotNav />}
      </SmoothScroll>
      <ContactWidget />
    </>
  );
}
