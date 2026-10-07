// Final shipping weights for the Riso sheet.
//
// The retouched portrait replaces `down` everywhere: it is the same photograph
// with a tighter crop and a much larger face, which is what a hero actually needs,
// and using one image across all nine panels keeps the edge treatment and the
// behaviour as the only variables. `chin` stays for B4 so the sheet still proves
// the treatment works on more than one subject.
//
// Sizing rationale: C renders the photo at up to ~691px (48% of a 1440 frame), so
// 900px is a 1.3x downscale - crisp, with headroom for a wider desktop. The
// retouch compresses badly (hair and skin detail), so 900/q78 is 148.6 KB as
// base64 against 91.8 KB for the softer original at 1100px. Paying that is
// correct: this is the hero.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const DL = "C:\\Users\\Aadarsh Upadhyay\\Downloads\\Mobile Devices";
const OUT = "C:\\Users\\AADARS~1\\AppData\\Local\\Temp\\opencode\\sticker-hi";

const JOBS = [
  { src: "Aadarsh_io_face_revel.png", tag: "revel", width: 900, q: 78 },
  { src: "sticker_1791028975421.png", tag: "chin", width: 820, q: 78 },
];

(async () => {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const rows = [];
  for (const j of JOBS) {
    const raw = await sharp(path.join(DL, j.src)).trim({ threshold: 8 }).toBuffer();
    const buf = await sharp(raw)
      .resize({ width: j.width, withoutEnlargement: true, fit: "inside" })
      .webp({ quality: j.q, alphaQuality: 100, effort: 6 })
      .toBuffer();
    fs.writeFileSync(path.join(OUT, `${j.tag}-final.webp`), buf);
    rows.push({
      tag: j.tag,
      width: j.width,
      q: j.q,
      rawKB: +(buf.length / 1024).toFixed(1),
      b64KB: +((buf.length * 4) / 3 / 1024).toFixed(1),
    });
  }
  console.table(rows);
  const total = rows.reduce((s, r) => s + r.b64KB, 0);
  console.log(`total base64 ${total.toFixed(1)} KB -> markup+CSS budget ${(512 - total).toFixed(1)} KB`);
})();