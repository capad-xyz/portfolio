# capad portfolio - Design PRD

> Living spec. We build to this, not to vibes. Rule: nothing is random - every
> element earns its place through aesthetic, function, or story.

## 1. Vision

Apple's **Liquid Glass, made personal**: **light, airy, premium**, with
**cinematic, immersive, scroll-driven** motion. Every surface is bright
translucent glass; every transition is a deliberate, physics-driven moment. It
should feel like capad's, not a Liquid-Glass template.

**Anti-goals (the first pass got these wrong):** a dark, flat, near-black void;
generic glassmorphism; static or sparse motion; template feel.

## 2. Design language

- **Palette - white + near-black, 2 colors MAX.** Strict monochrome: a light
  (white/off-white) base and near-black ink. All depth, drama, and "alive"
  feeling comes from **light, translucency, refraction, contrast, and motion -
  never color**. A single accent is allowed ONLY when explicitly earned (e.g. one
  CTA, or a project's own hue inside its case study). No gradient washes, no
  pastel palette. This makes the glass read as Apple-grade, not decorative.
- **Material - light liquid glass.** Bright frosted panels: high translucency,
  soft blur + saturation, crisp specular rim, gentle float shadows, Chromium SVG
  edge refraction. Reads as polished glass on a bright surface.
- **Typography.** Confident premium display sans for "capad"; mono for technical
  labels. (Specific font TBD.)
- **Depth & light.** One consistent light source; glass catches and casts it.

## 3. Motion system - DISCIPLINED cinematic (liquid, alive, but evidence-led)

Per `research-ux.md`: heavy/decorative motion + slow loads backfire (bounce,
motion-sickness). So the site is **genuinely liquid and alive everywhere**, but
**performance-budgeted, no scroll-jacking, with `prefers-reduced-motion`
fallbacks**, and ONE signature delight peak (peak-end rule).

- **Opens with a liquid-drop intro.** A glass drop falls, ripples, and the page
  forms/reveals from it - the first impression IS the material. (Technique TBD
  from liquid-animation research: SVG goo/morph or WebGL ripple.)
- **Liquid, not just frosted.** Gooey/metaball merges, blob morphs, ripple on
  interaction, a liquid cursor - the glass behaves like liquid, in monochrome.
- **Scroll is the narrative.** GSAP ScrollTrigger + Lenis drive a choreographed
  journey - pinned moments, parallax depth, glass that assembles/refracts as you
  move.
- **WebGL-forward.** R3F glass that reacts to scroll + cursor and is genuinely
  **light-filled and refractive** (the fix for the flat dark shard).
- **Dramatic transitions.** Shared-element morphs (card -> project page), liquid
  section dissolves, blur/scale reveals.
- **Pervasive micro-physics.** Springs on every hover/press; magnetic buttons;
  cursor-reactive specular. Never static, always tasteful.
- **Signature set-pieces:** hero glass reveal; featured cards refracting on
  approach; the timeline as a scrubbable beam of light.

## 4. Information architecture

1. **Hero** - luminous glass centerpiece + "capad" + identity; cinematic entrance.
2. **About** - short, personal, airy.
3. **Featured work** - searchts, Grove, GlyphMaps as glass cards (with our demo
   GIFs) -> shared-element morph to case-study pages.
4. **All projects** - filterable glass grid (by type).
5. **Timeline / journey** - the work timeline reimagined as a scrubbable light beam.
6. **Stack** - categorized glass chips.
7. **Contact** - glass card, hi@ / oss@capad.fyi.

**Persistent chrome - the navigation.** A floating liquid-glass nav pill (mono,
refracts the content behind it). Minimal per Hick's Law: capad mark (home) +
Work / Timeline / About + a low-friction Contact action. Alive: a liquid
active-indicator that morphs between sections on scroll, magnetic links, and the
pill condenses to a compact glass blob on scroll-down / re-expands on scroll-up.
On project pages it becomes a back/breadcrumb. Mobile: a glass button that
expands into a gooey full-screen menu.

## 5. Content - the up-to-date dataset

Repopulate Sanity (project `v6eklfsd`) via MCP: replace the template works with
the real ones (searchts, Grove, GlyphMaps, CoffeeBreath, Discord overlay, ...),
real skills/stack, real timeline (`workExperience`), and the about. Extend the
schema for richer projects: accent color, repo/demo links, demo media (GIF),
tags, a "flagship" flag, role/year.

## 6. Tech

Next 16 + React 19 + Tailwind v4 - Motion (micro) - GSAP ScrollTrigger + Lenis
(scroll) - R3F + drei `MeshTransmissionMaterial` (WebGL) - next-sanity + TypeGen.
**Rebuild the glass material for LIGHT.** Deploy: Cloudflare Pages on capad.fyi.

## 7. Performance & accessibility

Budget live glass panels; immersive but capped WebGL; lazy-load WebGL;
`prefers-reduced-motion` / `prefers-reduced-transparency` fallbacks; APCA
contrast for text on light glass.

## 8. Phases

1. **PRD sign-off** (this).
2. **Moodboard + hero redesign** (light, luminous, cinematic) - redo the feel checkpoint.
3. **Sections** built to the system + Sanity content refreshed.
4. **Polish, perf pass, deploy** to capad.fyi.

## Open inputs (needed from you)

- **References** (most important): sites / shots that match your imagination.
- **Accent color**: a signature hue, or I propose a few.
- **Font**: a preference, or I propose options.
- **Brand**: keep lowercase "capad" as the display name? (current default)

## Decisions locked

- **PINNED:** strict black + white palette; dark-ink **Space Grotesk** wordmark.
- **Startup:** a proper *refracting* liquid drop falls to the BOTTOM of the screen;
  its impact "creates"/loads the app, elements developing in one by one (a wave up
  the screen). This is the signature delight peak — must be nailed.


- Light & airy palette. Cinematic & immersive motion. Featured-flagships + grid.
  Hybrid scroll + project pages, plus a work timeline. Next.js + Sanity. Build
  the strongest version; judged live.
