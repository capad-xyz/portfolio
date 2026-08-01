import type { PortableTextBlock } from "@portabletext/types";
import type { GlyphmapsPage, GlyphmapsPrivacy } from "./glyphmaps-content";

/**
 * Demo mirror for glyphmaps.capad.fyi — the same deliberate mirror pattern as
 * `demo-content.ts`: this is not filler. Every number, permission and claim
 * below was read out of the GlyphMaps source at v1.0.0 and is kept in sync with
 * the published Sanity documents.
 *
 * Verified against github.com/capad-xyz/GlyphMaps:
 *   137 LEDs            MatrixFrame.ROW_WIDTHS sums to 137
 *   12 maneuvers        Maneuver.kt enum
 *   20s watchdog        GlyphRenderService.IDLE_TIMEOUT_MS = 20_000L
 *   (4a) Pro only       GlyphRenderer registers Glyph.DEVICE_25111p
 *   no networking       AndroidManifest declares no INTERNET permission
 *   dev-only capture    CaptureWriter is gated on BuildConfig.IS_DEV
 *
 * Do not add download counts, ratings, user numbers or testimonials here. None
 * exist yet, and inventing them would make the page a lie.
 */

const REPO = "https://github.com/capad-xyz/GlyphMaps";
const RELEASES = `${REPO}/releases/latest`;

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

/* ----------------------------------------------------------- landing page */

export const GLYPHMAPS_DEMO_PAGE: GlyphmapsPage = {
  heroEyebrow: "nothing phone (4a) pro · glyph matrix",
  heroTitle: "glyphmaps",
  heroTagline:
    "Turn-by-turn navigation on the back of your phone. GlyphMaps mirrors Google Maps' next maneuver onto the 137-LED Glyph Matrix, so a face-down phone still shows your next turn.",
  heroNote: "v1.0.0 · AGPL-3.0 · Android 14+",
  heroManeuvers: ["STRAIGHT", "LEFT", "ROUNDABOUT", "KEEP_RIGHT", "ARRIVE"],
  ctas: [
    { label: "Download the APK", href: RELEASES, variant: "glass" },
    { label: "Read the source", href: REPO, variant: "outline" },
  ],
  metrics: [
    { value: "137", label: "LEDs" },
    { value: "12", label: "maneuvers" },
    { value: "2.3 MB", label: "APK" },
    { value: "0", label: "network permissions" },
  ],
  sections: [
    {
      _type: "gmFeature",
      _key: "f-why",
      eyebrow: "the constraint",
      title: "The official API said no",
      body:
        "Nothing's supported route onto the Matrix is the Glyph Toy framework, and on the (4a) Pro Toys are always-on-display only, refreshing about once a minute. That is fine for a clock and useless for a turn you are three seconds from missing. GlyphMaps is not a Toy: it is an ordinary app that drives the panel directly with setAppMatrixFrame, which is not throttled. A foreground service holds the Matrix only while a route is live and hands it straight back when the route ends.",
      maneuver: "STRAIGHT",
    },
    {
      _type: "gmFeature",
      _key: "f-parse",
      eyebrow: "the input",
      title: "Read from the one surface Google exposes",
      body:
        "There is no public turn-by-turn API. The only live signal is Maps' own navigation notification, which updates every few seconds during a route. GlyphMaps listens for exactly that — filtered to the Google Maps package and the navigation category, so every other notification on your phone is ignored — and maps Google's sprawling maneuver vocabulary down to the twelve shapes that stay legible on a 13x13 grid.",
      maneuver: "ROUNDABOUT",
      flip: true,
    },
    {
      _type: "gmFeature",
      _key: "f-compose",
      eyebrow: "the renderer",
      title: "One composer, two displays",
      body:
        "Everything renders through a single pure function: parsed navigation state in, a 13x13 brightness grid out. The arrow sits on top, the distance scrolls underneath as a marquee because the panel is thirteen LEDs wide and 1.2k is not. The same function drives the LEDs and the in-app preview, so what the screen shows and what the back of the phone shows are the same pixels.",
      maneuver: "LEFT",
    },
    {
      _type: "gmFeature",
      _key: "f-sweep",
      eyebrow: "the animation",
      title: "A sweep that cannot drift",
      body:
        "Sweeping Flow animates a comet along the arrow toward the turn. It started as hand-drawn frames and they drifted — the animated left pointed at a different column than the static left, two sources of truth and both wrong. The hand-authored frames are gone: the sweep is now generated from the static pattern, so a settled animation frame lights exactly the same cells at exactly the same brightness. The drift is not fixed, it is unrepresentable.",
      maneuver: "KEEP_RIGHT",
      flip: true,
    },
    {
      _type: "gmShowcase",
      _key: "s-shots",
      eyebrow: "on the device",
      title: "The app is the smaller half",
      body:
        "Most of the time GlyphMaps is invisible — you start a route in Maps and flip the phone. The app itself is a live preview of the panel, the two display modes, and independent head and tail brightness.",
      shots: [
        {
          url: "/glyphmaps/hero.png",
          alt: "GlyphMaps showing an upward arrow with 90m rendered beneath it in the dot matrix, labelled Continue straight",
          caption: "Next maneuver, distance rendered in the same dot font the LEDs use.",
          width: 1080,
          height: 1430,
        },
        {
          url: "/glyphmaps/app.png",
          alt: "The app's main screen with a circular matrix preview, display mode toggle and head and tail brightness sliders",
          caption:
            "Live preview, Static Glow / Sweeping Flow, head and tail brightness. (Shot predates the rename — the app now reads GlyphMaps.)",
          width: 1080,
          height: 2400,
        },
      ],
    },
    {
      _type: "gmSpecs",
      _key: "s-specs",
      eyebrow: "the facts",
      title: "What it needs, what it is",
      rows: [
        { label: "Device", value: "Nothing Phone (4a) Pro" },
        { label: "Panel", value: "137 LEDs, circular 13x13" },
        { label: "Android", value: "14+ (minSdk 34)" },
        { label: "Needs", value: "Google Maps with an active route" },
        { label: "Permission", value: "Notification Access" },
        { label: "Network permission", value: "None" },
        { label: "Download", value: "2.3 MB APK, signed and minified" },
        { label: "Licence", value: "AGPL-3.0" },
        { label: "Version", value: "1.0.0" },
      ],
    },
    {
      _type: "gmDownload",
      _key: "s-download",
      eyebrow: "get it",
      title: "Install it",
      body:
        "Not on Google Play yet — a Play listing is on the roadmap. For now it is a signed APK on GitHub Releases, and the source is right there if you would rather build it yourself.",
      options: [
        {
          label: "Download the APK",
          href: RELEASES,
          meta: "v1.0.0 · 2.3 MB · Android 14+",
          primary: true,
        },
        { label: "Build from source", href: REPO, meta: "Kotlin · AGPL-3.0" },
      ],
      requirements: [
        "A Nothing Phone (4a) Pro. The Phone (3) has a different 25x25 Matrix and is not supported.",
        "Grant Notification Access on first launch — it is the only way to read Maps' directions.",
        "If you already run a custom Glyph Toy, give Notification Access to one Glyph-Matrix app at a time.",
      ],
    },
    {
      _type: "gmFaq",
      _key: "s-faq",
      eyebrow: "questions",
      title: "The things people ask",
      items: [
        {
          question: "Does it send my location anywhere?",
          answer:
            "No. The app has no network permission at all, so it cannot — there is no networking code, no analytics SDK, no crash reporter and no account. The maneuver and distance are turned into an arrow in memory and drawn on the LEDs.",
        },
        {
          question: "Why does it need Notification Access?",
          answer:
            "Because Android exposes no public turn-by-turn API. Maps' live navigation notification is the only real-time signal, so reading it is the whole mechanism. GlyphMaps filters to the Google Maps package and the navigation category and ignores everything else on your phone.",
        },
        {
          question: "Does it work on the Phone (3)?",
          answer:
            "No. GlyphMaps registers specifically for the (4a) Pro's panel and its renderer is built around the circular 13x13 grid. The Phone (3)'s Matrix is a different 25x25 panel.",
        },
        {
          question: "Do I have to keep the app open?",
          answer:
            "No. Start a route in Maps and flip the phone over. A foreground service takes the Matrix while navigation is live and releases it when the route ends, with a twenty-second idle watchdog as a backstop so your usual Glyph toy always comes back.",
        },
        {
          question: "Is it on the Play Store?",
          answer:
            "Not yet. The release is signed, minified and Play-ready, but the listing is still ahead of it. Until then the APK on GitHub Releases is the way in.",
        },
        {
          question: "Can I fork it?",
          answer:
            "Yes, under AGPL-3.0 — the licence it moved to deliberately, so it cannot be quietly taken closed. The brand assets (name, icon, artwork) are excluded; see NOTICE in the repo.",
        },
      ],
    },
  ],
  closingTitle: "It is thirteen by thirteen and it knows where to turn",
  closingBody:
    "GlyphMaps is free, open source, and built for one phone that happens to have a perfectly shaped grid of LEDs on its back. If it breaks on your drive, the issue tracker is open.",
  seoTitle: "GlyphMaps — turn-by-turn navigation on the Nothing Glyph Matrix",
  seoDescription:
    "GlyphMaps mirrors Google Maps' next maneuver onto the Nothing Phone (4a) Pro's 137-LED Glyph Matrix. Free, open source, AGPL-3.0, and entirely on-device.",
};

/* --------------------------------------------------------- privacy policy */

/**
 * Ported from PRIVACY_POLICY.md in the GlyphMaps repo and re-verified line by
 * line against the source at v1.0.0 before being published here. Two things
 * were corrected against the manifest rather than copied: the Glyph permission
 * is `com.nothing.ketchum.permission.ENABLE`, and FOREGROUND_SERVICE is
 * declared alongside the special-use variant.
 *
 * TODO(owner): confirm the contact address below is the one you want on a legal
 * page — the repo's policy still carries a [YOUR_EMAIL] placeholder.
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
    bullet("Notification Access — read the Google Maps navigation notification. This is the core function."),
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
