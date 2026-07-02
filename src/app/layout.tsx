import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";

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
const TITLE = "capad — developer tools & desktop apps";
const DESCRIPTION =
  "Aadarsh Upadhyay (capad): fast, genuinely-free developer tools and desktop apps.";

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
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
  email: "mailto:connect@capad.fyi",
  jobTitle: "Software Engineer & Architect",
  sameAs: ["https://github.com/capad-xyz"],
  knowsAbout: ["developer tools", "desktop apps", "open source software"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
