import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Content model for glyphmaps.capad.fyi.
 *
 * Only one document type, on purpose. The landing page is the existing
 * `glyphmaps` project document — same title, one-liner, metrics and links the
 * case study uses — so it needs no schema of its own, and editing the product
 * page means editing the project you already maintain. The privacy policy is
 * the one piece of content that exists only on the subdomain, so it is the one
 * type here.
 *
 * Pinned as a singleton by `src/sanity/structure.ts`.
 */

export const glyphmapsPrivacy = defineType({
  name: "glyphmapsPrivacy",
  title: "GlyphMaps — privacy policy",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      initialValue: "Privacy Policy",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lastUpdated",
      title: "Last updated",
      type: "date",
      description:
        "Shown verbatim on the page. Update this whenever the text changes — it is a legal representation.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      description: "The one-paragraph plain-English version, set in a glass callout at the top.",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Policy body",
      description:
        "The policy itself. It must describe what the app actually does — check it against the GlyphMaps source before publishing.",
      type: "array",
      of: [defineArrayMember({ type: "block" })],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "contactEmail",
      title: "Contact email",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.max(180),
    }),
  ],
  preview: {
    select: { subtitle: "lastUpdated" },
    prepare: ({ subtitle }) => ({
      title: "GlyphMaps — privacy policy",
      subtitle: subtitle ? `Last updated ${subtitle}` : undefined,
    }),
  },
});

export const glyphmapsSchemas = [glyphmapsPrivacy];
