// One-off script: pre-renders the site's Open Graph card to a static PNG
// so the Cloudflare worker build never has to bundle @vercel/og's
// resvg.wasm / yoga.wasm (blows the free-plan 3 MiB gzip limit and breaks
// `wrangler deploy --dry-run` on Windows). Run with:
//   node scripts/generate-og.mjs
// Regenerate whenever the design in this file changes; there is no
// src/app/opengraph-image.tsx anymore, this script is the source of truth.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "..", "public", "opengraph-image.png");

const size = { width: 1200, height: 630 };

const element = h(
  "div",
  {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background:
        "radial-gradient(125% 90% at 50% -12%, #ffffff 0%, #f1f0ec 56%)",
      color: "#0b0b0d",
      fontFamily: "sans-serif",
    },
  },
  h(
    "div",
    {
      style: {
        fontSize: 32,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color: "#6f6e6a",
        marginBottom: 18,
      },
    },
    "developer tools · desktop apps",
  ),
  h(
    "div",
    {
      style: {
        fontSize: 220,
        fontWeight: 700,
        lineHeight: 0.9,
        letterSpacing: "-0.05em",
      },
    },
    "capad",
  ),
  h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 20,
        marginTop: 34,
      },
    },
    h("div", {
      style: { width: 60, height: 2, background: "rgba(11,11,13,0.25)" },
    }),
    h(
      "div",
      {
        style: { fontSize: 30, letterSpacing: "0.14em", color: "#46453f" },
      },
      "Aadarsh Upadhyay",
    ),
    h("div", {
      style: { width: 60, height: 2, background: "rgba(11,11,13,0.25)" },
    }),
  ),
  h(
    "div",
    {
      style: {
        fontSize: 24,
        color: "#6f6e6a",
        marginTop: 40,
      },
    },
    "fast, genuinely-free tools · capad.fyi",
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
