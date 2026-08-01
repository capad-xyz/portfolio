import type { Project } from "./sanity";

/**
 * One identity, referenced everywhere.
 *
 * The site used to emit a fresh inline `Person` on each page that needed an
 * author: one in the layout, another inside the WebSite node, another on the
 * GlyphMaps page. To a search engine those are three unrelated people who
 * happen to share a name — nothing in the markup says they are the same entity,
 * so nothing ties "capad" to the person, and neither of them to the projects.
 *
 * Stable `@id` values fix that. Every node below is declared once with an id,
 * and every other reference is `{"@id": ...}` pointing at it. That is what turns
 * a pile of separate JSON-LD blobs into one graph: the person authored the
 * site, the site publishes the projects, the projects are authored by the
 * person, and a query for the brand name can walk to any of it.
 *
 * The ids are URL fragments on the canonical origin by convention. They are
 * identifiers, not links — nothing has to resolve at `/#person`.
 */

export const SITE_URL = "https://capad.fyi";

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Reference the person from any other node, without restating them. */
export const authorRef = { "@id": PERSON_ID } as const;

/** A project's stable identity, reachable from either host. */
export const projectId = (slug: string) => `${SITE_URL}/work/${slug}#project`;

/**
 * `sameAs` is what lets a search engine merge this Person with the GitHub, X and
 * LinkedIn profiles it already knows about, so it is the single highest-value
 * field here — and the easiest to let rot. It is derived from the same CMS
 * documents that render the contact bubbles rather than retyped, so adding a
 * profile in the Studio adds it to the identity graph too, and a typo can only
 * happen in one place.
 */
export function personNode(description: string, sameAs: string[] = []) {
  const profiles = [...new Set([...sameAs, "https://pypi.org/project/searchts/"])];

  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Aadarsh Upadhyay",
    // Both spellings people actually search. "capad" is the handle the work
    // ships under, so it has to be an alias of the person and not only the
    // brand, or a search for it resolves to a site with no human attached.
    alternateName: ["capad", "capad-xyz"],
    url: SITE_URL,
    mainEntityOfPage: SITE_URL,
    image: `${SITE_URL}/opengraph-image.png`,
    email: "mailto:connect@capad.fyi",
    jobTitle: "Software Engineer & Architect",
    description,
    // No `worksFor`: the Appson contract ended 31 Jul 2026, and a structured-data
    // employer claim is read by recruiter tooling as current. `jobTitle` is the
    // discipline, not an employer, so it stays. Add `worksFor` back on the day
    // there is a real answer.
    sameAs: profiles,
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
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "capad",
    alternateName: ["capad.fyi", "Aadarsh Upadhyay"],
    url: SITE_URL,
    inLanguage: "en",
    author: authorRef,
    publisher: authorRef,
    copyrightHolder: authorRef,
  };
}

/**
 * One project, defined once and emitted from two places: its own case study and
 * the homepage list. Both must agree, and before this existed they could not —
 * the case study described the project while the homepage said nothing about
 * it, and each page invented its own inline author.
 *
 * `SoftwareApplication` (rather than the more literal `SoftwareSourceCode`) is
 * kept from the original case-study markup on purpose: it is the type that
 * carries `offers`, and a free `offers` node is what makes these eligible for
 * rich results at all. The `author` edge to the single person id is the part
 * that matters here, since it is what makes "what did capad make" answerable
 * from the markup instead of inferred from prose.
 */
export function projectNode(
  project: Project,
  slug: string,
  licenseUrl?: Record<string, string>,
  isContribution = false,
) {
  const repo = project.links?.find((l) => l.kind === "code")?.href;
  const isAndroid = project.tags?.includes("android");
  const license =
    project.license && licenseUrl?.[project.license]
      ? licenseUrl[project.license]
      : undefined;

  return {
    "@type": "SoftwareApplication",
    "@id": projectId(slug),
    name: project.title,
    description: project.oneLiner,
    applicationCategory: "DeveloperApplication",
    operatingSystem: isAndroid ? "Android" : "Windows, macOS, Linux",
    url: `${SITE_URL}/work/${slug}`,
    // Not everything on this site is his. wmux is someone else's project he
    // shipped a fix to, and the grid says so in prose; structured data has to
    // say it too, or the markup quietly claims authorship of another person's
    // work in the one place a recruiter's tooling repeats verbatim. The source
    // of truth is the `alsoShipped` entry's kind, so the page and the markup
    // cannot disagree.
    ...(isContribution
      ? { contributor: authorRef }
      : { author: authorRef, creator: authorRef, maintainer: authorRef }),
    isPartOf: { "@id": WEBSITE_ID },
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    ...(repo ? { codeRepository: repo } : {}),
    ...(project.tags?.length ? { keywords: project.tags.join(", ") } : {}),
    ...(project.year ? { datePublished: project.year } : {}),
    ...(license ? { license } : {}),
  };
}

/**
 * Site-wide identity, emitted from the layout so every page on the site carries
 * it. One `@graph` rather than sibling <script> tags: the ids resolve against
 * each other inside a single parse.
 */
export function identityGraph(description: string, sameAs: string[] = []) {
  return {
    "@context": "https://schema.org",
    "@graph": [personNode(description, sameAs), websiteNode()],
  };
}

/**
 * The homepage's own claim: this page is about that person, and here is
 * everything they made. The person and site are NOT restated here — the layout
 * already declared them, and these reference the same ids, which is the whole
 * point of having ids. Restating would put two nodes with one id in the page.
 */
export function homeGraph(projects: Project[], contributed: Set<string> = new Set()) {
  const authored = projects.filter((p) => !contributed.has(p.title.toLowerCase()));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/#profilepage`,
        url: SITE_URL,
        name: "capad — Aadarsh Upadhyay",
        about: authorRef,
        mainEntity: authorRef,
        isPartOf: { "@id": WEBSITE_ID },
      },
      ...projects.map((p) =>
        projectNode(p, p.slug, undefined, contributed.has(p.title.toLowerCase())),
      ),
      {
        // Only the work he actually made. This list is the answer to "what did
        // capad build", so a project he contributed a fix to does not belong in
        // it — it is still in the graph above, correctly, as a contribution.
        "@type": "ItemList",
        "@id": `${SITE_URL}/#projects`,
        name: "Projects by Aadarsh Upadhyay (capad)",
        itemListElement: authored.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: { "@id": projectId(p.slug) },
        })),
      },
    ],
  };
}

/**
 * The resume page, where the person is the subject rather than the author.
 *
 * This re-opens the SAME person id the layout already declared and adds the
 * things only this page knows: the role, the employment history, the degree.
 * JSON-LD merges nodes by id, so this reads as more facts about one person
 * rather than a second person, which is exactly why the ids exist.
 *
 * Employment goes through the Role pattern (Person -> OrganizationRole ->
 * Organization) so each entry carries its own dates. That matters here: every
 * one of these is finished, and a bare `worksFor: Organization` is read by
 * recruiter tooling as a current job. Dated roles say "held", not "holds".
 */
export function resumeGraph(
  headline: string,
  work: { position: string; company: string; startYear: string; endYear?: string }[],
  skills: string[],
  education: { credential: string; institution: string }[] = [],
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}/resume#page`,
        url: `${SITE_URL}/resume`,
        name: "Aadarsh Upadhyay — resume",
        about: authorRef,
        mainEntity: authorRef,
        isPartOf: { "@id": WEBSITE_ID },
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        hasOccupation: {
          "@type": "Occupation",
          name: headline || "Software Engineer & Architect",
          // O*NET code for Software Developers. A machine-readable occupation
          // beats a job title string, which is free text nothing can resolve.
          occupationalCategory: "15-1252.00",
          ...(skills.length ? { skills: skills.join(", ") } : {}),
        },
        worksFor: work.map((w) => ({
          "@type": "OrganizationRole",
          roleName: w.position,
          startDate: w.startYear,
          ...(w.endYear ? { endDate: w.endYear } : {}),
          worksFor: { "@type": "Organization", name: w.company },
        })),
        ...(education.length
          ? {
              alumniOf: education.map((e) => ({
                "@type": "EducationalOrganization",
                name: e.institution,
              })),
            }
          : {}),
      },
    ],
  };
}

/**
 * JSON.stringify does not escape `<`, and these payloads carry CMS text, so a
 * stray `</script>` in a Sanity field would close the tag early. Every emitter
 * goes through here rather than remembering to do it at each call site.
 */
export const jsonLdHtml = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");
