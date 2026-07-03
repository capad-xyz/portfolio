import { Hero } from "@/components/hero";
import { LiquidIntro } from "@/components/liquid-intro";
import { LiquidLens } from "@/components/liquid-lens";
import { FeaturedWork } from "@/components/featured-work";
import { About } from "@/components/about";
import { WorkExperience } from "@/components/work-experience";
import { Stack } from "@/components/stack";
import { Testimonials } from "@/components/testimonials";
import { Contact } from "@/components/contact";

// ISR: regenerate at most every 5 min so CMS edits appear without a redeploy.
export const revalidate = 300;

export default function Home() {
  return (
    <main id="main" className="relative z-10">
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
  );
}
