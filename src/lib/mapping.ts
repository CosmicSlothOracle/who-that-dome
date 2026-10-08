import { cardUrl } from "./catalog";
import { DRAP_EDITION } from "./config";
import type { CardMappingRow, Decade, Song } from "./types";

const CSV_HEADER: (keyof CardMappingRow)[] = [
  "card_id",
  "edition",
  "decade",
  "artist",
  "title",
  "album",
  "year",
  "year_note",
  "city",
  "explicit",
  "spotify_track_id",
  "qr_content",
  "qr_svg",
  "qr_png",
  "artwork_file",
];

export function decadeFromPool(poolId: string): Decade | undefined {
  const match = poolId.match(/^drap-(\d{2})$/);
  if (match?.[1] === "90" || match?.[1] === "00" || match?.[1] === "10") {
    return match[1];
  }
  return undefined;
}

export function songToRow(song: Song, origin: string): CardMappingRow {
  const decade = song.decade ?? decadeFromPool(song.poolId) ?? "";
  return {
    card_id: song.id,
    edition: song.edition ?? DRAP_EDITION,
    decade,
    artist: song.artist,
    title: song.title,
    album: song.album,
    year: song.year,
    year_note: song.yearNote ?? "",
    city: song.city ?? "",
    explicit: Boolean(song.explicit),
    spotify_track_id: song.spotifyTrackId,
    qr_content: cardUrl(song.id, origin),
    qr_svg: `qr/svg/${song.id}.svg`,
    qr_png: `qr/png/${song.id}.png`,
    artwork_file: song.artworkFile ?? "",
  };
}

function csvEscape(value: string | number | boolean): string {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function rowsToCsv(rows: CardMappingRow[]): string {
  const lines = [
    CSV_HEADER.join(","),
    ...rows.map((row) => CSV_HEADER.map((key) => csvEscape(row[key])).join(",")),
  ];
  return `${lines.join("\n")}\n`;
}
