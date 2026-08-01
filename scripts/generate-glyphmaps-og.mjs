// One-off script: pre-renders the Open Graph card for glyphmaps.capad.fyi to a
// static PNG, for the same reason as scripts/generate-og.mjs — the Worker build
// must never bundle @vercel/og's resvg.wasm / yoga.wasm (blows the free-plan
// 3 MiB gzip limit and breaks `wrangler deploy --dry-run` on Windows). Run with:
//   node scripts/generate-glyphmaps-og.mjs
//
// The mark is the app's own launcher icon, transcribed from
// GlyphMaps/app/src/main/res/drawable/ic_launcher_foreground.xml: an up-chevron
// of Glyph-Matrix dots, five head dots at full warm glow and a three-dot shaft
// at the 62% the LED tail actually renders at. Coordinates below are the
// vector's own, on its 108x108 viewport, scaled here — so the card and the icon
// on the phone cannot drift apart.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "..", "public", "glyphmaps-og.png");

const size = { width: 1200, height: 630 };

/* ---------------------------------------------- the launcher icon, verbatim */

const VIEWPORT = 108;
const DOT_R = 5.5;
const GLOW = "#FFE9B5";
const ICON_BG = "#0A0A0A";

// cx, cy on the 108x108 viewport. Head = full, tail = fillAlpha 0.62.
const HEAD = [
  [54, 33],
  [43, 43],
  [65, 43],
  [32, 53],
  [76, 53],
];
const TAIL = [
  [54, 53],
  [54, 65],
  [54, 77],
];

const TILE = 320;
const s = TILE / VIEWPORT;

const dot = ([cx, cy], opacity, key) =>
  h("div", {
    key,
    style: {
      position: "absolute",
      left: (cx - DOT_R) * s,
      top: (cy - DOT_R) * s,
      width: DOT_R * 2 * s,
      height: DOT_R * 2 * s,
      borderRadius: 999,
      background: GLOW,
      opacity,
    },
  });

const icon = h(
  "div",
  {
    style: {
      position: "relative",
      display: "flex",
      width: TILE,
      height: TILE,
      // The adaptive icon's own background colour, in the squircle a launcher
      // would crop it to.
      background: ICON_BG,
      borderRadius: 72,
      boxShadow: "0 0 0 1px rgba(255,255,255,0.07)",
    },
  },
  ...HEAD.map((p, i) => dot(p, 1, `h${i}`)),
  ...TAIL.map((p, i) => dot(p, 0.62, `t${i}`)),
);

/* --------------------------------------------------------------- the card */

const element = h(
  "div",
  {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      gap: 72,
      padding: "0 84px",
      background: "radial-gradient(120% 120% at 22% 12%, #1c1c21 0%, #0b0b0d 62%)",
      color: "#f3f1ea",
      fontFamily: "sans-serif",
    },
  },
  icon,
  h(
    "div",
    { style: { display: "flex", flexDirection: "column", flex: 1 } },
    h(
      "div",
      {
        style: {
          fontSize: 22,
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: "#8f8d85",
          marginBottom: 16,
        },
      },
      "Nothing Phone (4a) Pro",
    ),
    h(
      "div",
      { style: { fontSize: 100, fontWeight: 700, lineHeight: 0.92, letterSpacing: "-0.045em" } },
      "glyphmaps",
    ),
    h(
      "div",
      { style: { fontSize: 33, lineHeight: 1.28, color: "#c9c6bd", marginTop: 24 } },
      "Google Maps turn-by-turn on the 137-LED Glyph Matrix.",
    ),
    h(
      "div",
      { style: { fontSize: 23, color: "#8f8d85", marginTop: 32 } },
      "free · open source · glyphmaps.capad.fyi",
    ),
  ),
);

async function main() {
  const response = new ImageResponse(element, size);
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(outPath, buffer);
  console.log(`Wrote ${outPath} (${buffer.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
