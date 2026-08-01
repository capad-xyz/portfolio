import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemas";
import { structure } from "./src/sanity/structure";

// The privacy policy is a one-of-a-kind document reached from the desk, so it
// stays out of the global "create new" menu — a second copy would silently
// compete with the live one.
const SINGLETONS = new Set(["glyphmapsPrivacy"]);

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
