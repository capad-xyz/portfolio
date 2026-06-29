import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

// Existing portfolio content lives in this Sanity project (recovered).
export const sanity = createClient({
  projectId: "v6eklfsd",
  dataset: "production",
  apiVersion: "2024-10-01",
  useCdn: true,
});

const builder = imageUrlBuilder(sanity);
export const urlFor = (source: Parameters<typeof builder.image>[0]) =>
  builder.image(source);
