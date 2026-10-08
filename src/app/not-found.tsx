import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function NotFound() {
  return (
    <AppShell>
      <section className="panel p-6">
        <h1 className="text-2xl font-semibold">Karte nicht gefunden</h1>
        <p className="mt-2 text-[var(--muted)]">
          Diese Karten-ID steckt nicht in der Song-Datenbank.
        </p>
        <Link className="gold-btn mt-5 inline-block" href="/">
          Zur Startseite
        </Link>
      </section>
    </AppShell>
  );
}
