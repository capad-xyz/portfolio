#!/usr/bin/env node
/**
 * Higher-fidelity cut-outs for the Riso (option C) iterations.
 *
 * The first sheet inlined every photo at 300px wide so nine mockups would fit
 * the 512 KB self-contained cap. That was fine for A and B, where a photo is
 * never larger than ~160px on screen, but C renders ONE photo at up to 48% of a
 * 1440px frame - roughly 690px - so a 300px source was upscaled 2.3x and read as
 * pixelated. The fix is not "compress less"; it is to stop inlining nine copies
 * of five photos and instead inline one photo at a size that matches its largest
 * use.
 *
 * Also measures the budget so the sheet size is a decision, not a surprise.
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = "C:\\Users\\Aadarsh Upadhyay\\Downloads\\Mobile Devices";
const OUT = "C:\\Users\\AADARS~1\\AppData\\Local\\Temp\\opencode\\sticker-hi";

// Only the two photos option C actually needs at large size.
const WANT = [
  { file: "sticker_1791029683003.png", tag: "down", widths: [1100, 720] },
  { file: "sticker_1791028975421.png", tag: "chin", widths: [1100, 720] },
];

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const rows = [];

  for (const w of WANT) {
    const src = path.join(SRC, w.file);
    // trim() crops to the alpha bounds; sources have transparent corners.
    const t = await sharp(src).trim({ threshold: 8 }).toBuffer({ resolveWithObject: true });
    const meta = await sharp(t.data).metadata();

    for (const width of w.widths) {
      // q82 rather than the 74 used for thumbnails: these are the sheet's hero
      // image and the halftone/erode treatments pull hard edges, where
      // compression artefacts are far more visible than in a soft photo.
      const buf = await sharp(t.data)
        .resize({ width, withoutEnlargement: true, fit: "inside" })
        .webp({ quality: 82, alphaQuality: 100, effort: 6 })
        .toBuffer();

      const name = `${w.tag}-${width}.webp`;
      fs.writeFileSync(path.join(OUT, name), buf);
      rows.push({
        tag: w.tag,
        trimmed: `${meta.width}x${meta.height}`,
        out: `${width}px`,
        aspect: (meta.width / meta.height).toFixed(3),
        rawKB: (buf.length / 1024).toFixed(1),
        b64KB: ((buf.length * 4) / 3 / 1024).toFixed(1),
      });
    }
  }

  console.table(rows);

  // What the sheet can actually afford.
  const hi = rows.filter((r) => r.out === "1100px");
  const mid = rows.filter((r) => r.out === "720px");
  const sum = (a) => a.reduce((s, r) => s + parseFloat(r.b64KB), 0);
  console.log(`both @1100px as base64 : ${sum(hi).toFixed(1)} KB`);
  console.log(`both @720px  as base64 : ${sum(mid).toFixed(1)} KB`);
  console.log(`one  @1100px + one @720px : ${(parseFloat(hi[0].b64KB) + parseFloat(mid[1].b64KB)).toFixed(1)} KB`);
  console.log(`doc cap 512 KB -> markup+CSS budget: ${(512 - sum(hi)).toFixed(1)} KB if both are 1100px`);
})();