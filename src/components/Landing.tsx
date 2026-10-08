"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSongs, playablePools } from "@/lib/catalog";
import { THEMES, themeFor } from "@/lib/themes";
import { useMatch } from "@/lib/use-match";
import { getPool } from "@/lib/catalog";
import { Device } from "./game/Devices";
import { ThemeScope } from "./game/ThemeScope";
import { SpotifyStatus } from "./SpotifyStatus";

const AUTH_ERRORS: Record<string, string> = {
  access_denied: "Spotify-Login wurde abgebrochen.",
  state: "Login-Sitzung abgelaufen. Bitte erneut verbinden.",
  token: "Token-Tausch fehlgeschlagen.",
};

export function Landing() {
  const params = useSearchParams();
  const [match] = useMatch();
  const pools = playablePools();
  const groups = Object.entries(
    pools.reduce<Record<string, typeof pools>>((acc, pool) => {
      (acc[pool.group ?? "Weitere"] ??= []).push(pool);
      return acc;
    }, {}),
  );
  const reason = params.get("reason");
  const authError = params.get("auth") === "error" ? AUTH_ERRORS[reason ?? ""] ?? "Spotify-Login fehlgeschlagen." : null;
  const resumePool = match && match.phase !== "finished" ? getPool(match.poolId) : undefined;
  const base = THEMES["turntable-orange"];

  return (
    <ThemeScope theme={base}>
      <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-10 pt-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-[0.3em]" style={{ color: "var(--t-muted)" }}>
              Musik-Quiz · 2–6 Spieler
            </p>
            <h1 className="mt-1 text-4xl font-bold leading-none sm:text-5xl">Who That Dome</h1>
          </div>
          <SpotifyStatus compact />
        </header>

        {authError && (
          <p className="tcard mt-4 px-4 py-3 text-sm normal-case" style={{ outline: "2px solid var(--t-bad)" }}>
            {authError}
          </p>
        )}

        {resumePool && (
          <Link href="/play" className="tbtn mt-6 block text-center">
            Weiterspielen · {resumePool.name} · Runde {(match?.round ?? 0) + 1}
          </Link>
        )}

        {groups.map(([group, groupPools]) => (
          <section key={group}>
            <h2 className="mt-8 text-sm tracking-[0.25em]" style={{ color: "var(--t-muted)" }}>
              {group}
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-3">
              {groupPools.map((pool) => {
                const theme = themeFor(pool);
                const count = getSongs([pool.id]).length;
                return (
                  <li key={pool.id} className="h-full">
                    <Link href={`/play?pool=${encodeURIComponent(pool.id)}`} className="block h-full">
                      <ThemeScope theme={theme} className="!min-h-full h-full overflow-hidden rounded-[var(--t-radius)]">
                        <div className="flex h-full min-h-[270px] flex-col justify-between p-3">
                          <div className="grid h-[150px] shrink-0 place-items-center">
                            <Device theme={theme.id} playing={false} size={140} />
                          </div>
                          <div>
                            <strong className="block text-lg leading-tight">{pool.name}</strong>
                            <span className="block text-xs" style={{ color: "var(--t-muted)" }}>
                              {[pool.era, pool.genre].filter(Boolean).join(" · ")} · {count} Songs
                            </span>
                          </div>
                        </div>
                      </ThemeScope>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <nav className="mt-auto flex gap-4 pt-10 text-xs tracking-widest" style={{ color: "var(--t-muted)" }}>
          <Link href="/regeln" className="underline">Regeln</Link>
          <Link href="/cards" className="underline">Karten / QR</Link>
        </nav>
      </main>
    </ThemeScope>
  );
}
