import { ImageResponse } from "next/og";

/**
 * Social-share card, generated at build time. Mirrors the site's mono
 * paper/ink language: giant lowercase wordmark, hairline-flanked signature,
 * quiet tagline. One static card for every share of the homepage.
 */
export const alt = "capad — developer tools & desktop apps by Aadarsh Upadhyay";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(125% 90% at 50% -12%, #ffffff 0%, #f1f0ec 56%)",
          color: "#0b0b0d",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 32,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#6f6e6a",
            marginBottom: 18,
          }}
        >
          developer tools · desktop apps
        </div>
        <div
          style={{
            fontSize: 220,
            fontWeight: 700,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
          }}
        >
          capad
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: 34,
          }}
        >
          <div style={{ width: 60, height: 2, background: "rgba(11,11,13,0.25)" }} />
          <div style={{ fontSize: 30, letterSpacing: "0.14em", color: "#46453f" }}>
            Aadarsh Upadhyay
          </div>
          <div style={{ width: 60, height: 2, background: "rgba(11,11,13,0.25)" }} />
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#6f6e6a",
            marginTop: 40,
          }}
        >
          fast, genuinely-free tools · capad.fyi
        </div>
      </div>
    ),
    size,
  );
}
