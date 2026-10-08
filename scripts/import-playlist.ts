import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { nextCardId } from "../src/lib/catalog";
import type { Catalog, Pool, Song } from "../src/lib/types";
import { arg, hasFlag, loadEnvFiles } from "./env";

loadEnvFiles();

type SpotifyTrack = {
  id: string | null;
  name: string;
  artists: { name: string }[];
  album: { name: string; release_date: string; images?: { url: string }[] };
  type?: string;
};

function playlistIdFromInput(input: string): string {
  const urlMatch = input.match(/playlist[/:]([a-zA-Z0-9]+)/);
  if (urlMatch?.[1]) return urlMatch[1];
  return input.trim();
}

async function clientCredentialsToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (process.env.SPOTIFY_ACCESS_TOKEN) return process.env.SPOTIFY_ACCESS_TOKEN;
  if (!clientId || !secret) {
    throw new Error("SPOTIFY_CLIENT_ID und SPOTIFY_CLIENT_SECRET (oder SPOTIFY_ACCESS_TOKEN) nötig.");
  }
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!response.ok) {
    throw new Error(`Token fehlgeschlagen: ${response.status} ${await response.text()}`);
  }
  const body = (await response.json()) as { access_token: string };
  return body.access_token;
}

async function fetchPlaylist(id: string, token: string) {
  const first = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!first.ok) {
    throw new Error(`Playlist nicht ladbar: ${first.status} ${await first.text()}`);
  }
  const playlist = (await first.json()) as {
    name: string;
    description: string;
    tracks: { items: { track: SpotifyTrack | null }[]; next: string | null };
  };

  const tracks: SpotifyTrack[] = [];
  let next: string | null = null;
  const firstItems = playlist.tracks.items;
  for (const item of firstItems) if (item.track?.id) tracks.push(item.track);
  next = playlist.tracks.next;

  while (next) {
    const page = await fetch(next, { headers: { Authorization: `Bearer ${token}` } });
    if (!page.ok) throw new Error(`Tracks-Seite fehlgeschlagen: ${page.status}`);
    const body = (await page.json()) as { items: { track: SpotifyTrack | null }[]; next: string | null };
    for (const item of body.items) if (item.track?.id) tracks.push(item.track);
    next = body.next;
  }

  return { name: playlist.name, description: playlist.description, tracks };
}

// Datei von /api/dev/playlist (Nutzer-Token nötig, siehe dort).
function loadPlaylistFile(path: string) {
  const data = JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")) as {
    name: string;
    description: string;
    items: { track?: SpotifyTrack | null; item?: SpotifyTrack | null }[];
  };
  const tracks = data.items
    .map((entry) => entry.item ?? entry.track)
    .filter((track): track is SpotifyTrack => Boolean(track?.id) && track?.type !== "episode");
  return { name: data.name, description: data.description, tracks };
}

function yearFrom(date: string): number {
  const year = Number.parseInt(date.slice(0, 4), 10);
  return Number.isFinite(year) ? year : 0;
}

async function main() {
  const positional = process.argv.slice(2).find((value) => !value.startsWith("--"));
  if (!positional) {
    console.error("Usage: npm run import-playlist -- <playlist-url-or-id> --pool 2000er [--name \"2000er Hits\"] [--replace]");
    process.exit(1);
  }

  const poolId = arg("pool");
  if (!poolId) {
    console.error("Bitte --pool <id> angeben, z. B. --pool 2000er");
    process.exit(1);
  }

  const catalogPath = resolve(process.cwd(), "src/data/songs.json");
  const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as Catalog;
  const fromFile = arg("from-file");
  const playlist = fromFile
    ? loadPlaylistFile(fromFile)
    : await fetchPlaylist(playlistIdFromInput(positional), await clientCredentialsToken());
  const poolName = arg("name", playlist.name) ?? playlist.name;
  const replace = hasFlag("replace");

  const existingPool = catalog.pools.find((pool) => pool.id === poolId);
  const pool: Pool = existingPool
    ? { ...existingPool, name: poolName, description: existingPool.description || playlist.description || poolName }
    : { id: poolId, name: poolName, description: playlist.description || poolName };

  const theme = arg("theme");
  const era = arg("era");
  const genre = arg("genre");
  if (theme) pool.theme = theme as Pool["theme"];
  if (era) pool.era = era;
  if (genre) pool.genre = genre;

  if (!existingPool) catalog.pools.push(pool);
  else Object.assign(existingPool, pool);

  const remaining = replace ? catalog.songs.filter((song) => song.poolId !== poolId) : catalog.songs;
  const imported: Song[] = [];
  const seen = new Set(
    remaining.filter((song) => song.poolId === poolId).map((song) => song.spotifyTrackId),
  );

  for (const track of playlist.tracks) {
    if (!track.id || seen.has(track.id)) continue;
    seen.add(track.id);
    imported.push({
      id: nextCardId(poolId, [...remaining, ...imported]),
      poolId,
      spotifyTrackId: track.id,
      title: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      album: track.album.name,
      year: yearFrom(track.album.release_date),
      coverUrl: track.album.images?.[0]?.url,
    });
  }

  catalog.songs = [...remaining, ...imported];
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`Importiert: ${imported.length} Songs in Pool "${pool.name}" (${poolId}). Gesamt: ${catalog.songs.length}`);
}

void main();
