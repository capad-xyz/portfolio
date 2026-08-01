import type { StructureResolver } from "sanity/structure";

/**
 * The Studio sidebar.
 *
 * Without this the Studio lists every document type alphabetically, which says
 * nothing about what the site actually does with them and — worse — lets you
 * create a second Resume. The site reads `*[_type == "resume"][0]`, so a second
 * one would silently win or lose depending on creation order.
 *
 * Three rules shaped the order below:
 *
 * 1. Singletons open straight into the document. No list, no "create new", no
 *    way to end up with two of something the site only ever reads one of.
 * 2. Everything else is grouped by WHERE it shows up, not by what it is. When
 *    you come back in three months wanting to change the homepage footnote, the
 *    question in your head is "where does that appear", not "what type is it".
 * 3. capad.fyi content stays at the top level, one click deep. One Sanity
 *    project now backs two hostnames, but glyphmaps.capad.fyi accounts for a
 *    single document type — so it gets its own section at the bottom rather
 *    than pushing every everyday edit down a folder to make room for it.
 */

// Types that have an explicit home above the catch-all. Anything NOT listed
// here falls through to the bottom of the desk, so a newly registered type is
// never invisible just because this file was not updated — and anything that IS
// listed appears exactly once, never twice.
const PLACED = [
  "resume",
  "project",
  "alsoShipped",
  "workExperience",
  "stackGroup",
  "testimonial",
  "socialLink",
  "glyphmapsPrivacy",
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("capad.fyi")
    .items([
      // ---- pages ----
      S.listItem()
        .title("Resume")
        .id("resume")
        .child(
          S.document()
            .schemaType("resume")
            .documentId("resume")
            .title("Resume (/resume)"),
        ),

      S.divider(),

      // ---- the homepage, in the order the page itself reads ----
      S.documentTypeListItem("project").title("Projects"),
      S.documentTypeListItem("alsoShipped").title("Also shipped (footnote)"),
      S.documentTypeListItem("workExperience").title("Work experience"),
      S.documentTypeListItem("stackGroup").title("Stack"),
      S.documentTypeListItem("testimonial").title("Kind words"),

      S.divider(),

      // ---- chrome, shared by every page ----
      S.documentTypeListItem("socialLink").title("Contact bubbles"),

      S.divider(),

      // ---- the second hostname ----
      // Both things a visitor to glyphmaps.capad.fyi can see are in here, even
      // though only one of them is unique to that host. The landing page is an
      // ordinary `project` document (also editable under Projects); reaching it
      // by slug rather than by id means recreating that document doesn't
      // quietly turn this into a dead link.
      S.listItem()
        .title("glyphmaps.capad.fyi")
        .id("glyphmaps")
        .child(
          S.list()
            .title("glyphmaps.capad.fyi")
            .items([
              S.listItem()
                .title("Landing page")
                .id("glyphmapsLanding")
                .child(
                  S.documentList()
                    .title("Landing page")
                    .filter('_type == "project" && slug.current == "glyphmaps"'),
                ),
              S.listItem()
                .title("Privacy policy")
                .id("glyphmapsPrivacy")
                .child(
                  S.document()
                    .schemaType("glyphmapsPrivacy")
                    .documentId("glyphmapsPrivacy")
                    .title("Privacy policy (/privacy)"),
                ),
            ]),
        ),

      ...S.documentTypeListItems().filter(
        (item) => !PLACED.includes(item.getId() ?? ""),
      ),
    ]);
