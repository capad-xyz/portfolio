const SITE_URL = "https://capad.fyi";
const DESCRIPTION =
  "Aadarsh Upadhyay (capad) builds fast, genuinely-free, open-source developer tools and desktop apps: searchts, GlyphMaps, Grove, and beep-beep-oss. Software engineer and architect.";

/**
 * capad.fyi's identity markup: the person behind the site, and the site as an
 * entity authored by them. Search engines read this, visitors never see it.
 *
 * Rendered by the capad.fyi homepage rather than the root layout, and that
 * placement is the point. The layout is shared with glyphmaps.capad.fyi, so
 * emitting it there told a crawler that the GlyphMaps product page belongs to a
 * WebSite whose url is capad.fyi — a different property claiming a page it does
 * not own. The homepage is also simply where Person/WebSite markup belongs;
 * repeating it on every route was redundant.
 */
export function CapadJsonLd() {
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
    sameAs: ["https://github.com/capad-xyz", "https://x.com/aadarsh_io"],
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

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "capad",
    alternateName: "Aadarsh Upadhyay",
    url: SITE_URL,
    author: { "@type": "Person", name: "Aadarsh Upadhyay" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
    </>
  );
}
