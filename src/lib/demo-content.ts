import type { ProjectDetail, Testimonial } from "./sanity";
import type { PortableTextBlock } from "@portabletext/types";

/**
 * DEMO CONTENT — placeholder data so the metrics, case-study, and testimonial
 * features render before the Sanity CMS is populated. Wired in sanity.ts as a
 * FALLBACK ONLY: it appears when a query returns nothing, so anything you add in
 * /studio immediately takes precedence, and it's gated to non-production (see
 * DEMO_ENABLED in sanity.ts) so it never ships to a live build by accident.
 *
 * ⚠️ The numbers and the testimonial NAMES below are FICTIONAL. Replace them
 * with real content in Studio before relying on this publicly — shipping
 * invented metrics or quotes is exactly the credibility risk to avoid. To drop
 * demo mode entirely, delete this file and the `DEMO_*` references in sanity.ts.
 */

// deterministic keys (no Date/Math.random) — evaluated once at module load
let _k = 0;
const key = () => `demo-${(_k += 1)}`;

const p = (text: string): PortableTextBlock => ({
  _type: "block",
  _key: key(),
  style: "normal",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

const h = (text: string): PortableTextBlock => ({
  _type: "block",
  _key: key(),
  style: "h2",
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

const ul = (items: string[]): PortableTextBlock[] =>
  items.map((text) => ({
    _type: "block",
    _key: key(),
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  }));

export const DEMO_PROJECTS: ProjectDetail[] = [
  {
    _id: "demo-searchts",
    title: "searchts",
    slug: "searchts",
    status: "done",
    oneLiner:
      "Bot walls and paywalls silently break automated reading. searchts is a local unlocker that reads, searches, and transcribes any page — straight from the terminal.",
    metrics: [
      { value: "12k", label: "installs" },
      { value: "0", label: "cloud calls" },
      { value: "MIT", label: "license" },
    ],
    tags: ["typescript", "cli", "ocr"],
    year: "2025",
    license: "MIT",
    links: [
      { label: "Code", href: "https://github.com/capad-xyz/searchts", kind: "code" },
      { label: "npm", href: "https://www.npmjs.com/package/searchts", kind: "package" },
    ],
    hasStory: true,
    body: [
      h("The problem"),
      p(
        "Half the web is now gated behind bot detection, cookie walls, and JS-only rendering. Tools that used to read a page in one request get a CAPTCHA or an empty shell instead.",
      ),
      h("What I built"),
      p(
        "searchts runs entirely on your machine. It drives a real browser context only when it has to, falls back to OCR for image-only content, and streams clean text to stdout so it composes with everything else in a terminal.",
      ),
      ...ul([
        "Reads, searches, and transcribes any page — no API keys, no cloud.",
        "OCR fallback for scanned PDFs and image-only pages.",
        "Pipeable output: grep it, pipe it, redirect it.",
      ]),
      h("Impact"),
      p(
        "Shipped open-source under MIT; ~12k installs and counting, with zero outbound cloud calls — everything stays local by design.",
      ),
    ],
  },
  {
    _id: "demo-grove",
    title: "grove",
    slug: "grove",
    status: "done",
    oneLiner:
      "A calm, keyboard-first file manager that treats your projects as a living tree instead of a flat list of folders.",
    metrics: [
      { value: "4.3k", label: "GitHub stars" },
      { value: "<16ms", label: "frame time" },
      { value: "3", label: "platforms" },
    ],
    tags: ["rust", "tauri", "desktop"],
    year: "2024",
    license: "Apache-2.0",
    links: [
      { label: "Code", href: "https://github.com/capad-xyz/grove", kind: "code" },
      { label: "Download", href: "https://capad.fyi/grove", kind: "store" },
    ],
    hasStory: true,
    body: [
      h("Why"),
      p(
        "File managers either drown you in chrome or hide everything behind the mouse. grove is for people who already live on the keyboard and think in trees, not windows.",
      ),
      h("How"),
      p(
        "Built on Rust + Tauri so the binary is tiny and the UI stays at native frame rates. Every action is a keystroke; the mouse is optional.",
      ),
      ...ul([
        "Sub-16ms navigation even in repos with 100k+ files.",
        "Fuzzy jump, multi-select, and bulk ops without leaving home row.",
        "One binary, three platforms.",
      ]),
      h("Result"),
      p(
        "4.3k stars in the first year and a steady stream of contributors — the keyboard-first crowd found it fast.",
      ),
    ],
  },
  {
    _id: "demo-glyphmaps",
    title: "glyphmaps",
    slug: "glyphmaps",
    status: "ongoing",
    oneLiner:
      "Turn any font into an explorable map of its glyphs, ligatures, and OpenType features — rendered on the GPU.",
    metrics: [
      { value: "beta", label: "stage" },
      { value: "900+", label: "glyphs / font" },
    ],
    tags: ["webgl", "typography", "react"],
    year: "2025",
    links: [{ label: "Live preview", href: "https://capad.fyi/glyphmaps", kind: "live" }],
    hasStory: true,
    body: [
      h("The idea"),
      p(
        "Type specimens are static images. glyphmaps makes the whole character set interactive — pan, zoom, and toggle OpenType features to see exactly what a font can do before you commit to it.",
      ),
      h("Status"),
      p(
        "In open beta: rendering and feature toggles work; performance tuning for very large CJK fonts is in progress.",
      ),
    ],
  },
  {
    _id: "demo-lumen",
    title: "lumen",
    slug: "lumen",
    status: "ongoing",
    oneLiner:
      "A tiny, GPU-accelerated color picker that lives in your menu bar and speaks every format you actually paste.",
    metrics: [{ value: "soon", label: "launching" }],
    tags: ["swift", "macos", "metal"],
    year: "2025",
    links: [],
    hasStory: false,
  },
];

export const DEMO_TESTIMONIALS: Testimonial[] = [
  {
    _id: "demo-t1",
    quote:
      "searchts quietly replaced three brittle scrapers we'd been babysitting for years. It just reads the page and gets out of the way.",
    name: "Dana Whitfield",
    role: "Staff Engineer",
    company: "Northwind Data",
  },
  {
    _id: "demo-t2",
    quote:
      "grove is the first file manager that keeps up with how fast I think. I haven't reached for my mouse in a week.",
    name: "Marco Reyes",
    role: "Independent developer",
  },
  {
    _id: "demo-t3",
    quote:
      "Genuinely free, genuinely fast, and obviously built by someone who sweats the details. Rare combination.",
    name: "Priya Nair",
    role: "Design Engineer",
    company: "Atlas Studio",
  },
];
