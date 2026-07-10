import type { ProjectDetail, Testimonial, WorkExperience, StackGroup } from "./sanity";
import type { PortableTextBlock } from "@portabletext/types";

/**
 * DEMO CONTENT — placeholder data so every section (projects + metrics, case
 * studies, experience, stack, testimonials) renders fully before the Sanity CMS
 * is populated. Wired in sanity.ts: while demo mode is on it OVERRIDES the CMS,
 * so all of it is guaranteed to show. Demo mode is on in dev / any non-prod
 * build and off in production — force on with NEXT_PUBLIC_DEMO_CONTENT=1, or off
 * with =0 (to preview real CMS content in dev). See DEMO_ENABLED in sanity.ts.
 *
 * ⚠️ The PROJECTS below (metrics, licenses, links, case-study bodies) are REAL,
 * verified against the repos and the Notion write-ups, and mirror the published
 * Sanity documents. TESTIMONIALS are intentionally empty (the earlier fictional
 * names/quotes were removed). Work experience and stack are real. To drop demo
 * entirely, delete this file and the `DEMO_*` references in sanity.ts.
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
      "The missing layer between AI and the web: a keyless, open-source unlocker that reads, searches, and transcribes any page past the bot-walls that block a naive fetch, straight from your terminal or agent.",
    metrics: [
      { value: "0", label: "API keys" },
      { value: "3", label: "unlock tiers" },
      { value: "4", label: "MCP tools" },
    ],
    tags: ["python", "cli", "mcp"],
    year: "2026",
    license: "MIT",
    links: [
      { label: "Code", href: "https://github.com/capad-xyz/searchts", kind: "code" },
      { label: "PyPI", href: "https://pypi.org/project/searchts/", kind: "package" },
    ],
    hasStory: true,
    body: [
      h("The problem"),
      p(
        "AI agents and research tools constantly need to read arbitrary web pages, but the naive way they fetch is trivially blocked by modern anti-bot systems like Cloudflare, PerimeterX, and DataDome. The agent just gets a CAPTCHA or an empty shell and gives up.",
      ),
      h("Why it can be free"),
      p(
        "Paid unlockers exist, but the thing they really charge for is a huge pool of clean residential IP addresses. searchts runs on your own machine, from your own connection, at personal volume, so it already has the one expensive piece for free.",
      ),
      h("What I built"),
      p("An escalating fetch ladder that stops at the first tier returning real content:"),
      ...ul([
        "curl_cffi: impersonates a real Chrome's TLS and HTTP2 fingerprint. Fast, local, private. This tier alone turned a Zillow 403 into a genuine 422 KB page in testing.",
        "Jina Reader: a JavaScript-rendering relay for pages that only fill in after running JS.",
        "A stealth browser (patchright), launched lazily only when the cheaper tiers fail.",
      ]),
      p(
        "It reads, searches (keyless, multi-provider with reciprocal rank fusion), and transcribes video subtitles-first with a Whisper fallback, exposed as a CLI, an MCP server, a Claude Code skill, and a plain Python library. Installed CLIs unlock native channels — GitHub, Twitter/X, Reddit, LinkedIn, RSS — and the same unlocker grabs assets (images, fonts, CSS, even a page's palette) and remembers which tier worked per domain, so repeat fetches start at the cheapest thing that works. Fetched content is scrubbed of invisible-character tricks and flagged for prompt-injection indicators before it reaches an agent.",
      ),
      h("The honest ceiling"),
      p(
        "An interactive CAPTCHA still needs a human — so instead of faking success, a --human flow opens a real browser, you solve it once, and the fetch continues. Built on and extending Agent-Reach (MIT), shipped open-source under MIT on PyPI: no API key, no paid proxy.",
      ),
    ],
  },
  {
    _id: "demo-grove",
    title: "grove",
    slug: "grove",
    status: "ongoing",
    oneLiner:
      "A genuinely-free Git review companion that sits beside your AI coding editor: the commit graph, diffs, and every in-flight worktree, refreshing live as your agent changes the repo under you.",
    nowLine: "hover cards, tab restore, watcher perf (v0.1.3)",
    metrics: [
      { value: "alpha", label: "stage" },
      { value: "worktree", label: "first" },
      { value: "BYO", label: "agent" },
    ],
    tags: ["rust", "tauri", "svelte"],
    year: "2026",
    license: "GPL-3.0",
    links: [
      { label: "Code", href: "https://github.com/capad-xyz/grove", kind: "code" },
      {
        label: "Windows alpha",
        href: "https://github.com/capad-xyz/grove/releases/latest",
        kind: "store",
      },
    ],
    hasStory: true,
    body: [
      h("Why it exists"),
      p(
        "AI coding editors pour everything into the chat-and-agent loop and leave git review as a cramped side panel. But the agent produces diffs and commits at high volume, so the tool creating the most diffs has the worst diff UX. Grove fills that gap from the outside, beside any agent (Claude, Cursor, Windsurf, a terminal), including several at once.",
      ),
      h("The wedge"),
      p(
        "The Git GUI market is crowded, but the genuinely-free, genuinely-beautiful slice is nearly empty: GitKraken and Tower are paid, Fork and Sublime Merge nag, GitHub Desktop is thin, GitButler is source-available with a no-compete license. Grove is GPL-3.0: free as in actually free, and forks stay open.",
      ),
      h("Three pillars"),
      ...ul([
        "A beautiful read-first, edit-light surface (a custom commit-graph renderer, diffs, blame, stash, inline Monaco quick edits) that refreshes live as the repo changes under you.",
        "Worktree-first, because one-worktree-per-task is becoming how people run parallel agents.",
        "Bring-your-own agent for commit and PR text, never an in-house paid model.",
      ]),
      h("What works, and how"),
      p(
        "Already daily-usable on real repos: a custom SVG commit graph, virtualized for large repos (hollow nodes for unpushed commits, hover cards with details and quick jumps, real diffs even on merge commits), a diff and blame viewer with find-in-diff, stage/unstage and commit from the working-changes view, a worktree dashboard, an instant Spotlight search across files, commits, branches, and content, live refresh that redraws as your agent changes the repo, and a wired local-CLI agent for commit messages. Under it, a Tauri 2 shell with small Rust-core binaries, a Svelte 5 frontend, and a hybrid git engine: gix for fast reads, the user's own git binary for writes.",
      ),
      h("Honest state"),
      p(
        "Alpha: the v0 hero features have shipped and it runs my own repos daily. Windows-only for now, and the installers are unsigned — SmartScreen will warn until code-signing lands.",
      ),
    ],
  },
  {
    _id: "demo-glyphmaps",
    title: "glyphmaps",
    slug: "glyphmaps",
    status: "done",
    oneLiner:
      "Turn-by-turn navigation on the back of a phone. GlyphMaps mirrors Google Maps' next maneuver onto the Nothing Phone (4a) Pro's 137-LED Glyph Matrix, so a glance at a face-down phone shows your next turn.",
    metrics: [
      { value: "137", label: "LEDs" },
      { value: "12", label: "maneuvers" },
      { value: "2.3 MB", label: "APK" },
    ],
    tags: ["android", "kotlin", "glyph-matrix"],
    year: "2026",
    license: "AGPL-3.0",
    links: [
      { label: "Code", href: "https://github.com/capad-xyz/GlyphMaps", kind: "code" },
      {
        label: "Download APK",
        href: "https://github.com/capad-xyz/GlyphMaps/releases/latest",
        kind: "store",
      },
    ],
    hasStory: true,
    body: [
      h("The idea"),
      p(
        "Glance navigation on a phone screen is distracting and battery-hungry. The Nothing Phone (4a) Pro has a circular 13x13 grid of 137 LEDs on its back, exactly the right shape to draw a turn arrow. Flip the phone face-down on a mount and your next turn lights up on the back instead of the screen.",
      ),
      h("Why it is not a Glyph Toy"),
      p(
        "Nothing's official Glyph Toy API is throttled to always-on-display cadence, about one update a minute, useless for live nav. The setAppMatrixFrame call is not throttled, but it needs a foreground lifecycle to stay alive. So GlyphMaps runs as a foreground service that claims the Matrix only while you navigate and releases it the moment the route ends, with a 20-second idle watchdog as a safety net so your normal Glyph toy always comes back.",
      ),
      h("How a turn travels"),
      p(
        "A NotificationListenerService reads Google Maps' live navigation notification — scoped to the Maps package and the navigation category only — and parses the maneuver and distance. One pure composer turns that into a dot-matrix arrow with a scrolling distance marquee, and the same function drives both the LEDs and the in-app preview, so there is a single source of truth. The preview is speed-aware: a far-off turn reads as “continue, then turn” and flips to the direct arrow as you approach.",
      ),
      h("Shipped"),
      p(
        "v1.0.0 is live on a real 4a Pro: a signed, R8-minified 2.3 MB APK on GitHub Releases, AGPL-3.0. Twelve maneuver shapes, each with a procedurally generated sweep animation so the static and animated arrows can never drift apart, plus per-LED brightness sliders and a choice of Static Glow or Sweeping Flow display modes.",
      ),
      h("Private by construction"),
      p(
        "It reads a navigation notification, so it was built to be provably harmless: 100% on-device, no network code, no analytics, no account. A pre-release privacy audit gated all notification-content logging behind a dev-only build flag.",
      ),
    ],
  },
  {
    _id: "demo-beep",
    title: "beep-beep-oss",
    slug: "beep-beep-oss",
    status: "ongoing",
    oneLiner:
      "An open-source, self-hostable universal chat client: all your messaging networks in one native inbox, with instant sync and nothing locked behind a paywall. Built on Matrix and Tauri, so the whole stack stays fast, native, and yours to run.",
    nowLine: "fast cold start + the multi-account inbox UI",
    metrics: [
      { value: "live", label: "sync" },
      { value: "0", label: "paywalls" },
      { value: "Matrix", label: "protocol" },
    ],
    tags: ["matrix", "tauri", "rust"],
    year: "2026",
    license: "AGPL-3.0",
    links: [{ label: "Code", href: "https://github.com/capad-xyz/beep-beep-oss", kind: "code" }],
    hasStory: true,
    body: [
      h("The problem"),
      p(
        "Universal-chat apps gate basic functionality behind subscription tiers, including how fast your own messages sync. beep-beep-oss takes the opposite stance: self-hosting removes the artificial throttling entirely, and every messaging feature in the open-source client is free.",
      ),
      h("The architecture"),
      p(
        "It is Beeper's core architecture, rebuilt in the open: a Synapse homeserver, the mautrix bridges that translate WhatsApp and other networks into Matrix (the same bridges Beeper uses), and a custom client. Once a network is translated into Matrix, an open protocol, any Matrix client can read it, which is what makes a unified inbox possible.",
      ),
      h("The client"),
      p(
        "A native Tauri 2 app — a React UI over a Rust core on matrix-rust-sdk, desktop and mobile from one core, not another Electron shell. The Phase 1 client is already a working two-way messenger: log in, a live inbox with real WhatsApp avatars, previews and search, open a room, read history, send with an optimistic echo, sessions that persist across restarts, and Simplified Sliding Sync for live, no-delay updates, all verified against real bridged WhatsApp chats.",
      ),
      h("Status"),
      p(
        "Alpha, Phase 1 in progress. The live, no-delay sync that is the whole thesis is working; multi-account is designed in from the start (two WhatsApp accounts, side by side — bridged as a companion device, so ban risk stays low), and the infra ships with a setup guide including a fully-free self-host path on Oracle Cloud's Always Free tier. Instagram lands next via mautrix-meta; Signal and Telegram after. AGPL-3.0, so nobody can quietly absorb it into a closed product.",
      ),
    ],
  },
];

// Mirrors the published Sanity testimonial documents (attribution is role-based,
// not personal names; the searchts quote distils genuine reactions from the
// launch thread, attributed anonymously). Keep this in sync with Sanity so dev
// preview matches production.
export const DEMO_TESTIMONIALS: Testimonial[] = [
  {
    _id: "demo-t1",
    quote:
      "Aadarsh owned the architecture of Compliance Sarathi end to end and shipped a reliable agentic assistant under real deadline pressure. He is who you want on the hard parts of a system.",
    name: "Engineering, Compliance Sarathi",
    company: "Appson Technologies",
  },
  {
    _id: "demo-t2",
    quote:
      "On Wordibly he moved fast across the whole stack, from customer upload flows to the manager dashboards, and left the codebase better than he found it.",
    name: "Engineering team, Wordibly",
    company: "Appson Technologies",
  },
  {
    _id: "demo-t3",
    quote:
      "searchts quietly solves a problem every AI agent hits: it is fast, keyless, and clearly built by someone who sweats the details.",
    name: "Open-source user",
    role: "Developer",
  },
];

export const DEMO_WORK_EXPERIENCE: WorkExperience[] = [
  {
    _id: "demo-w1",
    position: "Software Engineer & Architect",
    company: "Compliance Sarathi · Appson Technologies",
    startYear: "2026",
    current: true,
    summary:
      "Main engineer and architect of Compliance Sarathi, an AI-powered ROC and corporate-compliance platform for Indian companies. Designed its agentic AI assistant with a safety-gated action layer, a multi-provider LLM service (OpenAI, Gemini, Claude), and a deterministic statutory-deadline engine, leading architecture, core build, and client delivery on a React + Node / MongoDB stack.",
  },
  {
    _id: "demo-w2",
    position: "Junior Software Engineer",
    company: "Wordibly · Appson Technologies",
    startYear: "2025",
    endYear: "2026",
    current: false,
    summary:
      "At Appson Technologies, worked on Wordibly, a US-based hybrid human + AI transcription and translation platform, across its React / Node.js / Python / MongoDB / AWS stack, from customer ordering and upload flows to the transcriber and manager dashboards.",
  },
  {
    _id: "demo-w3",
    position: "AI Training Engineer",
    company: "Turing",
    startYear: "2025",
    current: false,
    summary:
      "Short two-week contract training Meta's Llama models, hands-on LLM data work via Appson Technologies.",
  },
];

// Mirrors the published Sanity stackGroup documents (label, items, and order),
// so dev and production show the same stack.
export const DEMO_STACK_GROUPS: StackGroup[] = [
  {
    _id: "demo-s0",
    label: "ai & agents",
    items: [
      "Claude API & MCP",
      "agentic tool-calling",
      "safety-gated actions",
      "OpenAI / Gemini",
      "Claude Code skills",
      "LLM training data",
    ],
  },
  { _id: "demo-s1", label: "languages", items: ["TypeScript", "Python", "Rust", "Kotlin", "Lua"] },
  { _id: "demo-s2", label: "frameworks", items: ["Next.js", "React", "Svelte", "Tauri", "Electron"] },
  {
    _id: "demo-s3",
    label: "frontend & motion",
    items: ["Tailwind", "GSAP", "Motion", "Lenis", "SVG / WebGL"],
  },
  {
    _id: "demo-s4",
    label: "tooling & infra",
    items: ["Sanity", "Cloudflare", "PyPI", "Android SDK", "git"],
  },
];
