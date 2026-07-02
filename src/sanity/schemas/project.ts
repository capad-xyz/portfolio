import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Done", value: "done" },
          { title: "Ongoing", value: "ongoing" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
      },
      initialValue: "ongoing",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "oneLiner",
      title: "One liner",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.required().max(260),
    }),
    defineField({
      name: "nowLine",
      title: "Now line",
      description:
        "One short line of what's happening on the project right now (e.g. 'hardening bridge ops toward the multi-account inbox'). Shown with a pulse on ongoing cards; leave empty to hide.",
      type: "string",
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: "metrics",
      title: "Metrics",
      description:
        "Up to 4 hard, true numbers shown on the card + case study (e.g. value '12k', label 'installs'). Real proof beats adjectives — leave empty rather than inventing.",
      type: "array",
      of: [
        {
          type: "object",
          name: "metric",
          fields: [
            {
              name: "value",
              title: "Value",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "label",
              title: "Label",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: "body",
      title: "Body (case study)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({ name: "year", title: "Year", type: "string" }),
    defineField({ name: "license", title: "License", type: "string" }),
    defineField({
      name: "links",
      title: "Links",
      type: "array",
      of: [
        {
          type: "object",
          name: "link",
          fields: [
            { name: "label", title: "Label", type: "string" },
            { name: "href", title: "Href", type: "url" },
            {
              name: "kind",
              title: "Kind",
              type: "string",
              options: {
                list: [
                  { title: "Code", value: "code" },
                  { title: "Live", value: "live" },
                  { title: "Package", value: "package" },
                  { title: "Store", value: "store" },
                ],
              },
            },
          ],
          preview: { select: { title: "label", subtitle: "href" } },
        },
      ],
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "featured",
      title: "Featured on homepage",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Order (lower = first)",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Manual order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "status", media: "image" },
  },
});
