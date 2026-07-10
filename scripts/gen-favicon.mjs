// Rasterizes src/app/icon.svg into the fallback icons Next.js serves alongside
// the vector one: a multi-size favicon.ico (legacy browsers, sizes=any) and a
// 180px apple-icon.png (iOS home screen). Re-run after editing icon.svg:
//   node scripts/gen-favicon.mjs
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "src/app/icon.svg"));

const render = (size) =>
  sharp(svg, { density: 512 }).resize(size, size, { fit: "contain" }).png().toBuffer();

// iOS / Android touch icon
writeFileSync(join(root, "src/app/apple-icon.png"), await render(180));

// favicon.ico packing 16/32/48 PNG entries (PNG-in-ICO; every modern browser
// reads it, and it stays tiny).
const sizes = [16, 32, 48];
const imgs = await Promise.all(sizes.map(render));
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(imgs.length, 4);

let offset = 6 + imgs.length * 16;
const entries = imgs.map((data, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 0); // width
  e.writeUInt8(sizes[i] >= 256 ? 0 : sizes[i], 1); // height
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(data.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += data.length;
  return e;
});

writeFileSync(join(root, "src/app/favicon.ico"), Buffer.concat([header, ...entries, ...imgs]));
console.log(`favicon.ico (${sizes.join("/")}) + apple-icon.png (180) generated`);
