import { homeGraph, identityGraph, jsonLdHtml, SITE_DESCRIPTION } from "@/lib/jsonld";
import type { Project, SocialLink } from "@/lib/sanity";

/**
 * capad.fyi's identity markup: the person behind the site, the site as an
 * entity they authored, and everything they made.
 *
 * Rendered by the capad.fyi homepage rather than the root layout, and that
 * placement is the point. The layout is shared with glyphmaps.capad.fyi, so
 * emitting it there told a crawler that the GlyphMaps product page belongs to a
 * WebSite whose url is capad.fyi — a different property claiming a page it does
 * not own. The homepage is also simply where Person/WebSite markup belongs.
 *
 * The node shapes live in lib/jsonld.ts because they are referenced from more
 * than one page: the project case studies, /resume, and the GlyphMaps host all
 * point at the same person id rather than restating him. Two `@graph` documents
 * rather than one call, because they answer different questions — who owns this
 * site, and what is on it.
 */
export function CapadJsonLd({
  projects,
  socials,
  contributed,
}: {
  projects: Project[];
  socials: SocialLink[];
  /** Lowercased names of projects he contributed to rather than authored. */
  contributed: Set<string>;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            identityGraph(
              SITE_DESCRIPTION,
              socials.map((s) => s.href),
            ),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(homeGraph(projects, contributed)) }}
      />
    </>
  );
}
