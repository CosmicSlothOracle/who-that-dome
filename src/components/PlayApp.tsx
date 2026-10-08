"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getPool, getSongs } from "@/lib/catalog";
import { enterImmersive, leaveImmersive } from "@/lib/device-features";
import {
  begin,
  createMatch,
  currentSongId,
  nextRound,
  submitAnswer,
  categoriesFor,
  tap,
} from "@/lib/game-engine";
import { pauseViaConnect, playTrack } from "@/lib/playback";
import { THEMES } from "@/lib/themes";
import { useDeviceId } from "@/lib/use-game";
import { useMatch } from "@/lib/use-match";
import { getSong } from "@/lib/catalog";
import { MatchScreen } from "./game/MatchScreen";
import { Setup } from "./game/Setup";
import { ThemeScope } from "./game/ThemeScope";
import { useAppConfig } from "./SpotifyStatus";

export function PlayApp() {
  const router = useRouter();
  const poolParam = useSearchParams().get("pool");
  const config = useAppConfig();
  const [match, setMatch] = useMatch();
  const [deviceId] = useDeviceId();
  const [error, setError] = useState<string | null>(null);

  if (!config) {
    return (
      <ThemeScope theme={THEMES["turntable-orange"]}>
        <p className="p-6">Lade…</p>
      </ThemeScope>
    );
  }

  const showSetup = !match || (poolParam !== null && match.poolId !== poolParam);

  if (showSetup) {
    const pool = poolParam ? getPool(poolParam) : undefined;
    if (!pool) {
      return (
        <ThemeScope theme={THEMES["turntable-orange"]}>
          <main className="p-6">
            <p>Keine Playlist gewählt.</p>
            <Link href="/" className="tbtn mt-4 inline-block">Zu den Playlists</Link>
          </main>
        </ThemeScope>
      );
    }
    return (
      <Setup
        pool={pool}
        playbackMode={config.playbackMode}
        onStart={(names) => {
          setError(null);
          setMatch(createMatch(pool, getSongs([pool.id]), names));
        }}
      />
    );
  }

  const active = match;

  async function play(songId: string | null) {
    if (!songId || !config) return;
    const result = await playTrack({ mode: config.playbackMode, cardId: songId, deviceId });
    setError(result.ok ? null : result.message);
  }

  return (
    <MatchScreen
      match={active}
      error={error}
      handlers={{
        onBegin: () => {
          void enterImmersive();
          const next = begin(active);
          setMatch(next);
          void play(currentSongId(next));
        },
        onTap: (playerId) => {
          // Aktuellen Stand lesen, damit ein zweiter Tap im selben Frame ignoriert wird.
          setMatch((prev) => (prev ? tap(prev, playerId) : prev));
        },
        onAnswer: (correct) => {
          setMatch((prev) => {
            if (!prev) return prev;
            const song = getSong(currentSongId(prev) ?? "");
            if (!song) return prev;
            return submitAnswer(prev, correct, categoriesFor(song, getPool(prev.poolId)));
          });
        },
        onNext: () => {
          const next = nextRound(active);
          setMatch(next);
          if (next.phase === "finished") {
            void pauseViaConnect();
            void leaveImmersive();
          } else {
            void play(currentSongId(next));
          }
        },
        onRematch: () => {
          const pool = getPool(active.poolId);
          if (!pool) return;
          setMatch(createMatch(pool, getSongs([pool.id]), active.players.map((player) => player.name)));
        },
        onExit: () => {
          setMatch(null);
          router.push("/");
        },
      }}
    />
  );
}
