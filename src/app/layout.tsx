import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { PerfGuard } from "@/components/perf-guard";
import { getSocialLinks } from "@/lib/sanity";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Handwriting face, scoped to the personal signature in the closing section only.
const caveat = Caveat({
  variable: "--font-signature",
  subsets: ["latin"],
});

const SITE_URL = "https://capad.fyi";
const TWITTER = "@aadarsh_io";
const TITLE = "capad — developer tools & desktop apps";
const DESCRIPTION =
  "Aadarsh Upadhyay (capad) builds fast, genuinely-free, open-source developer tools and desktop apps: searchts, GlyphMaps, Grove, and beep-beep-oss. Software engineer and architect.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — capad",
  },
  description: DESCRIPTION,
  keywords: [
    "capad",
    "Aadarsh Upadhyay",
    "developer tools",
    "desktop apps",
    "open source",
    "searchts",
    "GlyphMaps",
    "Grove git client",
    "beep-beep-oss",
    "AI agents",
    "Model Context Protocol",
    "web unlocker",
    "Nothing Phone Glyph Matrix",
    "Tauri",
    "Rust",
    "Next.js",
    "software engineer",
  ],
  authors: [{ name: "Aadarsh Upadhyay", url: SITE_URL }],
  creator: "Aadarsh Upadhyay",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "capad",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "capad — developer tools & desktop apps by Aadarsh Upadhyay",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: TWITTER,
    creator: TWITTER,
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Search engines read this, visitors never see it: the person behind the site
// and the canonical places they exist online, machine-readably.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Aadarsh Upadhyay",
  alternateName: "capad",
  url: SITE_URL,
  image: `${SITE_URL}/opengraph-image.png`,
  email: "mailto:connect@capad.fyi",
  jobTitle: "Software Engineer & Architect",
  description: DESCRIPTION,
  // No `worksFor`: the Appson contract ended 31 Jul 2026, and a structured-data
  // employer claim is read by recruiter tooling as current. `jobTitle` is the
  // discipline, not an employer, so it stays. Add `worksFor` back on the day
  // there is a real answer.
  sameAs: [
    "https://github.com/capad-xyz",
    "https://x.com/aadarsh_io",
  ],
  knowsAbout: [
    "developer tools",
    "desktop apps",
    "open source software",
    "AI agents",
    "Model Context Protocol",
    "web scraping and unlocking",
    "Next.js",
    "Rust",
    "Tauri",
    "Android development",
  ],
};

// The site as an entity, authored by the person above — helps search engines
// tie the domain, brand ("capad"), and maker together for name/brand queries.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "capad",
  alternateName: "Aadarsh Upadhyay",
  url: SITE_URL,
  author: { "@type": "Person", name: "Aadarsh Upadhyay" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetched in the layout rather than per-page: the contact flock is chrome, it
  // rides every route, and one CDN-cached read here beats one per page.
  const socials = await getSocialLinks();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/*
          Every section on every page starts at opacity 0 and is promoted to
          `.in` by the IntersectionObserver in <Reveal>. Reduced-motion is
          already handled in CSS, but "no JavaScript at all" was not: with
          scripting off the observer never runs, nothing is ever promoted, and
          the page renders as a blank sheet.

          That is a real exposure rather than a hypothetical one, because
          glyphmaps.capad.fyi/privacy is the privacy policy the shipped Play
          Store listing points at, and store reviewers and crawlers do not all
          execute JavaScript. A legal page that renders empty to them is worse
          than one that renders unanimated.
        */}
        <noscript>
          <style>{`.reveal-up,.reveal-title{opacity:1!important;transform:none!important;filter:none!important;}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <PerfGuard />
        <SiteShell socials={socials}>{children}</SiteShell>
      </body>
    </html>
  );
}
