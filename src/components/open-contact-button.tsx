"use client";

import { type ReactNode } from "react";
import { LiquidButton } from "./liquid-button";

/**
 * "Start a conversation" — opens the floating contact bubble's panel right
 * where the reader is standing (no route change, no mailto detour). The
 * ContactWidget listens for the event on every non-studio page, so this works
 * from case studies, /projects, and the homepage alike.
 */
export function OpenContactButton({
  children = "Start a conversation",
  variant = "glass",
  className = "px-7 py-[14px] text-[15px] font-semibold",
}: {
  children?: ReactNode;
  variant?: "glass" | "outline";
  className?: string;
}) {
  return (
    <LiquidButton
      variant={variant}
      className={className}
      onClick={() => dispatchEvent(new Event("capad:open-contact"))}
    >
      {children}
    </LiquidButton>
  );
}
