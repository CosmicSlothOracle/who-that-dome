import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import QRCode from "qrcode";
import sharp from "sharp";
import { getDrapSongs } from "../src/lib/catalog";
import { CARD, CARD_PATHS, incomingNames, QR_ON_CARD } from "../src/lib/card-spec";
import { cardUrl } from "../src/lib/catalog";
import { getAppUrl } from "../src/lib/config";
import { drapCatalog } from "../src/data/drap-seeds";
import { arg, hasFlag, loadEnvFiles } from "./env";

loadEnvFiles();

const QR_OPTS = {
  errorCorrectionLevel: "Q" as const,
  margin: 4,
  color: { dark: "#000000", light: "#FFFFFF" },
};

function root(...parts: string[]) {
  return resolve(process.cwd(), ...parts);
}

async function assertCardSize(file: string, role: string) {
  const meta = await sharp(file).metadata();
  if (meta.width !== CARD.widthPx || meta.height !== CARD.heightPx) {
    throw new Error(
      `${role} muss genau ${CARD.widthPx}×${CARD.heightPx} px sein (ist ${meta.width}×${meta.height}): ${file}`,
    );
  }
}

async function makeTemplates() {
  const dir = root(CARD_PATHS.templates);
  mkdirSync(dir, { recursive: true });

  const front = await sharp({
    create: {
      width: CARD.widthPx,
      height: CARD.heightPx,
      channels: 3,
      background: { r: 245, g: 236, b: 220 },
    },
  })
    .png()
    .toBuffer();

  const svg = Buffer.from(
    `<svg width="${CARD.widthPx}" height="${CARD.heightPx}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1612"/>
      <rect x="${QR_ON_CARD.leftPx}" y="${QR_ON_CARD.topPx}" width="${QR_ON_CARD.sizePx}" height="${QR_ON_CARD.sizePx}" fill="#ffffff" stroke="#f3c06a" stroke-width="4"/>
      <text x="50%" y="190" text-anchor="middle" fill="#f3c06a" font-size="28" font-family="sans-serif">RÜCKSEITE</text>
      <text x="50%" y="${QR_ON_CARD.topPx + QR_ON_CARD.sizePx + 48}" text-anchor="middle" fill="#c4b19a" font-size="20" font-family="sans-serif">QR kommt hierhin · ${QR_ON_CARD.sizePx}px / 25mm</text>
      <text x="50%" y="980" text-anchor="middle" fill="#c4b19a" font-size="18" font-family="sans-serif">${CARD.widthPx}×${CARD.heightPx} px · 300 dpi</text>
    </svg>`,
  );

  const frontMarked = await sharp(front)
    .composite([
      {
        input: Buffer.from(
          `<svg width="${CARD.widthPx}" height="${CARD.heightPx}" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="200" text-anchor="middle" fill="#5c4a32" font-size="28" font-family="sans-serif">VORDERSEITE</text>
            <text x="50%" y="260" text-anchor="middle" fill="#8a7355" font-size="20" font-family="sans-serif">Artwork + Interpret, Titel, Album, Jahr, Stadt</text>
            <text x="50%" y="980" text-anchor="middle" fill="#8a7355" font-size="18" font-family="sans-serif">${CARD.widthPx}×${CARD.heightPx} px · kein Liedtext</text>
          </svg>`,
        ),
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toFile(root(CARD_PATHS.templates, "template_front.png"));

  await sharp(svg).png().toFile(root(CARD_PATHS.templates, "template_back.png"));
  void frontMarked;
}

async function qrPng(content: string): Promise<Buffer> {
  return QRCode.toBuffer(content, {
    ...QR_OPTS,
    type: "png",
    width: QR_ON_CARD.sizePx,
  });
}

async function composeOne(cardId: string, origin: string, incomingDir: string, outDir: string) {
  const names = incomingNames(cardId);
  const frontIn = resolve(incomingDir, names.front);
  const backIn = resolve(incomingDir, names.back);
  if (!existsSync(frontIn) || !existsSync(backIn)) {
    return { cardId, skipped: true as const };
  }

  await assertCardSize(frontIn, names.front);
  await assertCardSize(backIn, names.back);

  const frontOut = resolve(outDir, names.front);
  const backOut = resolve(outDir, names.back);
  await sharp(frontIn).png().toFile(frontOut);

  const qr = await qrPng(cardUrl(cardId, origin));
  await sharp(backIn)
    .composite([{ input: qr, left: QR_ON_CARD.leftPx, top: QR_ON_CARD.topPx }])
    .png()
    .toFile(backOut);

  return { cardId, skipped: false as const, frontOut, backOut };
}

async function main() {
  const origin = arg("origin") ?? getAppUrl();
  const incomingDir = root(arg("in") ?? CARD_PATHS.incoming);
  const outDir = root(arg("out") ?? CARD_PATHS.print);

  mkdirSync(incomingDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });
  await makeTemplates();

  const demoBack = root(CARD_PATHS.print, "beispiel_drap_90_001_back.png");
  mkdirSync(root(CARD_PATHS.print), { recursive: true });
  const demoQr = await qrPng(cardUrl("drap_90_001", origin));
  await sharp(root(CARD_PATHS.templates, "template_back.png"))
    .composite([{ input: demoQr, left: QR_ON_CARD.leftPx, top: QR_ON_CARD.topPx }])
    .png()
    .toFile(demoBack);

  if (hasFlag("templates-only")) {
    console.log(`Vorlagen: ${root(CARD_PATHS.templates)}. Beispiel-Rückseite mit QR: ${demoBack}`);
    return;
  }

  const songs = getDrapSongs().length ? getDrapSongs() : drapCatalog.songs;
  const only = arg("card");
  const list = only ? songs.filter((song) => song.id === only) : songs;

  let done = 0;
  let skipped = 0;
  for (const song of list) {
    const result = await composeOne(song.id, origin, incomingDir, outDir);
    if (result.skipped) skipped += 1;
    else done += 1;
  }

  writeFileSync(
    root(CARD_PATHS.incoming, "LESEN.txt"),
    [
      `Kartenmaß fest: ${CARD.widthPx} × ${CARD.heightPx} Pixel (63,5 × 88,9 mm bei 300 dpi).`,
      `Dateiname: drap_90_001_front.png und drap_90_001_back.png`,
      `Ablage: ${CARD_PATHS.incoming}/`,
      `Auf der Rückseite die Mitte frei lassen. Der QR sitzt bei x=${QR_ON_CARD.leftPx}, y=${QR_ON_CARD.topPx}, ${QR_ON_CARD.sizePx}×${QR_ON_CARD.sizePx} px (25 mm).`,
      `Danach: npm run compose-cards`,
      `Fertige Druck-PNGs: ${CARD_PATHS.print}/`,
      "",
    ].join("\n"),
  );

  console.log(
    `Karten gesetzt: ${done} vollständig, ${skipped} ohne Vorder-/Rückseite übersprungen. Ausgabe: ${outDir}`,
  );
}

void main();
