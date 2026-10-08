import { Suspense } from "react";
import { PlayApp } from "@/components/PlayApp";

export default function PlayPage() {
  return (
    <Suspense fallback={<p className="shell text-[var(--muted)]">Lade Spiel…</p>}>
      <PlayApp />
    </Suspense>
  );
}
