import type { MetadataRoute } from "next";
import { getProjectSlugs } from "@/lib/sanity";
import { CANONICAL_ELSEWHERE } from "@/lib/canonical";

const SITE_URL = "https://capad.fyi";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getProjectSlugs();
  const lastModified = new Date();
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // /cv is deliberately absent: it 308s to /resume, and a sitemap should only
    // ever list the canonical URL.
    {
      url: `${SITE_URL}/resume`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Same rule as /cv above: only canonical URLs belong in a sitemap. A
    // project that canonicalises to its own product hostname is listed in that
    // host's sitemap instead — see src/lib/canonical.ts and
    // src/app/glyphmaps/sitemap.ts.
    ...slugs
      .filter((slug) => !CANONICAL_ELSEWHERE[slug])
      .map((slug) => ({
        url: `${SITE_URL}/work/${slug}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
