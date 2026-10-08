import { getSong, spotifyUri, spotifyWebUrl } from "./catalog";
import type { PlaybackMode, PlaybackResult, SpotifyDevice } from "./types";

export function openDeeplink(trackId: string): PlaybackResult {
  if (typeof window === "undefined") {
    return { ok: false, code: "ssr", message: "Playback nur im Browser." };
  }

  const native = spotifyUri(trackId);
  const web = spotifyWebUrl(trackId);
  const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (mobile) {
    const started = Date.now();
    window.location.href = native;
    window.setTimeout(() => {
      if (document.hidden) return;
      if (Date.now() - started < 1500) window.location.href = web;
    }, 700);
  } else {
    window.open(web, "_blank", "noopener,noreferrer");
  }

  return { ok: true, mode: "deeplink" };
}

export async function fetchDevices(): Promise<SpotifyDevice[]> {
  const response = await fetch("/api/playback/devices");
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Geräte konnten nicht geladen werden.");
  }
  const body = (await response.json()) as { devices: SpotifyDevice[] };
  return body.devices;
}

export async function playViaConnect(
  trackId: string,
  deviceId?: string | null,
): Promise<PlaybackResult> {
  const response = await fetch("/api/playback/play", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trackId, deviceId: deviceId || undefined }),
  });

  if (response.ok) return { ok: true, mode: "connect" };

  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  };

  return {
    ok: false,
    code: body.error ?? "play_failed",
    message: body.message ?? "Wiedergabe fehlgeschlagen.",
  };
}

export async function pauseViaConnect(): Promise<void> {
  await fetch("/api/playback/pause", { method: "POST" });
}

export async function playTrack(options: {
  mode: PlaybackMode;
  cardId: string;
  deviceId?: string | null;
}): Promise<PlaybackResult> {
  const song = getSong(options.cardId);
  if (!song) {
    return { ok: false, code: "unknown_card", message: "Karte nicht gefunden." };
  }

  if (options.mode === "deeplink") {
    return openDeeplink(song.spotifyTrackId);
  }

  return playViaConnect(song.spotifyTrackId, options.deviceId);
}
