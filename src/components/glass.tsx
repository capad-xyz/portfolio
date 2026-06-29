"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

type GlassProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Enable Chromium-only SVG refraction on top of the blur. */
  refract?: boolean;
};

/**
 * The signature glass surface. Tracks the cursor to move the specular
 * highlight, so every panel feels individually lit.
 */
export function Glass({ className, refract, children, ...rest }: GlassProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn("glass", refract && "glass--refract", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
