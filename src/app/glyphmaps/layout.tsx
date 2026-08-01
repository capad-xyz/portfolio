import type { Metadata } from "next";
import "./glyphmaps.css";

/**
 * Internal mount point for glyphmaps.capad.fyi.
 *
 * `src/proxy.ts` rewrites that hostname onto `/glyphmaps/*`, so nothing links
 * here directly — every href on these pages is a public path (`/`, `/privacy`)
 * and the proxy maps it back. Keeping the internal prefix distinct is also what
 * keeps the two sites' ISR entries apart: the incremental cache is keyed on the
 * resolved route, so `/` and `/glyphmaps` can never collide.
 *
 * The metadata here replaces the capad.fyi values inherited from the root
 * layout — most importantly `metadataBase`, which every relative OG URL below
 * is resolved against.
 */

const SITE_URL = "https://glyphmaps.capad.fyi";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GlyphMaps — navigation on the Nothing Glyph Matrix",
    template: "%s — GlyphMaps",
  },
  applicationName: "GlyphMaps",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "GlyphMaps",
  },
  robots: { index: true, follow: true },
};

export default function GlyphmapsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
