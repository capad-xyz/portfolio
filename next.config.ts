import type { NextConfig } from "next";

/**
 * Hostname routing for the two sites this Worker serves.
 *
 *   glyphmaps.capad.fyi/*  ->  /glyphmaps/*   (rewrite, URL unchanged)
 *   capad.fyi/*            ->  untouched
 *   capad.fyi/glyphmaps/*  ->  308 to the subdomain
 *
 * This lives here rather than in a proxy/middleware file, and it has to. Next 16
 * renamed `middleware.ts` to `proxy.ts` AND pinned it to the Node.js runtime —
 * the `runtime` config option throws if you set it in a proxy file. The
 * Cloudflare adapter only runs edge middleware, so any proxy.ts at all fails the
 * deploy with "Node.js middleware is not currently supported". Redirects and
 * rewrites declared here compile into the routes manifest instead, which the
 * adapter handles natively, so this needs no runtime of its own.
 *
 * Why a distinct internal prefix rather than serving `/` for both hosts: Next's
 * incremental cache is keyed on the RESOLVED route, and OpenNext's KV cache
 * inherits that key. Two hosts rewriting to the same internal path would share
 * one cache entry and serve each other's HTML. Because `/` and `/glyphmaps` are
 * different routes, their ISR entries are different keys by construction.
 *
 * Ordering matters and is load-bearing. Next runs redirects BEFORE rewrites and
 * before static files are served, which is the only reason the legacy
 * `/privacy-policy.html` rule below works — by the filesystem stage it would
 * already have been treated as a public asset and passed through.
 */

// `has` values are matched as patterns, not literals, so one entry covers the
// real host and the dev one (browsers resolve *.localhost to loopback). The
// escaped dots keep this from matching a lookalike like "glyphmapsXcapad.fyi".
const GLYPHMAPS_HOST = {
  type: "host",
  value: "glyphmaps\\.(capad\\.fyi|localhost)",
} as const;

// Deliberately production-only: on plain localhost the /glyphmaps path stays
// directly reachable, so the page can be opened in dev without a subdomain.
// Production behaviour is unchanged — capad.fyi never serves it.
const APEX_HOST = {
  type: "host",
  value: "(www\\.)?capad\\.fyi",
} as const;

const nextConfig: NextConfig = {
  experimental: {
    // Enables React's <ViewTransition>, used to morph a project card's title
    // into the case-study headline (project-card.tsx <-> work/[slug]/page.tsx).
    // Degrades silently: browsers without the View Transitions API just navigate.
    viewTransition: true,
  },

  async redirects() {
    return [
      // Paths the GitHub Pages site served before this Worker took the hostname
      // over. Those URLs are indexed and may be linked from the repo and the
      // Play listing, so they keep working rather than 404ing on cutover.
      //
      // The shipped app hardcodes `/privacy` itself (MainActivity.kt:
      // PRIVACY_POLICY_URL), which GitHub Pages never served — the in-app
      // privacy link is a 404 today and starts working the moment this ships.
      {
        source: "/privacy-policy",
        has: [GLYPHMAPS_HOST],
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/privacy-policy.html",
        has: [GLYPHMAPS_HOST],
        destination: "/privacy",
        permanent: true,
      },

      // On capad.fyi the internal prefix is not a public URL. Send it to the
      // real one rather than serving the product site from a second address —
      // otherwise the two hosts compete as duplicate content.
      {
        source: "/glyphmaps",
        has: [APEX_HOST],
        destination: "https://glyphmaps.capad.fyi/",
        permanent: true,
      },
      {
        source: "/glyphmaps/:path*",
        has: [APEX_HOST],
        destination: "https://glyphmaps.capad.fyi/:path*",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return {
      // beforeFiles, so these win over the filesystem. That is what makes the
      // two metadata routes host-scoped: served from the apex's own /sitemap.xml
      // otherwise, which would advertise capad.fyi's pages on the subdomain.
      beforeFiles: [
        {
          source: "/sitemap.xml",
          has: [GLYPHMAPS_HOST],
          destination: "/glyphmaps/sitemap.xml",
        },
        {
          source: "/robots.txt",
          has: [GLYPHMAPS_HOST],
          destination: "/glyphmaps/robots.txt",
        },
        {
          source: "/",
          has: [GLYPHMAPS_HOST],
          destination: "/glyphmaps",
        },
        {
          // Everything else on the subdomain. The negative lookahead is what
          // keeps shared assets shared: anything with a file extension is a real
          // file in /public (icons, the OG card) and both hosts serve it as-is,
          // so it must NOT be rewritten into /glyphmaps/… where it does not
          // exist. `api` stays on the apex path too — the contact widget is
          // mounted site-wide and the Sanity webhook posts to /api/revalidate.
          //
          // Two exclusions here are load-bearing and easy to lose:
          //
          // `.+` rather than `.*`, so this cannot match "/" with an empty param
          // (which would resolve to "/glyphmaps/" and 404) and steal root from
          // the rule above.
          //
          // `glyphmaps(?:/|$)`, because Next keeps testing the REMAINING rules
          // in this list against the path a previous rule already rewrote. Root
          // becomes "/glyphmaps" via the rule above and then arrives here;
          // without this exclusion it is rewritten a second time, to
          // "/glyphmaps/glyphmaps", and the subdomain homepage 404s while every
          // other path looks fine. It is also why /sitemap.xml survives — the
          // extension lookahead happens to block its second pass.
          source: "/:path((?!api/|_next/|glyphmaps(?:/|$)|.*\\.[a-zA-Z0-9]+$).+)",
          has: [GLYPHMAPS_HOST],
          destination: "/glyphmaps/:path",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
