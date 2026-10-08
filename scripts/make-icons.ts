import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

// Erzeugt die PWA-Icons (Schallplatte, orange Label): npx tsx scripts/make-icons.ts
const svg = (size: number, pad: number) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#d7d7d7"/>
  <g transform="translate(256 256) scale(${(512 - pad * 2) / 512})">
    <circle r="236" fill="#1c1c1c"/>
    ${[190, 210, 226].map((r) => `<circle r="${r}" fill="none" stroke="#3a3a3a" stroke-width="2"/>`).join("")}
    <circle r="82" fill="#ef7b1a"/>
    <circle r="10" fill="#1c1c1c"/>
  </g>
</svg>`;

async function main() {
  const dir = resolve(process.cwd(), "public/icons");
  mkdirSync(dir, { recursive: true });
  await sharp(Buffer.from(svg(192, 8))).png().toFile(resolve(dir, "icon-192.png"));
  await sharp(Buffer.from(svg(512, 8))).png().toFile(resolve(dir, "icon-512.png"));
  await sharp(Buffer.from(svg(512, 70))).png().toFile(resolve(dir, "icon-maskable-512.png"));
  console.log("Icons in public/icons");
}

void main();
