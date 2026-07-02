import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

/**
 * Sanity -> site sync, authenticated with an HMAC signature instead of a
 * secret in the URL.
 *
 * Sanity signs every delivery when the webhook has a secret configured:
 *
 *   sanity-webhook-signature: t=<unix-ms>,v1=<base64url(HMAC-SHA256(secret, `${t}.${rawBody}`))>
 *
 * Verifying that proves three things a `?secret=` query param cannot:
 *   1. Authenticity - only a sender holding the secret can produce the MAC.
 *   2. Integrity    - the signature covers the raw body, so a tampered
 *                     payload fails verification.
 *   3. Freshness    - the signed timestamp lets us reject replays of an old
 *                     captured request (5 minute tolerance below).
 * And the secret itself never leaves the two vaults it lives in (Sanity's
 * webhook config + this worker's secret), so URL/access logs stay clean.
 */

const SIGNATURE_HEADER = "sanity-webhook-signature";
const TOLERANCE_MS = 5 * 60 * 1000;

function base64UrlEncode(bytes: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Compare in constant time: a plain `===` on strings can short-circuit on the
 * first differing char, which leaks how much of a guess was correct through
 * response timing. XOR-accumulating over the full length makes the comparison
 * take the same time whether the guess is 0% or 99% right.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function isValidSignature(
  rawBody: string,
  header: string | null,
  secret: string,
): Promise<boolean> {
  if (!header) return false;
  const match = header.match(/^t=(\d+)\s*,\s*v1=([A-Za-z0-9_-]+)$/);
  if (!match) return false;

  const timestamp = Number(match[1]);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() - timestamp) > TOLERANCE_MS) return false; // replay guard

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${rawBody}`),
  );
  return timingSafeEqual(base64UrlEncode(mac), match[2]);
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error("SANITY_REVALIDATE_SECRET missing");
    return Response.json({ error: "Not configured." }, { status: 500 });
  }

  // The signature covers the exact bytes on the wire, so read the raw text
  // first and only JSON-parse after it verifies.
  const rawBody = await req.text();
  if (!(await isValidSignature(rawBody, req.headers.get(SIGNATURE_HEADER), secret))) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  let slug: string | undefined;
  try {
    const body = JSON.parse(rawBody) as { slug?: { current?: string } | string };
    slug = typeof body.slug === "string" ? body.slug : body.slug?.current;
  } catch {
    // no/invalid body - still revalidate the shared pages
  }

  // Every project appears on the homepage grid, the /projects index, the
  // sitemap, and its own story (plus neighbours' prev/next) - refresh the set.
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/work/${slug}`);
  else revalidatePath("/work/[slug]", "page");

  return Response.json({ revalidated: true, slug: slug ?? null });
}
