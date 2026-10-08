import { Suspense } from "react";
import { HomeScreen } from "@/components/HomeScreen";

export default function Home() {
  return (
    <Suspense fallback={<p className="shell text-[var(--muted)]">Lade…</p>}>
      <HomeScreen />
    </Suspense>
  );
}
