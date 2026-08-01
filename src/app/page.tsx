import { Hero } from "@/components/hero";
import { LiquidIntro } from "@/components/liquid-intro";
import { LiquidLens } from "@/components/liquid-lens";
import { FeaturedWork } from "@/components/featured-work";
import { About } from "@/components/about";
import { WorkExperience } from "@/components/work-experience";
import { Stack } from "@/components/stack";
import { Testimonials } from "@/components/testimonials";
import { Contact } from "@/components/contact";
import { DotNav } from "@/components/dot-nav";
import { CapadJsonLd } from "@/components/capad-json-ld";
import { getAllProjects, getAlsoShipped, getSocialLinks } from "@/lib/sanity";

// ISR: regenerate at most every 5 min so CMS edits appear without a redeploy.
export const revalidate = 300;

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
      <LiquidIntro />
      <LiquidLens />
      {/* Persuasion order: proof stays contiguous (work → experience) because
          visitors hunt evidence before biography; About converts credibility
          into affinity once it's earned; Stack is the technical appendix; and
          Testimonials sit last before Contact so the peak-end note walking
          into the ask is third-party praise, not a tool list. */}
      <Hero />
      <FeaturedWork />
      <WorkExperience />
      <About />
      <Stack />
      <Testimonials />
      <Contact />
    </main>
    {/* The section spine belongs to this page, not the shell: these are the
        anchors it scroll-spies, and mounting it here keeps that a server-side
        decision. See the note in site-shell.tsx. */}
    <DotNav />
    </>
  );
}
