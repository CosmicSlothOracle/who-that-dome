"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { answerFor, getCatalog, getPool, getSong, getSongs } from "@/lib/catalog";
import { CATEGORIES, DRAP_POOLS, categoryPoints } from "@/lib/config";
import {
  adjustScore,
  applyArtistMiss,
  awardCategory,
  createGame,
  finishCurrentCard,
  hideCategory,
  openCard,
  revealCategory,
  setFirstVoice,
  setYearExact,
} from "@/lib/game-state";
import { fetchDevices, pauseViaConnect, playTrack } from "@/lib/playback";
import { useDeviceId, useGame } from "@/lib/use-game";
import type { GameState, PlaybackMode, SpotifyDevice } from "@/lib/types";
import { AppShell } from "./AppShell";
import { QrScanner } from "./QrScanner";
import { SpotifyStatus, useAppConfig } from "./SpotifyStatus";

export function GameApp() {
  const searchParams = useSearchParams();
  const config = useAppConfig();
  const [storedGame, setGame] = useGame();
  const [deviceId, setDeviceId] = useDeviceId();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);

  const cardParam = searchParams.get("card");
  const game = useMemo(() => {
    if (!storedGame) return null;
    if (
      cardParam &&
      getSong(cardParam) &&
      !storedGame.currentCardId &&
      !storedGame.usedCardIds.includes(cardParam)
    ) {
      return openCard(storedGame, cardParam);
    }
    return storedGame;
  }, [storedGame, cardParam]);

  const refreshDevices = useCallback(async () => {
    try {
      const list = await fetchDevices();
      setDevices(list);
      if (!deviceId) {
        const active = list.find((item) => item.is_active && item.id);
        const any = list.find((item) => item.id);
        const next = active?.id ?? any?.id ?? "";
        if (next) setDeviceId(next);
      }
    } catch {
      setDevices([]);
    }
  }, [deviceId, setDeviceId]);

  if (!config) {
    return (
      <AppShell>
        <p className="text-[var(--muted)]">Lade Spiel…</p>
      </AppShell>
    );
  }

  if (!game) {
    return (
      <SetupScreen
        onStart={(next) => setGame(next)}
        playbackMode={config.playbackMode}
      />
    );
  }

  const song = game.currentCardId ? getSong(game.currentCardId) : undefined;
  const remaining = getSongs(game.poolIds).filter(
    (item) => !game.usedCardIds.includes(item.id) && item.id !== game.currentCardId,
  ).length;

  async function handlePlay() {
    if (!game?.currentCardId || !config) return;
    if (game !== storedGame) setGame(game);
    setMessage(null);
    if (config.playbackMode === "connect" && devices.length === 0) {
      await refreshDevices();
    }
    const result = await playTrack({
      mode: config.playbackMode,
      cardId: game.currentCardId,
      deviceId,
    });
    if (result.ok) {
      setPlaying(true);
      return;
    }
    setMessage(result.message);
  }

  async function handlePause() {
    await pauseViaConnect();
    setPlaying(false);
  }

  return (
    <AppShell
      actions={
        <button
          className="ghost-btn text-sm"
          type="button"
          onClick={() => {
            setGame(null);
            setPlaying(false);
          }}
        >
          Neu
        </button>
      }
    >
      <SpotifyStatus />

      <section className="panel mt-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
              Runde · {game.usedCardIds.length + (game.currentCardId ? 1 : 0)} · {remaining} übrig
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Moderator-Ansicht</h1>
          </div>
          <div className={`vinyl ${playing ? "spin" : ""}`} aria-hidden />
        </div>

        {config.playbackMode === "connect" && (
          <div className="mt-4 flex flex-col gap-2">
            <label className="text-xs text-[var(--muted)]">Spotify-Gerät</label>
            <div className="flex gap-2">
              <select
                className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 py-2"
                value={deviceId}
                onChange={(event) => setDeviceId(event.target.value)}
              >
                <option value="">Kein Gerät erkannt</option>
                {devices.map((device) =>
                  device.id ? (
                    <option key={device.id} value={device.id}>
                      {device.name} {device.is_active ? "(aktiv)" : ""}
                    </option>
                  ) : null,
                )}
              </select>
              <button className="ghost-btn" type="button" onClick={() => void refreshDevices()}>
                Refresh
              </button>
            </div>
          </div>
        )}

        {!song ? (
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-[var(--muted)]">Scanne die nächste Spielkarte.</p>
            <button className="gold-btn" type="button" onClick={() => setScannerOpen(true)}>
              QR-Code scannen
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-xs text-[var(--muted)]">
              {getPool(song.poolId)?.name} · {song.id}
              {song.explicit ? " · explicit" : ""}
            </p>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-[var(--gold)]">Erste Stimme</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {game.players.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    className={`rounded-full px-3 py-1 text-sm ${
                      game.firstVoicePlayerId === player.id
                        ? "bg-[var(--gold)] text-[#2a1c08]"
                        : "border border-[var(--line)]"
                    }`}
                    onClick={() =>
                      setGame(
                        setFirstVoice(
                          game,
                          game.firstVoicePlayerId === player.id ? null : player.id,
                        ),
                      )
                    }
                  >
                    {player.name}
                  </button>
                ))}
              </div>
              {game.firstVoicePlayerId && (
                <button
                  className="mt-2 text-xs text-[var(--danger)] underline"
                  type="button"
                  onClick={() => setGame(applyArtistMiss(game))}
                >
                  Interpret falsch — 0 Punkte für erste Stimme
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <button className="gold-btn" type="button" onClick={() => void handlePlay()}>
                Song abspielen
              </button>
              {config.playbackMode === "connect" && (
                <button className="ghost-btn" type="button" onClick={() => void handlePause()}>
                  Pause
                </button>
              )}
              <button className="ghost-btn" type="button" onClick={() => setScannerOpen(true)}>
                Andere Karte
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              {CATEGORIES.map((category) => {
                const shown = game.revealed[category.id];
                const stored = answerFor(song, category.id);
                const value =
                  category.id === "verse"
                    ? "Aus dem Gedächtnis — Gruppe entscheidet"
                    : stored ?? "—";
                const winner = game.players.find((player) => player.id === game.awardedTo[category.id]);
                const points = categoryPoints(category.id, category.id === "year" && game.yearExact);
                return (
                  <article key={category.id} className="rounded-2xl border border-[var(--line)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-[var(--gold)]">
                          {category.label} · {points} P
                        </p>
                        <p
                          className={`mt-1 text-xl font-semibold ${
                            shown || category.id === "verse" ? "" : "reveal-hidden"
                          }`}
                        >
                          {value}
                        </p>
                        {shown && category.id === "year" && song.yearNote ? (
                          <p className="mt-1 text-xs text-[var(--muted)]">{song.yearNote}</p>
                        ) : null}
                      </div>
                      {category.id !== "verse" && (
                        <button
                          className="ghost-btn text-sm"
                          type="button"
                          onClick={() =>
                            setGame(shown ? hideCategory(game, category.id) : revealCategory(game, category.id))
                          }
                        >
                          {shown ? "Verdecken" : "Aufdecken"}
                        </button>
                      )}
                    </div>
                    {(shown || category.id === "verse") && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {game.players.map((player) => (
                          <button
                            key={player.id}
                            type="button"
                            onClick={() => setGame(awardCategory(game, category.id, player.id))}
                            className={`rounded-full px-3 py-1 text-sm ${
                              winner?.id === player.id
                                ? "bg-[var(--gold)] text-[#2a1c08]"
                                : "border border-[var(--line)]"
                            }`}
                          >
                            {player.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {category.id === "year" && shown && (
                      <label className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
                        <input
                          type="checkbox"
                          checked={game.yearExact}
                          onChange={(event) => setGame(setYearExact(game, event.target.checked))}
                        />
                        Jahr exakt (+1)
                      </label>
                    )}
                  </article>
                );
              })}
            </div>

            <button
              className="gold-btn mt-5 w-full"
              type="button"
              onClick={() => {
                setGame(finishCurrentCard(game));
                setPlaying(false);
              }}
            >
              Nächste Karte
            </button>
          </div>
        )}

        {message && <p className="mt-4 text-sm text-[var(--danger)]">{message}</p>}
      </section>

      <Scoreboard
        game={game}
        onAdjust={(playerId, delta) => setGame(adjustScore(game, playerId, delta))}
      />

      {scannerOpen && (
        <QrScanner
          onClose={() => setScannerOpen(false)}
          onResult={(cardId) => {
            setGame(openCard(game, cardId));
            setPlaying(false);
            setScannerOpen(false);
          }}
        />
      )}
    </AppShell>
  );
}

function SetupScreen({
  onStart,
  playbackMode,
}: {
  onStart: (game: GameState) => void;
  playbackMode: PlaybackMode;
}) {
  const catalog = useMemo(() => getCatalog(), []);
  const [poolIds, setPoolIds] = useState<string[]>([DRAP_POOLS[0]]);
  const [names, setNames] = useState("Alex, Sam, Kim");

  function togglePool(id: string) {
    setPoolIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <AppShell actions={<Link className="ghost-btn text-sm" href="/">Zurück</Link>}>
      <section className="panel p-5">
        <h1 className="text-2xl font-semibold">Neues Spiel</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Modus: {playbackMode === "connect" ? "Spotify Connect (privat)" : "Deep-Link"}
          {" · "}
          <Link href="/regeln" className="underline">
            Regeln
          </Link>
        </p>
        <SpotifyStatus />

        <h2 className="mt-6 text-sm uppercase tracking-wide text-[var(--gold)]">Musik-Pools</h2>
        <div className="mt-2 grid gap-2">
          {catalog.pools.map((pool) => {
            const count = catalog.songs.filter((song) => song.poolId === pool.id).length;
            const active = poolIds.includes(pool.id);
            return (
              <button
                key={pool.id}
                type="button"
                onClick={() => togglePool(pool.id)}
                className={`rounded-2xl border px-4 py-3 text-left ${
                  active ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-[var(--line)]"
                }`}
              >
                <strong>{pool.name}</strong>
                <span className="ml-2 text-sm text-[var(--muted)]">{count} Karten</span>
                <p className="text-sm text-[var(--muted)]">{pool.description}</p>
              </button>
            );
          })}
        </div>

        <label className="mt-6 block text-sm uppercase tracking-wide text-[var(--gold)]">
          Spieler
        </label>
        <input
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3"
          value={names}
          onChange={(event) => setNames(event.target.value)}
          placeholder="Namen, durch Komma getrennt"
        />

        <button
          className="gold-btn mt-5 w-full"
          type="button"
          onClick={() => {
            const playerNames = names.split(/[,;\n]/).map((name) => name.trim()).filter(Boolean);
            if (poolIds.length === 0 || playerNames.length === 0) return;
            onStart(createGame(poolIds, playerNames));
          }}
        >
          Runde beginnen
        </button>
      </section>
    </AppShell>
  );
}

function Scoreboard({
  game,
  onAdjust,
}: {
  game: GameState;
  onAdjust: (playerId: string, delta: number) => void;
}) {
  const ranked = [...game.players].sort((a, b) => b.score - a.score);
  return (
    <section className="panel mt-4 p-5">
      <h2 className="text-sm uppercase tracking-wide text-[var(--gold)]">Punktestand</h2>
      <ul className="mt-3 grid gap-2">
        {ranked.map((player, index) => (
          <li key={player.id} className="flex items-center justify-between gap-3">
            <span>
              {index + 1}. {player.name}
            </span>
            <span className="flex items-center gap-2">
              <button className="ghost-btn px-3 py-1" type="button" onClick={() => onAdjust(player.id, -1)}>
                −
              </button>
              <strong className="w-6 text-center">{player.score}</strong>
              <button className="ghost-btn px-3 py-1" type="button" onClick={() => onAdjust(player.id, 1)}>
                +
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
