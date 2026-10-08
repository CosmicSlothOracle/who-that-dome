import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function RulesPage() {
  return (
    <AppShell actions={<Link className="ghost-btn text-sm" href="/play">Spiel starten</Link>}>
      <article className="panel space-y-5 p-6 text-sm leading-relaxed">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">Deutschrap-Edition</p>
        <h1 className="text-3xl font-semibold">Regeln und Punkte</h1>
        <p className="text-[var(--muted)]">3+ Spieler · Moderator mit Spotify Premium · 24 Karten pro Dekade</p>

        <section>
          <h2 className="text-lg font-semibold">Ablauf</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Karte ziehen, QR nach oben. Vorderseite verdeckt.</li>
            <li>QR scannen, Song läuft. Alle hören.</li>
            <li>Erste Hand = erste Stimme. Zuerst den Interpret nennen.</li>
            <li>Interpret falsch: 0 Punkte für die erste Stimme. Andere dürfen stehlen.</li>
            <li>Interpret richtig: Titel, Vers, Album, Jahr, Stadt nachlegen.</li>
            <li>Einsatzrunde: offene oder falsche Kategorien von anderen füllen.</li>
            <li>Karte umdrehen. Auflösung + Artwork. Kein Liedtext auf der Karte.</li>
            <li>Ende bei leerem Stapel oder 21 Punkten.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Punkte · max. 10</h2>
          <ul className="mt-2 space-y-1">
            <li>Interpret — 3 · Pflicht</li>
            <li>Titel — 2</li>
            <li>Vers — 2 · aus dem Gedächtnis, Gruppe entscheidet</li>
            <li>Album — 1</li>
            <li>Jahr — 1 · +1 wenn exakt (Albumjahr)</li>
            <li>Stadt / Homebase — 1</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Steal</h2>
          <p className="mt-2 text-[var(--muted)]">
            Offene Kategorie geht an die erste korrekte Nennung. Falsche Antworten
            der ersten Stimme sind stehlbar. Interpret-Steal nur nach Fehlversuch;
            danach darf die stehlende Person offene Kategorien spielen.
          </p>
        </section>

        <p className="text-xs text-[var(--muted)]">
          Volltext: docs/punkteblatt.md · QR-Pack: handoff/drap/v001/
        </p>
      </article>
    </AppShell>
  );
}
