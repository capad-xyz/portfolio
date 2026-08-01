import type { MetadataRoute } from "next";

/**
 * The GlyphMaps sitemap, served at glyphmaps.capad.fyi/sitemap.xml via the
 * proxy rewrite.
 *
 * A subdomain is a separate property to a search engine, so it gets its own
 * sitemap listing only its own URLs. capad.fyi's `src/app/sitemap.ts` is
 * deliberately left untouched and continues to list only capad.fyi URLs —
 * neither file ever mentions the other host. Two static files beat one
 * request-time sitemap that has to sniff a Host header, and they stay
 * cacheable.
 */

const SITE_URL = "https://glyphmaps.capad.fyi";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
