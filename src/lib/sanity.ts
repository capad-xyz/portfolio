import { createClient, type ClientPerspective } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { PortableTextBlock } from "@portabletext/types";
import { DEMO_PROJECTS, DEMO_TESTIMONIALS } from "./demo-content";

// Demo content shows only when a query returns nothing — real CMS data always
// wins. On in dev / any non-production build, or force-on in prod with
// NEXT_PUBLIC_DEMO_CONTENT=1 for a staging preview. See ./demo-content.
const DEMO_ENABLED =
  process.env.NEXT_PUBLIC_DEMO_CONTENT === "1" ||
  process.env.NODE_ENV !== "production";

export const sanity = createClient({
  projectId: "v6eklfsd",
  dataset: "production",
  apiVersion: "2025-01-01",
  useCdn: true,
  perspective: "published" as ClientPerspective,
});

const builder = imageUrlBuilder(sanity);
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
  metrics?: ProjectMetric[];
  tags?: string[];
  year?: string;
  license?: string;
  links?: ProjectLink[];
  /** True when a case-study body exists, so the card can show a "read the story" link. */
  hasStory?: boolean;
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

// Shared card-level projection. `hasStory` lets the grid link to a case study
// only when one actually exists; `body` is added on top for the detail query.
const PROJECT_CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  status,
  oneLiner,
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

export async function getFeaturedProjects(): Promise<Project[]> {
  const projects = await sanity.fetch<Project[]>(FEATURED_PROJECTS_QUERY);
  const list = projects.length || !DEMO_ENABLED ? projects : DEMO_PROJECTS;
  return [...list].sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
}

const PROJECT_BY_SLUG_QUERY = `
  *[_type == "project" && slug.current == $slug][0]{
    ${PROJECT_CARD_FIELDS},
    body
  }
`;

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const project = await sanity.fetch<ProjectDetail | null>(PROJECT_BY_SLUG_QUERY, { slug });
  if (project) return project;
  if (!DEMO_ENABLED) return null;
  return DEMO_PROJECTS.find((p) => p.slug === slug) ?? null;
}

const PROJECT_SLUGS_QUERY = `
  *[_type == "project" && defined(slug.current)].slug.current
`;

export async function getProjectSlugs(): Promise<string[]> {
  const slugs = await sanity.fetch<string[]>(PROJECT_SLUGS_QUERY);
  if (slugs.length || !DEMO_ENABLED) return slugs;
  return DEMO_PROJECTS.map((p) => p.slug);
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
  return sanity.fetch<WorkExperience[]>(WORK_EXPERIENCE_QUERY);
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
  const featured = await sanity.fetch<Testimonial[]>(TESTIMONIALS_QUERY);
  if (featured.length) return featured;
  const any = await sanity.fetch<Testimonial[]>(ANY_TESTIMONIALS_QUERY);
  if (any.length || !DEMO_ENABLED) return any;
  return DEMO_TESTIMONIALS;
}

const STACK_GROUPS_QUERY = `
  *[_type == "stackGroup"] | order(order asc){_id, label, items}
`;

export async function getStackGroups(): Promise<StackGroup[]> {
  return sanity.fetch<StackGroup[]>(STACK_GROUPS_QUERY);
}
