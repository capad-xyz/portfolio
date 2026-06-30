import type { SchemaTypeDefinition } from "sanity";
import { project } from "./project";
import { workExperience } from "./work-experience";
import { testimonial } from "./testimonial";
import { stackGroup } from "./stack-group";

export const schemaTypes: SchemaTypeDefinition[] = [
  project,
  workExperience,
  testimonial,
  stackGroup,
];
