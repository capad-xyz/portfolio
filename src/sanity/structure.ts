import type { StructureResolver } from "sanity/structure";

/**
 * Studio desk layout.
 *
 * One Sanity project now backs two hostnames, but only just: glyphmaps.capad.fyi
 * renders the existing `glyphmaps` project document, so the only content that
 * lives solely on that host is its privacy policy. It is pinned as a singleton —
 * one document, reached from here, never duplicated into an ambiguous "which one
 * is live?" state.
 *
 * Everything else is capad.fyi content, listed automatically so a new document
 * type appears without this file being touched.
 *
 * NOTE(merge): the `resume-and-cms-copy` branch has its own, better-titled desk
 * (Resume / Projects / Also shipped / Work experience / Stack / Kind words /
 * Contact bubbles). That one should win — the only thing worth carrying across
 * from here is the "glyphmaps" list item below.
 */

const GLYPHMAPS_SINGLETONS = ["glyphmapsPrivacy"];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("capad.fyi")
        .child(
          S.list()
            .title("capad.fyi")
            .items(
              S.documentTypeListItems().filter((item) => {
                const id = item.getId();
                return !!id && !GLYPHMAPS_SINGLETONS.includes(id);
              }),
            ),
        ),
      S.divider(),
      S.listItem()
        .title("glyphmaps")
        .child(
          S.list()
            .title("glyphmaps.capad.fyi")
            .items([
              // The landing page is the `glyphmaps` project document, edited
              // under capad.fyi -> Projects. Only the policy is host-specific.
              S.listItem()
                .title("Privacy policy")
                .id("glyphmapsPrivacy")
                .child(
                  S.document().schemaType("glyphmapsPrivacy").documentId("glyphmapsPrivacy"),
                ),
            ]),
        ),
    ]);
