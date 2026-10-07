// Pick a shipping weight for the new retouched portrait.
//
// The retouch adds fine detail - individual hair strands, skin texture - which
// compresses far worse than the softer original: down-1100 was 91.8 KB, the
// retouched equivalent is 177.6 KB at the same settings. So this has to be
// measured rather than assumed, and the answer decides how much room is left for
// markup inside the 512 KB self-contained cap.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const DL = "C:\\Users\\Aadarsh Upadhyay\\Downloads\\Mobile Devices";
const OUT = "C:\\Users\\AADARS~1\\AppData\\Local\\Temp\\opencode\\sticker-hi";
const SRC = path.join(DL, "Aadarsh_io_face_revel.png");

(async () => {
  const t = await sharp(SRC).trim({ threshold: 8 }).toBuffer({ resolveWithObject: true });
  const rows = [];

  for (const width of [1100, 980, 900, 820, 720]) {
    for (const q of [82, 78, 74]) {
      const buf = await sharp(t.data)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: q, alphaQuality: 100, effort: 6 })
        .toBuffer();
      rows.push({
        width,
        q,
        rawKB: +(buf.length / 1024).toFixed(1),
        b64KB: +((buf.length * 4) / 3 / 1024).toFixed(1),
      });
    }
  }
  console.table(rows);

  // Largest display size C actually uses: 48% of a 1440 frame.
  const disp = Math.round(1440 * 0.48);
  console.log(`\nC displays this photo at up to ~${disp}px wide inside a 1440 frame.`);
  console.log("Pick the cheapest row that is still >= 1.0x that, i.e. width >= " + disp + ".");
})();