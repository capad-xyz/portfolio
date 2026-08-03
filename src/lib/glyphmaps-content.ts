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
  //
  // The floor has to survive a document that EXISTS but says nothing, not just a
  // missing one. `?? ` alone would not: publishing this document with only a
  // title filled in returns a real object whose `body` is undefined, and this
  // URL is the one the shipped app opens for its privacy policy
  // (MainActivity.kt: PRIVACY_POLICY_URL). A blank legal page is worse than a
  // stale one, so the body is what decides — if the CMS has no policy text,
  // none of it is used.
  if (!doc?.body?.length) return GLYPHMAPS_DEMO_PRIVACY;

  // Body is real, so the CMS is authoritative. The scalars around it still fall
  // back individually: forgetting to re-type the contact email should not
  // publish a policy with no way to contact anyone.
  return {
    ...GLYPHMAPS_DEMO_PRIVACY,
    ...Object.fromEntries(
      Object.entries(doc).filter(([, v]) => v !== null && v !== undefined && v !== ""),
    ),
    body: doc.body,
  };
}
