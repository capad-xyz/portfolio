import type { Metadata } from "next";
import { CaseStudyBody } from "@/components/portable-text";
import { Reveal } from "@/components/reveal";
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
    <main id="main" className="relative z-10">
      <section className="gm-section" style={{ paddingTop: "clamp(120px, 16vw, 190px)" }}>
        <div className="gm-narrow">
          <Reveal>
            <span className="section-eyebrow reveal-up">glyphmaps</span>
            <h1 className="gm-feature-title reveal-title">{doc.title}</h1>
            <p className="gm-policy-meta reveal-up">Last updated {updated}</p>

            <div className="glass gm-policy-summary reveal-up mt-9">{doc.summary}</div>

            <div className="reveal-up mt-4">
              <CaseStudyBody value={doc.body} />
            </div>

            <div className="reveal-up mt-14">
              <h2 className="text-[clamp(22px,3vw,30px)] font-bold tracking-[-0.02em]">
                Contact
              </h2>
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
        </div>
      </section>

      <GmFooter />
    </main>
  );
}
