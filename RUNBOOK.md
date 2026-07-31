# capad portfolio Runbook

Personal portfolio of Aadarsh Upadhyay (capad), live in production at
https://capad.fyi. A Next.js 16 App Router site with a Sanity-backed content
layer, deployed as a single Cloudflare Worker via OpenNext. Status: shipped and
live; deploys run automatically on every push to `main`. This file is the
operational layer. For what the site *is* and its design intent read
[README.md](README.md), [AGENTS.md](AGENTS.md), [docs/PRD.md](docs/PRD.md) and
[docs/build-spec.md](docs/build-spec.md); this runbook covers getting it
running, unbroken, committed, and deployed.

## Stack

- Node.js: no `.nvmrc` and no `engines` field. CI pins **Node 22**
  (`.github/workflows/deploy.yml`, `actions/setup-node` `node-version: 22`).
  `@types/node` is `^20` (package.json). The author's machine currently runs
  Node 24.16.0 and `npm run dev` works on it; Node 22 is what actually builds
  and ships production, so prefer it when a build behaves oddly.
- Package manager: **npm**, `package-lock.json` present, `lockfileVersion: 3`.
  CI uses `npm ci`. No pnpm/yarn/bun lockfile exists.
- Framework: **Next.js 16.2.9** (App Router), pinned exactly in package.json.
  `experimental.viewTransition: true` in `next.config.ts`.
- React **19.2.4** / react-dom **19.2.4**, pinned exactly.
- TypeScript **5.9.3** (`^5`), strict, `noEmit`, path alias `@/* -> ./src/*`
  (tsconfig.json).
- Tailwind CSS **v4** (4.3.2 installed) via `@tailwindcss/postcss`
  (postcss.config.mjs). No `tailwind.config.*` file: v4 is CSS-configured in
  `src/app/globals.css`.
- CMS: **Sanity 6.3.0** + `next-sanity` 13.1.1. Project id `v6eklfsd`, dataset
  `production`, Studio mounted at `/studio` (sanity.config.ts, src/lib/sanity.ts).
  Both ids are public config, not secrets.
- Animation: `motion` 12.x, `gsap` 3.x, `lenis` 1.x, `@hyperplexed/bubbles`
  0.8.1 (patched, see below), `styled-components` 6.x.
- Hosting adapter: **@opennextjs/cloudflare 1.20.1** + **wrangler 4.106.0**
  (devDependencies), config in `open-next.config.ts` and `wrangler.jsonc`.
- Email: **Resend** HTTP API, called directly with `fetch` from
  `src/app/api/contact/route.ts`. No SDK dependency.
- Bot check: **Cloudflare Turnstile**, feature-flagged off when its keys are
  absent.
- Lint: ESLint 9 flat config (`eslint.config.mjs`) with `eslint-config-next`
  16.2.9. No test framework, no test script, no typecheck script.
- `patch-package` 8.x runs on `postinstall`.

## Prerequisites

Windows 11, PowerShell primary, Git Bash available. Nothing here needs WSL,
Docker, Rust, or an Android SDK.

- **Node.js** with npm. Dev runs fine on the installed 24.16.0; production is
  built on 22. Check what you have first:

```powershell
node -v
```

  If Node is missing, install the current LTS (note this installs whatever LTS
  is current, which may be newer than the 22 CI uses):

```powershell
winget install OpenJS.NodeJS.LTS
```

  To pin 22 alongside other versions, use nvm-windows and `nvm install 22`:

```powershell
winget install CoreyButler.NVMforWindows
```

- **Git**. Already installed (the repo is a working clone).
- Nothing else is required to run `npm run dev`. The Cloudflare and Sanity
  toolchains are npm devDependencies (`wrangler`, `sanity`) and run through
  `npx`; do not install them globally.

Accounts you need only for the corresponding feature (all free-tier):

| Account | Needed for | Notes |
| --- | --- | --- |
| Cloudflare | hosting, DNS, Workers KV, Turnstile | owns `capad.fyi`, free plan |
| Sanity | real CMS content, `/studio` login | project `v6eklfsd` |
| Resend | contact form email delivery | sends as `contact@capad.fyi` |
| GitHub | the deploy pipeline runs as an Action | repo `capad-xyz/portfolio` |

You can run the whole site locally with **none** of these: demo content is on by
default in dev and the contact form is the only thing that needs a key.

## First-time setup

1. Clone (skip if you already have the working copy).

```powershell
git clone https://github.com/capad-xyz/portfolio.git capad-portfolio
```

2. Enter the repo.

```powershell
cd capad-portfolio
```

3. Install dependencies. This also runs `postinstall` -> `patch-package`.

```powershell
npm install
```

Success signal: the tail of the output includes
`patch-package ... Applying patches... @hyperplexed/bubbles@0.8.1 [OK]`.
If you do not see patch-package run, the contact bubbles will stack the wrong
way at runtime. See "Common startup failures".

4. Create `.env.local` at the repo root. It is gitignored (`.env*`). Only
   needed if you want the contact form to actually send.

```powershell
New-Item -ItemType File .env.local
```

5. Fill it in using the table in "Environment variables" below.

6. Start the dev server.

```powershell
npm run dev
```

Success signal: `- Local: http://localhost:3000` and the page renders the
liquid-drop intro then the hero. Every section (work, experience, about, stack,
testimonials, contact) should be populated, because demo content is on in dev.

7. Optional sanity check that the production build is clean before you push.

```powershell
npm run build
```

## Environment variables

There is no `.env.example` in the repo. This table is derived from every
`process.env.*` reference in `src/` plus `.github/workflows/deploy.yml`.

| Name | Required? | What it is | Where to get it | Example / placeholder |
| --- | --- | --- | --- | --- |
| `RESEND_API_KEY` | Only for the contact form | Resend API key; without it `/api/contact` returns 500 "Mail service not configured." | resend.com -> API Keys -> Create, sending access to `capad.fyi`. Shown once. | `re_<redacted>` |
| `SANITY_REVALIDATE_SECRET` | Only for CMS webhook sync | Shared secret used to verify Sanity's HMAC `sanity-webhook-signature` header on `/api/revalidate` | The same string configured on the Sanity webhook. Generate a long random one. | `<redacted>` |
| `TURNSTILE_SECRET_KEY` | No (feature flag) | Cloudflare Turnstile secret. When set, `/api/contact` requires a valid token. Unset = check skipped. | Cloudflare dash -> Turnstile -> your widget | `0x<redacted>` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No (feature flag) | Public Turnstile sitekey, inlined into the client bundle **at build time**. Unset = widget never renders. | Same Turnstile widget, "Site Key" | `0x4AAAA...` |
| `NEXT_PUBLIC_DEMO_CONTENT` | No | `1` forces demo content on, `0` forces it off. Unset = on whenever `NODE_ENV !== "production"`. | You choose | `0` |
| `PORT` | No | Standard Next.js dev/start port override; equivalent to `-p`. | You choose | `3001` |

Secrets that must never be committed: `RESEND_API_KEY`,
`SANITY_REVALIDATE_SECRET`, `TURNSTILE_SECRET_KEY`. `.gitignore` already covers
`.env*`. `NEXT_PUBLIC_*` values are public by definition and are baked into the
client bundle.

Where the real values live:

- **Local dev:** `.env.local` at the repo root (currently holds
  `RESEND_API_KEY` and `SANITY_REVALIDATE_SECRET`, values `<redacted>`).
- **Production:** on the Worker itself, not in CI. Set with:

```powershell
npx wrangler secret put RESEND_API_KEY
```

- **Build-time public values:** GitHub repo *variables*, not secrets. The
  workflow maps `vars.TURNSTILE_SITE_KEY` -> `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- **CI credentials:** `secrets.CLOUDFLARE_API_TOKEN` (secret) and
  `vars.CLOUDFLARE_ACCOUNT_ID` (variable), both under GitHub Settings ->
  Secrets and variables -> Actions.

## Running it

Scripts are exactly what is in `package.json`; there is no Makefile.

Dev server, http://localhost:3000 (Next.js default; nothing in this repo
overrides it):

```powershell
npm run dev
```

Production build (writes `.next/`):

```powershell
npm run build
```

Serve the Node production build, http://localhost:3000:

```powershell
npm run start
```

Lint (this is what CI gates the deploy on):

```powershell
npm run lint
```

Typecheck (no script exists; invoke tsc directly):

```powershell
npx tsc --noEmit
```

Build the Cloudflare Worker and preview it locally in workerd:

```powershell
npm run preview:cf
```

Deploy the Worker from your machine. **Do not run this on Windows** - see
"Common startup failures" entry 1. It exists for a Linux/macOS box only:

```powershell
npm run deploy
```

Sanity Studio: no separate process. It is a route in this app, at
http://localhost:3000/studio in dev and https://capad.fyi/studio in production.

Regenerate the favicon set after editing `src/app/icon.svg`:

```powershell
node scripts/gen-favicon.mjs
```

Regenerate the Open Graph card after editing its design in the script:

```powershell
node scripts/generate-og.mjs
```

Change the port if 3000 is taken:

```powershell
npm run dev -- -p 3001
```

There are no tests, no storybook, and no mobile target.

### Adding a project or case study (the content pipeline)

There is no MDX, no contentlayer, and no markdown content directory. All content
is **Sanity** documents, rendered through `@portabletext/react`. Four document
types exist, in `src/sanity/schemas/`: `project`, `testimonial`,
`workExperience`, `stackGroup`. Adding a project end to end:

1. Open the Studio at https://capad.fyi/studio (or http://localhost:3000/studio
   in dev) and sign in with the Sanity account that owns project `v6eklfsd`.
2. Create a **Project** document. Required fields: `title`, `slug` (generated
   from the title, this becomes `/work/<slug>`), `status` (`done` / `ongoing` /
   `archived`), `oneLiner` (max 260 chars). Optional: `nowLine` (max 120 chars,
   shown with a pulse on ongoing cards only), `metrics` (max 4 value/label
   pairs), `tags`, `year`, `license`, `links` (label/href/kind), `image`,
   `featured` (default true, controls the homepage grid), `order` (lower first).
3. Write the case study in the `body` field (Portable Text blocks). The card
   only shows a "read the story" link when `body` is non-empty; reading time is
   computed from its word count at 200 wpm.
4. Publish. Ordering on the site is `status` first (`done` -> `ongoing` ->
   `archived`), then your manual `order` within each band.
5. The site refreshes without a redeploy. Two mechanisms:
   - The Sanity webhook POSTs `/api/revalidate`, which calls `revalidatePath`
     on `/`, `/projects`, `/sitemap.xml` and `/work/<slug>`. It must send the
     HMAC `sanity-webhook-signature` header, so the webhook's secret has to
     match the Worker's `SANITY_REVALIDATE_SECRET`.
   - Failing that, `export const revalidate = 300` on the home page,
     `/projects` and `/work/[slug]` regenerates them within 5 minutes.
   `generateStaticParams` uses default `dynamicParams`, so a brand-new slug
   renders on demand rather than 404ing until the next build.
6. If you want the new project visible in **local dev**, remember demo content
   overrides the CMS there. Either add `NEXT_PUBLIC_DEMO_CONTENT=0` to
   `.env.local`, or mirror the entry into `DEMO_PROJECTS` in
   `src/lib/demo-content.ts` (the repo's convention is to keep both in sync).

UNVERIFIED: the exact Sanity webhook configuration (its URL, filter and secret)
lives in the Sanity management console, not in this repo, and could not be
checked from here. The endpoint it must call is
`https://capad.fyi/api/revalidate`.

## Common startup failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Site is live but every SSR route (`/`, `/projects`, `/work/*`) returns **500** while static files still return 200 | `npm run deploy` was run **on Windows**. OpenNext warns "may encounter unpredictable failures during runtime" and it is real: the Windows-built bundle uploads fine and then fails at runtime. Documented in AGENTS.md and commit `94dde43`. | Roll back, then redeploy from CI. `npx wrangler deployments list`, then `npx wrangler rollback <version-id>`, then load `/` and `/projects` a few times to flush the poisoned KV incremental cache (they self-heal to 200), then push to `main`. Never fix this by pushing another local deploy. |
| Deploy fails with Cloudflare **error 10027 / "size limit exceeded"** | The Worker exceeded the free plan's 3 MiB gzipped cap. Historically caused by the `sanity` package landing in the server bundle, or by `next/og` dragging in `resvg.wasm`/`yoga.wasm`. Fixed in `591aa48` (upload went from >3 MiB to 640 KiB gzipped). | Keep `src/app/studio/[[...tool]]/page.tsx` loading the Studio via `next/dynamic` with `ssr: false`. Do not recreate `src/app/opengraph-image.tsx`; the OG card is a pre-rendered static PNG produced by `scripts/generate-og.mjs`. |
| `wrangler deploy --dry-run` fails with path-resolution errors, Windows only | Same `@vercel/og` wasm assets as above; their paths do not resolve on Windows. | Already fixed by the static OG PNG. If you reintroduce `next/og` into the app (not the script), this returns. |
| Contact bubbles stack **upward/downward the wrong way**, or the flock docks wrong | `postinstall` did not run, so `patches/@hyperplexed+bubbles+0.8.1.patch` was never applied. Happens with `npm ci --ignore-scripts` or a CI cache that restored `node_modules` without running scripts. | Re-apply manually: `npx patch-package`. Verify the output says `@hyperplexed/bubbles@0.8.1 [OK]`. |
| CI fails at the **Lint** step and the deploy never runs | `npm run lint` gates the deploy job. Two real causes seen here: build output was committed (`b1487ab` "Ignore wrangler dry-run output (accidentally committed, broke CI lint)"), and React render-purity rules on refs/setState (`072271c`). | Run `npm run lint` locally before pushing. Never commit `.next/`, `.open-next/`, `.wrangler/`, or `.wrangler-dryrun/` - `.gitignore` and `eslint.config.mjs` both exclude them. Do not write `ref.current` during render; do it in an effect. |
| Publishing in Sanity changes nothing on the live site; `/api/revalidate` returns **200** but pages are stale | No incremental cache: OpenNext then serves pages frozen at build time. Fixed in `8dac80d` by binding a KV namespace. | Confirm `kv_namespaces` with binding `NEXT_INC_CACHE_KV` is still present in `wrangler.jsonc` and that `open-next.config.ts` still sets `incrementalCache: kvIncrementalCache`. Both are load-bearing. |
| `/api/revalidate` returns **401 `{"error":"Invalid signature."}`** | The Sanity webhook is not signing, its secret differs from the Worker's, or the delivery is older than the 5 minute replay tolerance. | Set the same secret in both places: Sanity manage -> API -> Webhooks -> Secret, and `npx wrangler secret put SANITY_REVALIDATE_SECRET`. The endpoint takes no `?secret=` query param - that was replaced by HMAC in `f85ce2b`. |
| `/api/revalidate` returns **500 `{"error":"Not configured."}`** | `SANITY_REVALIDATE_SECRET` is not set in that environment at all. | `npx wrangler secret put SANITY_REVALIDATE_SECRET` for prod, or add it to `.env.local` for dev. |
| Contact form errors with **500 "Mail service not configured."** | `RESEND_API_KEY` missing. Dev: not in `.env.local`, or the dev server was not restarted after adding it. Prod: not set as a Worker secret. | Add the key, then restart `npm run dev`. Next reads `.env.local` only at server start. |
| Contact form errors with **403 "Verification incomplete. Try again."** | `TURNSTILE_SECRET_KEY` is set on the server but `NEXT_PUBLIC_TURNSTILE_SITE_KEY` was not present **at build time**, so the browser never renders the widget and sends no token. | Either set the GitHub repo variable `TURNSTILE_SITE_KEY` and rebuild, or unset the Worker's `TURNSTILE_SECRET_KEY` (`npx wrangler secret delete TURNSTILE_SECRET_KEY`) to disable the check. The two keys must be set or unset together. |
| Contact form errors with **502 "Couldn't send. Try email directly."** | Resend rejected the send or was unreachable. In dev the JSON response includes a `devDetail` field with Resend's exact status and body. | Read the dev server terminal; the route logs `Resend error <status> <body>`. Most common real cause: the `capad.fyi` domain is not verified in Resend, so `From: contact@capad.fyi` is refused. |
| `npm run dev` exits with `EADDRINUSE ... :3000` | Port 3000 already taken by another dev server. | `npm run dev -- -p 3001`, or find the owner: `Get-NetTCPConnection -LocalPort 3000 \| Select-Object OwningProcess`. |
| Local site shows demo projects/testimonials instead of what is in Sanity | Intentional. `DEMO_ENABLED` in `src/lib/sanity.ts` is on whenever `NODE_ENV !== "production"`, and demo content **overrides** the CMS. | Put `NEXT_PUBLIC_DEMO_CONTENT=0` in `.env.local` and restart. |
| Build fails downloading fonts / hangs on "Fetching Geist" | `src/app/layout.tsx` uses `next/font/google` (Geist, Geist_Mono, Caveat), which fetches from Google at **build** time. Offline or firewalled builds fail. | Build with network access. There is no self-hosted font fallback in this repo. |
| `node scripts/gen-favicon.mjs` fails with `Cannot find module 'sharp'` | `sharp` is not a declared dependency. It resolves today only because `next@16` ships it transitively. | `npm i -D sharp`, then re-run. Do not assume it will always be there. |

## Committing

- Git identity configured in this repo: `user.name = capad.fyi`,
  `user.email = capad.xyz@gmail.com`. Verify with `git config user.email`
  before your first commit; personal projects use this address, work projects
  use the Appson one.
- Integration branch is **`main`**. It is also the deploy branch.
- Branching convention: there is none for human work. All 45 commits are linear
  on `main`, no merge commits. The only other remote branch is
  `origin/copilot/fix-deploy-job-failure`, created by a bot.
- Commit message style seen in `git log`: a sentence-cased subject in the form
  `Area: what changed and why it is better`, for example
  `Testimonials: dot navigation flips clean - no drip, no exit ghost`. Bodies
  are prose paragraphs or `-` bullets explaining the reasoning, not the diff.
  Conventional-commit prefixes are rare (one `docs(AGENTS):`).
- Do **not** add `Co-Authored-By` trailers. Older commits have them; new ones
  should not.
- Hooks: none. No husky, no lint-staged, no `core.hooksPath`, nothing in
  `.git/hooks` beyond the stock samples. Nothing will stop a bad commit
  locally - CI is the only gate, and it runs `npm run lint`.
- Run the gate yourself before pushing, because a lint failure on `main` means
  a failed production deploy:

```powershell
npm run lint
```

- Never commit build output. `.next/`, `.open-next/`, `.wrangler/`,
  `.wrangler-dryrun/`, `.env*`, `*.tsbuildinfo`, `next-env.d.ts`, and `.claude/`
  are all gitignored, and one of them getting committed has already broken CI
  once.

## Deployment

**Pushing to `main` deploys to production automatically.** There is no staging
environment and no manual approval. `.github/workflows/deploy.yml` triggers on
`push: branches: [main]` with **no path filter**, so even a docs-only commit
(including adding this file) kicks off a full rebuild and redeploy of the live
Worker at https://capad.fyi. That is safe for a docs-only change - the site
output is unchanged - but it is a real production deploy, it takes about two
minutes, and it will fail loudly if `npm run lint` is red.

- **Where:** a single Cloudflare Worker named `capad-portfolio`, serving the
  custom domains `capad.fyi` and `www.capad.fyi` (declared in `wrangler.jsonc`,
  `custom_domain: true`). Not Vercel, not Netlify, not Pages. There is no
  `vercel.json`, no `netlify.toml`, and no `CNAME` file in this repo.
- **Trigger:** push to `main`, or manual `workflow_dispatch` from the Actions
  tab. `concurrency: group: deploy, cancel-in-progress: true`, so a newer push
  cancels an in-flight deploy.
- **Pipeline** (`.github/workflows/deploy.yml`, `ubuntu-latest`):
  `actions/checkout@v4` -> `actions/setup-node@v4` Node 22 with npm cache ->
  `npm ci` -> `npm run lint` -> `cloudflare/wrangler-action@v3` with
  `preCommands: npx opennextjs-cloudflare build` and `command: deploy`.
- **Required CI credentials:** repo secret `CLOUDFLARE_API_TOKEN` (an API token
  from the "Edit Cloudflare Workers" template) and repo variable
  `CLOUDFLARE_ACCOUNT_ID`. Optional repo variable `TURNSTILE_SITE_KEY`.
- **Runtime secrets are not in CI.** `RESEND_API_KEY`,
  `SANITY_REVALIDATE_SECRET` and `TURNSTILE_SECRET_KEY` live on the Worker,
  set with `npx wrangler secret put NAME`. Changing one does not require a
  redeploy.
- **Never deploy from a Windows machine.** `npm run deploy` produces a Worker
  that 500s on every SSR route. See "Common startup failures" entry 1.
- **Rollback:**

```powershell
npx wrangler deployments list
```

then:

```powershell
npx wrangler rollback <version-id>
```

Afterwards load `/` and `/projects` a few times to flush the poisoned KV
incremental cache; those pages self-heal back to 200. Then push a corrected
commit to `main` for a clean CI deploy. There is no rollback button in the
GitHub Actions UI that helps here - re-running an old workflow rebuilds from
that commit, which is slower and less certain than `wrangler rollback`.

- **DNS:** `capad.fyi` is on Cloudflare (free plan) under the
  `capad.xyz@gmail.com` account, with Email Routing live. Worker custom domains
  manage their own DNS records; do not hand-create A/CNAME records for the apex
  or `www`.

## Gotchas

- `CLAUDE.md` contains one line: `@AGENTS.md`. The real notes are in
  **AGENTS.md**, and its deploy warning is the single most expensive thing in
  this repo to forget.
- **README.md is stale in one place:** it lists "React Three Fiber / drei for
  WebGL". Those were removed in commit `8536aa0` ("the only component importing
  them had been orphaned since 918646a") and are not in `package.json`. There is
  no WebGL in the shipped site; the liquid effects are DOM, CSS and SVG filters.
- **docs/contact-form.md is stale in one place:** it tells you to open
  `http://localhost:3030`. Nothing in this repo sets port 3030; `next dev`
  listens on **3000**.
- `sanity.config.ts` and `src/lib/sanity.ts` each hardcode `projectId:
  "v6eklfsd"` and `dataset: "production"`. If you ever move projects, both must
  change. They are public identifiers, not secrets.
- `open-next.config.ts` + the `NEXT_INC_CACHE_KV` binding in `wrangler.jsonc`
  (namespace id `2723bbf34f764ad8976016b186c6be88`) are load-bearing for ISR.
  Delete either and Sanity publishes stop reaching the site, silently, with the
  webhook still returning 200.
- The Worker runs with `global_fetch_strictly_public`. The app cannot fetch its
  own public hostname from inside the Worker; outbound calls to Resend, Sanity
  and Turnstile are fine.
- The free-plan **3 MiB gzipped Worker limit** is the reason the Studio is
  `ssr: false` and the OG image is a static PNG. Both look like odd choices and
  both are deliberate. `src/app/studio/[[...tool]]/page.tsx` and
  `scripts/generate-og.mjs` carry the explanation in comments.
- `patches/@hyperplexed+bubbles+0.8.1.patch` inverts the vendor library's dock
  geometry so the bubble stack grows upward. It is applied by `postinstall`.
  Upgrading `@hyperplexed/bubbles` past 0.8.1 will orphan the patch and
  `patch-package` will fail the install.
- `scripts/gen-favicon.mjs` imports `sharp`, which is **not** in
  `package.json`. It works only because `next@16` depends on sharp.
- `src/lib/demo-content.ts` is not filler - the project bodies, metrics and
  licenses in it are real and are kept as a deliberate mirror of the published
  Sanity documents. Several commits update both sides in the same change
  ("Sanity already updated"). If you edit content in one place, edit the other.
- Demo content **overrides** the CMS rather than filling gaps, in every
  non-production build. A staging preview will show demo data unless you set
  `NEXT_PUBLIC_DEMO_CONTENT=0`.
- Sanity fetches go through `safeFetch`, which swallows errors and returns a
  fallback. A broken CMS therefore renders an empty section instead of failing
  the build - check the server logs for `[sanity] ... fetch failed` rather than
  trusting a green build.
- `/api/contact` rate-limits 5 messages per hour per IP from an in-memory Map.
  It resets on every Worker restart and is not shared across isolates. That is
  intentional for a portfolio.
- `.coderabbit.yaml` configures an automated PR reviewer on `main`. Titles
  containing `wip` or `[skip ci]` are skipped.
- There are no tests. `npm run lint` and `npx tsc --noEmit` are the entire
  safety net.
- `.claude/launch.json` is gitignored local config for the Claude Code preview
  pane, not part of the build.

## Project map

```
.github/workflows/deploy.yml  Push to main -> OpenNext build -> wrangler deploy
.claude/launch.json           Local-only dev-server config (gitignored)
docs/                         PRD, build spec, contact-form guide, UX/perf research
patches/                      patch-package patch for @hyperplexed/bubbles
public/opengraph-image.png    Pre-rendered OG card (source: scripts/generate-og.mjs)
scripts/generate-og.mjs       Regenerates the OG PNG
scripts/gen-favicon.mjs       Rasterizes icon.svg -> favicon.ico + apple-icon.png
src/app/                      App Router: layout, page, /projects, /work/[slug],
                              /studio, /api/contact, /api/revalidate, robots,
                              sitemap, globals.css, icons
src/components/               Glass design system + client islands (hero, cursor,
                              lens, dot-nav, testimonials deck, contact widget)
src/lib/sanity.ts             Sanity client, GROQ queries, types, demo-mode switch
src/lib/demo-content.ts       Real content mirrored from Sanity, used in dev
src/lib/utils.ts              clsx/tailwind-merge helper
src/sanity/schemas/           project, testimonial, workExperience, stackGroup
next.config.ts                Enables experimental viewTransition
open-next.config.ts           Cloudflare adapter + KV incremental cache
wrangler.jsonc                Worker name, custom domains, KV binding, compat flags
sanity.config.ts              Studio config (projectId, dataset, basePath /studio)
eslint.config.mjs             Flat config; ignores all build output dirs
AGENTS.md                     Deploy rules and the Windows-deploy warning
```
