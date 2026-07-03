import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

// KV-backed incremental cache (binding NEXT_INC_CACHE_KV in wrangler.jsonc):
// gives revalidatePath/ISR a place to persist regenerated pages, which is what
// makes the Sanity publish -> webhook -> refreshed page loop actually stick.
// Without it, prerendered pages are frozen at build time.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
});
