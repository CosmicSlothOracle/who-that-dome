import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { drapCatalog } from "../src/data/drap-seeds";
import type { Catalog, Decade, Song } from "../src/lib/types";
import { loadEnvFiles } from "./env";

loadEnvFiles();

const PLAYLISTS: { decade: Decade; id: string; yearMin: number; yearMax: number }[] = [
  { decade: "90", id: "37i9dQZF1DWZRGaeImgsVz", yearMin: 1990, yearMax: 1999 },
  { decade: "00", id: "37i9dQZF1DX5sbPvjd2Huv", yearMin: 2000, yearMax: 2009 },
  { decade: "10", id: process.env.DRAP_10_PLAYLIST ?? "3WkmHIcQbIGFYOKBXpzW0U", yearMin: 2010, yearMax: 2019 },
];

type SpotifyTrack = {
  id: string | null;
  name: string;
  explicit?: boolean;
  artists: { name: string }[];
  album: { name: string; release_date: string };
};

async function token(): Promise<string | null> {
  if (process.env.SPOTIFY_ACCESS_TOKEN) return process.env.SPOTIFY_ACCESS_TOKEN;
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !secret) return null;
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { access_token: string };
  return body.access_token;
}

async function playlistTracks(id: string, access: string): Promise<SpotifyTrack[]> {
  const tracks: SpotifyTrack[] = [];
  let url: string | null = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=100`;
  while (url) {
    const page: Response = await fetch(url, { headers: { Authorization: `Bearer ${access}` } });
    if (!page.ok) throw new Error(`Playlist ${id}: ${page.status}`);
    const body = (await page.json()) as { items: { track: SpotifyTrack | null }[]; next: string | null };
    for (const item of body.items) if (item.track?.id) tracks.push(item.track);
    url = body.next;
  }
  return tracks;
}

function yearFrom(date: string): number {
  return Number.parseInt(date.slice(0, 4), 10) || 0;
}

function leadArtist(name: string): string {
  return name.split(",")[0]?.trim().toLowerCase() ?? name.toLowerCase();
}

function pick24(decade: Decade, tracks: SpotifyTrack[], yearMin: number, yearMax: number): Song[] {
  const picked: Song[] = [];
  const seen = new Set<string>();
  for (const track of tracks) {
    if (!track.id || picked.length >= 24) break;
    const year = yearFrom(track.album.release_date);
    if (year && (year < yearMin || year > yearMax)) continue;
    const lead = leadArtist(track.artists[0]?.name ?? track.name);
    if (seen.has(lead)) continue;
    seen.add(lead);
    picked.push({
      id: `drap_${decade}_${String(picked.length + 1).padStart(3, "0")}`,
      poolId: `drap-${decade}`,
      edition: "drap",
      decade,
      spotifyTrackId: track.id,
      title: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      album: track.album.name,
      year,
      explicit: Boolean(track.explicit),
      city: "",
    });
  }
  return picked;
}

async function main() {
  const access = await token();
  const out = resolve(process.cwd(), "src/data/drap-live.json");

  if (!access) {
    writeFileSync(out, `${JSON.stringify(drapCatalog, null, 2)}\n`);
    console.log("Keine Spotify-Credentials — Dev-Stubs nach src/data/drap-live.json geschrieben.");
    console.log(`${drapCatalog.songs.length} Stub-Karten (24 je Dekade). Finale Kuratierung später.`);
    return;
  }

  const catalog: Catalog = { pools: drapCatalog.pools, songs: [] };
  for (const spec of PLAYLISTS) {
    try {
      const tracks = await playlistTracks(spec.id, access);
      const songs = pick24(spec.decade, tracks, spec.yearMin, spec.yearMax);
      catalog.songs.push(...songs);
      console.log(`Dekade ${spec.decade}: ${songs.length} Tracks aus ${spec.id}`);
    } catch (error) {
      const fallback = drapCatalog.songs.filter((song) => song.decade === spec.decade);
      catalog.songs.push(...fallback);
      console.log(`Dekade ${spec.decade}: Import fehlgeschlagen, Stub behalten. ${error}`);
    }
  }

  writeFileSync(out, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`Geschrieben: ${out} (${catalog.songs.length} Songs)`);
}

void main();
