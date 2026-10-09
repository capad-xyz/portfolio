/**
 * Hidden SVG filters used across the site:
 *  - #refract : liquid-glass edge refraction for `.glass` (Chromium; elsewhere
 *               the backdrop-filter blur alone applies).
 *  - #chew    : the T4 hero treatment. Erodes the alpha edge of the hero
 *               photograph so the silhouette reads as torn rather than cut.
 *  - #deckle  : the same idea at a gentler, directional frequency, for a
 *               bleeding sheet edge rather than a chewed picture edge.
 *  - #goo     : metaball merge for the gooey liquid cursor.
 *  - #goo-drip: lighter metaball so falling droplets fuse into running liquid.
 * Rendered once in the root layout.
 *
 * `colorInterpolationFilters="sRGB"` on the two print filters is load-bearing,
 * not decoration: the default linearRGB interpolation shifts the photograph's
 * midtones on its way through the displacement map, so the plate came out a
 * visibly different colour from the same asset rendered unfiltered. The point of
 * the chew is the silhouette.
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

      {/* T4: one displacement pass eroding the alpha edge, colour untouched.
          High frequency and a small scale - this is a chewed edge, a few px of
          erosion, not a wobble. The 116% region is deliberate: the filter has to
          paint past the element box or the torn edge is clipped straight back to
          a rectangle, which is the one thing the chew exists to undo. */}
      <filter
        id="chew"
        x="-8%"
        y="-8%"
        width="116%"
        height="116%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="1.15"
          numOctaves={2}
          seed={9}
          result="n"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="n"
          scale={4.5}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      {/* The deckle: a much lower horizontal frequency and a larger scale than
          #chew. A torn paper edge is stretched along the grain, not chewed all
          the way round at once, and this is the version used where the sheet
          itself bleeds off an edge rather than the picture sitting on it. */}
      <filter
        id="deckle"
        x="-4%"
        y="-2%"
        width="108%"
        height="104%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.045 0.9"
          numOctaves={3}
          seed={4}
          result="n"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="n"
          scale={7}
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
