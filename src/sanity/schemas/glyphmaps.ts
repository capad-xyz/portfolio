import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Content model for the GlyphMaps product site (glyphmaps.capad.fyi).
 *
 * Two singletons — the landing page and the privacy policy — pinned in the
 * Studio by `src/sanity/structure.ts` so they can't be duplicated. Everything
 * the landing page renders lives in the `sections` array, which is an ordered
 * list of polymorphic blocks: the owner reorders sections by dragging, swaps
 * screenshots by replacing an image, and rewrites copy in place. No redeploy.
 *
 * All of these types are exported as one array so `schemas/index.ts` only has
 * to grow a single import and a single spread.
 */

// The twelve buckets GlyphMaps actually renders (Maneuver.kt). The showcase
// component draws these from the same 13x13 geometry the app uses, so this list
// must not drift from the app's enum.
const MANEUVERS = [
  { title: "Straight", value: "STRAIGHT" },
  { title: "Keep left", value: "KEEP_LEFT" },
  { title: "Turn left", value: "LEFT" },
  { title: "Sharp left", value: "SHARP_LEFT" },
  { title: "Keep right", value: "KEEP_RIGHT" },
  { title: "Turn right", value: "RIGHT" },
  { title: "Sharp right", value: "SHARP_RIGHT" },
  { title: "Fork left", value: "FORWARD_LEFT" },
  { title: "Fork right", value: "FORWARD_RIGHT" },
  { title: "Roundabout", value: "ROUNDABOUT" },
  { title: "U-turn", value: "UTURN" },
  { title: "Arrive", value: "ARRIVE" },
];

/* ------------------------------------------------------------------ blocks */

const gmFeature = defineType({
  name: "gmFeature",
  title: "Feature",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "maneuver",
      title: "Matrix demo maneuver",
      description:
        "Optional. Lights this maneuver on the animated Glyph Matrix beside the copy. Leave empty for a text-only feature.",
      type: "string",
      options: { list: MANEUVERS },
    }),
    defineField({
      name: "flip",
      title: "Put the visual on the left",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "eyebrow" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "Feature",
      subtitle: subtitle ? `Feature — ${subtitle}` : "Feature",
    }),
  },
});

const gmShowcase = defineType({
  name: "gmShowcase",
  title: "Screenshots",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
    defineField({
      name: "shots",
      title: "Shots",
      description:
        "Real screenshots only. Each is shown in a phone frame with its caption beneath.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "shot",
          fields: [
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
          ],
          preview: { select: { title: "caption", subtitle: "alt", media: "image" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({ title: title ?? "Screenshots", subtitle: "Screenshots" }),
  },
});

const gmDownload = defineType({
  name: "gmDownload",
  title: "Download",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
    defineField({
      name: "options",
      title: "Options",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "option",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "href",
              title: "Href",
              type: "url",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "meta",
              title: "Meta",
              description: "Small print beside the button, e.g. 'APK · 2.3 MB · Android 14+'.",
              type: "string",
            }),
            defineField({
              name: "primary",
              title: "Primary button",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: { select: { title: "label", subtitle: "meta" } },
        }),
      ],
    }),
    defineField({
      name: "requirements",
      title: "Requirements",
      description: "Short bullet list shown under the buttons. Be honest about device limits.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({ title: title ?? "Download", subtitle: "Download" }),
  },
});

const gmSpecs = defineType({
  name: "gmSpecs",
  title: "Spec table",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "rows",
      title: "Rows",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "specRow",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({ title: title ?? "Spec table", subtitle: "Spec table" }),
  },
});

const gmFaq = defineType({
  name: "gmFaq",
  title: "FAQ",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "items",
      title: "Questions",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "faqItem",
          fields: [
            defineField({
              name: "question",
              title: "Question",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: "question", subtitle: "answer" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({ title: title ?? "FAQ", subtitle: "FAQ" }),
  },
});

/* -------------------------------------------------------------- singletons */

const glyphmapsPage = defineType({
  name: "glyphmapsPage",
  title: "GlyphMaps — landing page",
  type: "document",
  fields: [
    defineField({
      name: "heroEyebrow",
      title: "Hero eyebrow",
      type: "string",
      description: "Small mono pill above the wordmark.",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero wordmark",
      type: "string",
      description: "The large display word. Keep it short — it is set enormous.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroTagline",
      title: "Hero tagline",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.required().max(300),
    }),
    defineField({
      name: "heroNote",
      title: "Hero status pill",
      description: "e.g. 'v1.0.0 · AGPL-3.0 · Nothing Phone (4a) Pro'. Leave empty to hide.",
      type: "string",
    }),
    defineField({
      name: "heroManeuvers",
      title: "Hero matrix sequence",
      description:
        "The maneuvers the hero's Glyph Matrix cycles through. Leave empty to use the default drive sequence.",
      type: "array",
      of: [defineArrayMember({ type: "string", options: { list: MANEUVERS } })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "ctas",
      title: "Hero buttons",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "cta",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "href",
              title: "Href",
              type: "string",
              description: "Full URL, or an in-page anchor like #download.",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "variant",
              title: "Variant",
              type: "string",
              options: {
                list: [
                  { title: "Glass (primary)", value: "glass" },
                  { title: "Outline (secondary)", value: "outline" },
                ],
                layout: "radio",
              },
              initialValue: "glass",
            }),
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: "metrics",
      title: "Hero metrics",
      description:
        "Hard, verifiable numbers only (137 LEDs, 12 maneuvers, 2.3 MB APK). Never invent download counts or ratings — leave this empty instead.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "metric",
          fields: [
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: "sections",
      title: "Sections",
      description: "Drag to reorder. Every block below the hero lives here.",
      type: "array",
      of: [
        defineArrayMember({ type: "gmFeature" }),
        defineArrayMember({ type: "gmShowcase" }),
        defineArrayMember({ type: "gmDownload" }),
        defineArrayMember({ type: "gmSpecs" }),
        defineArrayMember({ type: "gmFaq" }),
      ],
    }),
    defineField({
      name: "closingTitle",
      title: "Closing title",
      type: "string",
    }),
    defineField({
      name: "closingBody",
      title: "Closing body",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      validation: (Rule) => Rule.max(70),
    }),
    defineField({
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(180),
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      description: "1200x630. Falls back to the site default when empty.",
      type: "image",
    }),
  ],
  preview: {
    prepare: () => ({ title: "GlyphMaps — landing page" }),
  },
});

const glyphmapsPrivacy = defineType({
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
        "Shown verbatim on the page. Update this whenever the policy text changes — it is a legal representation.",
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
        "The policy itself. This must describe what the app actually does — check it against the GlyphMaps source before publishing.",
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

export const glyphmapsSchemas = [
  gmFeature,
  gmShowcase,
  gmDownload,
  gmSpecs,
  gmFaq,
  glyphmapsPage,
  glyphmapsPrivacy,
];
