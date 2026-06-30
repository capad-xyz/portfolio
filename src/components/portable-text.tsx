"use client";

import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";

/**
 * Case-study body renderer. The block content is plain serializable JSON passed
 * down from the server `/work/[slug]` page; this client island holds the render
 * map so PortableText's React context never has to instantiate in an RSC. Styled
 * to the mono/glass system: generous prose measure, quiet rules, mono code.
 */
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-5 text-[15px] leading-[1.7] text-[var(--ink)]/80 md:text-base">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-12 text-[clamp(22px,3vw,30px)] font-bold tracking-[-0.02em]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-9 text-[clamp(18px,2.2vw,22px)] font-semibold tracking-[-0.01em]">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-6 border-l-2 border-black/15 pl-5 text-[var(--ink)]/75 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-5 list-disc space-y-2 pl-5 text-[15px] leading-[1.7] text-[var(--ink)]/80 md:text-base">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-5 list-decimal space-y-2 pl-5 text-[15px] leading-[1.7] text-[var(--ink)]/80 md:text-base">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="pl-1">{children}</li>,
    number: ({ children }) => <li className="pl-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-[var(--ink)]">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded-md border border-black/10 bg-black/[0.04] px-1.5 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const href = (value as { href?: string } | undefined)?.href ?? "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
          className="underline decoration-[var(--muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:decoration-[var(--ink)]"
        >
          {children}
        </a>
      );
    },
  },
};

export function CaseStudyBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
