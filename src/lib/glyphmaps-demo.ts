import type { PortableTextBlock } from "@portabletext/types";
import type { GlyphmapsPrivacy } from "./glyphmaps-content";

/**
 * Demo mirror for the GlyphMaps privacy policy — the same deliberate mirror
 * pattern as `demo-content.ts`. This is not filler: it was read out of the
 * GlyphMaps source at v1.0.0 and is kept in sync with the published Sanity
 * document.
 *
 * Verified against github.com/capad-xyz/GlyphMaps:
 *   no networking       AndroidManifest declares no INTERNET permission
 *   package + category  MapsNotificationListener filters on both
 *   dev-only capture    CaptureWriter is gated on BuildConfig.IS_DEV, and the
 *                       default `user` flavour builds with IS_DEV = false
 *   no battery opt-out  the manifest deliberately omits it, with a comment
 *
 * A privacy policy is a legal representation, so nothing here is generated
 * boilerplate — if a fact could not be traced to a file, it is not claimed.
 */

/* ------------------------------------------------------- portable text util */

let k = 0;
const key = () => `gm-${++k}`;

function block(style: string, text: string): PortableTextBlock {
  return {
    _type: "block",
    _key: key(),
    style,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  } as unknown as PortableTextBlock;
}

function bullet(text: string): PortableTextBlock {
  return {
    _type: "block",
    _key: key(),
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  } as unknown as PortableTextBlock;
}

const h = (t: string) => block("h2", t);
const p = (t: string) => block("normal", t);

/* --------------------------------------------------------- privacy policy */

/**
 * Ported from PRIVACY_POLICY.md in the GlyphMaps repo and re-verified line by
 * line against the source before being published here. Two things were
 * corrected against the manifest rather than copied across: the Glyph
 * permission is `com.nothing.ketchum.permission.ENABLE`, and FOREGROUND_SERVICE
 * is declared alongside the special-use variant.
 *
 * TODO(owner): confirm the contact address below is the one you want on a legal
 * page — the repo's own policy still carries a [YOUR_EMAIL] placeholder.
 */
export const GLYPHMAPS_DEMO_PRIVACY: GlyphmapsPrivacy = {
  title: "Privacy Policy",
  lastUpdated: "2026-06-14",
  summary:
    "GlyphMaps processes everything on your device and transmits nothing. There are no accounts, no analytics, no ads and no servers — the app has no network permission at all.",
  contactEmail: "connect@capad.fyi",
  seoDescription:
    "How GlyphMaps handles data: notification access, on-device processing, and the fact that nothing leaves your phone.",
  body: [
    p(
      "GlyphMaps (“the app”) displays Google Maps turn-by-turn directions on the rear Glyph Matrix of the Nothing Phone (4a) Pro. This policy explains exactly what the app accesses and what it does — and does not — do with it.",
    ),

    h("What we access"),
    p(
      "To show your next turn on the Glyph Matrix, the app uses Notification Access to read the active Google Maps navigation notification only. It is filtered by the Google Maps package name and the navigation notification category; all other notifications — including other Google Maps notifications — are ignored. From that one notification the app reads the maneuver type (turn left, roundabout, arrive, and so on) and the distance to the turn.",
    ),

    h("Why we need it"),
    p(
      "Android does not expose a public turn-by-turn API. The live navigation notification is the only way to mirror your next maneuver to the Matrix in real time without a Google account or an API key.",
    ),

    h("What we do with it"),
    p(
      "The maneuver and distance are converted on-device into a dot-matrix arrow and drawn on the Glyph Matrix while you navigate. All parsing and rendering happen locally, in memory. The Matrix is released when navigation ends.",
    ),

    h("What we do not do"),
    bullet(
      "We do not send notification content, location, or any other data off your device. The app declares no INTERNET permission and contains no networking code.",
    ),
    bullet("We do not use analytics, advertising, tracking or crash-reporting SDKs."),
    bullet("We do not require or offer an account, sign-in or profile."),
    bullet("We do not sell or share any data with third parties — there is nothing to share."),

    h("What is stored on your device"),
    p(
      "The app saves only your display preferences — head and tail LED brightness, and the Static Glow / Sweeping Flow display mode — in private app storage, so they persist between sessions. This never leaves the device and is removed when you uninstall.",
    ),
    p(
      "Developer build only: a separate developer build (application ID com.glyphnavtoy.dev) can write a local capture log of parsed Maps directions to the app's private storage, used solely to tune the parser. This code is gated behind a build flag and is absent from the public release build. It is never transmitted. Clearing the app's data or uninstalling removes it.",
    ),

    h("Permissions, and what each is for"),
    bullet(
      "Notification Access — read the Google Maps navigation notification. This is the core function.",
    ),
    bullet(
      "Foreground Service, including the special-use type — keep the Matrix updating for the duration of a route.",
    ),
    bullet("Post Notifications — show the foreground-service notification Android requires."),
    bullet(
      "com.nothing.ketchum.permission.ENABLE — the Nothing SDK permission required to draw on the Glyph Matrix.",
    ),
    p(
      "The app deliberately does not request a battery-optimisation exemption: the foreground service keeps the Matrix updating during a route and the notification listener rebinds itself, so the exemption would buy nothing.",
    ),

    h("Data retention"),
    p(
      "Nothing is retained off-device, because nothing is sent off-device. Local preferences, and any developer-build log, persist until you clear the app's data or uninstall it.",
    ),

    h("Children"),
    p(
      "GlyphMaps is a utility with no data collection and is not directed at children. We do not knowingly collect data from anyone, including children under 13.",
    ),

    h("Changes"),
    p(
      "This policy may be updated. The date above changes when it is, and the current version is always available at this URL.",
    ),

    h("Verify it yourself"),
    p(
      "GlyphMaps is licensed under AGPL-3.0 and the source is public. Notification access is a powerful permission, so the code that uses it — MapsNotificationListener.kt — is the thing worth reading before you trust this page.",
    ),
  ],
};
