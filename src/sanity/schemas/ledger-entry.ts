import { defineField, defineType } from "sanity";

/**
 * One cell in the proof ledger: a number he already publishes, and where it came
 * from. The `source` field is the whole point - it is what makes the strip
 * checkable rather than a boast, so it is required and it names a project or a
 * document rather than being a vague credit.
 */
export const ledgerEntry = defineType({
  name: "ledgerEntry",
  title: "Ledger entry",
  type: "document",
  fields: [
    defineField({
      name: "value",
      title: "Value",
      description:
        "The number exactly as published, including any unit: '0', '2.3', '553/647', '1,400'. Keep units out of this field - there is a dedicated one.",
      type: "string",
      validation: (Rule) => Rule.required().max(24),
    }),
    defineField({
      name: "unit",
      title: "Unit",
      description:
        "Optional suffix set smaller than the number: 'ms', '%', 'MB'. Leave empty for a bare number. This is what lets '0.7' and '92' both sit on one baseline while their units still read.",
      type: "string",
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: "label",
      title: "Label",
      description:
        "What the number is about, in plain words and lower case. Say what it proves, not what it is.",
      type: "string",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "source",
      title: "Source",
      description:
        "Where this number is already published - the project slug, or 'resume'. Rendered small under the label; it is what lets a reader check the claim instead of taking it.",
      type: "string",
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: "href",
      title: "Link",
      description:
        "Optional: where to check it. Leave empty if the source is the resume rather than a page.",
      type: "url",
    }),
    defineField({
      name: "order",
      title: "Order (lower = first)",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "value", subtitle: "label" },
  },
});