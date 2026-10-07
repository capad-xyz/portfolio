// Why the riso version darkened him, measured rather than guessed.
//
// The earlier treatment applied `grayscale(1) contrast(1.5) brightness(.6)` to the
// key plate, then multiplied three plates together. Grayscale throws away hue,
// contrast(1.5) pushes the midtones apart, brightness(.6) pulls the key down -
// and multiply darkens at every layer. Skin is the thing that suffers most,
// because skin lives almost entirely in the midtones.
//
// So: sample the face, get the real distribution, and build the ink palette from
// what is actually there rather than from a generic riso colour set.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC =
  "C:\\Users\\Aadarsh Upadhyay\\Downloads\\Mobile Devices\\Aadarsh_io_face_revel.png";
const OUT = "C:\\Users\\AADARS~1\\AppData\\Local\\Temp\\opencode\\sticker-hi";

const hex = (r, g, b) =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

(async () => {
  const meta = await sharp(SRC).metadata();
  const W = meta.width, H = meta.height;
  console.log(`source ${W}x${H}`);

  // Face region. The retouched crop puts the head in the upper-middle; this is a
  // generous box around the cheeks, nose and forehead, avoiding the hair mass
  // at the top and the shirt at the bottom.
  const region = {
    left: Math.round(W * 0.26),
    top: Math.round(H * 0.22),
    width: Math.round(W * 0.48),
    height: Math.round(H * 0.34),
  };
  console.log(`face region ${region.width}x${region.height} at ${region.left},${region.top}`);

  const { data, info } = await sharp(SRC)
    .extract(region)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = info.width * info.height;
  const ch = info.channels;

  // --- luminance distribution + representative colours at each band ---
  const lums = [];
  const buckets = new Map();
  for (let i = 0; i < px; i++) {
    const r = data[i * ch], g = data[i * ch + 1], b = data[i * ch + 2];
    // Rec.709 luma
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lums.push(L);
    const band = Math.min(4, Math.floor((L / 256) * 5));
    if (!buckets.has(band)) buckets.set(band, { n: 0, r: 0, g: 0, b: 0 });
    const k = buckets.get(band);
    k.n++; k.r += r; k.g += g; k.b += b;
  }
  lums.sort((a, b) => a - b);
  const pct = (p) => Math.round(lums[Math.floor((lums.length - 1) * p)]);
  console.log(`\nluma  p05=${pct(0.05)}  p25=${pct(0.25)}  p50=${pct(0.5)}  p75=${pct(0.75)}  p95=${pct(0.95)}`);

  const names = ["deep shadow", "shadow", "midtone / skin", "light", "highlight"];
  console.log("\nband          share   mean colour   hex");
  for (const [band, v] of [...buckets.entries()].sort((a, b) => a[0] - b[0])) {
    const share = ((v.n / px) * 100).toFixed(1) + "%";
    const r = v.r / v.n, g = v.g / v.n, b = v.b / v.n;
    console.log(
      `${names[band].padEnd(14)} ${share.padStart(6)}   rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`.padEnd(46) + hex(r, g, b),
    );
  }

  // --- median skin colour: the midtone band only ---
  const sk = buckets.get(2);
  const skin = { r: sk.r / sk.n, g: sk.g / sk.n, b: sk.b / sk.n };
  console.log(`\nmedian skin  ${hex(skin.r, skin.g, skin.b)}  rgb(${Math.round(skin.r)},${Math.round(skin.g)},${Math.round(skin.b)})`);

  // Saturation tells us how much ink a "riso" pass would have to fight.
  const mx = Math.max(skin.r, skin.g, skin.b), mn = Math.min(skin.r, skin.g, skin.b);
  console.log(`skin saturation ${(((mx - mn) / mx) * 100).toFixed(1)}%   (grayscale(1) discards exactly this)`);

  // Swatch strip for visual reference.
  const sw = 240, sh = 60;
  const strip = [];
  for (const [band, v] of [...buckets.entries()].sort((a, b) => a[0] - b[0])) {
    const c = { r: v.r / v.n, g: v.g / v.n, b: v.b / v.n };
    for (let x = 0; x < sw / 5; x++) {
      for (let y = 0; y < sh; y++) strip.push(c.r, c.g, c.b);
    }
  }
  fs.writeFileSync(
    path.join(OUT, "tone-bands.png"),
    await sharp(Buffer.from(strip), { raw: { width: sw, height: sh, channels: 3 } })
      .png()
      .toBuffer(),
  );
  console.log("\nwrote tone-bands.png");
})();