import catalogJson from "../data/songs.json";
import liveJson from "../data/drap-live.json";
import { drapCatalog } from "../data/drap-seeds";
import type { Catalog, GuessCategory, Pool, Song } from "./types";

const base = catalogJson as Catalog;
const live = liveJson as Catalog;
const drap = live.songs?.length ? live : drapCatalog;

export const catalog: Catalog = {
  pools: [...drap.pools, ...base.pools],
  songs: [...drap.songs, ...base.songs],
};

export function getCatalog(): Catalog {
  return catalog;
}

export function getPools(): Pool[] {
  return catalog.pools;
}

export function getPool(poolId: string): Pool | undefined {
  return catalog.pools.find((pool) => pool.id === poolId);
}

export function getSongs(poolIds?: string[]): Song[] {
  if (!poolIds || poolIds.length === 0) return catalog.songs;
  const allowed = new Set(poolIds);
  return catalog.songs.filter((song) => allowed.has(song.poolId));
}

export function getSong(cardId: string): Song | undefined {
  return catalog.songs.find((song) => song.id === cardId);
}

export function getDrapSongs(): Song[] {
  return catalog.songs.filter((song) => song.poolId.startsWith("drap-"));
}

export function nextCardId(poolId: string, songs: Song[] = catalog.songs): string {
  const drap = poolId.match(/^drap-(\d{2})$/);
  const prefix = drap ? `drap_${drap[1]}_` : `${poolId}-`;
  let max = 0;
  for (const song of songs) {
    if (!song.id.startsWith(prefix)) continue;
    const n = Number.parseInt(song.id.slice(prefix.length), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

export function parseCardPayload(raw: string, knownIds?: Set<string>): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/c\/([^/?#]+)/);
    if (match?.[1]) return decodeURIComponent(match[1]);
    const queryCard = url.searchParams.get("card");
    if (queryCard) return queryCard;
  } catch {
    // not a URL
  }

  if (/^[a-z0-9]+_\d{2}_\d+$/i.test(trimmed)) return trimmed;
  if (/^[a-zA-Z0-9_-]+-\d+$/.test(trimmed)) return trimmed;
  if (knownIds?.has(trimmed)) return trimmed;
  return null;
}

export function cardUrl(cardId: string, origin: string): string {
  return `${origin.replace(/\/$/, "")}/c/${encodeURIComponent(cardId)}`;
}

export function spotifyWebUrl(trackId: string): string {
  return `https://open.spotify.com/track/${trackId}`;
}

export function spotifyUri(trackId: string): string {
  return `spotify:track:${trackId}`;
}

export function answerFor(song: Song, category: GuessCategory): string | null {
  if (category === "verse") return null;
  if (category === "year") return String(song.year);
  if (category === "city") return song.city?.trim() ? song.city : "—";
  return song[category];
}
