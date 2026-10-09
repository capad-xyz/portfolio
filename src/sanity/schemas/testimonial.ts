import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required().max(400),
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "company", title: "Company", type: "string" }),
    defineField({
      name: "link",
      title: "Link to source / their profile",
      type: "url",
    }),
    /**
     * Which project this quote is about. Peer review belongs to the thing it
     * reviews, so the homepage renders it inline on that project's row instead
     * of in a section of its own, and a reader meets the praise while still
     * looking at the work.
     *
     * A reference rather than a free-text slug so the Studio offers the list
     * instead of making you remember the slug, and so a project rename cannot
     * silently orphan a quote. Optional on purpose: a quote about an employer
     * (the Appson ones) has no project to attach to, and those are handled by
     * leaving it empty rather than being forced into a wrong home.
     */
    defineField({
      name: "project",
      title: "About which project",
      description:
        "Set this when the quote is about one specific project - it will appear inline on that project's row. Leave empty for praise about a job or an employer, which is shown with the experience section.",
      type: "reference",
      to: [{ type: "project" }],
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
  preview: { select: { title: "name", subtitle: "company" } },
});
