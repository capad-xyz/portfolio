import { defineField, defineType } from "sanity";

export const workExperience = defineType({
  name: "workExperience",
  title: "Work Experience",
  type: "document",
  fields: [
    defineField({
      name: "position",
      title: "Position",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "company",
      title: "Company",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startYear",
      title: "Start year",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "endYear",
      title: "End year",
      type: "string",
      description: "Leave blank if current",
    }),
    defineField({
      name: "current",
      title: "Current role",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({
      name: "order",
      title: "Sort order (lower = more recent)",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: { select: { title: "position", subtitle: "company" } },
});
