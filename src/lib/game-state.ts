import { GAME_STORAGE_KEY, categoryPoints } from "./config";
import type { GameState, GuessCategory, Player } from "./types";

const emptyReveal = (): GameState["revealed"] => ({
  artist: false,
  title: false,
  verse: false,
  album: false,
  year: false,
  city: false,
});

function uid(): string {
  return crypto.randomUUID();
}

export function createGame(poolIds: string[], names: string[]): GameState {
  const players: Player[] = names
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ id: uid(), name, score: 0 }));

  return {
    version: 2,
    players,
    poolIds,
    currentCardId: null,
    usedCardIds: [],
    revealed: emptyReveal(),
    awardedTo: {},
    firstVoicePlayerId: null,
    yearExact: false,
    createdAt: new Date().toISOString(),
  };
}

export function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const state = value as GameState;
  return state.version === 2 && Array.isArray(state.players) && Array.isArray(state.poolIds);
}

export const GAME_EVENT = "wtd-game";

export function notifyGame(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(GAME_EVENT));
}

let cachedRaw: string | null = null;
let cachedGame: GameState | null = null;

export function loadGame(): GameState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(GAME_STORAGE_KEY);
  if (raw === cachedRaw) return cachedGame;

  cachedRaw = raw;
  try {
    if (!raw) {
      cachedGame = null;
    } else {
      const parsed = JSON.parse(raw) as unknown;
      cachedGame = isGameState(parsed) ? parsed : null;
    }
  } catch {
    cachedGame = null;
  }
  return cachedGame;
}

export function saveGame(state: GameState): void {
  window.localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(state));
  notifyGame();
}

export function clearGame(): void {
  window.localStorage.removeItem(GAME_STORAGE_KEY);
  notifyGame();
}

export function openCard(state: GameState, cardId: string): GameState {
  return {
    ...state,
    currentCardId: cardId,
    revealed: emptyReveal(),
    awardedTo: {},
    firstVoicePlayerId: null,
    yearExact: false,
  };
}

export function finishCurrentCard(state: GameState): GameState {
  if (!state.currentCardId) return state;
  const used = state.usedCardIds.includes(state.currentCardId)
    ? state.usedCardIds
    : [...state.usedCardIds, state.currentCardId];
  return {
    ...state,
    currentCardId: null,
    usedCardIds: used,
    revealed: emptyReveal(),
    awardedTo: {},
    firstVoicePlayerId: null,
    yearExact: false,
  };
}

export function setFirstVoice(state: GameState, playerId: string | null): GameState {
  return { ...state, firstVoicePlayerId: playerId };
}

export function setYearExact(state: GameState, yearExact: boolean): GameState {
  const current = state.awardedTo.year;
  if (!current || state.yearExact === yearExact) {
    return { ...state, yearExact };
  }

  const delta = yearExact ? 1 : -1;
  return {
    ...state,
    yearExact,
    players: state.players.map((player) =>
      player.id === current ? { ...player, score: Math.max(0, player.score + delta) } : player,
    ),
  };
}

export function revealCategory(state: GameState, category: GuessCategory): GameState {
  return {
    ...state,
    revealed: { ...state.revealed, [category]: true },
  };
}

function pointsOnCard(state: GameState, category: GuessCategory): number {
  return categoryPoints(category, category === "year" && state.yearExact);
}

export function hideCategory(state: GameState, category: GuessCategory): GameState {
  const awardedTo = { ...state.awardedTo };
  const previous = awardedTo[category];
  delete awardedTo[category];
  const points = pointsOnCard(state, category);

  return {
    ...state,
    revealed: { ...state.revealed, [category]: false },
    awardedTo,
    yearExact: category === "year" ? false : state.yearExact,
    players: previous
      ? state.players.map((player) =>
          player.id === previous ? { ...player, score: Math.max(0, player.score - points) } : player,
        )
      : state.players,
  };
}

export function awardCategory(
  state: GameState,
  category: GuessCategory,
  playerId: string,
): GameState {
  const previous = state.awardedTo[category];
  const points = pointsOnCard(state, category);

  if (previous === playerId) {
    const awardedTo = { ...state.awardedTo };
    delete awardedTo[category];
    return {
      ...state,
      awardedTo,
      yearExact: category === "year" ? false : state.yearExact,
      players: state.players.map((player) =>
        player.id === playerId ? { ...player, score: Math.max(0, player.score - points) } : player,
      ),
    };
  }

  return {
    ...state,
    awardedTo: { ...state.awardedTo, [category]: playerId },
    players: state.players.map((player) => {
      if (player.id === playerId) return { ...player, score: player.score + points };
      if (player.id === previous) return { ...player, score: Math.max(0, player.score - points) };
      return player;
    }),
  };
}

/** Interpret falsch: erste Stimme verliert alle Punkte dieser Karte. */
export function applyArtistMiss(state: GameState): GameState {
  const first = state.firstVoicePlayerId;
  if (!first) return state;

  let next: GameState = { ...state, awardedTo: { ...state.awardedTo } };
  for (const category of Object.keys(next.awardedTo) as GuessCategory[]) {
    if (next.awardedTo[category] === first) {
      next = awardCategory(next, category, first);
    }
  }
  return next;
}

export function adjustScore(state: GameState, playerId: string, delta: number): GameState {
  return {
    ...state,
    players: state.players.map((player) =>
      player.id === playerId
        ? { ...player, score: Math.max(0, player.score + delta) }
        : player,
    ),
  };
}
