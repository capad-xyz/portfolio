import { defineCliConfig } from "sanity/cli";

/**
 * Companion to sanity.config.ts, for the `sanity` CLI rather than the Studio.
 *
 * The Studio is embedded in this Next app (basePath "/studio") and reads its
 * project/dataset from sanity.config.ts, so nothing on the site needs this file.
 * The CLI does: without it, every `npx sanity …` command fails with
 * "No CLI config found" — including the ones worth reaching for when the Studio
 * is not the right tool, e.g.
 *
 *   npx sanity documents query '*[_type == "resume"][0]'
 *   npx sanity dataset export production ./backup.tar.gz
 *
 * Same project and dataset as the Studio, deliberately: two sources of truth for
 * "which dataset am I editing" is how you end up writing to the wrong one.
 */
export default defineCliConfig({
  api: {
    projectId: "v6eklfsd",
    dataset: "production",
  },
});
