# capad portfolio - curated content + components (build spec)

Synthesis of `PRD.md` + `research-ux.md` (what makes portfolios sticky) +
liquid-animation research (how to make it alive). Palette: **white + near-black,
2 colors max**. Motion: **disciplined cinematic** - liquid everywhere, but fast,
no scroll-jacking, `prefers-reduced-motion` ships a static page. One WebGL
context; hot loops mutate the DOM directly; Lenis -> GSAP ticker -> renderer share
one clock; idle-guard suspends rAF after N idle frames.

Guiding rule (UX evidence): win the first ~50ms with craft, front-load the best
work, tell stories with curiosity gaps, one delight peak + a warm ending, one
low-friction CTA. (Sources in research-ux.md.)

---

## 0. Intro - the liquid drop  *(the delight peak + the 50ms craft win)*
- **Content:** black screen -> a single glass drop falls, splashes, ripples ->
  the ripple uncovers the hero. ~1.2-1.8s. Skippable. Reduced-motion = instant hero.
- **Build:** GSAP **MorphSVG** drop->splash, hand a single `progress` uniform to an
  R3F `shaderMaterial` ripple/displacement pass, whose `smoothstep` circle doubles
  as the `clip-path` reveal. One timeline, one value, three layers.
- **Why:** the first impression IS the material; design = credibility verdict.

## 1. Hero
- **Content:** `capad` (locked dark-ink Space Grotesk) · one-line value prop
  ("fast, genuinely-free developer tools & desktop apps") · ONE primary CTA
  ("See the work") · a quiet proof line ("searchts · Grove · GlyphMaps").
- **Build:** liquid-glass headline panel with `feImage`+`feDisplacementMap`
  refraction (Chromium; blur+rim-light fallback) over a grainy near-black/white;
  ambient `sin()` breathing + cursor flowmap distortion; the liquid cursor lives here.
- **Why:** "what + why" in one glance; ~74% of attention is the first two screens.

## 2. Featured work - searchts FIRST  *(front-load the lead)*
- **Content:** 3 flagship glass cards, strongest first:
  **searchts** (web access for AI agents past bot-walls; keyless, MIT, on PyPI -
  with the demo GIF we built) · **Grove** (git review companion) · **GlyphMaps**
  (Maps on the Nothing Glyph Matrix). Each: name · a hook + outcome line
  (curiosity gap) · tags · demo media · links. Click -> case study.
- **Build:** glass cards (`MeshTransmissionMaterial` or CSS glass + refraction);
  scroll-scrubbed `clip-path` + scale morph on enter; hover ripple from cursor
  point; shared-element morph into the case page.
- **Why:** best work first; curiosity-gap stories; concrete proof = competence.

## 3. Case-study pages (per flagship)
- **Content:** hook + outcome up top; "how" on scroll - problem -> build -> demo ->
  tech -> links; concrete metrics; the demo GIFs.
- **Build:** liquid page transition in (View Transitions API + a single-`progress`
  shader wipe); scroll-driven reveals.
- **Why:** story with tension; the "why/role/decisions/outcome" reads as senior.

## 4. All projects - the grid  *(breadth, secondary)*
- **Content:** the rest (CoffeeBreath, Discord overlay, beeper-oss, ...), a
  filterable glass grid by type (CLI / desktop / mobile / widget).
- **Build:** glass grid; gooey (`#goo` filter) filter chips that merge/split;
  magnetic cards.

## 5. Timeline / journey  *(the functional callback you asked for)*
- **Content:** the work timeline (from workExperience), reimagined.
- **Build:** GSAP **DrawSVG** stroke draws on as you scroll; nodes are tiny glass
  droplets that ripple when reached. Reduced-motion = fully drawn, no scrub.

## 6. Stack
- **Content:** categorized tech as glass chips (core build-with + a collapsible
  fuller toolbox - mirrors the GitHub profile).
- **Build:** glass chips, magnetic hover + ripple.

## 7. Contact - the ending  *(peak-end = highest-leverage conversion real estate)*
- **Content:** warm, human, ONE CTA - direct email `hi@` / `oss@capad.fyi` +
  socials. No long form (each field costs completion).
- **Build:** glass card; the liquid cursor "settles"; a final restrained flourish.
- **Why:** the end shapes memory + the decision to act.

## Persistent chrome
- **Nav:** floating liquid-glass pill (refracts content) - capad (home) · Work ·
  Timeline · About + a low-friction Contact. Magnetic items; gooey reveal on open;
  condenses to a glass blob on scroll-down. Mobile: glass button -> gooey full-screen menu.
- **Liquid cursor:** the signature "alive" element - a metaball/blob trail
  (`blobity` or a raymarched `smin` trail) that snaps to focusables. Hidden +
  native cursor restored on touch / reduced-motion.
- **Section transitions:** single-`progress` block-reveal + displacement warp;
  chromatic aberration earned ONLY mid-transition (otherwise off - it's color).

## Color discipline
White + near-black only. The "accent" is **value contrast and the transition
between black and white**, not a hue. A single real accent is allowed only when
explicitly earned (one CTA, or a project's own color inside its case study).
Grain/noise overlay everywhere to keep flat areas alive and hide blur banding.

---

## Technique & library appendix (from the liquid research)
- **Intro/transitions blueprint** (single progress uniform, ripple, block reveal):
  https://tympanus.net/codrops/2025/10/08/how-to-animate-webgl-shaders-with-gsap-ripples-reveals-and-dynamic-blur-effects/
  · https://tympanus.net/codrops/2026/05/06/from-shader-uniforms-to-clip-path-wipes-how-gsap-drives-my-portfolio/
- **Liquid glass refraction** (feImage + feDisplacementMap as backdrop-filter; squircle profile; Chromium-only + fallback):
  https://kube.io/blog/liquid-glass-css-svg/ · https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/
- **Goo / metaball filter:** https://css-tricks.com/gooey-effect/ ; raymarched droplet metaballs (`smin`):
  https://tympanus.net/codrops/2025/06/09/how-to-create-interactive-droplet-like-metaballs-with-three-js-and-glsl/
- **MorphSVG** (drop->splash): https://gsap.com/docs/v3/Plugins/MorphSVGPlugin/ ; flubber (license-free morph)
- **Magnetic buttons:** https://blog.olivierlarose.com/tutorials/magnetic-button
- **blobity** (liquid cursor): https://blobity.dev/
- **Libraries:** GSAP (+ MorphSVG, DrawSVG, ScrollTrigger) · Motion (springs) ·
  Lenis · R3F + drei (`shaderMaterial`, `MeshTransmissionMaterial`) · OGL `Flowmap`
  (cursor-velocity distortion) · blobity.
- **Perf:** one WebGL context across routes; direct DOM mutation in hot loops;
  one shared clock; cache bound objects; idle guard; reduced-motion = static page.
