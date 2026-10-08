import { shuffle } from "./catalog";
import { solutionFor } from "./answer-match";
import type { GuessCategory, Player, Pool, Song } from "./types";

export const ROUNDS = 10;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
const RESERVE = 3;

export type Phase = "ready" | "listening" | "answering" | "roundEnd" | "finished";

export type RoundOutcome = {
  songId: string;
  /** Spieler, der den Interpreten richtig hatte, sonst null. */
  playerId: string | null;
  points: number;
  /** Kategorie, an der die Runde endete (falsch) oder null bei voller Punktzahl / niemand. */
  failedAt: GuessCategory | null;
};

export type Match = {
  version: 3;
  poolId: string;
  players: Player[];
  queue: string[];
  reserve: string[];
  round: number;
  phase: Phase;
  eliminated: string[];
  activePlayerId: string | null;
  step: number;
  /** Nur diese Spieler spielen mit (Sudden Death), sonst null. */
  contenders: string[] | null;
  lastOutcome: RoundOutcome | null;
  lastWrong: { playerId: string; category: GuessCategory } | null;
  createdAt: string;
};

export function isMatch(value: unknown): value is Match {
  if (!value || typeof value !== "object") return false;
  const match = value as Match;
  return match.version === 3 && Array.isArray(match.players) && Array.isArray(match.queue);
}

export function categoriesFor(song: Song, pool?: Pool): GuessCategory[] {
  const extra = pool?.extraCategories ?? ["album", "year"];
  const usable = extra.filter((category) => solutionFor(category, song).trim() !== "");
  return ["artist", ...usable];
}

export function createMatch(
  pool: Pool,
  songs: Song[],
  names: string[],
  random: () => number = Math.random,
  rounds: number = ROUNDS,
): Match {
  const cleaned = names.map((name) => name.trim()).filter(Boolean).slice(0, MAX_PLAYERS);
  if (cleaned.length < MIN_PLAYERS) throw new Error("Mindestens zwei Spieler nötig.");
  const drawn = shuffle(songs.map((song) => song.id), random);
  const count = Math.min(rounds, drawn.length);
  return {
    version: 3,
    poolId: pool.id,
    players: cleaned.map((name, index) => ({ id: `p${index + 1}`, name, score: 0 })),
    queue: drawn.slice(0, count),
    reserve: drawn.slice(count, count + RESERVE),
    round: 0,
    phase: "ready",
    eliminated: [],
    activePlayerId: null,
    step: 0,
    contenders: null,
    lastOutcome: null,
    lastWrong: null,
    createdAt: new Date().toISOString(),
  };
}

export function currentSongId(match: Match): string | null {
  return match.queue[match.round] ?? null;
}

export function inPlay(match: Match, playerId: string): boolean {
  if (match.eliminated.includes(playerId)) return false;
  return !match.contenders || match.contenders.includes(playerId);
}

/** ready → listening. */
export function begin(match: Match): Match {
  if (match.phase !== "ready") return match;
  return { ...match, phase: "listening", lastWrong: null };
}

/** Erster Tap zählt: nur in "listening" und nur für Spieler, die noch dürfen. */
export function tap(match: Match, playerId: string): Match {
  if (match.phase !== "listening" || !inPlay(match, playerId)) return match;
  return { ...match, phase: "answering", activePlayerId: playerId, step: 0, lastWrong: null };
}

function award(match: Match, playerId: string): Player[] {
  return match.players.map((player) =>
    player.id === playerId ? { ...player, score: player.score + 1 } : player,
  );
}

function endRound(match: Match, outcome: RoundOutcome): Match {
  return { ...match, phase: "roundEnd", activePlayerId: null, lastOutcome: outcome };
}

/**
 * Wertet die Antwort des aktiven Spielers.
 * `categories` kommt aus categoriesFor(); Schritt 0 ist immer der Interpret.
 */
export function submitAnswer(match: Match, correct: boolean, categories: GuessCategory[]): Match {
  if (match.phase !== "answering" || !match.activePlayerId) return match;
  const playerId = match.activePlayerId;
  const songId = currentSongId(match) ?? "";
  const category = categories[match.step];

  if (match.step === 0) {
    if (correct) {
      const players = award(match, playerId);
      if (match.contenders || categories.length === 1) {
        return endRound({ ...match, players }, { songId, playerId, points: 1, failedAt: null });
      }
      return { ...match, players, step: 1 };
    }
    const eliminated = [...match.eliminated, playerId];
    const lastWrong = { playerId, category: "artist" as const };
    const anyLeft = match.players.some(
      (player) =>
        !eliminated.includes(player.id) && (!match.contenders || match.contenders.includes(player.id)),
    );
    const next = { ...match, eliminated, activePlayerId: null, step: 0, lastWrong };
    if (!anyLeft) return endRound(next, { songId, playerId: null, points: 0, failedAt: null });
    return { ...next, phase: "listening" };
  }

  if (correct) {
    const players = award(match, playerId);
    const points = match.step + 1;
    if (match.step + 1 >= categories.length) {
      return endRound({ ...match, players }, { songId, playerId, points, failedAt: null });
    }
    return { ...match, players, step: match.step + 1 };
  }
  return endRound(
    { ...match, lastWrong: { playerId, category } },
    { songId, playerId, points: match.step, failedAt: category },
  );
}

export function leaders(match: Match): Player[] {
  const top = Math.max(...match.players.map((player) => player.score));
  return match.players.filter((player) => player.score === top);
}

/** roundEnd → nächste Runde, Sudden Death oder Ende. */
export function nextRound(match: Match): Match {
  if (match.phase !== "roundEnd") return match;

  const base = { ...match, eliminated: [], activePlayerId: null, step: 0, lastWrong: null };

  if (match.contenders) {
    // Sudden-Death-Song entschieden?
    if (match.lastOutcome?.playerId) return { ...base, phase: "finished" };
    if (match.reserve.length > 0) return startSuddenDeath(base, match.contenders);
    return { ...base, phase: "finished" };
  }

  if (match.round + 1 < match.queue.length) {
    return { ...base, round: match.round + 1, phase: "listening" };
  }

  const top = leaders(match);
  if (top.length > 1 && match.reserve.length > 0) {
    return startSuddenDeath(base, top.map((player) => player.id));
  }
  return { ...base, phase: "finished" };
}

function startSuddenDeath(match: Match, contenders: string[]): Match {
  const [next, ...reserve] = match.reserve;
  return {
    ...match,
    queue: [...match.queue, next],
    reserve,
    round: match.queue.length,
    phase: "listening",
    contenders,
  };
}

export function winners(match: Match): Player[] {
  if (match.phase !== "finished") return [];
  if (match.contenders && match.lastOutcome?.playerId) {
    return match.players.filter((player) => player.id === match.lastOutcome?.playerId);
  }
  return leaders(match);
}

export function ranking(match: Match): Player[] {
  return [...match.players].sort((a, b) => b.score - a.score);
}
