import { Suspense } from "react";
import { GameApp } from "@/components/GameApp";

export default function PlayPage() {
  return (
    <Suspense fallback={<p className="shell text-[var(--muted)]">Lade Spiel…</p>}>
      <GameApp />
    </Suspense>
  );
}
