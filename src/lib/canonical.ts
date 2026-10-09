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

/**
 * THE contact address. One literal, imported by everything that publishes it.
 *
 * This lives in `lib` rather than in a component because the consumers are a
 * component (the colophon), a client island (the contact widget), a lib module
 * (the JSON-LD) and a plain-data file (the glyphmaps privacy copy) — and a
 * component importing another component for a string is a dependency that only
 * makes sense until someone moves the file.
 *
 * `connect@` is the address the inbox actually receives: it is the `TO` constant
 * in /api/contact, and it was already the value in the widget, the JSON-LD and the
 * colophon. The `hi@` variant survived only in the CMS resume document and the
 * markdown committed to /public, so a recruiter reading the resume was sent to an
 * address nothing was reading. Standardising on the address that delivers is the
 * only direction that can work; see the /public markdown, updated to match.
 */
export const CONTACT_EMAIL = "connect@capad.fyi";
