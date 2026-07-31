import { defineField, defineType } from "sanity";

/**
 * One downloadable copy of the resume — PDF, DOCX, or whatever a given employer
 * asks for next.
 *
 * An object type rather than fields on `resume` because the whole point is that
 * the list repeats: the owner can add a format, rename one, swap the file behind
 * it, or reorder which one leads, all without a deploy.
 *
 * Order is meaningful. The FIRST entry is the primary one-click button on
 * /resume; everything after it lives behind the small "other formats" menu next
 * to it. Most recruiters want the PDF, so the PDF should be first.
 */
export const resumeDownload = defineType({
  name: "resumeDownload",
  title: "Download option",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description:
        "The words on the control, e.g. 'Download the PDF' or 'Download the Word file'. The first entry's label is the big button, so write it as a full instruction.",
      validation: (Rule) => Rule.required().max(40),
    }),
    defineField({
      name: "format",
      title: "Format tag",
      type: "string",
      description:
        "The short hint shown beside the label in the menu, e.g. 'PDF', 'DOCX'. Kept separate from the label so the menu can stay a tidy column.",
      validation: (Rule) => Rule.required().max(8),
    }),
    defineField({
      name: "file",
      title: "File",
      type: "file",
      description:
        "Upload the file here and the link points at it immediately, with no deploy. Takes priority over 'Link' below.",
    }),
    defineField({
      name: "url",
      title: "Link",
      type: "url",
      description:
        "Used only when nothing is uploaded above. A path like /Aadarsh_Upadhyay_Resume.pdf serves the copy committed to the repo (which is what keeps the download working even with this CMS unreachable); a full https:// address also works.",
      validation: (Rule) => Rule.uri({ scheme: ["http", "https"], allowRelative: true }),
    }),
    defineField({
      name: "filename",
      title: "Save as",
      type: "string",
      description:
        "Optional. The filename the browser saves — this is what lands in a recruiter's downloads folder, so keep it your name. Defaults to the uploaded file's own name.",
      validation: (Rule) => Rule.max(80),
    }),
  ],
  // A row with neither a file nor a link renders nothing at all, which is worse
  // than an obvious error in the Studio — catch it here instead.
  validation: (Rule) =>
    Rule.custom((value?: { file?: { asset?: unknown }; url?: string }) =>
      value?.file?.asset || value?.url
        ? true
        : "Upload a file or paste a link — one of the two is required.",
    ),
  preview: {
    select: { title: "label", format: "format", filename: "file.asset.originalFilename" },
    prepare: ({ title, format, filename }) => ({
      title: title ?? "Download",
      subtitle: [format, filename].filter(Boolean).join(" · "),
    }),
  },
});
