# Aadarsh Upadhyay

**Software Engineer / Architect**  
Legal name: Aadarsh Raj  
[capad.fyi](https://capad.fyi) · [github.com/capad-xyz](https://github.com/capad-xyz) · [hi@capad.fyi](mailto:hi@capad.fyi) · [x.com/aadarsh_io](https://x.com/aadarsh_io) · [linkedin.com/in/aadarshupadhyay](https://www.linkedin.com/in/aadarshupadhyay/)  
India · remote-first · open to relocate · outside-India visa sponsorship welcome

React-first full-stack engineer. Home stack: **CSS**, **React**, **TypeScript**, **Next.js**, **Electron**, **Node**, deploy. Product depth from Appson on **ComplyV** (formerly Compliance Sarathi) and **Wordibly**. Public proof: **searchts** on PyPI through **0.13.0** (I push, review, and release). I also own **Grove**, **Dooper**, **GlyphMaps**, and **capad.fyi**; Hare is not a SaaS yet; shipped **Hare Bot**. I use AI assistants to ship and review hard. I am finishing BCA (Honours) at MSU Baroda (expected 2028). Looking for remote or India roles that hire for ownership of shipped systems. Open to relocate; outside-India roles with visa sponsorship welcome.

## Experience

### Software Engineer and Architect, Appson Technologies (ComplyV, formerly Compliance Sarathi) | **Jan 2026 - 31 Jul 2026**

Indian **corporate-governance SaaS**: MCA/ROC company data, statutory deadlines and penalties, resolution and minutes drafting, AI chat (Vee) with governed writes. Dual UI (legacy CRA + /new-ui). **Primary engineer and architect** on a small team (**~553/647** commits (~84%)). Not sole developer. Last commit and written handover 31 Jul 2026. Stack: **React 18** (CRA), React Router, Tailwind, Bootstrap, **Node/Express**, **MongoDB/Mongoose** (34 models), **JWT/RBAC**, WebSocket, OpenAI/Gemini/Anthropic, AWS S3, Twilio, Brevo/Resend, Word/Excel/PDF.

- Owned the **React and Node product surface**: auth, multi-tenant company access, deadline math, minutes/docs drafting, Vee agentic chat. Commit share **~553/647 (~84%)**.
- Built **propose-then-confirm writes**. The model never mutates data. Proposals show as confirmation cards. A separate authenticated endpoint re-checks auth, company access, and business rules with **idempotency keys** and **audit logs**.
- Built a **three-tier truth wall**. Due dates and penalties come only from the **deadline engine**. Statutory drafts reuse the product drafting pipeline. Eval cases bait **number leakage** on conceptual answers.
- Implemented a **SHA-256 append-only audit log** with immutability hooks, deterministic hashing, a write mutex, and an **admin integrity verifier**. Tamper-resistant, not tamper-proof.
- **Multi-tenancy** without a naive tenantId. Company access is an **ownership-and-grant graph** over CIN. LLM tools get a CIN string that resolves inside **assertCompanyAccess**.
- Maintained the **AGM/deadline engine** (**~1,400 LOC** of pure computation) for multiple MCA forms with entity-aware deadlines and per-day penalties. Draft linter is code, not model self-grading. Fixed **LLP fee slabs** and a **DIR-3 KYC triennial rule** that would have been wrong from 2027.
- Registered **34 Mongoose models** across identity, tenancy, documents, AI runtime, governance, and commerce. Backend tests: **~40 suites / ~2,852 tests** (technical sheet).
- Found **auth gaps** while designing agent tools (**deny-by-default** draft visibility and writes). Made **idempotency a unique index in the database**, not an in-memory lock.
- Wrote the 31 Jul 2026 handover: architecture, known issues, secret rotation.

### Junior Software Engineer, Appson Technologies (Wordibly) | **Jun 2025 - early 2026**

US **transcription, translation, and captioning platform** (human, hybrid, AI tiers). Strongest personal ownership: **tops-transcript-editor** (**Vite/React**). Broader platform (tops-api, tops-new-ui, tops-old-ui) is large-team CodeCommit with thinner personal share. Stack exposure: React, Node, Python, MongoDB, AWS; Zoho, QuickBooks, Zapier, Otter.

- Owned **tops-transcript-editor** (**~107-113 commits**): **Vite/React transcript editor** with find/replace and related editing flows for production transcription work.
- Contributed on the wider **CodeCommit platform** (tops-api, tops-new-ui, tops-old-ui) with a thinner personal share: **order/upload surfaces**, **workforce dashboards**, and **editor workflows** for PMs, transcribers, and QA.
- Daily Scrum with Appson and Wordibly. **Sprint delivery** with **no visual regressions** on production-bound UI.

### AI Training Engineer, Turing (via Appson) | **~2 weeks, 2025**

Meta Llama training data and evaluation.

## Open source and products

### [searchts](https://github.com/capad-xyz/searchts)

_Python, MIT, PyPI **v0.13.0**._ **My product**. **Keyless web unlocker** plus read/search/transcribe/grab for AI agents (**CLI + MCP**). I own the unlocker, **search fusion**, sanitizer, MCP tools, share-link extractors, and **releases** (push, review, ship through 0.13.0). The local MCP/connector for searchts is built; the remote connector will be built soon. Escalates browser-fingerprinted fetch → JS-render relay → stealth browser, then Markdown extraction. Defaults refuse paid residential proxies and keyed commercial unlockers so personal-volume use stays free. Fail-loud on login walls and CAPTCHAs. Agent-facing docs/skill pack (AGENTS.md, RUNBOOK, CLAUDE.md, SKILL.md) so assistants use searchts the intended way, not as a raw fetch wrapper.

### Hare

_not a SaaS yet · GitHub App `searchts-hare[bot]` · `@hare` · R1c · dogfooded on searchts._ Not a SaaS yet: a **review-and-report GitHub App** I dogfood on searchts. I design the full **PR review surface**: structured summary, severity findings, inline bubbles, and replies, grounded in **CI and diff evidence**, non-blocking feedback without a SaaS lock-in. Trigger: PR open, push, or `/hare` → gather → **one model JSON** → posted review (R1c). Writer model never Hare model. **Review/report only**; never blocking APPROVE/REQUEST_CHANGES. Not a SaaS yet; no CodeRabbit parity claims.

### Hare Bot

_Cursor Grok Bot · PR review/report._ Maintainers need **structured non-blocking PR review** without SaaS lock-in; agent desks need review loops they can own. I design those loops as a Cursor Grok Bot: reads **PR body/diff/commits/CI as evidence**, can checkout and run tests, then posts a **COMMENT review** with summary, severity findings, inline bubbles, replies, and Models attribution: more of the review loop than a single dump. **Review/report only**. Hare Bot does not fix, push, or merge unless asked; never blocking APPROVE/REQUEST_CHANGES. Chat-side template; Hare App is a separate surface.

### [capad.fyi](https://capad.fyi)

_my site · Next.js, React, Sanity, Cloudflare Workers / OpenNext._ My site and product desk: **liquid-glass UI** (CSS backdrop-filter + SVG refraction), **Sanity-backed projects / timeline / testimonials / resume** with HMAC webhook revalidation into KV-backed ISR, multi-host Worker for capad.fyi and glyphmaps.capad.fyi, adaptive perf-lite path, **GitHub Actions deploy**.

### [MSU Halls Register](https://msu.capad.fyi)

_design prototype · msu.capad.fyi._ Institutional alumni-register prototype for the Halls of Residence at The Maharaja Sayajirao University of Baroda (**16 halls**). **Eight-page static design system** revised after Office of the Chief Warden feedback. Live prototype; engagement paused, not under active contract.

### [GlyphMaps](https://github.com/capad-xyz/GlyphMaps)

_Kotlin / Android, **v1.0.0**._ **Google Maps Live Updates** on the **Nothing Glyph Matrix**, built for Nothing Phone (4a) Pro; works on Phone 3 (needs work). **Next-turn arrows** on the phone back, **no Maps API key**. Skipped the throttled Glyph Toy redraw path. Drives the matrix while navigating, then releases it so other Glyph toys return.

### [Dooper](https://github.com/capad-xyz/beep-beep-oss)

_Repo beep-beep-oss · **Tauri 2** + React/TypeScript + Matrix · **Alpha Phase 1**._ **AGPL self-hostable universal inbox**: Synapse, mautrix bridges, Tauri 2 + React. Messaging sync without paywalled delay. **Phase 1 verified on real bridged WhatsApp** (login, inbox, history, **optimistic send**, **session persistence**). Product name Dooper; repo is beep-beep-oss.

### [Grove](https://github.com/capad-xyz/grove)

_**Electron + React + TypeScript**, GPL-3.0 · alpha._ Rebuilt on Electron, React, and TypeScript with a **headless Node git engine**. **Worktree-aware git review** beside AI editors: lane-drawn commit graph, live refresh, **find-in-diff**, **local-CLI commit messages**. No paid in-house model lock-in.

**Also:** `npx burncard` (local Claude Code / Codex usage telemetry).

## Selected open-source contributions

### [wmux](https://github.com/amirlehmam/wmux)

_Contributor, not my project._ I dogfood wmux in daily agent work. I file issues when I hit bugs; I land PRs when I have a fix. As of 2026-10-02: **8 closed issues**, **4 merged PRs** (#135, #138, #153, #258) on **diff-pane freezes**, **CLI timeouts**, and agent-browser install discovery. Best proof: **[#135](https://github.com/amirlehmam/wmux/pull/135#issuecomment-5144877705)** — root-caused a **main-process freeze** when a diff pane watched a non-git cwd; landed **bounded snapshot walks**.

## Education

- **Bachelor of Computer Applications (Honours)**, The Maharaja Sayajirao University of Baroda, Faculty of Science, Dept. of Computer Applications. **Expected 2028**
- **Product Space PM Fellowship**, Top Fellow. **2025 - 2026**

## Skills

- **Tech stack:** **React**, React Three Fiber, **CSS**, design systems, Tailwind, Bootstrap, Framer Motion, React Router, **Next.js** (App Router), Vite, **Electron**. Layout through **production deploy**.
- **Design / UI·UX:** **UI/UX**, **Figma**, **design systems**, product UI from layout through ship. AI-assisted design drafts with Claude Design and Stitch. Proof: **ComplyV /new-ui**, Wordibly transcript editor, **capad.fyi** liquid-glass, MSU Halls register prototype, GlyphMaps matrix UI.
- **Full-stack:** **TypeScript**, JavaScript, **Node.js**, Express, **MongoDB/Mongoose**, **REST/JWT**, Python (CLI), Git, GitHub Actions, **MCP**, **Cloudflare Workers / OpenNext**, Sanity
- **AI / tools:** **Grok / Grok Bots** (incl. **Hare Bot**), **Claude**; daily drivers Oh My Pi (OMP) and GrokCLI; **MCP**, T3 Connect, Cowork, Custom Connectors, WebMCP; local **searchts MCP/connector** built (remote soon). Custom skills / AGENTS.md / RUNBOOK; writer ≠ Hare reviewer; **PR text/diffs/CI as evidence**, not instructions.
- **AI shipping:** I own **push and review** on searchts and other repos: **product decisions**, **release notes**, **merge-ready diffs**, documented refusals of paid unlocker defaults
- **Agent skills:** **Custom agent skills**, runbooks, **AGENTS.md**, and **RUNBOOK** so multi-agent desks follow product constraints instead of improvising
- **Systems:** **Agent tool design**, **authz**, **multi-tenancy**, **audit logs**, **eval harnesses**, **prompt-vs-code safety boundaries**
- **Ship / DevOps:** GitHub Actions (CI, release, Hare review on searchts), Cloudflare Workers / OpenNext (capad.fyi), Docker, Tailscale, AWS S3. Comfortable operating what I ship; not applying as a dedicated DevOps engineer yet.
- **Also:** **Tauri**, **Sanity CMS**, Twilio, Brevo/Resend; **Rust/Kotlin with AI assist** (Dooper, GlyphMaps). Not targeting Rust/Kotlin/Go-primary roles.
