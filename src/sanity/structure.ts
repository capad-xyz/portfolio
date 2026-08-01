import type { StructureResolver } from "sanity/structure";

/**
 * The Studio sidebar.
 *
 * Without this the Studio lists every document type alphabetically, which says
 * nothing about what the site actually does with them and — worse — lets you
 * create a second Resume. The site reads `*[_type == "resume"][0]`, so a second
 * one would silently win or lose depending on creation order.
 *
 * Two rules shaped the order below:
 *
 * 1. Singletons open straight into the document. No list, no "create new", no
 *    way to end up with two of something the site only ever reads one of.
 * 2. Everything else is grouped by WHERE it shows up, not by what it is. When
 *    you come back in three months wanting to change the homepage footnote, the
 *    question in your head is "where does that appear", not "what type is it".
 */
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

      // Anything registered later shows up here rather than vanishing, so a new
      // type is never invisible just because this file was not updated.
      ...S.documentTypeListItems().filter(
        (item) =>
          ![
            "resume",
            "project",
            "alsoShipped",
            "workExperience",
            "stackGroup",
            "testimonial",
            "socialLink",
          ].includes(item.getId() ?? ""),
      ),
    ]);
