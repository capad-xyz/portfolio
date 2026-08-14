# Aadarsh Upadhyay

**Software Engineer and Architect**

[capad.fyi](https://capad.fyi) | [github.com/capad-xyz](https://github.com/capad-xyz) | [linkedin.com/in/aadarshupadhyay](https://www.linkedin.com/in/aadarshupadhyay) | hi@capad.fyi | [@aadarsh_io](https://x.com/aadarsh_io) | +91 96317 21006

Remote-first; open to relocation worldwide (visa sponsorship welcome)

---

## Summary

Software engineer and architect who owns systems end to end: architecture, core build, and direct client delivery. My sweet spot is forward-deployed-style work: take a vague client ask, tinker until I find what the client and the system actually want, and ship it as a production feature. Most recently the primary engineer and architect of an agentic AI compliance SaaS; 84% of its commits are mine. Nights and weekends I ship open-source developer tools with real releases on PyPI, npm, and signed APKs.

## Experience

### Software Engineer and Architect - Appson Technologies (Compliance Sarathi)
*Jan 2026 - Jul 2026*

AI compliance SaaS for Indian corporate-governance and ROC/MCA compliance, used by company secretaries and CA/CS professionals. Designed and built the entire system end to end as primary engineer and architect (542 of 647 commits, 84%; ~146k insertions), with direct client delivery: I take client requests myself, from vague ask to shipped feature.

- Designed and built the platform's headline feature: an agentic AI compliance assistant with a strict truth-wall design. Read tools answer only from a deterministic deadline engine, never model memory; write actions (add company, set compliance dates, assign professionals) go through propose-then-confirm with server-side re-validation, idempotency keys, per-CIN access checks, and a tamper-resistant audit chain.
- Built the AI governance control plane: runtime enable/disable and re-scoping of every agent action by role, multi-provider model management (OpenAI, Gemini, Anthropic behind one interface), per-mode model routing, and usage/cost dashboards.
- Built the AGM Deadline Engine: pure-computation module covering 12+ statutory forms (AOC-4, MGT-7, ADT-1, DIR-3 KYC, ITR-6, LLP forms) with entity-type-aware deadlines and per-day penalty calculators.
- Shipped AI drafting across the document stack: a meeting-minutes pipeline (SS-1/SS-2-compliant minutes for Board/AGM/EGM/Committee), 70+ AI-drafted statutory document types, resolution and report draft pipelines, and chat generation that survives navigation and full reload.
- Built the audit and observability layer: a tamper-resistant audit trail across user and agent actions, structured error logging, and per-call AI usage and cost telemetry.
- Led the platform's UI/UX overhaul: a dual-UI rewrite mounted alongside the legacy app, including a full redesign of the recent-entries experience.
- Own the full stack: React 18, Node/Express, MongoDB (34 models, 28 route groups), JWT auth with RBAC, AWS S3, Twilio, server-side company creation with live MCA/CIN lookup, multi-format document generation (Word/Excel/PDF).

### Software Engineer - Appson Technologies (client products)
*Jun 2025 - Jan 2026*

Delivered across four client engagements on React, React Native, Node, Python, MongoDB, and AWS:

- **Wordibly** (US transcription SaaS, HIPAA-compliant): customer ordering and upload flows, tiered human/hybrid/AI transcription workflows, and transcriber and manager dashboards, through the platform's 2025 redesign generation.
- **AI avatar platform**: upload pipeline state logic and frontend delivery on an agile sprint team.
- **Document-AI / OCR product**: React Native (Expo) mobile app work including a design-system migration, smart camera and crop scanner workflow, document editing, and chat artifacts.
- **Turing (AI training)**: short specialist engagement training Meta's Llama models; hands-on LLM data and evaluation work.

## Open Source (github.com/capad-xyz)

- **searchts** (Python, MIT, on PyPI) - The missing layer between AI and the web: a keyless open-source unlocker that gets agents past bot-walls (Cloudflare, PerimeterX, DataDome) via an escalating fetch ladder (browser-fingerprinted TLS, JS-render relay, stealth browser, human-in-the-loop CAPTCHA). Reads AI-chat share links no generic reader can (decodes ChatGPT, Claude, Gemini, Grok, and Poe share URLs into complete role-labeled conversations, each provider a drop-in plugin). Plus keyless multi-provider search with rank fusion, video transcription with Whisper fallback, and prompt-injection scrubbing. CLI + MCP server + Claude Code skill; CI on macOS and Windows; tag-triggered PyPI publish.
- **burncard** (TypeScript, `npx burncard`) - Accurate local AI usage telemetry for Claude Code and Codex, computed from your own logs on your own machine.
- **Grove** (TypeScript/Electron/React, GPL-3.0) - Git review companion for AI coding editors: custom SVG commit graph, real merge-commit diffs, blame, spotlight search, worktree dashboard for multi-agent workflows. Re-authored off Rust/Tauri/Svelte onto a headless Node git engine (no Electron dependency, separately typechecked and tested) behind an Electron/React shell.
- **GlyphMaps** (Kotlin, AGPL-3.0, shipped v1.0.0) - Google Maps turn-by-turn navigation on the Nothing Phone's rear LED matrix, built on a reverse-engineered notification pipeline and an unthrottled matrix path the official API does not expose.
- **beep-beep-oss** (Rust/Tauri/Matrix, AGPL-3.0) - Self-hostable universal chat client; working two-way WhatsApp messaging via mautrix bridges and matrix-rust-sdk.
- **wmux** (TypeScript, external contributor) - 3 PRs merged and 8 issues filed, 7 already fixed, shipped across v0.40.0 to v1.0.0. Diagnosed a main-process freeze: CPU profile put 92% of self-time in synchronous fs calls under a 2s poll; established that a stalled event loop and a broken pipe are indistinguishable from the CLI. Took `system.identify` from timeout to 0.7ms. Maintainer, on the fix: "the right diagnosis and the right fix".

## Skills

- **AI engineering:** agentic assistants with safety-gated actions (propose-then-confirm, server-side revalidation, idempotency keys, tamper-resistant audit chains), multi-provider LLM APIs (OpenAI / Gemini / Claude), MCP servers, usage and cost telemetry, prompt-injection defense
- **Daily driver:** React, Next.js, TypeScript, Tailwind, Node, Express, MongoDB
- **Design:** Figma (UI design, prototyping, dev handoff), design-system and component-library work
- **AI-assisted delivery:** Claude Code (power user), custom agent harnesses; used to ship production desktop and mobile apps outside my primary stack, including Rust/Tauri and Kotlin/Android
- **Working knowledge:** Python, SQL/Postgres, Rust, Tauri, Kotlin/Android, React Native (Expo)
- **Infra:** AWS (S3), Cloudflare, GitHub Actions, Docker, Tailscale and OpenSSH remote access, PyPI/npm release automation

## Education

BCA (Hons.), The Maharaja Sayajirao University of Baroda - 2024 to 2028 (expected)
