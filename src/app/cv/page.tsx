import { permanentRedirect } from "next/navigation";

/**
 * /cv is the same document as /resume — half the world types one, half the
 * other, and a recruiter following a link from an application should land
 * somewhere either way.
 *
 * A 308 rather than a second copy of the page: one canonical URL keeps the
 * search result, the ISR entry, and the analytics single, and there is no way
 * for the two to drift apart later.
 */
export default function CvPage(): never {
  permanentRedirect("/resume");
}
