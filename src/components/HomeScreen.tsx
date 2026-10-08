"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "./AppShell";
import { SpotifyStatus } from "./SpotifyStatus";

const AUTH_ERRORS: Record<string, string> = {
  access_denied: "Spotify-Login wurde abgebrochen.",
  state: "Login-Sitzung ungültig. Bitte erneut verbinden.",
  token: "Token-Tausch fehlgeschlagen. Client-ID und Redirect URI prüfen.",
};

export function HomeScreen() {
  const params = useSearchParams();
  const reason = params.get("reason");
  const authError = params.get("auth") === "error" ? AUTH_ERRORS[reason ?? ""] ?? "Spotify-Login fehlgeschlagen." : null;

  return (
    <AppShell actions={<SpotifyStatus compact />}>
      <section className="panel overflow-hidden p-6 sm:p-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-[var(--gold)]">
              Gesellschaftsspiel
            </p>
            <h1 className="max-w-sm text-4xl font-semibold leading-tight">
              Wer kennt den Song?
            </h1>
            <p className="mt-3 max-w-md text-[var(--muted)]">
              Deutschrap-Edition: QR scannen, Song über Spotify starten, Interpret
              zuerst. Danach Titel, Vers, Album, Jahr und Stadt — mit Steal.
            </p>
          </div>
          <div className="vinyl hidden sm:block" aria-hidden />
        </div>

        {authError && (
          <p className="mb-4 rounded-2xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 px-4 py-3 text-sm">
            {authError}
          </p>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/play" className="gold-btn text-center">
            Spiel starten
          </Link>
          <Link href="/regeln" className="ghost-btn text-center">
            Regeln
          </Link>
          <Link href="/cards" className="ghost-btn text-center">
            Karten / QR
          </Link>
        </div>
      </section>

      <ol className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ["1", "Dekade wählen", "Deutschrap 90er, 2000er oder 2010er — 24 Karten, Playlists noch austauschbar."],
          ["2", "Karte scannen", "Der QR öffnet nur die Karten-ID, nie direkt Spotify."],
          ["3", "Erste Stimme", "Interpret ist Pflicht. Danach Steal auf offene Kategorien."],
        ].map(([n, title, text]) => (
          <li key={n} className="panel p-4">
            <p className="text-xs text-[var(--gold)]">{n}</p>
            <h2 className="mt-1 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{text}</p>
          </li>
        ))}
      </ol>
    </AppShell>
  );
}
