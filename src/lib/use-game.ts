"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEVICE_STORAGE_KEY } from "./config";
import {
  clearGame,
  GAME_EVENT,
  loadGame,
  saveGame,
} from "./game-state";
import type { GameState } from "./types";

function subscribeGame(onChange: () => void) {
  window.addEventListener(GAME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(GAME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useGame(): [
  GameState | null,
  (update: GameState | null | ((prev: GameState | null) => GameState | null)) => void,
] {
  const game = useSyncExternalStore(subscribeGame, loadGame, () => null);

  const setGame = useCallback(
    (update: GameState | null | ((prev: GameState | null) => GameState | null)) => {
      const prev = loadGame();
      const next = typeof update === "function" ? update(prev) : update;
      if (next) saveGame(next);
      else clearGame();
    },
    [],
  );

  return [game, setGame];
}

function readDeviceId() {
  return window.localStorage.getItem(DEVICE_STORAGE_KEY) ?? "";
}

export function useDeviceId(): [string, (id: string) => void] {
  const deviceId = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange);
      window.addEventListener("wtd-device", onChange);
      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener("wtd-device", onChange);
      };
    },
    readDeviceId,
    () => "",
  );

  const setDeviceId = useCallback((id: string) => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, id);
    window.dispatchEvent(new Event("wtd-device"));
  }, []);

  return [deviceId, setDeviceId];
}

export function useBrowserOrigin(): string {
  return useSyncExternalStore(
    () => () => undefined,
    () => window.location.origin,
    () => "",
  );
}
