import type { ReactNode } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllProjects,
  getResume,
  getStackGroups,
  getWorkExperience,
  type ProjectStatus,
  type WorkExperience as WE,
} from "@/lib/sanity";
import { resumeGraph, jsonLdHtml } from "@/lib/jsonld";
import { LiquidButton } from "@/components/liquid-button";
import { OpenContactButton } from "@/components/open-contact-button";
import { ResumeDownloads } from "@/components/resume-downloads";
import { Reveal } from "@/components/reveal";

// ISR: regenerate at most every 5 min so CMS edits appear without a redeploy.
export const revalidate = 300;

const NAME = "Aadarsh Upadhyay";

const DESCRIPTION =
  "The resume of Aadarsh Upadhyay (capad) — software engineer and architect. Experience, open-source work, and stack, or download the one-page PDF.";

export const metadata: Metadata = {
  title: "Resume",
  description: DESCRIPTION,
  alternates: { canonical: "/resume" },
  openGraph: {
    type: "profile",
    url: "/resume",
    title: "Resume — capad",
    description: DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume — capad",
    description: DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  done: "shipped",
  ongoing: "in progress",
  archived: "archived",
};

/** Resume periods want a span, not the timeline's big-year treatment. */
function period(w: WE) {
  if (w.current) return `${w.startYear} - now`;
  if (w.endYear && w.endYear !== w.startYear) return `${w.startYear} - ${w.endYear}`;
  return w.startYear;
}

/** mailto:/tel: must open in place; only real pages get a new tab. */
const isHttp = (href: string) => /^https?:/i.test(href);

/**
 * The resume, at /resume and /cv.
 *
 * It composes rather than duplicates: experience comes from `workExperience`,
 * the open-source list from `project`, the toolbox from `stackGroup`, and only
 * the parts with no existing home — summary, availability, contact row,
 * education, the PDF itself — come from the `resume` singleton. Nothing here can
 * drift out of sync with the homepage, because it is the same content.
 *
 * The download is the page's real job. It sits directly under the name, above a
 * single line of prose, because a recruiter with thirty tabs open should be able
 * to take the file and go. Which formats it offers is a CMS list
 * (`resume.downloads`), not a constant here — see components/resume-downloads.
 */
export default async function ResumePage() {
  const [resume, work, projects, stack] = await Promise.all([
    getResume(),
    getWorkExperience(),
    getAllProjects(),
    getStackGroups(),
  ]);

  return (
    <main
      id="main"
      className="relative z-10 mx-auto max-w-4xl px-6 py-28 md:py-36 print:max-w-none print:px-0 print:py-0"
    >
      {/* The page a search for the name should resolve to: it is the one that
          says who he is, what the role is, and where the work happened. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            resumeGraph(
              resume.headline,
              work,
              stack.flatMap((g) => g.items),
              resume.education ?? [],
            ),
          ),
        }}
      />
      <Reveal>
        <Link
          href="/"
          className="reveal-up section-eyebrow inline-flex items-center gap-2 transition hover:text-[var(--ink)] print:hidden"
        >
          <span aria-hidden>&larr;</span> home
        </Link>

        <header className="reveal-title mt-8 print:mt-0">
          <p className="section-eyebrow">resume</p>
          <h1 className="mt-4 text-[clamp(38px,6.5vw,72px)] font-bold leading-[0.92] tracking-[-0.03em]">
            {NAME}
          </h1>
          <p className="mt-3 text-[clamp(17px,2vw,22px)] leading-[1.3] text-[var(--ink)]/80">
            {resume.headline}
          </p>
          {resume.availability && (
            <p className="mt-3 font-mono text-[12px] leading-[1.7] tracking-[0.04em] text-[var(--muted)]">
              {resume.availability}
            </p>
          )}
        </header>

        {/* Above everything, including the prose: the whole point of this page is
            that a recruiter can take the file without reading it first. One
            button, one format, no decision — the PDF is what they came for.
            Anyone wanting DOCX or Markdown finds all three at the close. */}
        <div className="reveal-up mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 print:hidden">
          <ResumeDownloads options={resume.downloads} variant="single" />
          {resume.updated && (
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {resume.updated}
            </span>
          )}
        </div>

        {/* On paper a download button is a dead end; the address it came from is
            the one thing worth carrying onto the page. */}
        <p className="hidden font-mono text-[11px] tracking-[0.16em] text-[var(--muted)] print:mt-4 print:block">
          capad.fyi/resume
        </p>

        {resume.contacts && resume.contacts.length > 0 && (
          <ul className="reveal-up glass lensable mt-8 grid gap-x-8 gap-y-5 rounded-[20px] px-7 py-6 sm:grid-cols-2 md:grid-cols-3 print:mt-6 print:rounded-none print:px-0 print:py-4">
            {resume.contacts.map((c) => (
              <li key={`${c.label}-${c.value}`} className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  {c.label}
                </p>
                {c.href ? (
                  <a
                    href={c.href}
                    {...(isHttp(c.href)
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="mt-1.5 block truncate text-[14px] text-[var(--ink)] underline decoration-[var(--muted)]/40 underline-offset-4 transition hover:decoration-[var(--ink)]"
                  >
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-1.5 truncate text-[14px] text-[var(--ink)]">{c.value}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="reveal-up mt-10 max-w-2xl text-[clamp(15px,1.6vw,18px)] leading-[1.65] text-[var(--ink)]/85 [text-wrap:pretty]">
          {resume.summary}
        </p>

        <div className="mt-14 flex flex-col gap-12 print:mt-8 print:gap-8">
          {work.length > 0 && (
            <Section label="experience">
              <ol className="flex flex-col gap-9">
                {work.map((w) => (
                  <li key={w._id} className="reveal-up break-inside-avoid">
                    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                      {period(w)}
                    </p>
                    <h3 className="mt-1.5 text-[clamp(19px,2.2vw,25px)] font-bold leading-[1.15] tracking-[-0.015em]">
                      {w.position}
                    </h3>
                    <p className="mt-1 text-[15px] text-[var(--muted)]">{w.company}</p>
                    {w.summary && (
                      <p className="mt-3 max-w-2xl text-[15px] leading-[1.6] text-[var(--ink)]/75 [text-wrap:pretty]">
                        {w.summary}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {projects.length > 0 && (
            <Section label="open source">
              <ol className="flex flex-col gap-8">
                {projects.map((p) => (
                  <li key={p._id} className="reveal-up break-inside-avoid">
                    <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
                      <h3 className="text-[clamp(18px,2vw,22px)] font-bold leading-[1.15] tracking-[-0.015em]">
                        {p.hasStory ? (
                          <Link
                            href={`/work/${p.slug}`}
                            className="transition-opacity hover:opacity-70"
                          >
                            {p.title}
                          </Link>
                        ) : (
                          p.title
                        )}
                      </h3>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                        {[STATUS_LABEL[p.status], p.year, p.license]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                    <p className="mt-2 max-w-2xl text-[15px] leading-[1.55] text-[var(--ink)]/75 [text-wrap:pretty]">
                      {p.oneLiner}
                    </p>
                    {p.links && p.links.length > 0 && (
                      <p className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-[11px] uppercase tracking-[0.16em]">
                        {p.links.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="print-url text-[var(--ink)]/65 underline decoration-[var(--muted)]/40 underline-offset-4 transition hover:text-[var(--ink)] hover:decoration-[var(--ink)]"
                          >
                            {l.label}
                          </a>
                        ))}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {stack.length > 0 && (
            <Section label="stack">
              <div className="flex flex-col gap-6">
                {stack.map((g) => (
                  <div key={g._id} className="reveal-up break-inside-avoid">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                      {g.label}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {g.items?.map((t) => (
                        <span
                          key={t}
                          className="chip lensable px-3.5 py-1.5 text-[12px] lowercase tracking-[0.04em]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {resume.education && resume.education.length > 0 && (
            <Section label="education">
              <ul className="flex flex-col gap-6">
                {resume.education.map((e) => (
                  <li
                    key={`${e.credential}-${e.institution}`}
                    className="reveal-up break-inside-avoid"
                  >
                    {e.period && (
                      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                        {e.period}
                      </p>
                    )}
                    <h3 className="mt-1.5 text-[18px] font-bold leading-[1.2] tracking-[-0.015em]">
                      {e.credential}
                    </h3>
                    <p className="mt-1 text-[15px] text-[var(--muted)]">{e.institution}</p>
                    {e.note && (
                      <p className="mt-2 max-w-2xl text-[14px] leading-[1.6] text-[var(--ink)]/75">
                        {e.note}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        <div className="reveal-up mt-16 flex flex-wrap items-center gap-4 print:hidden">
          {/* The closing CTA offers every format behind one button: by here the
              reader has chosen deliberately, and a second "Download the PDF"
              would just read as the header's button repeated. */}
          <ResumeDownloads options={resume.downloads} variant="menu" />
          <OpenContactButton variant="outline" className="px-6 py-[14px] text-[15px] font-medium">
            Start a conversation
          </OpenContactButton>
          <LiquidButton
            href="/projects"
            variant="outline"
            className="px-6 py-[14px] text-[15px] font-medium"
          >
            The build stories
          </LiquidButton>
        </div>
      </Reveal>
    </main>
  );
}

/**
 * Label column on the left, content on the right — the same shape the Stack
 * section uses on the homepage, so the resume reads as part of the site rather
 * than a document pasted into it.
 */
function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="grid gap-5 border-t border-black/10 pt-10 md:grid-cols-[160px_1fr] md:gap-x-10 print:pt-6">
      <h2 className="reveal-up font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--muted)] md:pt-1">
        {label}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
