import { describe, expect, it } from "vitest";
import { matchAlbum, matchArtist, matchTitle, matchYear } from "../src/lib/answer-match";
import type { Song } from "../src/lib/types";

const song = (over: Partial<Song> = {}): Song => ({
  id: "t-001",
  poolId: "t",
  spotifyTrackId: "x",
  title: "Pauch It",
  artist: "K.I.Z, Massimo",
  album: "Hahnenkampf (+ Excl. K.I.Z. Kolumnen)",
  year: 2007,
  ...over,
});

describe("answer-match", () => {
  it("nimmt jeden genannten Interpreten, ignoriert Punkte und Groß-/Kleinschreibung", () => {
    expect(matchArtist("kiz", song())).toBe(true);
    expect(matchArtist("K.I.Z", song())).toBe(true);
    expect(matchArtist("massimo", song())).toBe(true);
    expect(matchArtist("Sido", song())).toBe(false);
    expect(matchArtist("", song())).toBe(false);
  });

  it("toleriert einen Tippfehler bei längeren Namen", () => {
    expect(matchArtist("Masimo", song())).toBe(true);
    expect(matchArtist("Sidoo", song({ artist: "Sido" }))).toBe(false);
  });

  it("ignoriert Klammerzusätze beim Album und Titel", () => {
    expect(matchAlbum("Hahnenkampf", song())).toBe(true);
    expect(matchAlbum("hahnenkampf deluxe", song({ album: "Hahnenkampf" }))).toBe(false);
    expect(matchTitle("pauch it", song())).toBe(true);
    expect(matchTitle("Der Schöne und das Biest", song({ title: "Der Schöne und das Biest" }))).toBe(true);
    expect(matchTitle("der schone und das biest", song({ title: "Der Schöne und das Biest" }))).toBe(true);
  });

  it("verlangt das Jahr exakt", () => {
    expect(matchYear("2007", song())).toBe(true);
    expect(matchYear("2008", song())).toBe(false);
    expect(matchYear("07", song())).toBe(false);
  });
});
