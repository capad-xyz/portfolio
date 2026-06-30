import { defineField, defineType } from "sanity";

export const stackGroup = defineType({
  name: "stackGroup",
  title: "Stack Group",
  type: "document",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "e.g. 'languages', 'frameworks'",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "items",
      title: "Items",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "order",
      title: "Order (lower = first)",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: { select: { title: "label" } },
});
