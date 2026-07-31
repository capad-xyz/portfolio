import { defineField, defineType } from "sanity";

/**
 * A bubble in the floating contact stack.
 *
 * The icon is stored as raw SVG *path data*, not as markup. The widget builds
 * the <svg> itself and sets only the `d` attribute, so nothing typed into the
 * CMS can inject markup into the page — while still letting a new platform be
 * added without a deploy: open the brand's SVG, copy the `d`, paste it here.
 */
export const socialLink = defineType({
  name: "socialLink",
  title: "Social link (contact bubble)",
  type: "document",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description:
        "Read aloud by screen readers and shown on hover. e.g. \"GitHub - capad-xyz\"",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "url",
      validation: (Rule) =>
        Rule.required().uri({ scheme: ["http", "https", "mailto"] }),
    }),
    defineField({
      name: "iconPath",
      title: "Icon path data",
      type: "text",
      rows: 4,
      description:
        "The `d` attribute from the platform's SVG - the long string of coordinates, not the whole <svg> tag. Open the brand's icon file, copy what is inside d=\"...\".",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "iconViewBox",
      title: "Icon viewBox",
      type: "string",
      description:
        "From the same SVG. Almost always \"0 0 24 24\"; GitHub's official mark is \"0 0 16 16\".",
      initialValue: "0 0 24 24",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "iconSize",
      title: "Icon size (px)",
      type: "number",
      description: "Rendered width/height inside the bubble. 19-21 looks right.",
      initialValue: 19,
    }),
    defineField({
      name: "surface",
      title: "Bubble surface",
      type: "string",
      description:
        "CSS background for the bubble. Keep it in the mercury family, e.g. radial-gradient(circle at 34% 26%, #7e7e88 0%, #1f1f25 50%, #060608 100%)",
      initialValue:
        "radial-gradient(circle at 34% 26%, #7e7e88 0%, #1f1f25 50%, #060608 100%)",
    }),
    defineField({
      name: "enabled",
      title: "Show in the stack",
      type: "boolean",
      description: "Turn off to hide without deleting.",
      initialValue: true,
    }),
    defineField({
      name: "order",
      title: "Order (lower = closer to the face)",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      name: "orderAsc",
      title: "Manual order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});
