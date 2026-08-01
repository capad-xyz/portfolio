import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemas";
import { structure } from "./src/sanity/structure";

// Read once, in the site. `resume` is a singleton there, so the Studio must not
// offer to make a second one — see ./src/sanity/structure.ts.
const SINGLETONS = new Set(["resume"]);

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
    // the other doors — the global "+" and the duplicate action — so there is no
    // route to a second Resume at all, not merely an unlikely one.
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
