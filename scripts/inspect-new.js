// Compare the two new assets against what is already in play.
//
// portrait.svg is NOT a vector: it is an <image> element wrapping a base64 PNG,
// which is why it is 2.39 MB. Confirm that, and confirm whether the raster inside
// is the same picture as Aadarsh_io_face_revel.png.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DL = "C:\\Users\\Aadarsh Upadhyay\\Downloads\\Mobile Devices";
const OUT = "C:\\Users\\AADARS~1\\AppData\\Local\\Temp\\opencode\\sticker-hi";
const svgPath = path.join(DL, "portrait.svg");
const pngPath = path.join(DL, "Aadarsh_io_face_revel.png");

(async () => {
  // ---- what is actually inside the .svg ----
  const svg = fs.readFileSync(svgPath, "utf8");
  const m = /base64,([A-Za-z0-9+/=]+)/.exec(svg);
  const rows = [];
  if (m) {
    const inner = Buffer.from(m[1], "base64");
    fs.writeFileSync(path.join(OUT, "svg-inner.png"), inner);
    const im = await sharp(inner).metadata();
    rows.push({
      asset: "portrait.svg -> inner PNG",
      px: `${im.width}x${im.height}`,
      hasAlpha: im.hasAlpha,
      channels: im.channels,
      bytes: (inner.length / 1048576).toFixed(2) + " MB",
      sha: crypto.createHash("sha256").update(inner).digest("hex").slice(0, 16),
    });
  }

  const png = fs.readFileSync(pngPath);
  const pm = await sharp(png).metadata();
  rows.push({
    asset: "Aadarsh_io_face_revel.png",
    px: `${pm.width}x${pm.height}`,
    hasAlpha: pm.hasAlpha,
    channels: pm.channels,
    bytes: (png.length / 1048576).toFixed(2) + " MB",
    sha: crypto.createHash("sha256").update(png).digest("hex").slice(0, 16),
  });

  // ---- and the two photos the riso sheet is currently built on ----
  for (const [tag, file] of [
    ["down (in use)", "sticker_1791029683003.png"],
    ["chin (in use)", "sticker_1791028975421.png"],
  ]) {
    const b = fs.readFileSync(path.join(DL, file));
    const mm = await sharp(b).metadata();
    rows.push({
      asset: tag,
      px: `${mm.width}x${mm.height}`,
      hasAlpha: mm.hasAlpha,
      channels: mm.channels,
      bytes: (b.length / 1048576).toFixed(2) + " MB",
      sha: crypto.createHash("sha256").update(b).digest("hex").slice(0, 16),
    });
  }
  console.table(rows);

  // ---- visual previews ----
  const t = await sharp(png).trim({ threshold: 8 }).toBuffer({ resolveWithObject: true });
  console.log(`\nface_revel trims to ${t.info.width}x${t.info.height} (aspect ${(t.info.width / t.info.height).toFixed(3)})`);
  await sharp(t.data).resize({ width: 620 }).png().toFile(path.join(OUT, "face-revel.png"));
  await sharp(t.data).resize({ width: 260 }).png().toFile(path.join(OUT, "face-revel-sm.png"));

  // web version, so we can see what the sheet would actually ship
  const webp = await sharp(t.data)
    .resize({ width: 1100, withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 100, effort: 6 })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, "revel-1100.webp"), webp);
  console.log(
    `revel-1100.webp: ${(webp.length / 1024).toFixed(1)} KB raw, ${((webp.length * 4) / 3 / 1024).toFixed(1)} KB as base64`,
  );
})();