import type { PortableTextBlock } from "@portabletext/types";
import { DEMO_ENABLED, safeFetch } from "./sanity";
import { GLYPHMAPS_DEMO_PAGE, GLYPHMAPS_DEMO_PRIVACY } from "./glyphmaps-demo";
import type { Maneuver } from "./glyph-matrix";

/**
 * Content layer for glyphmaps.capad.fyi.
 *
 * Same contract as `lib/sanity.ts`: every query goes through `safeFetch`, so a
 * flaky CMS renders a fallback instead of 500ing the page or failing the build,
 * and every section has a demo mirror in `glyphmaps-demo.ts` that keeps the
 * site rendering when Sanity is unreachable. Demo content OVERRIDES the CMS in
 * non-production builds, exactly as the main site does.
 *
 * The demo mirror is not filler — it is the real, source-verified copy, kept in
 * sync with what is published in Sanity.
 */

export type GmCta = { label: string; href: string; variant?: "glass" | "outline" };
export type GmMetric = { value: string; label: string };

export type GmImage = {
  /** Resolved URL — a Sanity asset URL in production, a /public path in demo. */
  url: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
};

export type GmSection =
  | {
      _type: "gmFeature";
      _key: string;
      eyebrow?: string;
      title: string;
      body: string;
      maneuver?: Maneuver;
      flip?: boolean;
    }
  | {
      _type: "gmShowcase";
      _key: string;
      eyebrow?: string;
      title: string;
      body?: string;
      shots?: GmImage[];
    }
  | {
      _type: "gmDownload";
      _key: string;
      eyebrow?: string;
      title: string;
      body?: string;
      options?: { label: string; href: string; meta?: string; primary?: boolean }[];
      requirements?: string[];
    }
  | {
      _type: "gmSpecs";
      _key: string;
      eyebrow?: string;
      title: string;
      rows?: { label: string; value: string }[];
    }
  | {
      _type: "gmFaq";
      _key: string;
      eyebrow?: string;
      title: string;
      items?: { question: string; answer: string }[];
    };

export type GlyphmapsPage = {
  heroEyebrow?: string;
  heroTitle: string;
  heroTagline: string;
  heroNote?: string;
  heroManeuvers?: Maneuver[];
  ctas?: GmCta[];
  metrics?: GmMetric[];
  sections?: GmSection[];
  closingTitle?: string;
  closingBody?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: { url: string } | null;
};

export type GlyphmapsPrivacy = {
  title: string;
  lastUpdated: string;
  summary: string;
  body: PortableTextBlock[];
  contactEmail: string;
  seoDescription?: string;
};

// `asset->url` resolves the image straight to a CDN URL so the page never has
// to ship the image-url builder to render a screenshot.
const IMAGE_FIELDS = `
  "url": image.asset->url,
  "width": image.asset->metadata.dimensions.width,
  "height": image.asset->metadata.dimensions.height,
  alt,
  caption
`;

const PAGE_QUERY = `
  *[_type == "glyphmapsPage"][0]{
    heroEyebrow,
    heroTitle,
    heroTagline,
    heroNote,
    heroManeuvers,
    ctas[]{label, href, variant},
    metrics[]{value, label},
    sections[]{
      _type,
      _key,
      eyebrow,
      title,
      body,
      maneuver,
      flip,
      shots[]{${IMAGE_FIELDS}},
      options[]{label, href, meta, primary},
      requirements,
      rows[]{label, value},
      items[]{question, answer}
    },
    closingTitle,
    closingBody,
    seoTitle,
    seoDescription,
    "ogImage": ogImage.asset->{url}
  }
`;

const PRIVACY_QUERY = `
  *[_type == "glyphmapsPrivacy"][0]{
    title,
    lastUpdated,
    summary,
    body,
    contactEmail,
    seoDescription
  }
`;

export async function getGlyphmapsPage(): Promise<GlyphmapsPage> {
  if (DEMO_ENABLED) return GLYPHMAPS_DEMO_PAGE;
  const page = await safeFetch<GlyphmapsPage | null>(
    PAGE_QUERY,
    {},
    null,
    "glyphmaps page",
  );
  // The demo mirror doubles as the floor: an empty or unreachable CMS still
  // renders a complete, accurate page rather than a blank product site.
  return page ?? GLYPHMAPS_DEMO_PAGE;
}

export async function getGlyphmapsPrivacy(): Promise<GlyphmapsPrivacy> {
  if (DEMO_ENABLED) return GLYPHMAPS_DEMO_PRIVACY;
  const doc = await safeFetch<GlyphmapsPrivacy | null>(
    PRIVACY_QUERY,
    {},
    null,
    "glyphmaps privacy",
  );
  return doc ?? GLYPHMAPS_DEMO_PRIVACY;
}
