import type {
  ProjectDetail,
  Testimonial,
  WorkExperience,
  StackGroup,
  AlsoShipped,
  Resume,
  SocialLink,
} from "./sanity";
import type { PortableTextBlock } from "@portabletext/types";

/**
 * DEMO CONTENT — placeholder data so every section (projects + metrics, case
 * studies, experience, stack, testimonials) renders fully before the Sanity CMS
 * is populated. Wired in sanity.ts: while demo mode is on it OVERRIDES the CMS,
 * so all of it is guaranteed to show. Demo mode is on in dev / any non-prod
 * build and off in production — force on with NEXT_PUBLIC_DEMO_CONTENT=1, or off
 * with =0 (to preview real CMS content in dev). See DEMO_ENABLED in sanity.ts.
 *
 * ⚠️ Nothing in here is invented. The PROJECTS (metrics, licenses, links,
 * case-study bodies) are verified against the repos and the Notion write-ups;
 * the TESTIMONIALS are the real published quotes with the real source links;
 * experience, stack and resume are his actual history. Every block mirrors a
 * published Sanity document — edit one side and you must edit the other. To drop
 * demo entirely, delete this file and the `DEMO_*` references in sanity.ts.
 *
 * DEMO_RESUME has a second job: it is also the production fallback for /resume
 * (see getResume in sanity.ts), so it is the one block that can reach a real
 * visitor. Hold it to the standard of the printed resume.
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
      "The missing layer between AI and the web: a keyless, open-source unlocker that reads, searches, and transcribes what a naive fetch cannot, from bot-walled pages to complete AI-chat share conversations, straight from your terminal or agent.",
    metrics: [
      { value: "0", label: "API keys" },
      { value: "3", label: "unlock tiers" },
      // "agent commands" is the MCP tool count (read_url, web_search,
      // fetch_asset, grab_site, get_status). It was 4 here until get_status
      // became a first-class tool in searchts 0.5.0.
      { value: "5", label: "agent commands" },
      { value: "8", label: "AI-chat providers" },
    ],
    tags: ["python", "cli", "mcp", "web-unlocker"],
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
      h("The pages the ladder could not read"),
      p(
        "Then something beat the whole ladder with no bot-wall in sight. Paste a ChatGPT or Claude share link and all three tiers come back with a thin shell or a conversation cut off mid-sentence. Nothing was blocking me. A chat share page is a single-page app, and the transcript never lands in the page as text worth extracting, so there was simply nothing there to read.",
      ),
      p(
        "The fix runs ahead of the ladder instead of inside it: recognize the share URL, then read the provider's own data channel rather than the page it paints. Eight are handled now, and they come in two shapes:",
      ),
      ...ul([
        "Five hand the transcript over with no browser at all. ChatGPT and Poe bury it in the page payload (a React Router turbo-stream, a __NEXT_DATA__ blob); Claude, Grok and Gemini answer a keyless endpoint that the Chrome-impersonated fetch already clears.",
        "Three are JavaScript shells: DeepSeek, Perplexity and Copilot. Those borrow the stealth tier's browser, wait on a ready selector, scroll until the page height stops moving so virtualization cannot truncate the chat, then click the collapsed sections open before reading.",
      ]),
      p(
        "Each provider is one auto-discovered module, so adding the ninth is adding a file, and an extractor that fails drops through to the normal ladder rather than failing the read. The benchmark covers the five that need no browser and passes all five. The three that need one are not in it yet.",
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

// Mirrors the four FEATURED Sanity testimonial documents, in their published
// order — the same set `getTestimonials` returns in production. Three carry a
// `link` to the PR comment or post they were said in; the deck renders that as a
// "source" affordance and simply omits it on the fourth. Keep this in sync with
// Sanity so dev preview matches production.
export const DEMO_TESTIMONIALS: Testimonial[] = [
  {
    _id: "demo-t1",
    quote:
      "#133 is one of the best bug reports this project has had. You attached a debugger to the main process, took a CPU profile, and came back with a before/after table showing system.identify going from timeout to 0.7 ms.",
    name: "amirlehmam",
    role: "Maintainer",
    company: "wmux",
    link: "https://github.com/amirlehmam/wmux/pull/135#issuecomment-5144877705",
  },
  {
    _id: "demo-t2",
    quote:
      "\"from your own IP\" is the whole insight. a proxy pool fights the bot-wall; your own IP is already through it, same reason a human's browser doesn't trip cloudflare. an agent acting from where you already are doesn't need to sneak in. nice build.",
    name: "Phi Browser",
    role: "on searchts",
    company: "@phibrowser",
    link: "https://x.com/phibrowser/status/2075049980268822770",
  },
  {
    _id: "demo-t3",
    quote:
      "fetch-time + final_url turns read output into something a reviewer can cite later. Tier/status is useful; redirect + timestamp makes it durable.",
    name: "Dang_nh",
    role: "on searchts",
    company: "@hikariraina",
    link: "https://x.com/aadarsh_io/status/2075055433493160062",
  },
  {
    _id: "demo-t4",
    quote:
      "Aadarsh owned the architecture of Compliance Sarathi end to end and shipped a reliable agentic assistant under real deadline pressure. He is who you want on the hard parts of a system.",
    name: "Engineering, Compliance Sarathi",
    role: "Engineering",
    company: "Appson Technologies",
  },
];

export const DEMO_WORK_EXPERIENCE: WorkExperience[] = [
  {
    _id: "demo-w1",
    position: "Software Engineer & Architect",
    company: "Compliance Sarathi · Appson Technologies",
    startYear: "2026",
    endYear: "2026",
    // The Appson contract ended 31 Jul 2026. Not `current` — the timeline's
    // pulsing "current" badge is a live claim and has to stay true.
    current: false,
    summary:
      "Main engineer and architect of Compliance Sarathi, an AI-powered ROC and corporate-compliance platform for Indian companies, where I wrote 542 of 647 commits (84%). Designed its agentic AI assistant with a safety-gated action layer, a multi-provider LLM service (OpenAI, Gemini, Claude), and a deterministic statutory-deadline engine, leading architecture, core build, and client delivery on a React + Node / MongoDB stack.",
  },
  {
    _id: "demo-w2",
    position: "Software Engineer",
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
  // Only what he can be interviewed on. Rust and Kotlin shipped real software
  // (Grove, beep-beep-oss, GlyphMaps) but with heavy Claude Code assistance, so
  // they are not listed as languages he speaks — same as the published Sanity doc.
  { _id: "demo-s1", label: "languages", items: ["TypeScript", "JavaScript", "Python"] },
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

// The floating contact stack. Doubles as the seed set: `getSocialLinks` falls
// back to this when the CMS returns nothing, so the bubbles never disappear
// mid-migration. Icons are path data only — the widget builds the <svg> and
// sets `d`, so nothing here (or in the CMS) can inject markup.
export const DEMO_SOCIAL_LINKS: SocialLink[] = [
  {
    _id: "demo-s1",
    label: "GitHub - capad-xyz",
    href: "https://github.com/capad-xyz",
    iconViewBox: "0 0 16 16",
    iconSize: 21,
    iconPath:
      "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z",
    surface:
      "radial-gradient(circle at 30% 22%, #8b8b95 0%, #26262c 52%, #08080a 100%)",
  },
  {
    _id: "demo-s2",
    label: "LinkedIn - Aadarsh Upadhyay",
    href: "https://www.linkedin.com/in/aadarshupadhyay",
    iconViewBox: "0 0 24 24",
    iconSize: 19,
    iconPath:
      "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.44v6.3ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z",
    surface:
      "radial-gradient(circle at 34% 26%, #7e7e88 0%, #1f1f25 50%, #060608 100%)",
  },
  {
    _id: "demo-s3",
    label: "X - @aadarsh_io",
    href: "https://x.com/aadarsh_io",
    iconViewBox: "0 0 24 24",
    iconSize: 19,
    iconPath:
      "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z",
    surface:
      "radial-gradient(circle at 42% 32%, #6d6d77 0%, #17171c 48%, #030304 100%)",
  },
];

// The homepage footnote under the four-card grid. Mirrors the published Sanity
// `alsoShipped` documents. `kind: "contributed"` is not decoration — the
// homepage renders those under a lead-in that says the project is not his.
// Links are only set where a real one exists; the two older Windows toys have no
// public URL and render as plain text rather than pointing at nothing.
export const DEMO_ALSO_SHIPPED: AlsoShipped[] = [
  {
    _id: "demo-a1",
    name: "CoffeeBreath",
    note: "a Rainmeter music widget that breathes with the song's album art",
    kind: "built",
  },
  {
    _id: "demo-a2",
    name: "Discord Voice Overlay",
    note: "a glass desktop overlay for live voice control",
    kind: "built",
  },
  {
    _id: "demo-a3",
    name: "burncard",
    note: "local-first AI usage and cost telemetry for Claude Code, one npx burncard away",
    kind: "built",
    href: "https://github.com/capad-xyz/burncard",
  },
  {
    _id: "demo-a4",
    name: "wmux",
    note: "a main-process freeze in a terminal multiplexer; diagnosed, patched, merged, shipped in v0.40.0",
    kind: "contributed",
    href: "https://github.com/amirlehmam/wmux/pull/135",
  },
];

// /resume and /cv. Mirrors the published Sanity `resume` singleton, and doubles
// as the production floor for that page (see getResume in sanity.ts): a recruiter
// arriving from a job application must never meet an empty resume because the
// CMS blinked. Everything here is copied from the real one-page PDF in /public.
//
// The phone number is deliberately NOT in `contacts`. It is on the PDF, which is
// one click away; putting it in HTML hands it to every scraper that crawls the
// site. One CMS entry away if he wants it.
export const DEMO_RESUME: Resume = {
  headline: "Software Engineer & Architect",
  summary:
    "Software engineer and architect who owns systems end to end: architecture, core build, and direct client delivery. My sweet spot is forward-deployed-style work — take a vague client ask, tinker until I find what the client and the system actually want, and ship it as a production feature. Most recently the primary engineer and architect of an agentic AI compliance SaaS, where I wrote 542 of its 647 commits. Nights and weekends I ship open-source developer tools with real releases on PyPI, npm, and signed APKs.",
  availability: "Remote-first; open to relocation worldwide (visa sponsorship welcome)",
  contacts: [
    { label: "email", value: "hi@capad.fyi", href: "mailto:hi@capad.fyi" },
    { label: "site", value: "capad.fyi", href: "https://capad.fyi" },
    { label: "github", value: "github.com/capad-xyz", href: "https://github.com/capad-xyz" },
    {
      label: "linkedin",
      value: "in/aadarshupadhyay",
      href: "https://www.linkedin.com/in/aadarshupadhyay",
    },
    { label: "x", value: "@aadarsh_io", href: "https://x.com/aadarsh_io" },
  ],
  education: [
    {
      credential: "BCA (Hons.)",
      institution: "The Maharaja Sayajirao University of Baroda",
      period: "2024 - 2028 (expected)",
    },
  ],
  // Mirrors `resume.downloads` in the CMS. Order is the design: the first entry
  // is the big one-click button, the rest sit behind the "other formats" menu.
  // Both files are committed to /public, so this list works with Sanity down.
  downloads: [
    {
      label: "Download the PDF",
      format: "PDF",
      href: "/Aadarsh_Upadhyay_Resume.pdf",
      filename: "Aadarsh_Upadhyay_Resume.pdf",
    },
    {
      label: "Download the Word file",
      format: "DOCX",
      href: "/Aadarsh_Upadhyay_Resume.docx",
      filename: "Aadarsh_Upadhyay_Resume.docx",
    },
  ],
  updated: "PDF · one page · updated Aug 2026",
};
