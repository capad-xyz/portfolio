# Performance & smoothness playbook (research)

For this stack: Next 16 / React 19, liquid glass (backdrop-filter + SVG
displacement), gooey rAF cursor, liquid-drop intro, Lenis, GSAP, optional R3F.
Governing principle: keep the main thread free, run ONE render clock, never block
input. Full sources inline.

## Top 12 rules (copy-ready)
1. **Animate only `transform` and `opacity`** (compositor-only). Never animate
   width/height/top/left/box-shadow/`filter`/`backdrop-filter` blur. web.dev
   benchmark: top/left = 37ms layout + 79ms paint per frame; transform = 0.
   https://web.dev/articles/animations-guide
2. **One rAF clock:** drive Lenis from the GSAP ticker.
   `const lenis = new Lenis({autoRaf:false}); lenis.on('scroll', ScrollTrigger.update);
   gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0);`
   https://github.com/darkroomengineering/lenis
3. **No per-frame React state.** Cursor/scroll/parallax = `useRef` + direct
   `element.style` / GSAP imperative API; zero re-renders mid-animation.
4. **Coalesce `pointermove` to one rAF write** (stash latest event, write in the
   ticker); `getCoalescedEvents()` for smooth trails; all input listeners
   `{passive:true}`. https://nolanlawson.com/2019/08/11/high-performance-input-handling-on-the-web/
5. **Batch DOM reads then writes;** never read `getBoundingClientRect`/`offsetWidth`/
   `scrollTop` mid-loop (layout thrash). Cache rects.
   https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing
6. **Cap glass to ~2-3 layers,** never nest blurred-behind-blurred, keep blur
   static (don't animate the radius), isolate with `contain: layout paint`.
   Each backdrop-filter re-samples the screen behind it every frame.
   https://css-tricks.com/almanac/properties/b/backdrop-filter/
7. **`content-visibility: auto` + `contain-intrinsic-size`** on offscreen
   glass/heavy sections to skip their layout/paint until near-viewport.
   https://web.dev/articles/content-visibility
8. **SVG liquid distortion:** animate only `feDisplacementMap`'s `scale`, keep the
   filter region small, never rebuild the filter graph per frame.
   https://www.smashingmagazine.com/2021/09/deep-dive-wonderful-world-svg-displacement-filtering/
9. **`will-change` on just-before, off just-after** an animation; never leave it
   on broadly. https://developer.mozilla.org/en-US/docs/Web/CSS/will-change
10. **R3F:** `frameloop="demand"` + `invalidate()`, `dpr={[1,2]}`, one canvas,
    instancing, dispose on unmount, `next/dynamic {ssr:false}`, suspend offscreen.
    https://r3f.docs.pmnd.rs/advanced/scaling-performance
11. **Protect INP:** interaction callbacks <50ms, yield deferred work via
    `scheduler.yield()`/`setTimeout`, idle-guard that suspends the ticker after N
    input-free frames. https://web.dev/articles/optimize-inp
12. **`prefers-reduced-motion` ships a real static path** (don't even init
    Lenis/GSAP/cursor); measure every change with DevTools Performance/Rendering/
    Layers + `web-vitals` against **LCP <=2.5s / INP <=200ms / CLS <=0.1**.
    https://web.dev/articles/defining-core-web-vitals-thresholds

## How the current build applies this
- Intro drop / pool / rings / wave: all `transform` + `opacity` via WAAPI.
- Cursor: one rAF loop, refs + direct `style` writes, `pointermove` passive +
  coalesced to a dirty flag; hidden on touch / reduced-motion.
- Magnetic CTA: rect cached on reveal + resize (no per-move layout read).
- Glass: `contain: paint`; blur static; refraction via static `#refract`.
- Reduced-motion: cursor/intro never mount; hero reveals instantly.

## TODO as sections land
- Wire Lenis to the GSAP ticker once ScrollTrigger is added (rule 2).
- `content-visibility:auto` + `contain-intrinsic-size` on each below-fold section.
- Idle-guard the cursor rAF after N input-free frames.
- If R3F drop/cards return: `frameloop="demand"`, dpr cap, dispose, suspend offscreen.
- Add `web-vitals` field logging; DevTools pass on a mid-range profile.
