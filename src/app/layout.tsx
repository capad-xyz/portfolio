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

// The Person/WebSite identity markup used to live here. It moved to
// <CapadJsonLd/>, rendered by the capad.fyi homepage: this layout is shared
// with glyphmaps.capad.fyi, so emitting it here told crawlers that the
// GlyphMaps product page belongs to a WebSite whose url is capad.fyi. See
// src/components/capad-json-ld.tsx.

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
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <PerfGuard />
        <SiteShell socials={socials}>{children}</SiteShell>
      </body>
    </html>
  );
}
