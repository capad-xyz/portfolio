"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { Glass } from "./glass";

// The WebGL centerpiece is the only client-WebGL surface — load it lazily.
const GlassObject = dynamic(() => import("./glass-object"), { ssr: false });

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* WebGL glass centerpiece */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-90">
        <GlassObject />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, filter: "blur(8px)", y: 12 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="mb-5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)] backdrop-blur-md"
        >
          developer tools · desktop apps
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, filter: "blur(14px)", y: 20 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.05 }}
          className="text-7xl font-bold tracking-tight md:text-9xl"
        >
          capad
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
          className="mt-5 max-w-md text-balance text-base text-[var(--muted)] md:text-lg"
        >
          I build fast, genuinely-free tools for people who live in a terminal and an editor.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.32 }}
          className="mt-9"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Glass className="cursor-pointer px-6 py-3" style={{ "--r": "999px" } as React.CSSProperties}>
            <span className="text-sm font-medium">View the work</span>
          </Glass>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{ opacity: { delay: 1, duration: 1 }, y: { delay: 1, duration: 1.8, repeat: Infinity } }}
        className="absolute bottom-8 z-10 font-mono text-xs tracking-widest text-[var(--muted)]"
      >
        scroll
      </motion.div>
    </section>
  );
}
