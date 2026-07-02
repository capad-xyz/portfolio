# capad portfolio

Personal portfolio of Aadarsh Upadhyay (capad), live at https://capad.fyi. A "liquid glass" design: monochrome white and near-black, translucent glass surfaces, WebGL and scroll-driven motion.

## Stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- Motion + GSAP + Lenis for animation
- React Three Fiber / drei for WebGL
- Sanity (project content CMS) via next-sanity
- Deployed as a single Cloudflare Worker via @opennextjs/cloudflare

## Structure

- src/app (routes: home, /projects, /work/[slug] case studies, /studio Sanity Studio, /api/contact, /api/revalidate)
- src/components (glass design system)
- src/lib (Sanity client + demo content)
- src/sanity/schemas (project, testimonial, workExperience, stackGroup)
- docs/ (PRD and build spec)

## Development

```bash
npm install
npm run dev
```

Demo content overrides the CMS in dev so every section renders. To preview real CMS content, set NEXT_PUBLIC_DEMO_CONTENT=0.

Local environment variables go in .env.local (gitignored):
- RESEND_API_KEY (contact form)
- SANITY_REVALIDATE_SECRET (webhook revalidation)

## Deployment

Push to main deploys via GitHub Actions (.github/workflows/deploy.yml) using OpenNext + wrangler to a Cloudflare Worker. CI needs the CLOUDFLARE_API_TOKEN secret and CLOUDFLARE_ACCOUNT_ID variable. Runtime secrets live on the Worker (wrangler secret put).

```bash
npm run preview:cf
```

builds and previews the worker locally.

## License

(c) capad. Contact: hi@capad.fyi.
