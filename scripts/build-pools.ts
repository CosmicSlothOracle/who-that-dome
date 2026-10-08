import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { nextCardId } from "../src/lib/catalog";
import { normalize } from "../src/lib/answer-match";
import type { Catalog, GuessCategory, Pool, Song, ThemeId } from "../src/lib/types";
import { arg, loadEnvFiles } from "./env";

loadEnvFiles();

// Kuratierte Listen (scripts/curated-pools.json) → Pools in src/data/songs.json.
// Spotify liefert Tracks fremder Playlists nicht mehr; deshalb Suche pro Titel (nur App-Token, eingehend).
// Aufruf: npm run build-pools [-- --only 90er,tarantino]

type Curated = {
  id: string;
  name: string;
  description: string;
  theme: ThemeId;
  era: string;
  genre: string;
  group: string;
  extra: GuessCategory[];
  tracks: { title: string; artist: string; year: number }[];
};

type Item = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; release_date: string; album_type: string; images?: { url: string }[] };
  popularity?: number;
};

const BAD_ALBUM = /deluxe|anniversary|remaster|greatest|best of|hits|collection|essential|ultimate|karaoke|tribute|live|version|mix|sampler|now that|party|#1|number 1|favou?rites|gold|platinum/i;
const BAD_TITLE = /remaster|live|karaoke|instrumental|acoustic|cover|tribute|version|remix|edit|demo/i;

const stripBrackets = (value: string) => value.replace(/\s*[([].*?[)\]]/g, "").replace(/\s+-\s+.*$/, "").trim();
const yearOf = (date: string) => Number.parseInt(date.slice(0, 4), 10);

async function token(): Promise<string> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!response.ok) throw new Error(`Token: ${response.status}`);
  return ((await response.json()) as { access_token: string }).access_token;
}

async function search(query: string, bearer: string): Promise<Item[]> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10&market=DE`,
      { headers: { Authorization: `Bearer ${bearer}` } },
    );
    if (response.status === 429) {
      await new Promise((r) => setTimeout(r, (Number(response.headers.get("retry-after")) || 2) * 1000 + 500));
      continue;
    }
    if (!response.ok) return [];
    return ((await response.json()) as { tracks: { items: Item[] } }).tracks.items;
  }
  return [];
}

function pick(items: Item[], title: string, artist: string, year: number): Item | undefined {
  const wantTitle = normalize(stripBrackets(title));
  const wantArtist = normalize(artist);
  let best: { item: Item; score: number } | undefined;
  for (const item of items) {
    if (normalize(stripBrackets(item.name)) !== wantTitle) continue;
    const artistOk = item.artists.some((a) => {
      const name = normalize(a.name);
      return name === wantArtist || name.includes(wantArtist) || wantArtist.includes(name);
    });
    if (!artistOk) continue;
    let score = 0;
    if (item.album.album_type === "album") score += 10;
    if (item.album.album_type === "compilation") score -= 4;
    if (BAD_ALBUM.test(item.album.name)) score -= 8;
    if (BAD_TITLE.test(item.name)) score -= 6;
    const diff = Math.abs(yearOf(item.album.release_date) - year);
    score += diff === 0 ? 8 : -Math.min(diff, 10);
    score += (item.popularity ?? 0) / 25;
    if (!best || score > best.score) best = { item, score };
  }
  return best?.item;
}

async function main() {
  const only = arg("only")?.split(",");
  const curated = JSON.parse(readFileSync(resolve(process.cwd(), "scripts/curated-pools.json"), "utf8")) as Curated[];
  const catalogPath = resolve(process.cwd(), "src/data/songs.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;
  const bearer = await token();

  for (const pool of curated) {
    if (only && !only.includes(pool.id)) continue;
    catalog.songs = catalog.songs.filter((song) => song.poolId !== pool.id);
    const added: Song[] = [];
    const missing: string[] = [];
    const seen = new Set<string>();

    for (const track of pool.tracks) {
      const base = stripBrackets(track.title).replace(/"/g, "");
      let found = pick(await search(`track:${base} artist:${track.artist}`, bearer), track.title, track.artist, track.year);
      if (!found) found = pick(await search(`${base} ${track.artist}`, bearer), track.title, track.artist, track.year);
      if (!found || seen.has(found.id)) {
        missing.push(`${track.title} – ${track.artist}`);
        continue;
      }
      seen.add(found.id);
      added.push({
        id: nextCardId(pool.id, [...catalog.songs, ...added]),
        poolId: pool.id,
        spotifyTrackId: found.id,
        title: track.title.replace(/ - .*$/, ""),
        artist: track.artist,
        album: found.album.name,
        year: track.year,
        coverUrl: found.album.images?.[0]?.url,
      });
    }

    const meta: Pool = {
      id: pool.id,
      name: pool.name,
      description: pool.description,
      theme: pool.theme,
      era: pool.era,
      genre: pool.genre,
      group: pool.group,
      extraCategories: pool.extra,
    };
    const index = catalog.pools.findIndex((entry) => entry.id === pool.id);
    if (index >= 0) catalog.pools[index] = meta;
    else catalog.pools.push(meta);
    catalog.songs.push(...added);
    console.log(`${pool.id}: ${added.length}/${pool.tracks.length}${missing.length ? ` · fehlt: ${missing.join("; ")}` : ""}`);
  }

  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
}

void main();
