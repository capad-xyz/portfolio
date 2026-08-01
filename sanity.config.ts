import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemas";
import { structure } from "./src/sanity/structure";

// Documents the sites read exactly one of: the resume behind /resume, and the
// glyphmaps privacy policy behind glyphmaps.capad.fyi/privacy. Each is reached
// from a fixed spot on the desk (see ./src/sanity/structure.ts), so a second
// copy could never be reached — it would just sit there competing with the live
// one, and which of them won would depend on creation order.
const SINGLETONS = new Set(["resume", "glyphmapsPrivacy"]);

export default defineConfig({
  name: "default",
  title: "capad",
  projectId: "v6eklfsd",
  dataset: "production",
  basePath: "/studio",
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
  document: {
    // The structure hides the "create" affordance for singletons; this closes
    // the other doors — the global "+" and the duplicate action — so there is
    // no route to a second one at all, not merely an unlikely one.
    actions: (prev, { schemaType }) =>
      SINGLETONS.has(schemaType)
        ? prev.filter(({ action }) => action !== "duplicate" && action !== "delete")
        : prev,
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter((t) => !SINGLETONS.has(t.templateId))
        : prev,
  },
});
