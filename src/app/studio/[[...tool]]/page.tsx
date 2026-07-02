"use client";

import nextDynamic from "next/dynamic";

// Client-only load: `ssr: false` keeps the Studio (the entire `sanity`
// package) out of the server bundle — without it the Cloudflare worker
// blows past the free plan's 3 MiB size cap.
const StudioClient = nextDynamic(() => import("./studio-client"), {
  ssr: false,
  loading: () => null,
});

export const dynamic = "force-static";

export default function StudioPage() {
  return <StudioClient />;
}
