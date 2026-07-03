import Link from "next/link";
import { getFeaturedProjects } from "@/lib/sanity";
import { ProjectCard } from "./project-card";
import { Reveal } from "./reveal";

/**
 * Featured work. Server component; fetches projects from Sanity at request time
 * (CDN-cached). The four flagships get the big grid; everything else lives at
 * /projects (linked below the grid), so adding a fifth project in the CMS never
 * crowds the homepage.
 */
const COUNT_WORDS = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
];
const countWord = (n: number) => COUNT_WORDS[n] ?? String(n);

export async function FeaturedWork() {
  const projects = await getFeaturedProjects();
  const shipped = projects.filter((p) => p.status === "done").length;
  const ongoing = projects.filter((p) => p.status === "ongoing").length;

  return (
    <section id="work" className="relative z-10 mx-auto max-w-6xl px-6 py-28 md:py-36">
      <Reveal>
        <header className="reveal-title mb-14 flex flex-col items-center gap-4 text-center">
          <p className="section-eyebrow">selected work</p>
          {/* whole sentences as template strings: this JSX compiler drops the
              space between an expression and adjacent text */}
          <h2 className="text-[clamp(34px,5vw,58px)] font-bold leading-[0.95] tracking-[-0.03em]">
            {`${countWord(projects.length)} things I’m building.`}
          </h2>
          <p className="max-w-md text-[var(--muted)]">
            {`${countWord(shipped)} shipped, ${countWord(ongoing).toLowerCase()} in progress. Status updates live, straight from the CMS.`}
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 md:gap-7">
          {projects.map((p, i) => (
            <ProjectCard key={p._id} p={p} index={i + 1} />
          ))}
        </div>

        {/* The smaller shipped delights — real, just not flagship-sized. A quiet
            footnote keeps the grid honest about the four while showing range. */}
        <p className="reveal-up mx-auto mt-10 max-w-2xl text-center font-mono text-[12px] leading-[2] tracking-[0.04em] text-[var(--muted)]">
          also shipped, smaller: <span className="text-[var(--ink)]/75">CoffeeBreath</span> — a
          Rainmeter music widget that breathes with the song&apos;s album art ·{" "}
          <span className="text-[var(--ink)]/75">Discord Voice Overlay</span> — a glass
          desktop overlay for live voice control
        </p>

        <div className="reveal-up mt-8 text-center">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--ink)]/70 transition hover:text-[var(--ink)]"
          >
            read the build stories
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              &rarr;
            </span>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
