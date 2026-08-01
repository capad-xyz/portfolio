/**
 * robots.txt for glyphmaps.capad.fyi, served through the proxy rewrite.
 *
 * A Route Handler rather than a second `robots.ts`: the metadata convention
 * only produces `/robots.txt` at the app root, and that one belongs to
 * capad.fyi. This one advertises the GlyphMaps sitemap and nothing else, so
 * neither host's crawl directives reference the other.
 */

export const dynamic = "force-static";

const BODY = `User-agent: *
Allow: /
Disallow: /studio

Sitemap: https://glyphmaps.capad.fyi/sitemap.xml
`;

export function GET() {
  return new Response(BODY, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
