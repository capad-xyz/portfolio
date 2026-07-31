import { defineField, defineType } from "sanity";

/**
 * The homepage footnote under the four-card work grid ("also shipped, smaller").
 *
 * It exists because the grid is deliberately capped at four flagships, so the
 * smaller real work needs somewhere honest to live. Each entry is one clause;
 * the homepage joins them into a single quiet line.
 *
 * `kind` is the important field. Entries marked as an outside contribution are
 * rendered under their own lead-in that says, in plain words, that the project
 * is somebody else's. That framing lives in the code (featured-work.tsx) rather
 * than in the CMS on purpose: it is a claim about authorship, not a caption, and
 * it should not be possible to soften it by editing a text field.
 */
export const alsoShipped = defineType({
  name: "alsoShipped",
  title: "Also shipped (homepage footnote)",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "The project's name, e.g. 'CoffeeBreath'.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "note",
      title: "One clause",
      type: "string",
      description:
        "What it is, in one clause, lower case, no full stop — it is read as part of a sentence, e.g. 'a Rainmeter music widget that breathes with the song's album art'.",
      validation: (Rule) => Rule.required().max(180),
    }),
    defineField({
      name: "kind",
      title: "Whose project is it?",
      type: "string",
      description:
        "Mine = I built it. Outside contribution = somebody else's project that I contributed a fix to. These render in two separate lines, and the second one says so explicitly.",
      options: {
        list: [
          { title: "Mine — I built it", value: "built" },
          { title: "Not mine — outside contribution", value: "contributed" },
        ],
        layout: "radio",
      },
      initialValue: "built",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "href",
      title: "Link (optional)",
      type: "url",
      description:
        "Repo, package, or the merged PR. Leave empty and the name renders as plain text — better than pointing somewhere that does not exist.",
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
  preview: { select: { title: "name", subtitle: "note" } },
});
