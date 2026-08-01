import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/sanity";
import { CaseStudyBody } from "@/components/portable-text";
import { OpenContactButton } from "@/components/open-contact-button";
import { ReadingProgress } from "@/components/reading-progress";
import { Reveal } from "@/components/reveal";
import { LICENSE_URL, ProjectHeader, ProjectTags } from "@/components/project-header";
import { GmFooter } from "@/components/glyphmaps/gm-footer";

/**
 * glyphmaps.capad.fyi — the product face of the `glyphmaps` project document.
 *
 * The same view and the same content as capad.fyi/work/glyphmaps, rendered by
 * the same components, minus the three things that only make sense inside a
 * portfolio: the "the build stories" link back to /projects, and the prev/next
 * rail through the neighbouring projects. Someone who arrived at a product
 * domain should not be handed a link onward to searchts.
 *
 * It is a separate route rather than a rewrite onto /work/glyphmaps because
 * Next keys the incremental cache on the resolved route: pointing both hosts at
 * one path would make them share a cache entry and serve each other's HTML.
 * Distinct routes, distinct keys, nothing to configure.
 */

export const revalidate = 300;

const SITE_URL = "https://glyphmaps.capad.fyi";
const SLUG = "glyphmaps";

export async function generateMetadata(): Promise<Metadata> {
  const project = await getProjectBySlug(SLUG);
  if (!project) return { title: { absolute: "GlyphMaps" } };
  // "glyphmaps" as a bare word is already owned by an unrelated data-viz
  // concept (RAMPVIS, IEEE papers), so the title targets what someone looking
  // for THIS actually types — the phone, Google Maps, the Matrix — rather than
  // competing for a term whose intent isn't ours.
  const title = "GlyphMaps — Google Maps turn-by-turn on the Nothing Glyph Matrix";
  return {
    title: { absolute: title },
    description: project.oneLiner,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: "/",
      title,
      description: project.oneLiner,
      // The product's own card, not the capad portfolio one — sharing this URL
      // used to preview someone else's brand.
      images: [{ url: "/glyphmaps-og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.oneLiner,
      images: ["/glyphmaps-og.png"],
    },
  };
}

export default async function GlyphmapsPage() {
  const project = await getProjectBySlug(SLUG);
  if (!project) notFound();

  // Only claims that hold. No rating and no install count — those would have to
  // be invented, and this markup is exactly where a search engine would repeat
  // them verbatim.
  const codeRepo = project.links?.find((l) => l.kind === "code")?.href;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GlyphMaps",
    description: project.oneLiner,
    applicationCategory: "TravelApplication",
    operatingSystem: "Android 14+",
    url: SITE_URL,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    author: { "@type": "Person", name: "Aadarsh Upadhyay", url: "https://capad.fyi" },
    ...(codeRepo ? { codeRepository: codeRepo } : {}),
    ...(project.tags?.length ? { keywords: project.tags.join(", ") } : {}),
    ...(project.year ? { datePublished: project.year } : {}),
    ...(project.license && LICENSE_URL[project.license]
      ? { license: LICENSE_URL[project.license] }
      : {}),
  };

  return (
    <main id="main" className="relative z-10 mx-auto max-w-3xl px-6 py-28 md:py-36">
      <ReadingProgress />
      <script
        type="application/ld+json"
        // JSON.stringify does not escape `<`, and this payload carries CMS text,
        // so a stray `</script>` in a Sanity field would close the tag early.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Reveal>
        <span className="section-eyebrow reveal-up">nothing phone (4a) pro · glyph matrix</span>

        <ProjectHeader project={project} slug={SLUG} morph={false} />

        {project.body && project.body.length > 0 && (
          <div className="case-body reveal-up mt-14 border-t border-black/10 pt-12">
            <CaseStudyBody value={project.body} />
          </div>
        )}

        <ProjectTags tags={project.tags} />

        <div className="reveal-up mt-16">
          <OpenContactButton />
        </div>
      </Reveal>

      <GmFooter />
    </main>
  );
}
