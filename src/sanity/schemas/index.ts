import type { SchemaTypeDefinition } from "sanity";
import { project } from "./project";
import { workExperience } from "./work-experience";
import { testimonial } from "./testimonial";
import { stackGroup } from "./stack-group";
import { glyphmapsSchemas } from "./glyphmaps";

export const schemaTypes: SchemaTypeDefinition[] = [
  project,
  workExperience,
  testimonial,
  stackGroup,
  // The glyphmaps.capad.fyi content model (landing page + privacy policy, plus
  // the section object types they embed). Grouped into its own file and spread
  // here so this list stays readable as the second site grows.
  ...glyphmapsSchemas,
];
