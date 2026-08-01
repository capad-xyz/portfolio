/**
 * Projects that also live on their own product hostname.
 *
 * glyphmaps.capad.fyi serves the `glyphmaps` project exactly as
 * capad.fyi/work/glyphmaps does — same document, same components, minus the
 * portfolio navigation. That makes the two URLs duplicate content, and left
 * alone each declared itself canonical, which makes a search engine pick one
 * and discard the signals pointing at the other.
 *
 * The product domain wins: it is the address the app opens for its privacy
 * policy, the one the README and the GitHub repo homepage point at, and the one
 * worth ranking for the product. The case study stays fully readable on
 * capad.fyi — it just stops competing with itself.
 *
 * Shared by `/work/[slug]`'s metadata and the sitemap, which must agree: a
 * sitemap should only ever list canonical URLs.
 */
export const CANONICAL_ELSEWHERE: Record<string, string> = {
  glyphmaps: "https://glyphmaps.capad.fyi/",
};
