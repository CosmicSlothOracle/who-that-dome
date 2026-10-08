import { Suspense } from "react";
import { Landing } from "@/components/Landing";

export default function Home() {
  return (
    <Suspense fallback={<p className="shell text-[var(--muted)]">Lade…</p>}>
      <Landing />
    </Suspense>
  );
}
