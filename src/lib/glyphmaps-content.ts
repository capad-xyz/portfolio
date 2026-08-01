import type { PortableTextBlock } from "@portabletext/types";
import { DEMO_ENABLED, safeFetch } from "./sanity";
import { GLYPHMAPS_DEMO_PRIVACY } from "./glyphmaps-demo";

/**
 * Content layer for glyphmaps.capad.fyi.
 *
 * The landing page is the `glyphmaps` project document rendered through the
 * shared project components, so it needs nothing here — it reads through
 * `lib/sanity.ts` like every other project. The privacy policy is the one piece
 * of content that exists only on this host, so it is the only thing this file
 * carries.
 *
 * Same contract as the rest of the site: the query goes through `safeFetch`, so
 * a flaky CMS renders the mirror instead of 500ing, and the mirror in
 * `glyphmaps-demo.ts` is real source-verified copy rather than filler.
 */

export type GlyphmapsPrivacy = {
  title: string;
  lastUpdated: string;
  summary: string;
  body: PortableTextBlock[];
  contactEmail: string;
  seoDescription?: string;
};

const PRIVACY_QUERY = `
  *[_type == "glyphmapsPrivacy"][0]{
    title,
    lastUpdated,
    summary,
    body,
    contactEmail,
    seoDescription
  }
`;

export async function getGlyphmapsPrivacy(): Promise<GlyphmapsPrivacy> {
  if (DEMO_ENABLED) return GLYPHMAPS_DEMO_PRIVACY;
  const doc = await safeFetch<GlyphmapsPrivacy | null>(
    PRIVACY_QUERY,
    {},
    null,
    "glyphmaps privacy",
  );
  // The mirror doubles as the floor: an empty or unreachable CMS still serves a
  // complete, accurate policy rather than an empty legal page.
  return doc ?? GLYPHMAPS_DEMO_PRIVACY;
}
