/**
 * Is this browser actually rasterising on the GPU?
 *
 * The site's whole material language is `backdrop-filter` plus SVG filters
 * (`feDisplacementMap` for edge refraction, `feGaussianBlur`/`feColorMatrix` for
 * the testimonial deck's ink fusion). Those are per-pixel and are *not*
 * compositable: they cannot be cached and they re-run whenever their backdrop
 * moves. On a GPU they are cheap enough to be free. On a software rasteriser
 * they are catastrophic — and they are catastrophic in exactly one browser on
 * one machine while three other Chromium browsers on the same GPU are fine.
 *
 * That asymmetry is the whole reason this module exists. The previous gate
 * asked "is this a phone?" (a coarse pointer) or "was this frame budget missed?"
 * (an rAF probe). Both are proxies, and both answer "no" for a desktop browser
 * that has quietly fallen back to SwiftShader — which is the one case the owner
 * actually reported. A capable GPU does not help if the page never reaches it.
 *
 * So ask the renderer directly. `WEBGL_debug_renderer_info` is the only
 * cross-browser way to get the *unmasked* string; the plain `RENDERER` constant
 * is deliberately genericised to "WebKit WebGL" precisely so sites cannot read
 * this.
 *
 * Two deliberate limits:
 *
 *  1. We do not demote when the answer is merely unknown. A missing extension or
 *     a failed context must not cost a real GPU its glass, so `software` is only
 *     ever true on positive evidence. `renderer: "unknown"` means we could not
 *     tell, which is a fact worth surfacing rather than guessing past.
 *
 *  2. Detection is a snapshot, taken once at mount. GPU blacklisting can change
 *     later (a driver update, a laptop switching from hybrid to discrete), but
 *     re-probing mid-session would mean toggling the design under the reader.
 *     The `?perf=` override below exists so it can be re-tested on demand.
 */

/** Renderer strings that mean "there is no GPU in this pipeline". */
const SOFTWARE_MARKERS = [
  "swiftshader",
  "llvmpipe",
  "softpipe",
  "software rasterizer",
  "software rasteriser",
  "basic render",
  "microsoft basic",
  "generic renderer",
] as const;

export type Raster = {
  /**
   * True only on positive evidence that pages are rasterised on the CPU.
   * `false` means "fine" OR "could not tell" — see `unknown` to distinguish.
   */
  software: boolean;
  /** Unmasked renderer string, truncated for a data-attribute, or "unknown". */
  renderer: string;
  /** True when we had no way to ask. */
  unknown: boolean;
};

export const UNKNOWN_RASTER: Raster = { software: false, renderer: "unknown", unknown: true };

/**
 * Read the unmasked renderer off a throwaway WebGL context.
 *
 * The context is created with `failIfMajorPerformanceCaveat: true` so that a
 * machine which *could* rasterise but has blocklisted the driver fails loudly
 * here rather than silently handing us a software context — that failure is
 * itself the signal we want. Context creation is cheap, happens once, and the
 * canvas is never attached or sized, so it costs nothing to lose.
 */
export function detectRaster(): Raster {
  if (typeof document === "undefined") return UNKNOWN_RASTER;

  let canvas: HTMLCanvasElement | null = null;
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  try {
    canvas = document.createElement("canvas");
    gl = (canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ??
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true })) as
      | WebGLRenderingContext
      | WebGL2RenderingContext
      | null;
  } catch {
    return UNKNOWN_RASTER;
  }

  if (!gl) {
    // WebGL refused outright. Could be software-only, could be disabled
    // enterprise policy. Either way there is no hardware path to speak of, and
    // both mean "do not spend per-pixel work". Treat as software.
    return { software: true, renderer: "no-webgl-context", unknown: false };
  }

  let renderer = "";
  try {
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    // The extension is the only route to the real string; fall back to the
    // generic one, which will simply not match any marker below.
    renderer = String(
      ext
        ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER),
    );
  } catch {
    /* keep the empty string; treated as unknown below */
  } finally {
    // Release immediately — this context exists only to read one string.
    try {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {}
  }

  const hay = renderer.toLowerCase();
  if (!hay) return UNKNOWN_RASTER;

  const software = SOFTWARE_MARKERS.some((m) => hay.includes(m));
  return { software, renderer: renderer.slice(0, 60), unknown: false };
}

/** What `?perf=` asked for, if anything. */
export type PerfOverride = "soft" | "off" | null;

/**
 * Read the `perf` query parameter. This exists so the software tier can be
 * A/B-tested in the offending browser without a rebuild:
 *
 *   /?perf=soft   force the cheap path
 *   /?perf=off    forbid any downgrade (full quality, probe disabled)
 *
 * Absent = no opinion. Reading it from the URL keeps it session-scoped and
 * shareable, which is what makes it useful for "try this and tell me".
 */
export function readPerfOverride(search?: string): PerfOverride {
  try {
    const qs =
      search ?? (typeof window === "undefined" ? "" : window.location.search);
    const v = new URLSearchParams(qs).get("perf");
    if (v === "soft") return "soft";
    if (v === "off") return "off";
  } catch {}
  return null;
}