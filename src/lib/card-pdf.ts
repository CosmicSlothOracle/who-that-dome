import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";
import { cardUrl } from "./catalog";
import type { Pool, Song } from "./types";

const PAGE = { width: 595.28, height: 841.89 };
const COLS = 2;
const ROWS = 4;
const MARGIN = 22;

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages;
}

async function qrPng(value: string): Promise<Uint8Array> {
  const dataUrl = await QRCode.toDataURL(value, {
    width: 420,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#1a130c", light: "#fff8ec" },
  });
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function buildCardsPdf(input: {
  songs: Song[];
  pools: Pool[];
  origin: string;
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const gold = rgb(0.72, 0.5, 0.18);
  const ink = rgb(0.12, 0.09, 0.05);
  const muted = rgb(0.35, 0.28, 0.2);
  const perPage = COLS * ROWS;
  const cardW = (PAGE.width - MARGIN * 2) / COLS;
  const cardH = (PAGE.height - MARGIN * 2) / ROWS;
  const poolName = (id: string) => input.pools.find((pool) => pool.id === id)?.name ?? id;

  for (const pageSongs of chunk(input.songs, perPage)) {
    const page = pdf.addPage([PAGE.width, PAGE.height]);
    for (const [index, song] of pageSongs.entries()) {
      const col = index % COLS;
      const row = Math.floor(index / COLS);
      const x = MARGIN + col * cardW;
      const y = PAGE.height - MARGIN - (row + 1) * cardH;
      page.drawRectangle({
        x,
        y,
        width: cardW,
        height: cardH,
        borderColor: gold,
        borderWidth: 1.2,
      });

      page.drawText("WHO THAT DOME", {
        x: x + 14,
        y: y + cardH - 28,
        size: 9,
        font: bold,
        color: gold,
      });
      page.drawText(poolName(song.poolId).toUpperCase(), {
        x: x + 14,
        y: y + cardH - 44,
        size: 11,
        font: bold,
        color: ink,
      });

      const png = await pdf.embedPng(await qrPng(cardUrl(song.id, input.origin)));
      const qrSize = Math.min(cardW, cardH) * 0.52;
      page.drawImage(png, {
        x: x + (cardW - qrSize) / 2,
        y: y + 42,
        width: qrSize,
        height: qrSize,
      });

      page.drawText(song.id, {
        x: x + 14,
        y: y + 20,
        size: 10,
        font,
        color: muted,
      });
    }
  }

  for (const pageSongs of chunk(input.songs, perPage)) {
    const page = pdf.addPage([PAGE.width, PAGE.height]);
    for (const [index, song] of pageSongs.entries()) {
      const col = index % COLS;
      const row = Math.floor(index / COLS);
      const x = MARGIN + col * cardW;
      const y = PAGE.height - MARGIN - (row + 1) * cardH;
      page.drawRectangle({
        x,
        y,
        width: cardW,
        height: cardH,
        borderColor: gold,
        borderWidth: 1.2,
      });
      const lines = [
        poolName(song.poolId),
        song.artist,
        song.title,
        song.album,
        String(song.year),
        song.id,
      ];
      lines.forEach((line, lineIndex) => {
        page.drawText(line.slice(0, 42), {
          x: x + 16,
          y: y + cardH - 36 - lineIndex * 22,
          size: lineIndex === 0 ? 10 : 12,
          font: lineIndex === 0 || lineIndex === 5 ? font : bold,
          color: lineIndex === 0 || lineIndex === 5 ? muted : ink,
        });
      });
    }
  }

  return pdf.save();
}
