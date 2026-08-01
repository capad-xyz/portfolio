import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Hostname routing for the two sites this Worker serves.
 *
 * NOTE: in Next 16 this file is `proxy.ts`, not `middleware.ts` — the
 * convention was renamed (and the exported function with it). A file named
 * `middleware.ts` is silently never invoked.
 *
 *   glyphmaps.capad.fyi/*  ->  /glyphmaps/*   (rewrite, URL unchanged)
 *   capad.fyi/*            ->  untouched
 *   capad.fyi/glyphmaps/*  ->  308 to the subdomain
 *
 * Why a distinct internal prefix rather than serving `/` for both hosts:
 * Next's incremental cache is keyed on the RESOLVED route, and OpenNext's KV
 * cache inherits that key. Two hosts rewriting to the same internal path would
 * therefore share one cache entry and serve each other's HTML — the exact
 * cross-host leak this design has to prevent. Because `/` and `/glyphmaps` are
 * different routes, their ISR entries are different keys by construction; there
 * is no cache configuration to get wrong.
 *
 * The redirect on the capad.fyi side matters for SEO as much as tidiness:
 * without it the whole product site would be reachable at two URLs and the
 * hosts would compete as duplicate content.
 */

const GLYPHMAPS_HOSTS = new Set([
  "glyphmaps.capad.fyi",
  // local + preview conveniences; browsers resolve *.localhost to loopback
  "glyphmaps.localhost",
]);

const PREFIX = "/glyphmaps";

/** Metadata routes that must follow the host rewrite despite having a dot. */
const HOST_SCOPED_FILES = new Set(["/sitemap.xml", "/robots.txt"]);

/**
 * Paths the GitHub Pages site served before this Worker took the hostname over.
 * Those URLs are indexed and may be linked from the repo and the Play listing,
 * so they keep working rather than 404ing on cutover.
 *
 * Note the shipped app hardcodes `/privacy` itself
 * (MainActivity.kt: PRIVACY_POLICY_URL), which GitHub Pages never served — the
 * in-app privacy link is a 404 today and starts working the moment this ships.
 */
const LEGACY_PRIVACY = new Set(["/privacy-policy", "/privacy-policy.html"]);

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname } = request.nextUrl;

  // Before the static-file bail-out below: one of these ends in `.html` and
  // would otherwise be treated as a public asset and passed straight through.
  if (GLYPHMAPS_HOSTS.has(host) && LEGACY_PRIVACY.has(pathname)) {
    return NextResponse.redirect(new URL("/privacy", request.url), 308);
  }

  // Anything with a file extension is a real file in /public (icons, the OG
  // card) and is shared by both hosts as-is. The two metadata routes are the
  // deliberate exceptions — each host needs its own.
  const isFile = /\.[a-z0-9]+$/i.test(pathname);
  if (isFile && !HOST_SCOPED_FILES.has(pathname)) return NextResponse.next();

  if (GLYPHMAPS_HOSTS.has(host)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? PREFIX : `${PREFIX}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // On capad.fyi the internal prefix is not a public URL. Send it to the real
  // one rather than serving the product site from a second address.
  if (pathname === PREFIX || pathname.startsWith(`${PREFIX}/`)) {
    const rest = pathname.slice(PREFIX.length) || "/";
    return NextResponse.redirect(new URL(rest, "https://glyphmaps.capad.fyi"), 308);
  }

  return NextResponse.next();
}

export const config = {
  // `api` is excluded so /api/contact and /api/revalidate keep working
  // unchanged on both hosts — the contact widget is mounted site-wide, and the
  // Sanity webhook posts to the apex.
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};
