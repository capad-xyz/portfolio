import type { StructureResolver } from "sanity/structure";

/**
 * Studio desk layout.
 *
 * One Sanity project now backs two sites, so the desk splits by site rather
 * than dumping every document type into one flat list. The GlyphMaps landing
 * page and privacy policy are singletons — pinned as single documents so they
 * can't be duplicated into an ambiguous "which one is live?" state.
 *
 * The section object types (gmFeature, gmShowcase, …) are deliberately absent:
 * they only ever exist inside `glyphmapsPage.sections`, never standalone.
 */

const GLYPHMAPS_SINGLETONS = ["glyphmapsPage", "glyphmapsPrivacy"];
const CAPAD_TYPES = ["project", "workExperience", "testimonial", "stackGroup"];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("capad.fyi")
        .child(
          S.list()
            .title("capad.fyi")
            .items([
              S.documentTypeListItem("project").title("Projects"),
              S.documentTypeListItem("workExperience").title("Work experience"),
              S.documentTypeListItem("testimonial").title("Testimonials"),
              S.documentTypeListItem("stackGroup").title("Stack groups"),
              // Anything added to the capad schema later shows up here without
              // needing this file touched.
              ...S.documentTypeListItems().filter((item) => {
                const id = item.getId();
                return (
                  !!id && !CAPAD_TYPES.includes(id) && !GLYPHMAPS_SINGLETONS.includes(id)
                );
              }),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title("glyphmaps")
        .child(
          S.list()
            .title("glyphmaps.capad.fyi")
            .items([
              S.listItem()
                .title("Landing page")
                .id("glyphmapsPage")
                .child(
                  S.document().schemaType("glyphmapsPage").documentId("glyphmapsPage"),
                ),
              S.listItem()
                .title("Privacy policy")
                .id("glyphmapsPrivacy")
                .child(
                  S.document()
                    .schemaType("glyphmapsPrivacy")
                    .documentId("glyphmapsPrivacy"),
                ),
            ]),
        ),
    ]);
