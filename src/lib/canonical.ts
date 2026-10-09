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
 * THE contact address. One literal, imported by everything that publishes or
 * receives it: the colophon, the contact widget, the JSON-LD, the glyphmaps
 * privacy copy, the /resume mirror, and the `TO` in /api/contact.
 *
 * This lives in `lib` rather than in a component because the consumers are a
 * component, a client island, two lib modules and a server route — and a
 * component importing another component for a string is a dependency that only
 * makes sense until someone moves the file.
 *
 * `hi@` is the one address, chosen deliberately over the `connect@` variant the
 * site carried in four places. Both existed simultaneously and neither was
 * wrong on its own terms: the CMS resume and the /public markdown said `hi@`,
 * while the colophon, widget, JSON-LD and the form's `TO` said `connect@`. So a
 * recruiter reading the resume was sent to one address and a visitor using the
 * form was delivered to another. One address now, everywhere, INCLUDING the
 * delivery target — a published address that does not receive is the worst of the
 * two arrangements, because it is the one that looks correct.
 */
export const CONTACT_EMAIL = "hi@capad.fyi";
