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
    featured: true,
    order: 10,
    oneLiner:
      "A keyless web unlocker that reads, searches, and transcribes what a naive fetch cannot, from bot-walled pages to whole AI-chat share conversations. Ships on PyPI through 0.13.1 as a CLI, an MCP server, and a Python library.",
    metrics: [
      { value: "0", label: "API keys" },
      { value: "3", label: "unlock tiers" },
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
    body: [
      h("The problem"),
      p(
        "Ask an AI agent to go read a web page and watch what happens. Cloudflare, PerimeterX, or DataDome takes one look at its naive fetch, decides it is a robot, and slams the door. The agent gets a CAPTCHA or an empty shell, shrugs, and quotes some third-party summary instead of the source. I got tired of watching that happen.",
      ),
      h("The trick paid unlockers do not spell out"),
      p(
        "Commercial unlockers charge real money to punch through bot-walls, but what you are actually renting is their pool of millions of clean residential IP addresses. Here is the joke: you already have one. searchts runs on your machine, from your home connection, at personal volume. The single most expensive piece of the paid product is sitting in your house.",
      ),
      h("What a bot-wall actually checks"),
      p("A bot-wall is a bouncer with a checklist, and each line falls to a different trick:"),
      ...ul([
        "Do you look like a browser? Headers. Trivial.",
        "Do you sound like a browser? The TLS and HTTP/2 handshake, the JA3 fingerprint. Real Chrome has a distinctive accent; scripts sound robotic. This is the key lever.",
        "Can you run JavaScript? Needs a real engine.",
        "Can you press and hold like a human? An interactive CAPTCHA. No free robot beats this, and searchts admits it instead of faking success.",
        "Which neighborhood are you from? Datacenter IPs get flagged. Your home IP walks right in.",
      ]),
      h("The escalating ladder"),
      p("So a fetch walks a ladder, cheapest tier first, and stops at the first real content:"),
      ...ul([
        "curl_cffi puts on a real Chrome's exact TLS fingerprint in a single call. Fast, local, private: the URL never leaves your machine.",
        "Jina Reader, a JavaScript-rendering relay, for pages that only exist after the JS runs.",
        "A stealth browser (patchright), launched lazily only when the cheap tiers fail. You pay its 300-600 MB on hard pages, never at idle.",
      ]),
      p(
        "The ladder remembers which tier worked per domain, so the second visit starts at the cheapest thing that works, and everything comes back as clean Markdown.",
      ),
      h("The bugs that taught me block detection"),
      p(
        "Deciding real page or wall is where naive implementations die, and every rule here was paid for with a real bug. Zillow's genuine homepage ships the PerimeterX sensor script, so matching vendor names falsely flagged 432 KB of real content: match the wall's interstitial phrases, never its vendor. A 500-character minimum called example.com blocked, because short is not blocked, short is an escalation hint. And one relay returned HTTP 200 with a body politely explaining the upstream 403, a failure dressed as success, straight onto the block list.",
      ),
      h("Proof"),
      p(
        "One benchmark row says it all. Zillow: naive fetch, 403. Fingerprint tier, a genuine 200 with 422 KB of real listing data. Same request, same machine, same afternoon. And g2.com, sitting behind DataDome's interactive CAPTCHA, was reported blocked honestly instead of returning junk, because a tool that cannot be trusted to say no cannot be trusted to say yes either.",
      ),
      h("The pages the ladder could not read"),
      p(
        "Then something beat the whole ladder with no bot-wall in sight. Paste a ChatGPT or Claude share link and all three tiers come back with a thin shell or a conversation cut off mid-sentence. Nothing was blocking me. A chat share page is a single-page app, and the transcript never lands in the page as text worth extracting, so there was simply nothing there to read.",
      ),
      p(
        "The fix runs ahead of the ladder instead of inside it: recognize the share URL, then read the provider's own data channel rather than the page it paints. Eight are handled now, in two shapes.",
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
        "Reading is a third of it. searchts also searches (keyless, multi-provider, results fused with reciprocal rank) and transcribes video, subtitles-first with a Whisper fallback. It ships as a CLI, an MCP server with six tools, a Claude Code skill, and a plain Python library. Fetched content is scrubbed for invisible-character tricks and prompt-injection tells before it reaches an agent, and every read comes with a receipt (which tier, when, final URL), so what an agent read becomes a citation another agent can replay.",
      ),
      p(
        "There is no per-platform router. `searchts doctor` only probes whether optional CLIs like gh or opencli are on PATH and logged in, and being on PATH is not a claim that searchts reads those sites through them. I retracted the older line about installed CLIs unlocking native GitHub, X, Reddit, LinkedIn and RSS channels, because it was not true and the README says so now.",
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
    featured: true,
    order: 40,
    oneLiner:
      "A free Git review companion that sits beside your AI coding editor. The commit graph, diffs, and every in-flight worktree, refreshing live as your agent changes the repo under you.",
    nowLine: "markdown fidelity + the large-commit freeze (v0.2.0-alpha)",
    metrics: [
      { value: "alpha", label: "stage" },
      { value: "worktree", label: "first" },
      { value: "BYO", label: "agent" },
    ],
    // Was rust/tauri/svelte for the pre-rebuild shell. The repo is now
    // Electron + React + TypeScript over a headless Node git engine, which is
    // also what GitHub reports as its primary language.
    tags: ["typescript", "electron", "react", "node"],
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
        "AI coding editors generate more diffs and commits than any tool in history, and they review them in a cramped side panel. Sit with that for a second: the tool creating the most diffs has the worst diff UX. Grove fills the gap from the outside. It is a desktop app that sits beside Claude, Cursor, Windsurf, a terminal agent, or all of them at once, and answers one question well. What just changed, across which files and commits, and is it good?",
      ),
      h("The wedge"),
      p(
        "The Git GUI market is crowded, and almost none of it is actually free. GitKraken and Tower are paid, Fork and Sublime Merge nag, GitHub Desktop is thin, GitButler is source-available with a no-compete clause. The free, good-looking slice is sitting there empty. Grove is GPL-3.0, so free means free and forks stay open. GPL rather than AGPL because the network clause does nothing for a desktop app; copyleft alone stops proprietary forks.",
      ),
      h("Three pillars"),
      ...ul([
        "A read-first, edit-light surface (commit graph, diffs, blame, stash, inline quick edits) that refreshes live as the repo changes under you.",
        "Worktree-first, because one worktree per task is becoming how people run parallel agents.",
        "Bring your own agent for commit and PR text, never an in-house paid model.",
      ]),
      h("What works today"),
      p(
        "This is not a mockup. I review my own repos in it daily, including one with 400+ commits and dozens of branches. The commit graph is a custom SVG lane renderer with no off-the-shelf library, because the look is the whole differentiator: color-coded lanes, ref pills, hollow nodes for unpushed commits, and real diffs on merge commits (diffed against the first parent, so a merge never shows up empty). Around it, a diff and blame viewer, a worktree dashboard with clean-or-dirty and ahead/behind for every tree, and Spotlight: one Ctrl+K across files, commit messages, branches, and file contents, instant because the heavy every-path-that-ever-existed walk is precomputed once and cached per query.",
      ),
      p(
        "And it is alive. A file-watcher redraws the graph, status, and worktrees as your agent mutates the repo under you, with a pulsing live indicator. Every SHA, path, and branch gets a one-click copy.",
      ),
      h("The engine underneath"),
      p(
        "Grove was rebuilt on Electron, React, and TypeScript around a headless Node git engine, away from the Tauri, Rust, and Svelte shell it started as. One language across the app and the engine means the commit-graph types, the diff model, and the worktree state are the same types in every layer, so a change to one cannot leave the others describing a shape that no longer exists.",
      ),
      h("Honest state"),
      p(
        "Alpha. The v0 features have shipped and it survives daily use on real repos, but it is Windows-only for now and the installers are unsigned, so SmartScreen will warn until code-signing lands. Next up: syntax highlighting in diffs, a stash view, and wiring the bring-your-own-agent pillar properly.",
      ),
    ],
  },
  {
    _id: "demo-glyphmaps",
    title: "glyphmaps",
    slug: "glyphmaps",
    status: "done",
    featured: true,
    order: 30,
    oneLiner:
      "Google Maps turn-by-turn on the back of a phone. GlyphMaps mirrors the next maneuver onto the Nothing Phone (4a) Pro's 137-LED Glyph Matrix, so a glance at a face-down phone shows your next turn. No Maps API key.",
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
        "My phone has 137 LEDs on its back, and for months they did nothing but blink at notifications. Meanwhile every drive meant glancing at a bright six-inch screen for what amounts to one arrow and one number. The Nothing Phone (4a) Pro's Glyph Matrix is a circular 13x13 dot grid, which happens to be exactly the right shape for a turn arrow. So I flip the phone face-down on the dash, and the next turn lights up on the back. The screen is for routing. The back is for the glance.",
      ),
      h("The API that said no"),
      p(
        "Nothing's official way onto the Matrix is the Glyph Toy framework, and it is throttled to always-on-display cadence: one update a minute. Navigation needs one every couple of seconds. Dead end, by design. But the way in was hiding in plain sight. setAppMatrixFrame, the SDK's raw framebuffer call, is not throttled at all. It just needs a foreground lifecycle to stay alive. So GlyphMaps runs as a foreground service that claims the Matrix when you start navigating and releases it the moment the route ends, with a 20-second watchdog so your usual Glyph toy always comes back. That one architectural choice is why the app exists.",
      ),
      h("Reverse-engineering the turn"),
      p(
        "Google Maps has no public turn-by-turn API. The only surface is its live navigation notification, so I logged real captures, diffed them across maneuvers, and reverse-engineered the format. A listener scoped to exactly the Maps package and the navigation category parses out the maneuver and distance, and a turn hits the back of the phone within a few hundred milliseconds of Maps announcing it.",
      ),
      p(
        "Google's routing vocabulary has over 60 maneuver constants. On a 13x13 grid most of those distinctions are invisible, so they collapse into 12 shapes you can read at arm's length: chevrons, corners, forks, a hooked U-turn, a ringed roundabout, an arrival flag. Precedence matters here, since sharp-left has to win over turn-left. The post-trip 'How was your route?' survey gets dropped at the door.",
      ),
      h("One pure function"),
      p(
        "Everything renders through a single pure composer: parsed state in, 13x13 brightness grid out. Arrow on top, distance scrolling underneath as a marquee, because the grid is 13 LEDs wide and '1.5 km' is not. The same function drives the LEDs and the in-app preview, so what the screen shows and what the back lights are pixel-identical. The arrows themselves are authored as ASCII strings, X for the bright head, o for the dim tail. The whole vocabulary is readable in the source.",
      ),
      h("The sweep that cannot drift"),
      p(
        "The animated mode originally used hand-drawn frames, one set per arrow. They drifted: the animated LEFT pointed at a different column than the static LEFT. Two sources of truth, both wrong. I deleted every hand-authored frame, and now the sweep is generated procedurally from the static pattern, so a settled animation frame lights exactly the same cells at exactly the same brightness. Drift is not fixed. It is impossible.",
      ),
      h("Private by construction"),
      p(
        "An app that reads your navigation notifications had better be provably harmless: 100% on-device, no network code, no analytics, no account. A pre-release privacy audit still caught something real. The dev capture log could leak street names to logcat, so every code path that touches notification content is now gated behind a dev-only build flag, and the release build strips logging entirely.",
      ),
      h("Shipped"),
      p(
        "v1.0.0 runs on my actual phone on actual drives: a signed, R8-minified 2.3 MB APK on GitHub Releases. Twelve arrows, twelve generated sweeps, brightness sliders, two display modes. AGPL-3.0, after a deliberate MIT-to-AGPL migration with a full history scrub, so no one can quietly take it closed.",
      ),
    ],
  },
  {
    _id: "demo-hare",
    title: "Hare",
    slug: "hare",
    status: "ongoing",
    featured: true,
    // Second, right behind searchts, on both the homepage grid and /projects.
    // It sits above glyphmaps despite being `ongoing` while glyphmaps is
    // `done`, which only works because `order` outranks the status band.
    order: 20,
    // One card for both forms. They are the same review contract with two
    // different triggers, and splitting them would read as two products when
    // one was cloned from the other. Status is ongoing because the App still
    // needs work; the chat form is the better of the two and the copy says so.
    oneLiner:
      "A PR reviewer in two forms. Hare Bot is a Grok Bot in a Cursor chat: it checks the branch out, installs it, runs the repo's own test command, and posts findings as me. Hare is that same review shipped as a GitHub App on 122 of my own PRs. Neither can approve a merge.",
    // No `nowLine` here. It used to say the App still lacks the computer run,
    // which is true and is the second section of the build story. Repeating it
    // on the card spent a line to say something one click away, and the card
    // read as a status update about a defect rather than about the work.
    metrics: [
      { value: "127", label: "app reviews" },
      { value: "25", label: "bot reviews" },
      { value: "0", label: "blocking" },
    ],
    tags: ["github-app", "actions", "code-review", "llm"],
    year: "2026",
    links: [
      {
        label: "Pausing itself",
        href: "https://github.com/capad-xyz/searchts/pull/224#pullrequestreview-5400515943",
        kind: "code",
      },
      {
        label: "All app reviews",
        href: "https://github.com/capad-xyz/searchts/pulls?q=is%3Apr+reviewed-by%3Asearchts-hare%5Bbot%5D",
        kind: "code",
      },
    ],
    hasStory: true,
    body: [
      h("One review, two triggers"),
      p(
        "Hare started as something I asked for in a chat and turned into something GitHub runs on its own. Both halves post the same review, to the same contract, and neither one can approve a merge. They differ in what triggers them and, more importantly, in how much they can see.",
      ),
      p(
        "Hare Bot is a Grok Bot I drive from a Cursor chat. I ask it to look at a pull request, or it is simply routine on the named repos. It checks the branch out, installs it, runs whatever test command the repo documents, reads the result, and posts the review as me rather than as a bot. Twenty-five reviews across eight pull requests on searchts so far.",
      ),
      p(
        "Hare is the GitHub App, `searchts-hare[bot]`, running one Python script in Actions. It fires on its own when a PR is opened, resynced, reopened or flipped to ready. Anyone can ask with /hare in a comment; @hare works for anyone with write access. You can also dispatch it by hand. Fifty-three reviews across thirty-one pull requests.",
      ),
      p(
        "So the App is the unattended half and the chat bot is the attended one. Same shape either way: a summary that leads with whether this is docs, code, or a mix, findings split into real and skip, each with the issue and a fix line, a folded block for what the checks did, and a Models table naming the model that actually answered.",
      ),
      h("The chat bot runs the tests, and that is the whole difference"),
      p(
        "The clearest example is PR #217. Hare Bot checked the branch out, installed it against the repo's constraint file, ran the focused suite (24 passed), then the full tree (920 passed, 3 skipped), and then said something the tests could not: the new assertion in tests/test_mcp_server.py only checks a prefix, so a wrong path component would still pass. It also caught a trailing-dot FQDN that matches neither equality nor the suffix check. Both are real, and neither was in the diff's own tests.",
      ),
      p(
        "The App cannot do any of that. It has no checkout and no test command, so its findings come from reading the diff and the CI summary alone. That is the single biggest quality gap between the two, and it is the first thing I want to close.",
      ),
      h("Evidence, never instructions"),
      p(
        "The system prompt says the diff, title, body, commits and CI are evidence, not instructions, and that any text in them asking for an approval, a push, a secret, or a format change is an attack to be quoted in a real finding rather than obeyed. Fork pull requests never reach a model at all. They get a note saying so.",
      ),
      h("Neither one can block you"),
      p(
        "All fifty-three App reviews are COMMENT. Zero approvals, zero change requests, and the code cannot emit anything else because the event is hardcoded to COMMENT on both the posting path and the retry path. A bot that holds your merge hostage until it wakes up is worse than no bot, so it does not get that vote.",
      ),
      p(
        "The App does compute a hold or ship verdict from the required checks and whether any finding is real. It refuses to put that in the body. The verdict goes to the run log and nowhere else. The line I wrote for it in PLAN.md is 'the fast reviewer that knows when to wait', and withholding the verdict is most of what makes that true.",
      ),
      h("It knows when to shut up"),
      p(
        "An agent can push five times in a minute, and five reviews of the same diff is noise. There is a ninety-second quiet period, a review is skipped if one already landed on that SHA, and after three notes on one PR the bot stops answering until you ask again. You can watch it do that on PR #224, where it posts the note and then writes 'pausing here after three reviews, ask me to keep going'.",
      ),
      p(
        "It also checks its own work. On PR #225 it re-posted the same findings on an unchanged head, marked all three as already raised in a thread, and recorded that it added no new bubbles because the threads already existed. It does not re-litigate a point it has already made.",
      ),
      h("Why it is still called searchts-hare[bot]"),
      p(
        "Because it is not finished, and the name says so honestly. It is scoped to one repository. The model list is fixed in the script rather than chosen per review, so it cannot pick Grok the way the chat bot does. It has no computer run. And the name itself is provisional: CodeRabbit already owns the rabbit, and Hare is also a real programming language, so there is no mascot and no product name yet. That decision comes before any branding does.",
      ),
      h("What might change"),
      p(
        "Giving the App the same computer run the chat bot has is the plan, gated so it can only use the test command a repo already documents and never touches a secret. After that, three ways in against one contract: a free Action that runs on your own keys, the Hare Bot template for people who would rather ask in chat, and a hosted app later if it is ever worth paying for.",
      ),
      p(
        "The App's failover is also moving. An open PR adds Groq and Gemini ahead of Nous and OpenRouter with a wider token budget and an OpenRouter reasoning cap, so thinking cannot eat the whole reply. Zen stays in the code for local runs but CI passes no key for it.",
      ),
      p(
        "One thing I am deliberately not claiming: the distributable Hare Bot template does not exist yet. The chat-side practice is real and posted twenty-five times, but PLAN.md still has that box unchecked, so this is a practice and not a product.",
      ),
    ],
  },
  {
    _id: "demo-beep",
    // Dooper is the product name; beep-beep-oss is only the repository slug.
    // The README says so outright: "The repository keeps its beep-beep-oss
    // codename; the product name is Dooper."
    title: "Dooper",
    // The slug stays on the codename. `/work/beep-beep-oss` is a published URL
    // and there is no slug-redirect table in next.config.ts, so renaming it
    // would 404 a link that is already out in the world.
    slug: "beep-beep-oss",
    status: "ongoing",
    order: 50,
    // Off the homepage grid on purpose. The four flagship slots are searchts,
    // GlyphMaps, Hare and Grove, and Dooper reads as a footnote entry instead.
    // It still appears on /projects and in the resume's open-source list,
    // because the work is real and hiding it would be the actual problem.
    featured: false,
    oneLiner:
      "A self-hostable universal chat client. All your messaging networks in one native inbox, with instant sync and nothing locked behind a paywall. Built on Matrix and Tauri, so the whole stack stays fast, native, and yours to run.",
    nowLine: "fast cold start + the multi-account inbox UI",
    metrics: [
      { value: "live", label: "sync" },
      { value: "0", label: "paywalls" },
      { value: "Matrix", label: "protocol" },
    ],
    // typescript, not rust: Tauri does carry a Rust core (the case study below
    // describes it), but the repo's primary language is TypeScript and that is
    // the stack the resume claims.
    tags: ["matrix", "tauri", "typescript"],
    year: "2026",
    license: "AGPL-3.0",
    links: [{ label: "Code", href: "https://github.com/capad-xyz/beep-beep-oss", kind: "code" }],
    hasStory: true,
    body: [
      h("The problem"),
      p(
        "Somewhere along the way, chat apps started charging you for your own messages. Unified-inbox products gate how fast your chats sync behind a subscription tier. Dooper is the opposite stance. Self-host it and the throttle simply does not exist. Every messaging feature in the open client is free, permanently.",
      ),
      h("The architecture"),
      p(
        "It is Beeper's core architecture, rebuilt in the open: a Synapse homeserver, Postgres underneath, the mautrix bridges (literally the same bridge software Beeper runs) translating WhatsApp into Matrix, and a custom client on top. Matrix is the trick. It is an open protocol, basically email for chat, so once a network is translated into it any Matrix client can read it. That is the entire unified-inbox dream in one sentence. Your phone just sees another linked device, exactly like WhatsApp Web.",
      ),
      h("The client"),
      p(
        "A native Tauri 2 app: React in the OS webview over a Rust core on matrix-rust-sdk, desktop and mobile from one core, not another Electron shell hauling a whole browser around. The two halves talk across a typed IPC boundary where the Rust command list is the security boundary, and the TypeScript types are generated from the Rust structs, so the two languages cannot drift apart. One source of truth, two languages.",
      ),
      h("Making sync feel instant"),
      p(
        "Speed is the thesis, so the sync path got the real engineering. Simplified Sliding Sync as the engine. A reactive room-update stream pushed to the UI as debounced events, so the inbox and the open conversation fill themselves with no refresh button anywhere. Optimistic send paints your message instantly and quietly reconciles in the background, rolling back if the network fails you. Lazily fetched real WhatsApp avatars, cached per room. All of it verified against real bridged WhatsApp chats, not a demo server.",
      ),
      h("Self-hosting's sharp edges"),
      p(
        "Running your own stack teaches you fast that the sharp edges are operational, not architectural. Windows line endings broke the database init script with a single invisible carriage return in a shebang. A Docker bind-mount quirk corrupted the bridge's trust tokens. localhost resolved to IPv6 while the server bound IPv4. Every one of them is documented in the repo, so the next self-hoster does not pay the same toll.",
      ),
      h("Status"),
      p(
        "Alpha, with Phase 1 complete as a working two-way messenger with live sync. Multi-account is designed in from the start (two WhatsApp accounts side by side, bridged as a companion device so ban risk stays low), and the infra ships with a setup guide including a fully free self-host path on Oracle Cloud's Always Free tier. Instagram lands next via mautrix-meta, then Signal and Telegram. AGPL-3.0, so nobody can quietly absorb it into a closed product.",
      ),
    ],
  },
  {
    // Not my project. Listed under open source because the work is, but it is a
    // contribution to somebody else's repo and the homepage already says so in
    // the footnote. `status: "contributed"` (not `done`) because the pill is a
    // claim about authorship — it badges "contributed", never "shipped".
    // `hasStory` is false because there is no case study.
    _id: "demo-wmux",
    title: "wmux",
    slug: "wmux",
    status: "contributed",
    order: 60,
    featured: false,
    oneLiner:
      "A terminal multiplexer froze whenever I opened a diff pane on a non-git folder. I profiled the main process, found 92 percent of self-time in synchronous fs calls under a 2-second poll, and took one call from timeout to 0.7ms. Contribution, not authorship: 9 filed issues and 4 merged PRs (#135, #138, #153, #258) on diff-pane freezes, CLI timeouts, and agent-browser install discovery.",
    tags: ["typescript", "node", "performance", "open-source-contribution"],
    year: "2026",
    links: [
      { label: "PR #135", href: "https://github.com/amirlehmam/wmux/pull/135", kind: "code" },
      {
        label: "All my PRs",
        href: "https://github.com/amirlehmam/wmux/pulls?q=is%3Apr+author%3Acapad-xyz",
        kind: "code",
      },
    ],
    hasStory: false,
  },
  {
    _id: "demo-burncard",
    title: "burncard",
    slug: "burncard",
    status: "ongoing",
    order: 70,
    featured: false,
    oneLiner:
      "Know what your AI coding agents actually cost. burncard reads your Claude Code and Codex logs on your own machine, so the numbers are yours and nothing gets proxied through anyone else.",
    tags: ["typescript", "node", "cli", "llm-telemetry"],
    year: "2026",
    links: [
      { label: "GitHub", href: "https://github.com/capad-xyz/burncard", kind: "code" },
      { label: "npx burncard", href: "https://www.npmjs.com/package/burncard", kind: "package" },
    ],
    hasStory: false,
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
      "#133, which is one of the best bug reports this project has had. ... You attached a debugger to the main process, took a CPU profile, and came back with 92% of self-time in readdirSync/statSync/readFileSync under walkDir/readCurrentFile, plus a before/after table showing system.identify going from timeout to 0.7 ms.",
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
    // "and", not "&": this is the title as it appears on the printed resume.
    position: "Software Engineer and Architect",
    // ComplyV is the current product name; Compliance Sarathi is the former one,
    // and both still turn up in code, commit history, and the Appson contract.
    company: "ComplyV (formerly Compliance Sarathi) · Appson Technologies",
    startYear: "2026",
    endYear: "2026",
    // The Appson contract ended 31 Jul 2026. Not `current` — the timeline's
    // pulsing "current" badge is a live claim and has to stay true.
    current: false,
    summary:
      "Primary engineer and architect on a small team for ComplyV, an Indian corporate-governance SaaS covering MCA/ROC company data, statutory deadlines and penalties, resolution and minutes drafting, and Vee, an agentic chat with governed writes (~553 of 647 commits, ~84%; not sole developer). Wrote the propose-then-confirm write path so the model never mutates data, a three-tier truth wall that keeps due dates and penalties on the deadline engine alone, multi-tenancy as an ownership-and-grant graph over CIN rather than a naive tenantId, and a SHA-256 append-only audit log with an admin integrity verifier. Maintained the ~1,400 LOC AGM/deadline engine and 34 Mongoose models. React 18 + Node/Express + MongoDB.",
  },
  {
    _id: "demo-w2",
    position: "Junior Software Engineer",
    company: "Wordibly · Appson Technologies",
    startYear: "2025",
    endYear: "2026",
    current: false,
    summary:
      "Owned tops-transcript-editor, a Vite/React transcript editor with find/replace and related editing flows for production transcription work (~107-113 commits), at Wordibly, a US hybrid human and AI transcription, translation, and captioning platform. Contributed with a thinner personal share on the wider CodeCommit platform (tops-api, tops-new-ui, tops-old-ui): order and upload surfaces, workforce dashboards, and editor workflows for PMs, transcribers, and QA.",
  },
  {
    _id: "demo-w3",
    position: "AI Training Engineer",
    company: "Turing (via Appson Technologies)",
    startYear: "2025",
    current: false,
    summary:
      "Short two-week contract producing Meta Llama training data and evaluation sets, hands-on LLM data work via Appson Technologies.",
  },
];

// Mirrors the published Sanity stackGroup documents, and follows the Skills
// section of the printed resume rather than the CMS's older grouping.
export const DEMO_STACK_GROUPS: StackGroup[] = [
  // Only what he can be interviewed on. Rust and Kotlin shipped real software
  // (Grove, beep-beep-oss, GlyphMaps) but with heavy AI assistance, so they are
  // not listed as languages he speaks.
  { _id: "demo-s1", label: "languages", items: ["TypeScript", "JavaScript", "Python"] },
  {
    _id: "demo-s2",
    label: "frameworks",
    items: ["Next.js", "React", "React Router", "Vite", "Electron"],
  },
  {
    _id: "demo-s3",
    label: "frontend & design",
    items: [
      "CSS",
      "design systems",
      "UI/UX",
      "Figma",
      "Tailwind",
      "Bootstrap",
      "Framer Motion",
      "React Three Fiber",
      "GSAP",
      "Lenis",
      "Claude Design",
      "Stitch",
    ],
  },
  {
    _id: "demo-s4",
    label: "backend & data",
    items: [
      "Node.js",
      "Express",
      "MongoDB / Mongoose",
      "REST",
      "JWT / RBAC",
      "WebSocket",
      "AWS S3",
      "Twilio",
      "Brevo / Resend",
    ],
  },
  {
    _id: "demo-s5",
    label: "auth & systems",
    items: [
      "multi-tenancy",
      "authz",
      "audit logs",
      "agent tool design",
      "eval harnesses",
      "prompt-vs-code safety",
    ],
  },
  {
    _id: "demo-s6",
    label: "mobile & desktop",
    items: ["Android SDK", "Jetpack Compose", "Tauri", "Matrix / matrix-rust-sdk"],
  },
  {
    _id: "demo-s7",
    label: "tooling & infra",
    items: [
      "Sanity",
      "Cloudflare Workers / OpenNext",
      "GitHub Actions",
      "PyPI",
      "Docker",
      "Tailscale",
      "Git",
      "wmux",
    ],
  },
  {
    // Last, not first. The tools he reaches for are the answer to everything
    // above them; leading with them made the list read as a list of AI tools
    // rather than as an engineer's stack.
    _id: "demo-s0",
    label: "agentic tool",
    items: [
      "Grok / Grok Bots",
      "Claude",
      "OpenAI / Gemini / Anthropic",
      "MCP",
      "searchts MCP",
      "Oh My Pi (OMP)",
      "GrokCLI",
      "Claude Code skills",
      "AGENTS.md / RUNBOOK",
      "T3 Connect",
      "Cowork",
      "WebMCP",
    ],
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
    _id: "demo-a0c",
    name: "MSU Halls Register",
    note: "an alumni-register design prototype for MSU Baroda's 16 halls; live, engagement paused",
    kind: "built",
    href: "https://msu.capad.fyi",
  },
  {
    // A full project document too, just not a homepage card. The footnote is
    // how it stays visible now that it is off the four-card grid.
    _id: "demo-a0d",
    name: "Dooper",
    note: "a self-hostable Matrix inbox; Tauri 2 and React, AGPL, no paywalls on your own messages",
    kind: "built",
    href: "https://github.com/capad-xyz/beep-beep-oss",
  },
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
    _id: "demo-a4",
    name: "wmux",
    note: "a main-process freeze in a terminal multiplexer; diagnosed, patched, merged. 9 filed issues and 4 merged PRs (#135, #138, #153, #258) on diff-pane freezes, CLI timeouts, and agent-browser install discovery",
    kind: "contributed",
    href: "https://github.com/amirlehmam/wmux/pulls?q=is%3Apr+author%3Acapad-xyz",
  },
];

// /resume and /cv. Mirrors the published Sanity `resume` singleton, and doubles
// as the production floor for that page (see getResume in sanity.ts): a recruiter
// arriving from a job application must never meet an empty resume because the
// CMS blinked. Everything here is copied from the real PDF in /public.
//
// The phone number is deliberately NOT in `contacts`. It is on the PDF, which is
// one click away; putting it in HTML hands it to every scraper that crawls the
// site. One CMS entry away if he wants it.
export const DEMO_RESUME: Resume = {
  headline: "Software Engineer / Architect",
  // The printed resume's own summary, kept verbatim. Two documents describing
  // the same person should not disagree about what he is looking for, and this
  // paragraph is the one he actually sends to recruiters.
  summary:
    "React-first full-stack engineer. Home stack: CSS, React, TypeScript, Next.js, Electron, Node, deploy. Product depth from Appson on ComplyV (formerly Compliance Sarathi) and Wordibly. Public proof: searchts on PyPI through 0.13.1 (I push, review, and release). I also own Grove, Dooper, GlyphMaps, and capad.fyi; Hare is not a SaaS yet; shipped Hare Bot. I use AI assistants to ship and review hard. I am finishing BCA (Honours) at MSU Baroda (expected 2028). Looking for remote or India roles that hire for ownership of shipped systems. Open to relocate; outside-India roles with visa sponsorship welcome.",
  availability: "India · remote-first · open to relocate · outside-India visa sponsorship welcome",
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
      credential: "Bachelor of Computer Applications (Honours)",
      institution:
        "The Maharaja Sayajirao University of Baroda, Faculty of Science, Dept. of Computer Applications",
      period: "Expected 2028",
      note: "Ongoing undergraduate programme.",
    },
    {
      credential: "Product Space PM Fellowship, Top Fellow",
      institution: "Product Space",
      period: "2025 - 2026",
      note: "Product management fellowship; recognized as Top Fellow for the cohort.",
    },
  ],
  // Mirrors `resume.downloads` in the CMS. Order is the design: the first entry
  // is the big one-click button, the rest sit behind the "other formats" menu.
  // All six files are committed to /public, so this list works with Sanity down.
  //
  // Resume and CV are two different documents, not two formats of one. The
  // resume is the two-page screen; the CV is the four-page record with the
  // architecture notes and the selected-systems section. Both are offered because
  // some recruiters want one and some want the other, and guessing wrong for
  // them is a worse outcome than a slightly longer menu.
  downloads: [
    {
      label: "Download the PDF",
      format: "PDF",
      href: "/Aadarsh_Upadhyay_Resume.pdf",
      filename: "Aadarsh_Upadhyay_Resume.pdf",
    },
    {
      label: "Resume · Word file",
      format: "DOCX",
      href: "/Aadarsh_Upadhyay_Resume.docx",
      filename: "Aadarsh_Upadhyay_Resume.docx",
    },
    {
      label: "Resume · Markdown",
      format: "MD",
      href: "/Aadarsh_Upadhyay_Resume.md",
      filename: "Aadarsh_Upadhyay_Resume.md",
    },
    {
      label: "Download the CV",
      format: "PDF",
      href: "/Aadarsh_Upadhyay_CV.pdf",
      filename: "Aadarsh_Upadhyay_CV.pdf",
    },
    {
      label: "CV · Word file",
      format: "DOCX",
      href: "/Aadarsh_Upadhyay_CV.docx",
      filename: "Aadarsh_Upadhyay_CV.docx",
    },
    {
      label: "CV · Markdown",
      format: "MD",
      href: "/Aadarsh_Upadhyay_CV.md",
      filename: "Aadarsh_Upadhyay_CV.md",
    },
  ],
  updated: "PDF · two pages · updated Oct 2026",
};
