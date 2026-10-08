import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";
import { cardUrl, getCatalog } from "../src/lib/catalog";
import { CARD, QR_ON_CARD } from "../src/lib/card-spec";
import { getAppUrl } from "../src/lib/config";
import { arg, loadEnvFiles } from "./env";

loadEnvFiles();

// Rückseiten mit QR für einen Pool: npm run make-card-backs -- --pool testlauf [--origin https://…]
async function main() {
  const poolId = arg("pool");
  if (!poolId) throw new Error("Bitte --pool <id> angeben.");
  const origin = arg("origin") ?? getAppUrl();
  const outDir = resolve(process.cwd(), arg("out") ?? `handoff/${poolId}/backs`);
  mkdirSync(outDir, { recursive: true });

  const songs = getCatalog().songs.filter((song) => song.poolId === poolId);
  if (!songs.length) throw new Error(`Keine Songs im Pool "${poolId}".`);

  const { widthPx: w, heightPx: h } = CARD;
  const { leftPx, topPx, sizePx } = QR_ON_CARD;

  for (const song of songs) {
    const qr = await QRCode.toBuffer(cardUrl(song.id, origin), {
      errorCorrectionLevel: "Q",
      margin: 4,
      type: "png",
      width: sizePx,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
    const base = Buffer.from(
      `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1612"/>
        <rect x="24" y="24" width="${w - 48}" height="${h - 48}" rx="28" fill="none" stroke="#f3c06a" stroke-width="3"/>
        <text x="50%" y="170" text-anchor="middle" fill="#f3c06a" font-size="54" font-weight="bold" font-family="sans-serif">WHO THAT DOME</text>
        <text x="50%" y="${topPx + sizePx + 70}" text-anchor="middle" fill="#c4b19a" font-size="26" font-family="sans-serif">Scannen &amp; raten</text>
        <text x="50%" y="${h - 70}" text-anchor="middle" fill="#8a7355" font-size="22" font-family="monospace">${song.id}</text>
      </svg>`,
    );
    const file = resolve(outDir, `${song.id}_back.png`);
    await sharp(base).composite([{ input: qr, left: leftPx, top: topPx }]).png().toFile(file);
  }
  console.log(`${songs.length} Rückseiten in ${outDir} (QR → ${origin}/c/<id>)`);
}

void main();
