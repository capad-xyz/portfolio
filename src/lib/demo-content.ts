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
    // Ported from the Agent-Reach OSS Unlocker research paper (Notion) —
    // mirrors the published Sanity body.
    body: [
      h("The problem"),
      p(
        "Ask an AI agent to go read a web page and watch what happens. Cloudflare, PerimeterX, or DataDome takes one look at its naive fetch, decides it's a robot (it is), and slams the door. The agent gets a CAPTCHA or an empty shell, shrugs, and quotes some third-party summary instead of the source. I got tired of watching that happen.",
      ),
      h("The trick paid unlockers don't spell out"),
      p(
        "Commercial unlockers charge real money to punch through bot-walls, but the thing you're actually renting is their pool of millions of clean residential IP addresses. Here's the joke: you already have one. searchts runs on your machine, from your home connection, at personal volume. The single most expensive piece of the paid product is sitting in your house.",
      ),
      h("What a bot-wall actually checks"),
      p("A bot-wall is a bouncer with a checklist, and each line falls to a different trick:"),
      ...ul([
        "Do you look like a browser? Headers. Trivial.",
        "Do you sound like a browser? The TLS and HTTP/2 handshake (the JA3 fingerprint). Real Chrome has a distinctive accent; scripts sound robotic. This is the key lever.",
        "Can you run JavaScript? Needs a real engine.",
        "Can you press-and-hold like a human? An interactive CAPTCHA. No free robot beats this, and searchts admits it instead of faking success.",
        "Which neighborhood are you from? Datacenter IPs get flagged. Your home IP walks right in.",
      ]),
      h("The escalating ladder"),
      p("So a fetch walks a ladder, cheapest tier first, and stops at the first real content:"),
      ...ul([
        "curl_cffi puts on a real Chrome's exact TLS fingerprint in a single call. Fast, local, private: the URL never leaves your machine.",
        "Jina Reader, a JavaScript-rendering relay, for pages that only exist after the JS runs.",
        "A stealth browser (patchright), launched lazily only when the cheap tiers fail. You pay its 300-600 MB only on hard pages, never at idle.",
      ]),
      p(
        "The ladder remembers which tier worked per domain, so the second visit starts at the cheapest thing that works, and everything comes back as clean Markdown.",
      ),
      h("The bugs that taught me block detection"),
      p(
        "Deciding 'real page or wall?' is where naive implementations die, and every rule here was paid for with a real bug. Zillow's genuine homepage ships the PerimeterX sensor script, so matching vendor names falsely flagged 432 KB of real content: match the wall's interstitial phrases, never its vendor. A 500-character minimum called example.com blocked: short is not blocked, short is an escalation hint. And one relay returned HTTP 200 with a body politely explaining the upstream 403: a failure dressed as success, straight onto the block list.",
      ),
      h("Proof"),
      p(
        "One benchmark row says it all. Zillow: naive fetch, 403. Fingerprint tier, a genuine 200 with 422 KB of real listing data. Same request, same machine, same afternoon. And g2.com, sitting behind DataDome's interactive CAPTCHA, was reported blocked honestly instead of returning junk, because a tool that can't be trusted to say no can't be trusted to say yes either.",
      ),
      h("Beyond the unlocker"),
      p(
        "Reading is a third of it. searchts also searches (keyless, multi-provider, results fused with reciprocal rank) and transcribes video, subtitles-first with a Whisper fallback. It ships as a CLI, an MCP server, a Claude Code skill, and a plain Python library, and installed CLIs unlock native channels: GitHub, Twitter/X, Reddit, LinkedIn, RSS. Fetched content is scrubbed for invisible-character tricks and prompt-injection tells before it reaches an agent, and every read comes with a receipt (which tier, when, final URL), so what an agent read becomes a citation another agent can replay.",
      ),
      h("The honest ceiling"),
      p(
        "An interactive CAPTCHA still needs a human. Instead of pretending otherwise, a --human flag opens a real browser, you solve it once, and the fetch continues. Personal scale only: one home IP at low volume, not a mass scraper. Built on Agent-Reach (MIT), shipped MIT on PyPI. No API key, no proxy bill, no subscription.",
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
    // Ported from the Grove research paper (Notion) — mirrors Sanity.
    body: [
      h("Why it exists"),
      p(
        "AI coding editors generate more diffs and commits than any tool in history, and they review them in a cramped side panel. Sit with that for a second: the tool creating the most diffs has the worst diff UX. Grove fills the gap from the outside, a desktop app that sits beside Claude, Cursor, Windsurf, a terminal agent, or all of them at once, and answers one question well: what just changed, across which files and commits, and is it good?",
      ),
      h("The wedge"),
      p(
        "The Git GUI market is crowded, and almost none of it is actually free. GitKraken and Tower are paid, Fork and Sublime Merge nag, GitHub Desktop is thin, GitButler is source-available with a no-compete clause. The genuinely-free, genuinely-beautiful slice is sitting there empty. Grove is GPL-3.0: free as in actually free, and forks stay open. (GPL rather than AGPL because the network clause does nothing for a desktop app; copyleft alone stops proprietary forks.)",
      ),
      h("Three pillars"),
      ...ul([
        "A beautiful read-first, edit-light surface (commit graph, diffs, blame, stash, inline quick edits) that refreshes live as the repo changes under you.",
        "Worktree-first, because one-worktree-per-task is becoming how people run parallel agents.",
        "Bring-your-own agent for commit and PR text, never an in-house paid model.",
      ]),
      h("What works today"),
      p(
        "This isn't a mockup. I review my own repos in it daily, including one with 400+ commits and dozens of branches. The commit graph is a custom SVG lane renderer, no off-the-shelf library, because the look is the whole differentiator: color-coded lanes, ref pills, hollow nodes for unpushed commits, and real diffs on merge commits (diffed against the first parent, so a merge never shows up empty). Around it: a diff and blame viewer, a worktree dashboard with clean-or-dirty and ahead/behind for every tree, and Spotlight, one Ctrl+K across files, commit messages, branches, and file contents, instant because the heavy every-path-that-ever-existed walk is precomputed once and cached per query.",
      ),
      p(
        "And it's alive. A Rust file-watcher redraws the graph, status, and worktrees as your agent mutates the repo under you, with a pulsing live indicator. Every SHA, path, and branch gets a one-click copy.",
      ),
      h("The engine underneath"),
      p(
        "A Tauri 2 shell, a small Rust core, a Svelte 5 frontend. The git engine is a deliberate hybrid: gix (gitoxide) for reads, because reads are the hot path and gix is fast with no C dependency, and the user's own git binary for writes, one clean write boundary. That combination sidesteps libgit2's Windows build pain without giving up a single operation.",
      ),
      h("Honest state"),
      p(
        "Alpha. The v0 hero features have shipped and it survives daily use on real repos, but it's Windows-only for now and the installers are unsigned, so SmartScreen will warn until code-signing lands. Next up: syntax highlighting in diffs, a stash view, and wiring the bring-your-own-agent pillar fully.",
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
    // Ported from the GlyphMaps build-story paper (Notion) — mirrors Sanity.
    body: [
      h("The idea"),
      p(
        "My phone has 137 LEDs on its back, and for months they did nothing but blink at notifications. Meanwhile every drive meant glancing at a bright six-inch screen for what amounts to one arrow and one number. The Nothing Phone (4a) Pro's Glyph Matrix is a circular 13x13 dot grid, which happens to be exactly the right shape for a turn arrow. So: flip the phone face-down on the dash, and the next turn lights up on the back. The screen is for routing. The back is for the glance.",
      ),
      h("The API that said no"),
      p(
        "Nothing's official way onto the Matrix is the Glyph Toy framework, and it's throttled to always-on-display cadence: one update a minute. Navigation needs one every couple of seconds. Dead end, by design. But the way in was hiding in plain sight: setAppMatrixFrame, the SDK's raw framebuffer call, isn't throttled at all. It just needs a foreground lifecycle to stay alive. So GlyphMaps runs as a foreground service that claims the Matrix when you start navigating and releases it the moment the route ends, with a 20-second watchdog so your usual Glyph toy always comes back. That one architectural choice is why the app exists.",
      ),
      h("Reverse-engineering the turn"),
      p(
        "Google Maps has no public turn-by-turn API. The only surface is its live navigation notification, so I logged real captures, diffed them across maneuvers, and reverse-engineered the format. A listener scoped to exactly the Maps package and the navigation category parses out the maneuver and distance, and a turn hits the back of the phone within a few hundred milliseconds of Maps announcing it.",
      ),
      p(
        "Google's routing vocabulary has over 60 maneuver constants. On a 13x13 grid most of those distinctions are invisible, so they collapse into 12 shapes you can read at arm's length: chevrons, corners, forks, a hooked U-turn, a ringed roundabout, an arrival flag. Precedence matters here (sharp-left has to win over turn-left), and the post-trip 'How was your route?' survey gets dropped at the door.",
      ),
      h("One pure function"),
      p(
        "Everything renders through a single pure composer: parsed state in, 13x13 brightness grid out. Arrow on top, distance scrolling underneath as a marquee, because the grid is 13 LEDs wide and '1.5 km' isn't. The same function drives the LEDs and the in-app preview, so what the screen shows and what the back lights are pixel-identical. The arrows themselves are authored as ASCII strings, X for the bright head, o for the dim tail. The whole vocabulary is readable in the source.",
      ),
      h("The sweep that cannot drift"),
      p(
        "The animated mode originally used hand-drawn frames, one set per arrow. They drifted: the animated LEFT pointed at a different column than the static LEFT. Two sources of truth, both wrong. I deleted every hand-authored frame, and now the sweep is generated procedurally from the static pattern, so a settled animation frame lights exactly the same cells at exactly the same brightness. Drift isn't fixed. It's impossible.",
      ),
      h("Private by construction"),
      p(
        "An app that reads your navigation notifications had better be provably harmless: 100% on-device, no network code, no analytics, no account. A pre-release privacy audit still caught something real, though. The dev capture log could leak street names to logcat, so every code path that touches notification content is now gated behind a dev-only build flag, and the release build strips logging entirely.",
      ),
      h("Shipped"),
      p(
        "v1.0.0 runs on my actual phone on actual drives: a signed, R8-minified 2.3 MB APK on GitHub Releases. Twelve arrows, twelve generated sweeps, brightness sliders, two display modes. AGPL-3.0, after a deliberate MIT-to-AGPL migration with a full history scrub, so no one can quietly take it closed.",
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
    // Ported from the beep-beep-oss "How It Actually Works" paper (Notion) —
    // mirrors Sanity.
    body: [
      h("The problem"),
      p(
        "Somewhere along the way, chat apps started charging you for your own messages: unified-inbox products gate how fast your chats sync behind a subscription tier. beep-beep-oss is the opposite stance. Self-host it, and the throttle simply doesn't exist. Every messaging feature in the open client is free, permanently.",
      ),
      h("The architecture"),
      p(
        "It's Beeper's core architecture, rebuilt in the open: a Synapse homeserver, Postgres underneath, the mautrix bridges (literally the same bridge software Beeper runs) translating WhatsApp into Matrix, and a custom client on top. Matrix is the trick. It's an open protocol, basically email for chat: once a network is translated into it, any Matrix client can read it. That's the entire unified-inbox dream in one sentence. Your phone just sees another linked device, exactly like WhatsApp Web.",
      ),
      h("The client"),
      p(
        "A native Tauri 2 app: React in the OS webview over a Rust core on matrix-rust-sdk, desktop and mobile from one core, not another Electron shell hauling a whole browser around. The two halves talk across a typed IPC boundary where the Rust command list is the security boundary, and the TypeScript types are generated from the Rust structs, so the two languages cannot drift apart. One source of truth, two languages.",
      ),
      h("Making sync feel instant"),
      p(
        "Speed is the thesis, so the sync path got the real engineering. Simplified Sliding Sync as the engine. A reactive room-update stream pushed to the UI as debounced events, so the inbox and the open conversation fill themselves, no refresh button anywhere. Optimistic send that paints your message instantly and quietly reconciles in the background, with rollback if the network fails you. Lazily fetched real WhatsApp avatars, cached per room. All of it verified against real bridged WhatsApp chats, not a demo server.",
      ),
      h("Self-hosting's sharp edges"),
      p(
        "Running your own stack teaches you fast that the sharp edges are operational, not architectural. Windows line endings broke the database init script with a single invisible carriage return in a shebang. A Docker bind-mount quirk corrupted the bridge's trust tokens. localhost resolved to IPv6 while the server bound IPv4. Every one of them is documented in the repo, so the next self-hoster doesn't pay the same toll.",
      ),
      h("Status"),
      p(
        "Alpha, Phase 1 complete as a working two-way messenger with live sync. Multi-account is designed in from the start (two WhatsApp accounts side by side, bridged as a companion device so ban risk stays low), and the infra ships with a setup guide including a fully-free self-host path on Oracle Cloud's Always Free tier. Instagram lands next via mautrix-meta; Signal and Telegram after. AGPL-3.0, so nobody can quietly absorb it into a closed product.",
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
      "searchts gets the one thing paid unlockers actually charge for: your own IP is already past the bot-wall. Fast, keyless, and clearly built by someone who sweats the details.",
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
      "Claude Code skills",
      "LLM training data",
    ],
  },
  { _id: "demo-s1", label: "languages", items: ["TypeScript", "Python", "Rust", "Kotlin", "Lua"] },
  {
    _id: "demo-s2",
    label: "frameworks",
    items: ["Next.js", "React", "Svelte", "Tauri", "Electron"],
  },
  {
    _id: "demo-s3",
    label: "frontend & motion",
    items: ["Tailwind", "GSAP", "Motion", "Lenis", "React Three Fiber"],
  },
  {
    _id: "demo-s4",
    label: "backend & data",
    items: ["Node.js", "MongoDB / Mongoose", "REST APIs", "JWT auth", "AWS S3"],
  },
  {
    _id: "demo-s5",
    label: "systems & mobile",
    items: ["Android SDK", "Jetpack Compose", "Matrix / matrix-rust-sdk", "Docker"],
  },
  {
    _id: "demo-s6",
    label: "tooling & infra",
    items: ["Sanity", "Cloudflare", "PyPI", "GitHub Actions", "git"],
  },
];
