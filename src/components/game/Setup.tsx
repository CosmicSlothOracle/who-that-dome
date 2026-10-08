"use client";

import Link from "next/link";
import { useState } from "react";
import { getSongs } from "@/lib/catalog";
import { MAX_PLAYERS, MIN_PLAYERS, ROUNDS } from "@/lib/game-engine";
import { themeFor } from "@/lib/themes";
import type { PlaybackMode, Pool } from "@/lib/types";
import { Device } from "./Devices";
import { DevicePanel } from "./DevicePanel";
import { ThemeScope } from "./ThemeScope";
import { useSpotifyMe } from "../SpotifyStatus";

export function Setup({
  pool,
  playbackMode,
  onStart,
}: {
  pool: Pool;
  playbackMode: PlaybackMode;
  onStart: (names: string[]) => void;
}) {
  const theme = themeFor(pool);
  const me = useSpotifyMe();
  const [count, setCount] = useState(3);
  const [names, setNames] = useState<string[]>(["", "", "", "", "", ""]);
  const rounds = Math.min(ROUNDS, getSongs([pool.id]).length);
  const connected = playbackMode === "deeplink" || Boolean(me?.connected);
  const nextUrl = `/play?pool=${encodeURIComponent(pool.id)}`;

  return (
    <ThemeScope theme={theme}>
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-5">
        <Link href="/" className="text-sm underline">← Playlists</Link>
        <div className="mt-3 flex items-center gap-4">
          <Device theme={theme.id} playing={false} size={110} />
          <div>
            <h1 className="text-3xl font-bold leading-tight">{pool.name}</h1>
            <p className="text-xs" style={{ color: "var(--t-muted)" }}>
              {[pool.era, pool.genre].filter(Boolean).join(" · ")} · {rounds} Songs
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-xs tracking-[0.25em]" style={{ color: "var(--t-muted)" }}>Spieler</h2>
        <div className="mt-2 flex items-center gap-3">
          <button className="tbtn-ghost !px-5 text-2xl" type="button" onClick={() => setCount((c) => Math.max(MIN_PLAYERS, c - 1))} aria-label="Weniger Spieler">−</button>
          <strong className="w-10 text-center text-4xl">{count}</strong>
          <button className="tbtn-ghost !px-5 text-2xl" type="button" onClick={() => setCount((c) => Math.min(MAX_PLAYERS, c + 1))} aria-label="Mehr Spieler">+</button>
        </div>

        <ul className="mt-4 space-y-2">
          {Array.from({ length: count }, (_, index) => (
            <li key={index}>
              <input
                className="w-full rounded-xl border-2 border-current bg-transparent px-4 py-3 text-lg outline-none"
                placeholder={`Name Spieler ${index + 1}`}
                maxLength={14}
                value={names[index]}
                onChange={(event) =>
                  setNames((current) => current.map((value, i) => (i === index ? event.target.value : value)))
                }
              />
            </li>
          ))}
        </ul>

        {playbackMode === "connect" && (
          <div className="mt-5 space-y-3">
            {!connected ? (
              <div className="tcard p-4 normal-case">
                {me?.reason === "spotify_rejected" ? (
                  <p className="mb-3 text-sm">
                    Spotify lehnt diesen Account ab (Status {me.spotifyStatus}). Der Account muss im Spotify-Dashboard
                    unter „User Management“ eingetragen sein.
                  </p>
                ) : (
                  <p className="mb-3 text-sm">Zum Abspielen mit Spotify Premium verbinden.</p>
                )}
                <a className="tbtn block text-center" href={`/api/auth/login?next=${encodeURIComponent(nextUrl)}`}>
                  Mit Spotify verbinden
                </a>
              </div>
            ) : (
              <DevicePanel />
            )}
          </div>
        )}

        <button
          className="tbtn mt-6"
          type="button"
          disabled={!connected}
          onClick={() =>
            onStart(names.slice(0, count).map((name, index) => name.trim() || String.fromCharCode(65 + index)))
          }
        >
          Spiel starten
        </button>
      </main>
    </ThemeScope>
  );
}
