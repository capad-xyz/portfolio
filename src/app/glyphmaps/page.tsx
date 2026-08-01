import type { Metadata } from "next";
import { LiquidIntro } from "@/components/liquid-intro";
import { LiquidLens } from "@/components/liquid-lens";
import { Reveal } from "@/components/reveal";
import { GlyphmapsHero } from "@/components/glyphmaps/gm-hero";
import { GmSections } from "@/components/glyphmaps/gm-sections";
import { GmFooter } from "@/components/glyphmaps/gm-footer";
import { getGlyphmapsPage } from "@/lib/glyphmaps-content";

// Same ISR window as the main site: CMS edits land within 5 minutes without a
// redeploy, and the Sanity webhook can revalidate sooner.
export const revalidate = 300;

/**
 * Serialise JSON-LD for inline injection. Unlike the root layout's two blocks,
 * this one carries CMS-authored text, and `JSON.stringify` does not escape
 * `<` — so a stray `</script>` in a Sanity field would close the tag and let
 * the rest execute. Escaping the three characters that can start markup keeps
 * the payload valid JSON while making that impossible.
 */
function jsonLd(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getGlyphmapsPage();
  const title = page.seoTitle ?? "GlyphMaps — navigation on the Nothing Glyph Matrix";
  const description = page.seoDescription ?? page.heroTagline;
  const images = page.ogImage?.url ? [page.ogImage.url] : undefined;
  return {
    title: { absolute: title },
    description,
    openGraph: { title, description, url: "/", ...(images ? { images } : {}) },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}

export default async function GlyphmapsHome() {
  const page = await getGlyphmapsPage();

  // Only claims that hold: a free, open-source Android utility. No rating, no
  // install count — those would have to be invented, and this markup is the
  // one place a search engine would repeat them verbatim.
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GlyphMaps",
    applicationCategory: "TravelApplication",
    operatingSystem: "Android 14+",
    softwareVersion: "1.0.0",
    url: "https://glyphmaps.capad.fyi",
    downloadUrl: "https://github.com/capad-xyz/GlyphMaps/releases/latest",
    license: "https://www.gnu.org/licenses/agpl-3.0.html",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Person", name: "Aadarsh Upadhyay", url: "https://capad.fyi" },
    description: page.seoDescription ?? page.heroTagline,
  };

  return (
    <main id="main" className="relative z-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(appJsonLd) }}
      />
      <LiquidIntro />
      <LiquidLens />

      <GlyphmapsHero
        eyebrow={page.heroEyebrow}
        title={page.heroTitle}
        tagline={page.heroTagline}
        note={page.heroNote}
        ctas={page.ctas}
        metrics={page.metrics}
        maneuvers={page.heroManeuvers}
      />

      <GmSections sections={page.sections ?? []} />

      {(page.closingTitle || page.closingBody) && (
        <section className="gm-section">
          <div className="gm-narrow text-center">
            <Reveal>
              {page.closingTitle && (
                <h2 className="gm-feature-title reveal-title">{page.closingTitle}</h2>
              )}
              {page.closingBody && (
                <p className="gm-feature-body reveal-up">{page.closingBody}</p>
              )}
            </Reveal>
          </div>
        </section>
      )}

      <GmFooter />
    </main>
  );
}
