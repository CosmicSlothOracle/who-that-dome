import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { getCatalog, getSongs } from "../src/lib/catalog";
import { buildCardsPdf } from "../src/lib/card-pdf";
import { arg, loadEnvFiles } from "./env";

loadEnvFiles();

async function main() {
  const origin =
    arg("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  const pool = arg("pool");
  const out = resolve(process.cwd(), arg("out", "output/cards.pdf") ?? "output/cards.pdf");
  const catalog = getCatalog();
  const songs = getSongs(pool ? [pool] : undefined);

  if (songs.length === 0) {
    console.error("Keine Songs für diesen Pool.");
    process.exit(1);
  }

  const bytes = await buildCardsPdf({ songs, pools: catalog.pools, origin });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, bytes);
  console.log(`PDF geschrieben: ${out} (${songs.length} Karten, Basis ${origin})`);
}

void main();
