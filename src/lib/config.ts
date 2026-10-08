import type { GuessCategory, PlaybackMode } from "./types";

export const CATEGORY_POINTS: Record<GuessCategory, number> = {
  artist: 3,
  title: 2,
  verse: 2,
  album: 1,
  year: 1,
  city: 1,
};

export const CATEGORIES: { id: GuessCategory; label: string; hint?: string }[] = [
  { id: "artist", label: "Interpret", hint: "Pflicht · 3 Punkte. Falsch = 0 für die erste Stimme." },
  { id: "title", label: "Songtitel", hint: "2 Punkte" },
  { id: "verse", label: "Vers", hint: "2 Punkte · aus dem Gedächtnis, nicht auf der Karte" },
  { id: "album", label: "Album", hint: "1 Punkt" },
  { id: "year", label: "Erscheinungsjahr", hint: "1 Punkt, +1 wenn exakt" },
  { id: "city", label: "Stadt / Homebase", hint: "1 Punkt" },
];

export function categoryPoints(category: GuessCategory, yearExact = false): number {
  const base = CATEGORY_POINTS[category];
  if (category === "year" && yearExact) return base + 1;
  return base;
}

export function getPlaybackMode(): PlaybackMode {
  return process.env.NEXT_PUBLIC_PLAYBACK_MODE === "deeplink"
    ? "deeplink"
    : "connect";
}

export function getAppUrl(origin?: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (origin) return origin.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function getSpotifyClientId(): string | undefined {
  return process.env.SPOTIFY_CLIENT_ID;
}

export function getSpotifyClientSecret(): string | undefined {
  return process.env.SPOTIFY_CLIENT_SECRET;
}

export function isSpotifyConfigured(): boolean {
  return Boolean(getSpotifyClientId());
}

export const COOKIE = {
  access: "wtd_access_token",
  refresh: "wtd_refresh_token",
  verifier: "wtd_pkce_verifier",
  state: "wtd_oauth_state",
  next: "wtd_oauth_next",
  redirect: "wtd_oauth_redirect",
} as const;

export const GAME_STORAGE_KEY = "wtd-game-v2";
export const DEVICE_STORAGE_KEY = "wtd-device-id";

export const DRAP_EDITION = "drap";
export const DRAP_POOLS = ["drap-90", "drap-00", "drap-10"] as const;
