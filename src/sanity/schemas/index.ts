import type { SchemaTypeDefinition } from "sanity";
import { project } from "./project";
import { workExperience } from "./work-experience";
import { testimonial } from "./testimonial";
import { stackGroup } from "./stack-group";
import { alsoShipped } from "./also-shipped";
import { resume } from "./resume";
import { resumeDownload } from "./resume-download";
import { socialLink } from "./social-link";

export const schemaTypes: SchemaTypeDefinition[] = [
  project,
  workExperience,
  testimonial,
  stackGroup,
  alsoShipped,
  socialLink,
  resume,
  // Object type, not a document: it only exists inside `resume.downloads`, but
  // it still has to be registered here or the Studio cannot resolve it.
  resumeDownload,
];
