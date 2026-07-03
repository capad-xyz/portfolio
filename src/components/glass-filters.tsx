/**
 * Hidden SVG filters used across the site:
 *  - #refract : liquid-glass edge refraction for `.glass` / `.plate` (Chromium;
 *               elsewhere the backdrop-filter blur alone applies).
 *  - #drop    : stronger lens for the falling liquid drop.
 *  - #goo     : metaball merge for the gooey liquid cursor.
 *  - #goo-drip: lighter metaball so falling droplets fuse into running liquid.
 * Rendered once in the root layout.
 */
export function GlassFilters() {
  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <filter
        id="refract"
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.008 0.011"
          numOctaves={2}
          seed={6}
          result="n"
        />
        <feGaussianBlur in="n" stdDeviation="1.4" result="nb" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="nb"
          scale={22}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      <filter
        id="drop"
        x="-60%"
        y="-60%"
        width="220%"
        height="220%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.01 0.01"
          numOctaves={2}
          seed={2}
          result="n"
        />
        <feGaussianBlur in="n" stdDeviation="1.8" result="nb" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="nb"
          scale={36}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      <filter id="goo">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
        <feColorMatrix
          in="b"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
        />
      </filter>

      <filter id="goo-drip">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
        <feColorMatrix
          in="b"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
        />
      </filter>

      <filter id="goo-dn">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="b" />
        <feColorMatrix
          in="b"
          mode="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
        />
      </filter>

      <filter
        id="lens"
        x="-40%"
        y="-40%"
        width="180%"
        height="180%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.0028 0.0036"
          numOctaves={2}
          seed={4}
          result="n"
        />
        <feGaussianBlur in="n" stdDeviation="1.6" result="nb" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="nb"
          scale={92}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
