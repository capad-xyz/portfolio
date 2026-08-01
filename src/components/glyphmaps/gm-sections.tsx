import { Reveal } from "@/components/reveal";
import { LiquidButton } from "@/components/liquid-button";
import { GlyphMatrix } from "@/components/glyph-matrix";
import type { GmImage, GmSection } from "@/lib/glyphmaps-content";

/**
 * Renders the CMS `sections` array in whatever order the Studio returns it, so
 * reordering a product page is a drag in Sanity rather than a deploy. Each
 * block is a server component wrapped in the shared `Reveal` island, which is
 * the same scroll choreography every capad.fyi section uses.
 */

function Eyebrow({ children }: { children?: string }) {
  if (!children) return null;
  return <span className="section-eyebrow reveal-up">{children}</span>;
}

/**
 * Sanity serves resized derivatives from the asset URL, so ask for one rather
 * than shipping a 1080px-wide PNG to a 300px slot. Local /public paths (the
 * demo mirror) are passed through untouched.
 */
function sized(url: string, width: number) {
  if (!url.startsWith("https://cdn.sanity.io")) return url;
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}w=${width}&q=80&auto=format`;
}

function Shot({ shot }: { shot: GmImage }) {
  return (
    <figure className="gm-shot reveal-up">
      <div className="gm-shot-frame">
        {/* Plain <img>: these are the only images on the site, they are already
            correctly sized, and the Worker runs without an image optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sized(shot.url, 720)}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          loading="lazy"
          decoding="async"
        />
      </div>
      {shot.caption && <figcaption>{shot.caption}</figcaption>}
    </figure>
  );
}

export function GmSections({ sections }: { sections: GmSection[] }) {
  return (
    <>
      {sections.map((section) => (
        <Section key={section._key} section={section} />
      ))}
    </>
  );
}

function Section({ section }: { section: GmSection }) {
  switch (section._type) {
    case "gmFeature":
      return (
        <section className="gm-section" id={section._key}>
          <div className="gm-wrap">
            <Reveal>
              <div className={`gm-feature${section.flip ? " is-flipped" : ""}`}>
                <div>
                  <Eyebrow>{section.eyebrow}</Eyebrow>
                  <h2 className="gm-feature-title reveal-title">{section.title}</h2>
                  <p className="gm-feature-body reveal-up">{section.body}</p>
                </div>
                {section.maneuver && (
                  <div className="gm-feature-visual reveal-up">
                    <GlyphMatrix maneuver={section.maneuver} distance="" />
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      );

    case "gmShowcase":
      return (
        <section className="gm-section" id={section._key}>
          <div className="gm-wrap">
            <Reveal>
              <div className="mx-auto mb-14 max-w-[620px] text-center">
                <Eyebrow>{section.eyebrow}</Eyebrow>
                <h2 className="gm-feature-title reveal-title">{section.title}</h2>
                {section.body && <p className="gm-feature-body reveal-up">{section.body}</p>}
              </div>
              <div className="gm-shots">
                {section.shots?.map((shot) => (
                  <Shot key={shot.url} shot={shot} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      );

    case "gmSpecs":
      return (
        <section className="gm-section" id={section._key}>
          <div className="gm-narrow">
            <Reveal>
              <div className="mb-10 text-center">
                <Eyebrow>{section.eyebrow}</Eyebrow>
                <h2 className="gm-feature-title reveal-title">{section.title}</h2>
              </div>
              <div className="glass gm-specs reveal-up">
                {section.rows?.map((row) => (
                  <div key={row.label} className="gm-spec-row">
                    <span className="gm-spec-label">{row.label}</span>
                    <span className="gm-spec-value">{row.value}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      );

    case "gmDownload":
      return (
        <section className="gm-section" id="download">
          <div className="gm-narrow text-center">
            <Reveal>
              <Eyebrow>{section.eyebrow}</Eyebrow>
              <h2 className="gm-feature-title reveal-title">{section.title}</h2>
              {section.body && <p className="gm-feature-body reveal-up">{section.body}</p>}

              <div className="gm-download-actions reveal-up">
                {section.options?.map((opt) => (
                  <div key={opt.href + opt.label} className="gm-download-option">
                    <LiquidButton
                      href={opt.href}
                      external={/^https?:\/\//.test(opt.href)}
                      variant={opt.primary ? "glass" : "outline"}
                      className="px-8 py-[15px] text-[15px] font-semibold"
                    >
                      {opt.label}
                    </LiquidButton>
                    {opt.meta && <span className="gm-download-meta">{opt.meta}</span>}
                  </div>
                ))}
              </div>

              {!!section.requirements?.length && (
                <div className="gm-reqs reveal-up">
                  {section.requirements.map((req) => (
                    <p key={req} className="gm-req">
                      {req}
                    </p>
                  ))}
                </div>
              )}
            </Reveal>
          </div>
        </section>
      );

    case "gmFaq":
      return (
        <section className="gm-section" id={section._key}>
          <div className="gm-narrow">
            <Reveal>
              <div className="mb-10 text-center">
                <Eyebrow>{section.eyebrow}</Eyebrow>
                <h2 className="gm-feature-title reveal-title">{section.title}</h2>
              </div>
              <div className="gm-faq-list">
                {section.items?.map((item) => (
                  <details key={item.question} className="glass gm-faq-item reveal-up">
                    <summary>
                      {item.question}
                      <span className="gm-faq-sign" aria-hidden />
                    </summary>
                    <p className="gm-faq-answer">{item.answer}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      );
  }
}
