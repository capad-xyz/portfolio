import { Hero } from "@/components/hero";
import { LiquidLens } from "@/components/liquid-lens";
import { Ledger } from "@/components/ledger";
import { FeaturedWork } from "@/components/featured-work";
import { WorkExperience } from "@/components/work-experience";
import { Contact } from "@/components/contact";
import { DotNav } from "@/components/dot-nav";
import { CapadJsonLd } from "@/components/capad-json-ld";
import { getAllProjects, getAlsoShipped, getSocialLinks } from "@/lib/sanity";

// ISR: regenerate at most every 5 min so CMS edits appear without a redeploy.
export const revalidate = 300;

/**
 * The spine: cover -> ledger -> work -> experience -> colophon. Five stops, down
 * only.
 *
 * The reordering is the change. Proof moved UP and biography moved DOWN, and the
 * standalone sections went away: testimonials now ride on the project each quote
 * is about, and the manifesto closes the timeline instead of sitting in its own
 * section competing with it. The stack is gone from this page entirely — eight
 * groups of nouns is an appendix, and it is all still at /resume.
 */
export default async function Home() {
  // Every project, not just the featured four: this list is what answers "what
  // has capad made" for a machine, and there is no reason to hide the rest of
  // it from that answer just because the grid only has room for four.
  const [projects, alsoShipped, socials] = await Promise.all([
    getAllProjects(),
    getAlsoShipped(),
    getSocialLinks(),
  ]);

  // The footnote already distinguishes "built" from "contributed" for readers.
  // Same source drives the markup, so the two can never disagree about whose
  // project something is.
  const contributed = new Set(
    alsoShipped.filter((a) => a.kind === "contributed").map((a) => a.name.toLowerCase()),
  );

  return (
    <>
      <main id="main" className="relative z-10">
        <CapadJsonLd projects={projects} socials={socials} contributed={contributed} />
        <LiquidLens />
        <Hero />
        <Ledger />
        <FeaturedWork />
        <WorkExperience />
        <Contact />
      </main>
      {/* The section spine belongs to this page, not the shell: these are the
          anchors it scroll-spies, and mounting it here keeps that a server-side
          decision. See the note in site-shell.tsx. */}
      <DotNav />
    </>
  );
}