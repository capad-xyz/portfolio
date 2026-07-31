import { createClient, type ClientPerspective } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { PortableTextBlock } from "@portabletext/types";
import {
  DEMO_PROJECTS,
  DEMO_TESTIMONIALS,
  DEMO_WORK_EXPERIENCE,
  DEMO_STACK_GROUPS,
  DEMO_ALSO_SHIPPED,
  DEMO_SOCIAL_LINKS,
  DEMO_RESUME,
} from "./demo-content";

// While demo mode is on, demo content OVERRIDES the CMS so every section is
// guaranteed to render (preview mode). On in dev / any non-production build,
// off in production. Force on with NEXT_PUBLIC_DEMO_CONTENT=1 (e.g. a staging
// preview), or off with =0 to preview real CMS content in dev. See ./demo-content.
const DEMO_ENABLED =
  process.env.NEXT_PUBLIC_DEMO_CONTENT === "1"
    ? true
    : process.env.NEXT_PUBLIC_DEMO_CONTENT === "0"
      ? false
      : process.env.NODE_ENV !== "production";

export const sanity = createClient({
  projectId: "v6eklfsd",
  dataset: "production",
  apiVersion: "2025-01-01",
  useCdn: true,
  perspective: "published" as ClientPerspective,
});

const builder = createImageUrlBuilder(sanity);
export const urlFor = (source: Parameters<typeof builder.image>[0]) =>
  builder.image(source);

export type ProjectStatus = "done" | "ongoing" | "archived";

export type ProjectLink = {
  label: string;
  href: string;
  kind?: "code" | "live" | "package" | "store";
};

export type ProjectMetric = {
  value: string;
  label: string;
};

export type Project = {
  _id: string;
  title: string;
  slug: string;
  status: ProjectStatus;
  oneLiner: string;
  /** One line of live status shown on ongoing cards ("now: …"). */
  nowLine?: string;
  metrics?: ProjectMetric[];
  tags?: string[];
  year?: string;
  license?: string;
  links?: ProjectLink[];
  /** True when a case-study body exists, so the card can show a "read the story" link. */
  hasStory?: boolean;
  /** Estimated case-study reading time (minutes) — only set by getAllProjects. */
  readMinutes?: number;
};

export type ProjectDetail = Project & {
  body?: PortableTextBlock[];
};

export type WorkExperience = {
  _id: string;
  position: string;
  company: string;
  startYear: string;
  endYear?: string;
  current: boolean;
  summary?: string;
};

export type Testimonial = {
  _id: string;
  quote: string;
  name: string;
  role?: string;
  company?: string;
  link?: string;
};

export type StackGroup = {
  _id: string;
  label: string;
  items: string[];
};

/** "built" = his own; "contributed" = someone else's project he shipped a fix to. */
export type AlsoShippedKind = "built" | "contributed";

/** One clause in the homepage footnote under the four-card grid. */
export type AlsoShipped = {
  _id: string;
  name: string;
  note: string;
  kind?: AlsoShippedKind;
  href?: string;
};

/**
 * One bubble in the floating contact stack. `iconPath` is SVG path data (the
 * `d` attribute), never markup — the widget builds the element and sets only
 * that attribute, so the CMS cannot inject anything executable.
 */
export type SocialLink = {
  _id: string;
  label: string;
  href: string;
  iconPath: string;
  iconViewBox: string;
  iconSize?: number;
  surface?: string;
};

export type ResumeContact = {
  label: string;
  value: string;
  href?: string;
};

export type ResumeEducation = {
  credential: string;
  institution: string;
  period?: string;
  note?: string;
};

/** One format the resume can be taken away in, already resolved to a real href. */
export type ResumeDownload = {
  /** The words on the control, e.g. "Download the PDF". */
  label: string;
  /** Short hint beside the label in the menu, e.g. "PDF". */
  format: string;
  href: string;
  /**
   * What the browser saves it as. Only honoured same-origin — browsers ignore
   * `download` cross-origin, which is why Sanity-hosted files ask that CDN for
   * the attachment header instead (the `?dl=` below).
   */
  filename?: string;
};

export type Resume = {
  headline: string;
  summary: string;
  availability?: string;
  contacts?: ResumeContact[];
  education?: ResumeEducation[];
  /**
   * Never empty. The CMS drives the list; if it has nothing to say, this falls
   * back to the PDF committed to /public, so a recruiter is never handed a page
   * with no way to take the file.
   */
  downloads: ResumeDownload[];
  /**
   * Legacy single-PDF field, still read as the fallback when `downloads` is
   * empty. Absolute Sanity CDN URL, set only when a PDF has been uploaded.
   */
  fileUrl?: string;
  updated?: string;
};

// Shared card-level projection. `hasStory` lets the grid link to a case study
// only when one actually exists; `body` is added on top for the detail query.
const PROJECT_CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  status,
  oneLiner,
  nowLine,
  metrics[]{value, label},
  tags,
  year,
  license,
  links[]{label, href, kind},
  "hasStory": defined(body) && count(body) > 0
`;

const FEATURED_PROJECTS_QUERY = `
  *[_type == "project" && featured == true] | order(order asc, _createdAt desc){
    ${PROJECT_CARD_FIELDS}
  }
`;

// Serial-position safety net: shipped work leads the grid (card 01) even if the
// author forgot to set `order` in the CMS. Array.sort is stable, so the manual
// `order` from GROQ is preserved within each status band.
const STATUS_RANK: Record<ProjectStatus, number> = { done: 0, ongoing: 1, archived: 2 };

// Resilient fetch: a transient Sanity/CDN failure returns the fallback (and logs)
// instead of throwing, so one flaky query can't 500 the whole page or fail a build.
async function safeFetch<T>(
  query: string,
  params: Record<string, unknown>,
  fallback: T,
  label: string,
): Promise<T> {
  try {
    return await sanity.fetch<T>(query, params);
  } catch (err) {
    console.error(`[sanity] ${label} fetch failed:`, err instanceof Error ? err.message : err);
    return fallback;
  }
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const list: Project[] = DEMO_ENABLED
    ? DEMO_PROJECTS
    : await safeFetch<Project[]>(FEATURED_PROJECTS_QUERY, {}, [], "featured projects");
  return [...list].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
}

// Every project, featured or not — the /projects article index. Same card
// projection plus a word count so the index can show honest reading times.
const ALL_PROJECTS_QUERY = `
  *[_type == "project"] | order(order asc, _createdAt desc){
    ${PROJECT_CARD_FIELDS},
    "readWords": length(string::split(pt::text(body), " "))
  }
`;

const READ_WPM = 200;

/** Demo-path equivalent of the GROQ word count: joins the block spans. */
function demoReadMinutes(p: ProjectDetail): number | undefined {
  if (!p.body?.length) return undefined;
  const words = p.body
    .flatMap((b) => ("children" in b && Array.isArray(b.children) ? b.children : []))
    .map((c) => (typeof c.text === "string" ? c.text : ""))
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / READ_WPM));
}

export async function getAllProjects(): Promise<Project[]> {
  const list: Project[] = DEMO_ENABLED
    ? DEMO_PROJECTS.map((p) => ({ ...p, readMinutes: demoReadMinutes(p) }))
    : (
        await safeFetch<(Project & { readWords?: number })[]>(
          ALL_PROJECTS_QUERY,
          {},
          [],
          "all projects",
        )
      ).map(({ readWords, ...p }) => ({
        ...p,
        readMinutes: readWords ? Math.max(1, Math.ceil(readWords / READ_WPM)) : undefined,
      }));
  return [...list].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
}

const PROJECT_BY_SLUG_QUERY = `
  *[_type == "project" && slug.current == $slug][0]{
    ${PROJECT_CARD_FIELDS},
    body
  }
`;

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  if (DEMO_ENABLED) {
    const demo = DEMO_PROJECTS.find((p) => p.slug === slug);
    if (demo) return demo;
  }
  return safeFetch<ProjectDetail | null>(PROJECT_BY_SLUG_QUERY, { slug }, null, `project "${slug}"`);
}

const PROJECT_SLUGS_QUERY = `
  *[_type == "project" && defined(slug.current)].slug.current
`;

export async function getProjectSlugs(): Promise<string[]> {
  if (DEMO_ENABLED) return DEMO_PROJECTS.map((p) => p.slug);
  return safeFetch<string[]>(PROJECT_SLUGS_QUERY, {}, [], "project slugs");
}

const WORK_EXPERIENCE_QUERY = `
  *[_type == "workExperience" && defined(startYear)] | order(order asc, startYear desc){
    _id,
    position,
    company,
    startYear,
    endYear,
    current,
    summary
  }
`;

export async function getWorkExperience(): Promise<WorkExperience[]> {
  if (DEMO_ENABLED) return DEMO_WORK_EXPERIENCE;
  return safeFetch<WorkExperience[]>(WORK_EXPERIENCE_QUERY, {}, [], "work experience");
}

const TESTIMONIALS_QUERY = `
  *[_type == "testimonial" && featured == true] | order(order asc, _createdAt desc){
    _id, quote, name, role, company, link
  }
`;

// Floor: if nothing is explicitly featured, fall back to ANY real testimonials
// (newest first) so this trust block never silently disappears. Never fabricated
// — returns only what actually exists in the CMS.
const ANY_TESTIMONIALS_QUERY = `
  *[_type == "testimonial"] | order(order asc, _createdAt desc){
    _id, quote, name, role, company, link
  }
`;

export async function getTestimonials(): Promise<Testimonial[]> {
  if (DEMO_ENABLED) return DEMO_TESTIMONIALS;
  const featured = await safeFetch<Testimonial[]>(TESTIMONIALS_QUERY, {}, [], "testimonials");
  if (featured.length) return featured;
  return safeFetch<Testimonial[]>(ANY_TESTIMONIALS_QUERY, {}, [], "testimonials (fallback)");
}

const STACK_GROUPS_QUERY = `
  *[_type == "stackGroup"] | order(order asc){_id, label, items}
`;

export async function getStackGroups(): Promise<StackGroup[]> {
  if (DEMO_ENABLED) return DEMO_STACK_GROUPS;
  return safeFetch<StackGroup[]>(STACK_GROUPS_QUERY, {}, [], "stack groups");
}

// The contact bubbles. `enabled` lets a channel be parked without deleting it
// (and losing the icon path with it). Falls back to the demo set rather than an
// empty array: a contact stack with no way to reach anyone is worse than a
// slightly stale one.
const SOCIAL_LINKS_QUERY = `
  *[_type == "socialLink" && enabled != false] | order(order asc, _createdAt asc){
    _id, label, href, iconPath, iconViewBox, iconSize, surface
  }
`;

export async function getSocialLinks(): Promise<SocialLink[]> {
  if (DEMO_ENABLED) return DEMO_SOCIAL_LINKS;
  const links = await safeFetch<SocialLink[]>(SOCIAL_LINKS_QUERY, {}, [], "social links");
  return links.length ? links : DEMO_SOCIAL_LINKS;
}

// The homepage grid is capped at four flagships on purpose, so the smaller real
// work lives in a footnote under it. Editable from the CMS rather than baked
// into the component — new small things ship far more often than deploys do.
const ALSO_SHIPPED_QUERY = `
  *[_type == "alsoShipped"] | order(order asc, _createdAt asc){
    _id, name, note, kind, href
  }
`;

export async function getAlsoShipped(): Promise<AlsoShipped[]> {
  if (DEMO_ENABLED) return DEMO_ALSO_SHIPPED;
  return safeFetch<AlsoShipped[]>(ALSO_SHIPPED_QUERY, {}, [], "also shipped");
}

// Singleton: one published `resume` document drives /resume and /cv. Experience,
// projects and the stack are NOT duplicated here — the page composes them from
// the documents that already own them, so nothing can drift.
const RESUME_QUERY = `
  *[_type == "resume"][0]{
    headline,
    summary,
    availability,
    contacts[]{label, value, href},
    education[]{credential, institution, period, note},
    downloads[]{
      label,
      format,
      url,
      filename,
      "fileUrl": file.asset->url,
      "uploadedName": file.asset->originalFilename
    },
    "fileUrl": file.asset->url,
    updated
  }
`;

/** A `downloads` row as it comes out of GROQ, before the href is worked out. */
type RawResumeDownload = {
  label?: string;
  format?: string;
  url?: string;
  filename?: string;
  fileUrl?: string;
  uploadedName?: string;
};

type RawResume = Omit<Resume, "downloads"> & { downloads?: RawResumeDownload[] };

/** Last path segment of a URL or path, query and hash stripped. */
function basename(href: string): string | undefined {
  const path = href.split(/[?#]/)[0];
  return path.slice(path.lastIndexOf("/") + 1) || undefined;
}

// The copy committed to the repo. It is what makes the download unbreakable:
// even with the CMS unreachable and nothing configured, /resume still hands over
// a real file.
const PUBLIC_RESUME_PDF = "/Aadarsh_Upadhyay_Resume.pdf";
const PUBLIC_RESUME_PDF_NAME = "Aadarsh_Upadhyay_Resume.pdf";

/**
 * Turn the CMS rows into links the page can render without thinking. Rows with
 * neither a file nor a link are dropped rather than rendered as dead controls.
 */
function resolveDownloads(raw?: RawResumeDownload[]): ResumeDownload[] {
  return (raw ?? []).flatMap<ResumeDownload>((d) => {
    const source = d.fileUrl ?? d.url;
    if (!source || !d.label) return [];
    const filename = d.filename?.trim() || d.uploadedName || basename(source);
    // Sanity's CDN is another origin, where `download` is ignored; `?dl=` is how
    // you ask it for the attachment header instead.
    const href =
      d.fileUrl && filename ? `${d.fileUrl}?dl=${encodeURIComponent(filename)}` : source;
    return [{ label: d.label, format: d.format?.trim() || "FILE", href, filename }];
  });
}

/** What the control offers when the CMS lists nothing: the committed PDF. */
function fallbackDownloads(fileUrl?: string): ResumeDownload[] {
  return [
    {
      label: "Download the PDF",
      format: "PDF",
      href: fileUrl
        ? `${fileUrl}?dl=${encodeURIComponent(PUBLIC_RESUME_PDF_NAME)}`
        : PUBLIC_RESUME_PDF,
      filename: PUBLIC_RESUME_PDF_NAME,
    },
  ];
}

/**
 * Unlike every other getter here, this one never returns empty. /resume is the
 * page he links from job applications, so a missing document or an unreachable
 * CMS must not hand a recruiter a blank page — it falls through to the mirrored
 * copy in demo-content, which is the same real, verified content, not filler.
 *
 * `downloads` gets the same treatment one level down: an empty or unfilled list
 * still resolves to the PDF committed to /public.
 */
export async function getResume(): Promise<Resume> {
  if (DEMO_ENABLED) return DEMO_RESUME;
  const doc = await safeFetch<RawResume | null>(RESUME_QUERY, {}, null, "resume");
  if (!doc?.headline) return DEMO_RESUME;
  const downloads = resolveDownloads(doc.downloads);
  return { ...doc, downloads: downloads.length ? downloads : fallbackDownloads(doc.fileUrl) };
}
