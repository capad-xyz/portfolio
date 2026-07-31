import { defineField, defineType } from "sanity";

/**
 * The /resume (and /cv) page — the parts of a resume that have no home in the
 * existing document types.
 *
 * Deliberately small. Experience comes from `workExperience`, the projects come
 * from `project`, and the toolbox comes from `stackGroup`; duplicating any of
 * that here would guarantee the two copies drift. What is left is the header
 * (summary, availability, contact row), education, and the downloadable file.
 *
 * Treat it as a singleton: the site reads `*[_type == "resume"][0]`. One
 * published document is all it wants.
 *
 * The one repeating thing here is `downloads` (see ./resume-download): the file
 * formats the page offers. It repeats because "what formats do we hand out"
 * changes far more often than the code around it does.
 */
export const resume = defineType({
  name: "resume",
  title: "Resume (/resume)",
  type: "document",
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: "The one-line role under the name, e.g. 'Software Engineer & Architect'.",
      validation: (Rule) => Rule.required().max(80),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 5,
      description:
        "The opening paragraph a recruiter reads first. Keep it to what is provable — this page is linked from job applications.",
      validation: (Rule) => Rule.required().max(900),
    }),
    defineField({
      name: "availability",
      title: "Availability",
      type: "string",
      description:
        "One line on how you can be hired, e.g. 'Remote-first; open to relocation worldwide (visa sponsorship welcome)'. Leave empty to hide.",
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "contacts",
      title: "Contact row",
      type: "array",
      description:
        "The row under the headline. `Value` is what is shown; `Link` is where it goes (leave the link empty for things like a location that are not clickable).",
      of: [
        {
          type: "object",
          name: "contact",
          fields: [
            {
              name: "label",
              title: "Label",
              type: "string",
              description: "e.g. 'email', 'github' — shown small, above the value.",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "value",
              title: "Value",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "href",
              title: "Link",
              type: "url",
              description:
                "Optional. `mailto:` and `tel:` are allowed as well as http(s).",
              validation: (Rule) =>
                Rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
            },
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({
      name: "education",
      title: "Education",
      type: "array",
      of: [
        {
          type: "object",
          name: "educationEntry",
          fields: [
            {
              name: "credential",
              title: "Credential",
              type: "string",
              description: "e.g. 'BCA (Hons.)'",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "institution",
              title: "Institution",
              type: "string",
              validation: (Rule) => Rule.required(),
            },
            {
              name: "period",
              title: "Period",
              type: "string",
              description: "e.g. '2024 - 2028 (expected)'",
            },
            { name: "note", title: "Note", type: "string" },
          ],
          preview: { select: { title: "credential", subtitle: "institution" } },
        },
      ],
    }),
    defineField({
      name: "downloads",
      title: "Download options",
      type: "array",
      description:
        "What the download control offers. The FIRST entry is the primary one-click button; every entry after it sits behind the small 'other formats' menu beside it — so put the PDF first, because that is what most recruiters want. Reorder to change which format leads. Leave the list empty and the button falls back to the PDF below.",
      of: [{ type: "resumeDownload" }],
      validation: (Rule) => Rule.max(5),
    }),
    defineField({
      name: "file",
      title: "Resume PDF (fallback)",
      type: "file",
      description:
        "Only used when 'Download options' above is empty. Kept so an older document keeps working — for anything new, add a Download option instead.",
      options: { accept: ".pdf" },
    }),
    defineField({
      name: "updated",
      title: "Updated label",
      type: "string",
      description:
        "The caption next to the download control, e.g. 'PDF · one page · updated Aug 2026'. Leave empty to hide.",
      validation: (Rule) => Rule.max(80),
    }),
  ],
  preview: {
    select: { title: "headline", subtitle: "updated" },
    prepare: ({ title, subtitle }) => ({
      title: title ?? "Resume",
      subtitle: subtitle ?? "/resume",
    }),
  },
});
