import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

/**
 * Sanity → site sync. Point a Sanity webhook (manage.sanity.io → API →
 * Webhooks) at POST https://capad.fyi/api/revalidate?secret=<value> firing on
 * create/update/delete of project / testimonial / workExperience / stackGroup.
 * Publishing in the Studio then refreshes the affected pages within seconds
 * instead of waiting out the 5-minute ISR window. The secret lives in the
 * SANITY_REVALIDATE_SECRET env var (wrangler secret / .env.local).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret || req.nextUrl.searchParams.get("secret") !== secret) {
    return Response.json({ error: "Invalid secret." }, { status: 401 });
  }

  let slug: string | undefined;
  try {
    const body = (await req.json()) as { slug?: { current?: string } | string };
    slug = typeof body.slug === "string" ? body.slug : body.slug?.current;
  } catch {
    // no/invalid body — still revalidate the shared pages
  }

  // Every project appears on the homepage grid, the /projects index, the
  // sitemap, and its own story (plus neighbours' prev/next) — refresh the set.
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/work/${slug}`);
  else revalidatePath("/work/[slug]", "page");

  return Response.json({ revalidated: true, slug: slug ?? null });
}
