"use client";

import Link from "next/link";
import { useState } from "react";
import { getPool } from "@/lib/catalog";
import { playTrack } from "@/lib/playback";
import type { Song } from "@/lib/types";
import { AppShell } from "./AppShell";
import { useAppConfig } from "./SpotifyStatus";

export function CardPage({ song }: { song: Song }) {
  const config = useAppConfig();
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const pool = getPool(song.poolId);

  async function play() {
    if (!config) return;
    const result = await playTrack({ mode: config.playbackMode, cardId: song.id });
    if (!result.ok) setMessage(result.message);
  }

  return (
    <AppShell actions={<Link className="ghost-btn text-sm" href="/">Zum Spiel</Link>}>
      <section className="panel p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
          {pool?.name ?? song.poolId}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{song.id}</h1>
        <p className="mt-2 text-[var(--muted)]">
          Karte gescannt. Die Lösungen bleiben verdeckt, bis du sie aufdeckst.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button className="gold-btn" type="button" onClick={() => void play()}>
            Song abspielen
          </button>
        </div>

        <button
          className="mt-6 text-sm text-[var(--gold)] underline"
          type="button"
          onClick={() => setRevealed((value) => !value)}
        >
          {revealed ? "Lösungen verbergen" : "Lösungen anzeigen"}
        </button>

        {revealed && (
          <dl className="mt-4 grid gap-2 text-sm">
            <div><dt className="text-[var(--muted)]">Interpret</dt><dd className="text-lg">{song.artist}</dd></div>
            <div><dt className="text-[var(--muted)]">Songtitel</dt><dd className="text-lg">{song.title}</dd></div>
            <div><dt className="text-[var(--muted)]">Album</dt><dd className="text-lg">{song.album}</dd></div>
            <div>
              <dt className="text-[var(--muted)]">Jahr</dt>
              <dd className="text-lg">
                {song.year}
                {song.yearNote ? <span className="block text-sm text-[var(--muted)]">{song.yearNote}</span> : null}
              </dd>
            </div>
            <div><dt className="text-[var(--muted)]">Stadt / Homebase</dt><dd className="text-lg">{song.city || "—"}</dd></div>
            {song.explicit ? <div className="text-[var(--danger)]">Explicit</div> : null}
            <p className="text-[var(--muted)]">Vers: nicht auf der Karte — aus dem Gedächtnis.</p>
          </dl>
        )}

        {message && <p className="mt-4 text-sm text-[var(--danger)]">{message}</p>}
      </section>
    </AppShell>
  );
}
