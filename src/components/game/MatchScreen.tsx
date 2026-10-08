"use client";

import { useEffect, useRef, useState } from "react";
import { matchAnswer, solutionFor } from "@/lib/answer-match";
import { getPool, getSong } from "@/lib/catalog";
import {
  categoriesFor,
  currentSongId,
  inPlay,
  ranking,
  winners,
  type Match,
} from "@/lib/game-engine";
import { seatLayout } from "@/lib/seats";
import { themeFor } from "@/lib/themes";
import type { GuessCategory } from "@/lib/types";
import { Device } from "./Devices";
import { ThemeScope } from "./ThemeScope";

const LABEL: Record<GuessCategory, string> = {
  artist: "Interpret",
  title: "Songtitel",
  verse: "Vers",
  album: "Album",
  year: "Erscheinungsjahr",
  city: "Stadt",
};

function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // nicht unterstützt
  }
}

export type MatchHandlers = {
  onBegin: () => void;
  onTap: (playerId: string) => void;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
  onRematch: () => void;
  onExit: () => void;
};

export function MatchScreen({ match, handlers, error }: { match: Match; handlers: MatchHandlers; error: string | null }) {
  const pool = getPool(match.poolId);
  const theme = themeFor(pool);
  const songId = currentSongId(match);
  const song = songId ? getSong(songId) : undefined;
  const categories = song ? categoriesFor(song, pool) : ["artist" as GuessCategory];
  const { seats, inset } = seatLayout(match.players.length);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const flashTimer = useRef<number | null>(null);
  const playing = match.phase === "listening" || match.phase === "answering";

  useEffect(() => () => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
  }, []);

  function answer(text: string | null) {
    if (!song) return;
    const category = categories[match.step];
    const correct = text !== null && matchAnswer(category, text, song);
    buzz(correct ? [40, 40, 40] : 220);
    setFlash(correct ? "ok" : "bad");
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 900);
    handlers.onAnswer(correct);
  }

  if (match.phase === "finished") {
    return (
      <ThemeScope theme={theme}>
        <Finish match={match} handlers={handlers} themeId={theme.id} />
      </ThemeScope>
    );
  }

  const roundLabel = match.contenders ? "Sudden Death" : `Song ${match.round + 1} / ${match.queue.length}`;

  return (
    <ThemeScope theme={theme} className="!h-dvh !min-h-0">
      {/* Mitte */}
      <div
        className="absolute flex flex-col items-center justify-center gap-3 text-center"
        style={{
          left: `${inset.left}%`,
          right: `${inset.right}%`,
          top: `${inset.top}%`,
          bottom: `${inset.bottom}%`,
        }}
      >
        <p className="text-xs tracking-[0.3em]" style={{ color: "var(--t-muted)" }}>
          {pool?.name} · {roundLabel}
        </p>
        <div className="grid w-full place-items-center overflow-hidden">
          <Device theme={theme.id} playing={playing} size={Math.min(300, 260)} />
        </div>
        {match.phase === "ready" && (
          <button className="tbtn t-pulse !rounded-full px-10 text-xl" type="button" onClick={handlers.onBegin}>
            ▶ Play
          </button>
        )}
        {match.phase === "listening" && (
          <p className="px-2 text-sm font-bold">
            {match.lastWrong
              ? `${match.players.find((p) => p.id === match.lastWrong?.playerId)?.name} ist raus – wer weiß es?`
              : "Wer kennt den Interpreten? Tipp auf dein Feld!"}
          </p>
        )}
        {error && <p className="px-2 text-xs normal-case" style={{ color: "var(--t-bad)" }}>{error}</p>}
      </div>

      {/* Tap-Pads */}
      {match.players.map((player, index) => {
        const seat = seats[index];
        const out = !inPlay(match, player.id);
        const active = match.activePlayerId === player.id;
        const canTap = match.phase === "listening" && !out;
        const side = Math.abs(seat.rotate) === 90;
        return (
          <button
            key={player.id}
            type="button"
            className="tpad"
            data-state={active ? "active" : out ? "eliminated" : "idle"}
            disabled={!canTap}
            onPointerDown={() => {
              if (!canTap) return;
              buzz(30);
              handlers.onTap(player.id);
            }}
            style={{
              left: `calc(${seat.left}% + 5px)`,
              top: `calc(${seat.top}% + 5px)`,
              width: `calc(${seat.width}% - 10px)`,
              height: `calc(${seat.height}% - 10px)`,
            }}
          >
            <span
              className={`absolute left-1/2 top-1/2 flex items-center whitespace-nowrap ${
                side ? "flex-row gap-3" : "flex-col"
              }`}
              style={{ transform: `translate(-50%, -50%) rotate(${seat.rotate}deg)` }}
            >
              <strong className="text-lg leading-none sm:text-2xl">{player.name}</strong>
              <span className={`${side ? "" : "mt-1"} text-3xl font-bold leading-none sm:text-5xl`}>{player.score}</span>
              {!side && (
                <span className="mt-1 text-[10px] tracking-[0.25em] opacity-70">
                  {out ? "RAUS" : canTap ? "TAP" : ""}
                </span>
              )}
            </span>
          </button>
        );
      })}

      {/* Antwort */}
      {match.phase === "answering" && song && (
        <AnswerSheet
          key={`${match.round}-${match.activePlayerId}-${match.step}`}
          name={match.players.find((p) => p.id === match.activePlayerId)?.name ?? ""}
          categories={categories}
          step={match.step}
          onSubmit={(text) => answer(text)}
        />
      )}

      {/* Rundenende */}
      {match.phase === "roundEnd" && song && (
        <RoundEnd match={match} songId={song.id} categories={categories} onNext={handlers.onNext} />
      )}

      {flash && (
        <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center" aria-live="polite">
          <div
            className={`t-burst grid h-64 w-64 place-items-center rounded-full text-8xl font-bold ${flash === "bad" ? "t-shake" : ""}`}
            style={{
              background: flash === "ok" ? "var(--t-ok)" : "var(--t-bad)",
              color: "#fff",
            }}
          >
            {flash === "ok" ? "✓" : "✕"}
          </div>
        </div>
      )}
    </ThemeScope>
  );
}

function AnswerSheet({
  name,
  categories,
  step,
  onSubmit,
}: {
  name: string;
  categories: GuessCategory[];
  step: number;
  onSubmit: (text: string | null) => void;
}) {
  const [text, setText] = useState("");
  const category = categories[step];
  const numeric = category === "year";
  return (
    <div className="fixed inset-0 z-40 grid place-items-center p-4" style={{ background: "color-mix(in srgb, var(--t-bg) 82%, transparent)" }}>
      <form
        className="tcard w-full max-w-md p-5 normal-case"
        onSubmit={(event) => {
          event.preventDefault();
          if (text.trim()) onSubmit(text);
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <strong className="text-2xl">{name}</strong>
          <span className="flex gap-1" aria-label={`Kategorie ${step + 1} von ${categories.length}`}>
            {categories.map((item, index) => (
              <span
                key={item}
                className="h-3 w-3 rounded-full"
                style={{
                  background: index <= step ? "var(--t-accent)" : "transparent",
                  border: "2px solid var(--t-accent)",
                }}
              />
            ))}
          </span>
        </div>
        <label className="mt-4 block text-sm opacity-70" htmlFor="answer">
          {LABEL[category]}
        </label>
        <input
          id="answer"
          autoFocus
          autoComplete="off"
          autoCapitalize="words"
          inputMode={numeric ? "numeric" : "text"}
          className="mt-1 w-full rounded-xl border-2 border-current bg-transparent px-4 py-4 text-2xl outline-none"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={numeric ? "z. B. 2007" : "Antwort"}
        />
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <button className="tbtn" type="submit" disabled={!text.trim()}>
            Antworten
          </button>
          <button className="tbtn-ghost" type="button" onClick={() => onSubmit(null)}>
            Weiß nicht
          </button>
        </div>
      </form>
    </div>
  );
}

function RoundEnd({
  match,
  songId,
  categories,
  onNext,
}: {
  match: Match;
  songId: string;
  categories: GuessCategory[];
  onNext: () => void;
}) {
  const song = getSong(songId);
  if (!song) return null;
  const outcome = match.lastOutcome;
  const player = match.players.find((p) => p.id === outcome?.playerId);
  const last = match.round + 1 >= match.queue.length && !match.contenders;
  let headline = "Niemand wusste es";
  if (player) {
    headline =
      outcome && outcome.points > 0
        ? `${player.name} +${outcome.points}`
        : `${player.name}: 0 Punkte`;
  }
  return (
    <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto p-4" style={{ background: "color-mix(in srgb, var(--t-bg) 90%, transparent)" }}>
      <div className="tcard w-full max-w-md p-5 normal-case">
        <p className="text-sm font-bold tracking-widest" style={{ color: outcome?.points ? "var(--t-ok)" : "var(--t-muted)" }}>
          {headline}
        </p>
        <div className="mt-3 flex gap-4">
          {song.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={song.coverUrl} alt="" width={96} height={96} className="h-24 w-24 rounded-lg object-cover" />
          )}
          <div className="min-w-0">
            <strong className="block text-2xl leading-tight">{song.artist}</strong>
            <span className="block">{song.title}</span>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {categories
            .filter((c) => c !== "artist")
            .map((c) => (
              <div key={c} className="contents">
                <dt className="opacity-60">{LABEL[c]}</dt>
                <dd className="font-bold">{solutionFor(c, song)}</dd>
              </div>
            ))}
        </dl>
        <button className="tbtn mt-5 w-full" type="button" onClick={onNext}>
          {last ? "Ergebnis" : match.contenders ? "Weiter" : "Nächster Song"}
        </button>
      </div>
    </div>
  );
}

function Finish({ match, handlers, themeId }: { match: Match; handlers: MatchHandlers; themeId: ReturnType<typeof themeFor>["id"] }) {
  const ranked = ranking(match);
  const won = winners(match);
  const tie = won.length > 1;
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-4 py-8 text-center">
      <p className="text-xs tracking-[0.3em]" style={{ color: "var(--t-muted)" }}>Spiel beendet</p>
      <h1 className="mt-2 text-4xl font-bold leading-tight">
        {tie ? "Unentschieden" : `${won[0]?.name} gewinnt`}
      </h1>
      <div className="my-4">
        <Device theme={themeId} playing={false} size={200} />
      </div>
      <ol className="w-full space-y-2">
        {ranked.map((player, index) => (
          <li
            key={player.id}
            className="tcard flex items-center justify-between px-4 py-3"
            style={won.some((w) => w.id === player.id) ? { outline: "3px solid var(--t-accent)" } : undefined}
          >
            <span className="text-lg font-bold">
              {index + 1}. {player.name}
            </span>
            <span className="text-3xl font-bold">{player.score}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 grid w-full gap-2">
        <button className="tbtn" type="button" onClick={handlers.onRematch}>Nochmal spielen</button>
        <button className="tbtn-ghost" type="button" onClick={handlers.onExit}>Andere Playlist</button>
      </div>
    </main>
  );
}
