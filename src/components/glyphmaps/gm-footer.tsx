import Link from "next/link";

/**
 * Footer for the GlyphMaps pages — the only navigation on this host.
 *
 * Deliberately does NOT link back into the portfolio. The whole point of the
 * subdomain is that it does not hand a visitor a route into /projects, so the
 * links here stay on this host and go to the source, and nowhere else.
 *
 * "Overview" is the one exception added later, and it does not break that rule:
 * it points at this host's own landing page. Before it existed the policy was a
 * dead end, reachable from the app and from search with no way out of it but
 * the back button.
 *
 * These are PUBLIC paths, not `/glyphmaps/...`. The browser only ever sees
 * glyphmaps.capad.fyi URLs; the hostname rewrite in next.config maps them onto
 * the internal route. Linking the internal path would leak it into the address
 * bar.
 */
export function GmFooter() {
  return (
    <footer className="gm-footer">
      <nav className="gm-footer-links">
        <Link href="/">Overview</Link>
        <Link href="/privacy">Privacy</Link>
        <a href="https://github.com/capad-xyz/GlyphMaps" target="_blank" rel="noreferrer">
          Source
        </a>
        <a href="https://github.com/capad-xyz/GlyphMaps/issues" target="_blank" rel="noreferrer">
          Issues
        </a>
      </nav>
      <p className="gm-footer-note">
        GlyphMaps is an independent open-source project, licensed AGPL-3.0. It is not
        affiliated with, endorsed by, or sponsored by Google or Nothing Technology.
        &ldquo;Google Maps&rdquo;, &ldquo;Nothing&rdquo; and &ldquo;Glyph Matrix&rdquo; are
        trademarks of their respective owners.
      </p>
    </footer>
  );
}
