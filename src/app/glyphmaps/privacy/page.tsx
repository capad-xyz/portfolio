import type { Metadata } from "next";
import Link from "next/link";
import { CaseStudyBody } from "@/components/portable-text";
import { Reveal } from "@/components/reveal";
import { ReadingProgress } from "@/components/reading-progress";
import { GmFooter } from "@/components/glyphmaps/gm-footer";
import { getGlyphmapsPrivacy } from "@/lib/glyphmaps-content";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getGlyphmapsPrivacy();
  const description =
    doc.seoDescription ??
    "How GlyphMaps handles data: notification access, on-device processing, and what never leaves your phone.";
  return {
    title: doc.title,
    description,
    alternates: { canonical: "/privacy" },
    openGraph: { title: `${doc.title} — GlyphMaps`, description, url: "/privacy" },
  };
}

/**
 * The policy is CMS-driven so it can be corrected without a deploy — but the
 * copy that ships in the demo mirror was read out of the GlyphMaps source at
 * v1.0.0 rather than generated, because a privacy policy is a legal
 * representation and boilerplate would be a false one. The claims that matter
 * (no INTERNET permission, package + category filtering, dev-only capture log)
 * are each traceable to a specific file in the repo.
 *
 * Deliberately not wrapped in `.case-body`: that class auto-numbers every h2 as
 * a chapter, which is right for a case study and wrong for a policy.
 */
export default async function GlyphmapsPrivacy() {
  const doc = await getGlyphmapsPrivacy();
  const updated = new Date(doc.lastUpdated).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    // Same container as every other prose page in the app, and identical to
    // this host's own landing page. It used to be a bespoke 720px column with a
    // hand-rolled clamp(120px, 16vw, 190px) top pad, which put it 48px narrower
    // and ~46px lower than /glyphmaps for no reason anyone could name.
    <main id="main" className="relative z-10 mx-auto max-w-3xl px-6 py-28 md:py-36">
      <ReadingProgress />
      <Reveal>
        {/*
          The eyebrow doubles as the way back. It already read "glyphmaps", so
          making it the link adds an exit without adding furniture — and this
          was the only page on the host with no route off it except the
          browser's back button.

          `/` is correct and must stay relative: on glyphmaps.capad.fyi it
          resolves to the landing page. Writing "/glyphmaps" would leak the
          internal path into the address bar, and hardcoding the absolute host
          would break the *.localhost dev flow.
        */}
        <Link href="/" className="gm-back reveal-up section-eyebrow">
          <span aria-hidden className="gm-back-arrow">
            &larr;
          </span>
          glyphmaps
        </Link>
        <h1 className="gm-feature-title reveal-title">{doc.title}</h1>
        <p className="gm-policy-meta reveal-up">Last updated {updated}</p>

        <div className="glass gm-policy-summary reveal-up mt-9">{doc.summary}</div>

        {/* mt-10, not mt-4: the body's own first paragraph has its top margin
            zeroed (it opens a section that already has the card above it), so
            this wrapper carries the whole gap. At mt-4 the card sat almost on
            top of the paragraph while every other gap on the page was 64px. */}
        <div className="gm-policy-body reveal-up mt-10">
          <CaseStudyBody value={doc.body} />
        </div>

        {/* Takes the same rule as the policy's own headings — it is the last
            section of the document, not a footer note bolted underneath it. */}
        <div className="gm-policy-contact reveal-up">
          <h2 className="text-[clamp(22px,3vw,30px)] font-bold tracking-[-0.02em]">Contact</h2>
          <p className="mt-5 text-[15px] leading-[1.75] text-[var(--ink)]/80 md:text-base">
            Questions about this policy:{" "}
            <a
              href={`mailto:${doc.contactEmail}`}
              className="underline decoration-[var(--muted)] underline-offset-2 transition hover:text-[var(--ink)] hover:decoration-[var(--ink)]"
            >
              {doc.contactEmail}
            </a>
          </p>
        </div>
      </Reveal>

      <GmFooter />
    </main>
  );
}
