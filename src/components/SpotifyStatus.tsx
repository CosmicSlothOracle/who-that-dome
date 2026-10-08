"use client";

import { useEffect, useState } from "react";
import type { PlaybackMode } from "@/lib/types";

type Me = {
  connected: boolean;
  displayName?: string;
  premium?: boolean;
  reason?: string;
  spotifyStatus?: number;
};

export function useAppConfig() {
  const [config, setConfig] = useState<{
    playbackMode: PlaybackMode;
    spotifyConfigured: boolean;
  } | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then(setConfig)
      .catch(() => setConfig({ playbackMode: "connect", spotifyConfigured: false }));
  }, []);

  return config;
}

export function useSpotifyMe() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then(setMe)
      .catch(() => setMe({ connected: false }));
  }, []);

  return me;
}

export function SpotifyStatus({ compact = false }: { compact?: boolean }) {
  const config = useAppConfig();
  const me = useSpotifyMe();

  if (!config) return null;

  if (config.playbackMode === "deeplink") {
    return (
      <p className="text-xs text-[var(--muted)]">
        Deep-Link-Modus · Spotify öffnet sich zum Abspielen
      </p>
    );
  }

  if (!config.spotifyConfigured) {
    return (
      <p className="text-xs text-[var(--danger)]">
        Spotify ist noch nicht konfiguriert. Siehe README.
      </p>
    );
  }

  if (!me) return <p className="text-xs text-[var(--muted)]">Prüfe Spotify…</p>;

  if (!me.connected) {
    return (
      <a className="gold-btn inline-flex text-sm" href="/api/auth/login?next=/play">
        Mit Spotify verbinden
      </a>
    );
  }

  return (
    <div className={compact ? "text-xs text-[var(--muted)]" : "flex items-center gap-3"}>
      <span className="text-sm">
        {me.displayName}
        {me.premium === false ? " · kein Premium" : " · Premium"}
      </span>
      {!compact && (
        <a className="ghost-btn text-xs" href="/api/auth/logout">
          Trennen
        </a>
      )}
    </div>
  );
}
