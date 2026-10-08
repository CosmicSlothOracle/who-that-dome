import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { getDrapSongs } from "../src/lib/catalog";
import { getAppUrl } from "../src/lib/config";
import { rowsToCsv, songToRow } from "../src/lib/mapping";
import { drapCatalog } from "../src/data/drap-seeds";
import { arg, loadEnvFiles } from "./env";

loadEnvFiles();

const QR_OPTS = {
  errorCorrectionLevel: "Q" as const,
  margin: 4,
  color: { dark: "#000000", light: "#FFFFFF" },
};

async function main() {
  const origin = arg("origin") ?? getAppUrl();
  const version = arg("version") ?? "v001";
  const root = resolve(process.cwd(), "handoff/drap", version);
  const songs = getDrapSongs().length ? getDrapSongs() : drapCatalog.songs;
  const rows = songs.map((song) => songToRow(song, origin));

  mkdirSync(resolve(root, "qr/svg"), { recursive: true });
  mkdirSync(resolve(root, "qr/png"), { recursive: true });
  mkdirSync(resolve(root, "print"), { recursive: true });

  for (const row of rows) {
    const svg = resolve(root, row.qr_svg);
    const png = resolve(root, row.qr_png);
    await QRCode.toFile(svg, row.qr_content, { ...QR_OPTS, type: "svg" });
    await QRCode.toFile(png, row.qr_content, { ...QR_OPTS, type: "png", width: 1000 });
  }

  writeFileSync(resolve(root, "mapping.csv"), rowsToCsv(rows));
  writeFileSync(resolve(root, "mapping.json"), `${JSON.stringify(rows, null, 2)}\n`);

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const pageSize = { width: 595.28, height: 841.89 };
  const cols = 3;
  const rowsPerPage = 4;
  const cellW = pageSize.width / cols;
  const cellH = pageSize.height / rowsPerPage;

  for (let i = 0; i < rows.length; i += cols * rowsPerPage) {
    const page = pdf.addPage([pageSize.width, pageSize.height]);
    const slice = rows.slice(i, i + cols * rowsPerPage);
    for (const [index, row] of slice.entries()) {
      const col = index % cols;
      const gridRow = Math.floor(index / cols);
      const x = col * cellW;
      const y = pageSize.height - (gridRow + 1) * cellH;
      const pngBytes = await QRCode.toBuffer(row.qr_content, { ...QR_OPTS, type: "png", width: 600 });
      const image = await pdf.embedPng(pngBytes);
      const qr = 110;
      page.drawImage(image, { x: x + (cellW - qr) / 2, y: y + 36, width: qr, height: qr });
      page.drawText(row.card_id, {
        x: x + 16,
        y: y + 18,
        size: 9,
        font,
        color: rgb(0, 0, 0),
      });
    }
  }

  writeFileSync(resolve(root, "print/qr-sammelbogen.pdf"), await pdf.save());

  copyFileSync(resolve(process.cwd(), "docs/punkteblatt.md"), resolve(root, "punkteblatt.md"));

  writeFileSync(
    resolve(root, "README.txt"),
    [
      "Who That Dome — Deutschrap-Edition QR-Pack",
      `Version: ${version}`,
      `QR-Inhalt-Basis: ${origin}`,
      `Karten: ${rows.length}`,
      "",
      "Formate: SVG (primär) + PNG 1000x1000, Fehlerkorrektur Q, Ruhezone 4, schwarz auf weiß.",
      "Druckgröße auf der Karte: mindestens 25 x 25 mm.",
      "artwork_file in mapping.csv ist leer — vom Design zu befüllen.",
      "Dev-Stubs: Spotify-IDs sind Platzhalter, bis die Playlists final sind.",
      "Vor dem physischen Druck: HTTPS-URL und Songliste einfrieren, Pack neu erzeugen.",
      "",
    ].join("\n"),
  );

  console.log(`QR-Pack: ${root} (${rows.length} Karten, Basis ${origin})`);
}

void main();
