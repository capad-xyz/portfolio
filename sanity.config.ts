import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemas";
import { structure } from "./src/sanity/structure";

// Landing page + privacy policy are one-of-a-kind documents reached from the
// desk, so they're kept out of the global "create new" menu — a second
// glyphmapsPage would silently compete with the live one.
const SINGLETONS = new Set(["glyphmapsPage", "glyphmapsPrivacy"]);

export default defineConfig({
  name: "default",
  title: "capad",
  projectId: "v6eklfsd",
  dataset: "production",
  basePath: "/studio",
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (prev) =>
      prev.filter((item) => !SINGLETONS.has(item.templateId)),
  },
});
