"use client";

import { useCallback, useSyncExternalStore } from "react";
import { isMatch, type Match } from "./game-engine";

const KEY = "wtd-match-v3";
const EVENT = "wtd-match";

let cachedRaw: string | null = null;
let cachedMatch: Match | null = null;

function load(): Match | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cachedMatch;
  }
  if (raw === cachedRaw) return cachedMatch;
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    cachedMatch = isMatch(parsed) ? parsed : null;
  } catch {
    cachedMatch = null;
  }
  return cachedMatch;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useMatch(): [Match | null, (next: Match | null | ((prev: Match | null) => Match | null)) => void] {
  const match = useSyncExternalStore(subscribe, load, () => null);
  const set = useCallback((update: Match | null | ((prev: Match | null) => Match | null)) => {
    const next = typeof update === "function" ? update(load()) : update;
    try {
      if (next) window.localStorage.setItem(KEY, JSON.stringify(next));
      else window.localStorage.removeItem(KEY);
    } catch {
      cachedRaw = null;
      cachedMatch = next;
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [match, set];
}
