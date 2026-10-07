// Build small, alpha-correct WebP cutouts for the HTML reference sheet.
// The skill caps a self-contained doc at 512 KB and forbids local file paths, so
// every image has to be inlined as a data URL. Five photos of a face are the
// bulk of that budget, hence this step.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = "C:\\Users\\Aadarsh Upadhyay\\Downloads\\Mobile Devices";
const OUT = "C:\\Users\\AADARS~1\\AppData\\Local\\Temp\\opencode\\sticker-preview";

// Unique only: sticker_1791028975421.png and sticker_276808765691203754.png are
// byte-identical (verified by MD5), so one of them would just be dead weight.
const FILES = [
  "sticker_1791028975421.png", // chin-on-hand, black shirt, direct eye contact
  "sticker_1791029080355.png", // arms reaching toward camera, wide
  "sticker_1791029093649.png", // full body, crouching, phone up
  "sticker_1791029625500.png", // phone covering face, looking away
  "sticker_1791029683003.png", // looking down at camera, close, gold chain
];

(async () => {
  const budget = [];
  for (const f of FILES) {
    const src = path.join(SRC, f);
    const meta = await sharp(src).metadata();
    // trim() uses the alpha channel's top-left pixel by default; the sources all
    // have transparent corners, so this crops to the real subject.
    const trimmed = await sharp(src)
      .trim({ threshold: 8 })
      .toBuffer({ resolveWithObject: true });

    // WebP is the only format here that keeps the soft alpha edge these cutouts
    // need at a fraction of PNG's size. A lossy alpha plane would fringe against
    // the page, so alphaQuality is pinned high.
    const out = await sharp(trimmed.data)
      .resize({ width: 300, withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 74, alphaQuality: 100, effort: 6 })
      .toBuffer();

    const b64 = out.toString("base64");
    const dst = path.join(OUT, f.replace(/\.png$/, ".webp"));
    fs.writeFileSync(dst, out);
    budget.push({ file: f, origMB: +(fs.statSync(src).size / 1048576).toFixed(2), webpKB: +(out.length / 1024).toFixed(1), b64KB: +(b64.length / 1024).toFixed(1) });
  }

  const total = budget.reduce((a, b) => a + b.b64KB, 0);
  console.table(budget);
  console.log("total base64: " + total.toFixed(1) + " KB  (doc cap 512 KB, leaves " + (512 - total).toFixed(1) + " KB for markup+CSS)");
})();