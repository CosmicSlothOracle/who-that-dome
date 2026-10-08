import type { GuessCategory, Song } from "./types";

export function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/&/g, " und ")
    .replace(/\b(feat|ft|featuring)\b\.?/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/^(der|die|das|the)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripBrackets(value: string): string {
  return value.replace(/\s*[([].*?[)\]]/g, "").replace(/\s+-\s+.*$/, "").trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const above = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = above;
    }
  }
  return prev[b.length];
}

function tolerance(length: number): number {
  if (length >= 10) return 2;
  if (length >= 5) return 1;
  return 0;
}

function close(input: string, target: string): boolean {
  if (!input || !target) return false;
  return levenshtein(input, target) <= tolerance(target.length);
}

export function artistNames(song: Song): string[] {
  return song.artist
    .split(/,|&|\bfeat\.?\b|\bft\.?\b/i)
    .map((name) => name.trim())
    .filter(Boolean);
}

/** Der Interpret gilt als richtig, wenn irgendein genannter Name getroffen ist. */
export function matchArtist(input: string, song: Song): boolean {
  const guess = normalize(input);
  if (!guess) return false;
  const names = [song.artist, ...artistNames(song)].map(normalize);
  // "K.I.Z" und "KIZ" sollen gleich sein: Punkte wurden schon entfernt.
  return names.some((name) => close(guess, name) || close(guess.replace(/\s/g, ""), name.replace(/\s/g, "")));
}

export function matchTitle(input: string, song: Song): boolean {
  const guess = normalize(stripBrackets(input));
  const target = normalize(stripBrackets(song.title));
  return close(guess, target);
}

export function matchAlbum(input: string, song: Song): boolean {
  const guess = normalize(stripBrackets(input));
  const target = normalize(stripBrackets(song.album));
  return close(guess, target);
}

export function matchYear(input: string, song: Song): boolean {
  const digits = input.replace(/\D/g, "");
  return digits.length === 4 && Number.parseInt(digits, 10) === song.year;
}

export function matchCity(input: string, song: Song): boolean {
  return Boolean(song.city) && close(normalize(input), normalize(song.city ?? ""));
}

export function matchAnswer(category: GuessCategory, input: string, song: Song): boolean {
  switch (category) {
    case "artist":
      return matchArtist(input, song);
    case "title":
      return matchTitle(input, song);
    case "album":
      return matchAlbum(input, song);
    case "year":
      return matchYear(input, song);
    case "city":
      return matchCity(input, song);
    default:
      return false;
  }
}

export function solutionFor(category: GuessCategory, song: Song): string {
  switch (category) {
    case "artist":
      return song.artist;
    case "title":
      return song.title;
    case "album":
      return song.album;
    case "year":
      return String(song.year);
    case "city":
      return song.city ?? "";
    default:
      return "";
  }
}
