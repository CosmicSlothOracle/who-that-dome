import Link from "next/link";
import { ThemeScope } from "@/components/game/ThemeScope";
import { THEMES } from "@/lib/themes";

export default function RulesPage() {
  return (
    <ThemeScope theme={THEMES["turntable-orange"]}>
      <main className="mx-auto w-full max-w-xl px-4 pb-12 pt-6">
        <Link href="/" className="text-sm underline">← Playlists</Link>
        <h1 className="mt-4 text-4xl font-bold leading-tight">Regeln</h1>
        <p className="mt-2 normal-case" style={{ color: "var(--t-muted)" }}>
          2–6 Spieler · ein Gerät in der Tischmitte · Spotify Premium
        </p>

        <section className="tcard mt-6 p-5 normal-case">
          <h2 className="text-lg font-bold">Ziel</h2>
          <p className="mt-1">Sammle über 10 Songs die meisten Punkte. Wer am Ende vorne liegt, gewinnt.</p>
        </section>

        <section className="tcard mt-4 p-5 normal-case">
          <h2 className="text-lg font-bold">Ablauf</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>Playlist wählen, Spielerzahl und Namen eintragen, Gerät in die Mitte legen.</li>
            <li>Ein Spieler tippt auf Play. Ein zufälliger Song startet.</li>
            <li>Wer zuerst sein Feld antippt, nennt den Interpreten (Antwort eintippen).</li>
            <li>
              <strong>Falsch:</strong> Du bist für diesen Song raus, der Song läuft weiter und die anderen dürfen
              tippen. Sind alle raus, gibt es keine Punkte und der nächste Song beginnt.
            </li>
            <li>
              <strong>Richtig:</strong> 1 Punkt, du bleibst dran und beantwortest weitere Kategorien
              (z. B. Album, Erscheinungsjahr). Jede richtige Antwort bringt 1 Punkt.
            </li>
            <li>
              Eine falsche Antwort in einer weiteren Kategorie beendet deine Runde. Bereits verdiente Punkte bleiben.
            </li>
          </ol>
        </section>

        <section className="tcard mt-4 p-5 normal-case">
          <h2 className="text-lg font-bold">Spielende</h2>
          <p className="mt-1">
            Nach dem letzten Song gewinnt die höchste Punktzahl. Bei Gleichstand gibt es einen Sudden-Death-Song:
            Wer als Erster den Interpreten richtig nennt, gewinnt.
          </p>
        </section>
      </main>
    </ThemeScope>
  );
}
