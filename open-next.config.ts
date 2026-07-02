import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default config: regional cache off (the site is small and ISR-revalidated);
// R2/KV caches can be layered in later without touching app code.
export default defineCloudflareConfig();
