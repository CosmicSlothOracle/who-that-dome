import { describe, expect, it } from "vitest";
import {
  begin,
  categoriesFor,
  createMatch,
  currentSongId,
  nextRound,
  submitAnswer,
  tap,
  winners,
  type Match,
} from "../src/lib/game-engine";
import type { Pool, Song } from "../src/lib/types";

const pool: Pool = { id: "p", name: "P", description: "" };
const songs: Song[] = Array.from({ length: 6 }, (_, i) => ({
  id: `p-00${i + 1}`,
  poolId: "p",
  spotifyTrackId: `t${i}`,
  title: `T${i}`,
  artist: `A${i}`,
  album: `B${i}`,
  year: 2000 + i,
}));
const cats = ["artist", "album", "year"] as const;
const c = [...cats];

function start(rounds = 2): Match {
  return begin(createMatch(pool, songs, ["Alex", "Sam", "Kim"], () => 0.5, rounds));
}

describe("game-engine", () => {
  it("braucht mindestens zwei Spieler und zieht höchstens so viele Songs wie vorhanden", () => {
    expect(() => createMatch(pool, songs, ["Alex"])).toThrow();
    expect(createMatch(pool, songs.slice(0, 4), ["A", "B"]).queue).toHaveLength(4);
  });

  it("erster Tap zählt, ein zweiter wird ignoriert", () => {
    const m = tap(start(), "p1");
    expect(m.phase).toBe("answering");
    expect(tap(m, "p2").activePlayerId).toBe("p1");
  });

  it("falscher Interpret scheidet aus, Song läuft weiter, die anderen dürfen", () => {
    let m = tap(start(), "p1");
    m = submitAnswer(m, false, c);
    expect(m.phase).toBe("listening");
    expect(m.eliminated).toEqual(["p1"]);
    expect(tap(m, "p1").phase).toBe("listening");
    expect(tap(m, "p2").phase).toBe("answering");
  });

  it("alle ausgeschieden: Runde ohne Punkte", () => {
    let m = start();
    for (const id of ["p1", "p2", "p3"]) m = submitAnswer(tap(m, id), false, c);
    expect(m.phase).toBe("roundEnd");
    expect(m.lastOutcome).toMatchObject({ playerId: null, points: 0 });
  });

  it("richtige Kette gibt je 1 Punkt, Fehler in Zusatzkategorie behält Punkte", () => {
    let m = tap(start(), "p2");
    m = submitAnswer(m, true, c);
    expect(m.step).toBe(1);
    m = submitAnswer(m, true, c);
    m = submitAnswer(m, false, c);
    expect(m.phase).toBe("roundEnd");
    expect(m.players.find((p) => p.id === "p2")?.score).toBe(2);
    expect(m.lastOutcome).toMatchObject({ playerId: "p2", points: 2, failedAt: "year" });
  });

  it("volle Punktzahl beendet die Runde", () => {
    let m = tap(start(), "p1");
    for (let i = 0; i < 3; i += 1) m = submitAnswer(m, true, c);
    expect(m.phase).toBe("roundEnd");
    expect(m.players[0].score).toBe(3);
  });

  it("zählt Runden und endet nach der letzten mit Sieger", () => {
    let m = tap(start(2), "p1");
    m = nextRound(submitAnswer(submitAnswer(submitAnswer(m, true, c), true, c), true, c));
    expect(m.round).toBe(1);
    expect(m.eliminated).toEqual([]);
    m = tap(m, "p1");
    m = nextRound(submitAnswer(submitAnswer(submitAnswer(m, true, c), true, c), true, c));
    expect(m.phase).toBe("finished");
    expect(winners(m).map((p) => p.id)).toEqual(["p1"]);
  });

  it("Gleichstand löst Sudden Death mit Reserve-Song aus, erster richtiger Interpret gewinnt", () => {
    let m = start(1);
    const before = currentSongId(m);
    m = nextRound(submitAnswer(submitAnswer(submitAnswer(tap(m, "p1"), true, c), true, c), false, c));
    // p1 hat 2 Punkte; p2 gleich ziehen geht in einer Runde nicht → manuell Gleichstand herstellen
    m = { ...m, players: m.players.map((p) => (p.id === "p2" ? { ...p, score: 2 } : p)) };
    m = { ...m, phase: "roundEnd" };
    m = nextRound(m);
    expect(currentSongId(m)).not.toBe(before);
    expect(m.contenders).toEqual(["p1", "p2"]);
    expect(tap(m, "p3").phase).toBe("listening");
    m = nextRound(submitAnswer(tap(m, "p2"), true, c));
    expect(m.phase).toBe("finished");
    expect(winners(m).map((p) => p.id)).toEqual(["p2"]);
  });

  it("categoriesFor lässt leere Kategorien aus", () => {
    expect(categoriesFor(songs[0], pool)).toEqual(["artist", "album", "year"]);
    expect(categoriesFor(songs[0], { ...pool, extraCategories: ["city", "year"] })).toEqual(["artist", "year"]);
  });
});
