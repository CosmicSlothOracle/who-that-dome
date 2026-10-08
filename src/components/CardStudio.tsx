"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { cardUrl, getCatalog, getSongs } from "@/lib/catalog";
import { useBrowserOrigin } from "@/lib/use-game";
import { AppShell } from "./AppShell";

export function CardStudio() {
  const catalog = useMemo(() => getCatalog(), []);
  const browserOrigin = useBrowserOrigin();
  const [poolIds, setPoolIds] = useState<string[]>(catalog.pools.map((pool) => pool.id));
  const [origin, setOrigin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const songs = useMemo(() => getSongs(poolIds), [poolIds]);
  const qrOrigin = origin || browserOrigin;

  useEffect(() => {
    const base = qrOrigin;
    if (!base) return;
    let cancelled = false;
    async function render() {
      const next: Record<string, string> = {};
      for (const song of songs) {
        next[song.id] = await QRCode.toDataURL(cardUrl(song.id, base), {
          width: 240,
          margin: 1,
          color: { dark: "#1a130c", light: "#fff8ec" },
        });
      }
      if (!cancelled) setPreviews(next);
    }
    void render();
    return () => {
      cancelled = true;
    };
  }, [qrOrigin, songs]);

  async function downloadPdf() {
    setBusy(true);
    setError(null);
    try {
      const { buildCardsPdf } = await import("@/lib/card-pdf");
      const bytes = await buildCardsPdf({
        songs,
        pools: catalog.pools,
        origin: qrOrigin || window.location.origin,
      });
      const copy = new Uint8Array(bytes);
      const blob = new Blob([copy], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "who-that-dome-karten.pdf";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <section className="panel no-print p-5">
        <h1 className="text-2xl font-semibold">Karten drucken</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Vorderseiten mit QR-Code, danach Rückseiten mit den Lösungen. Für Duplex
          die Rückseiten als zweiten Stapel drucken.
        </p>

        <label className="mt-5 block text-sm text-[var(--gold)]">QR-Basis-URL</label>
        <input
          className="mt-2 w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3"
          value={qrOrigin}
          onChange={(event) => setOrigin(event.target.value)}
          placeholder="https://who-that-dome.onrender.com"
        />

        <div className="mt-4 grid gap-2">
          {catalog.pools.map((pool) => (
            <label key={pool.id} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={poolIds.includes(pool.id)}
                onChange={() =>
                  setPoolIds((current) =>
                    current.includes(pool.id)
                      ? current.filter((id) => id !== pool.id)
                      : [...current, pool.id],
                  )
                }
              />
              {pool.name} ({catalog.songs.filter((song) => song.poolId === pool.id).length})
            </label>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button className="gold-btn" type="button" disabled={busy || songs.length === 0} onClick={() => void downloadPdf()}>
            {busy ? "Erzeuge PDF…" : `PDF (${songs.length} Karten)`}
          </button>
          <button className="ghost-btn" type="button" onClick={() => window.print()}>
            Browser-Druck
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
      </section>

      <section className="print-sheet mt-6 grid grid-cols-2 gap-3">
        {songs.map((song) => (
          <article key={song.id} className="break-inside-avoid rounded-2xl border border-[var(--line)] p-3">
            <p className="text-[10px] tracking-widest text-[var(--gold)]">WHO THAT DOME</p>
            <p className="text-sm font-semibold">{catalog.pools.find((pool) => pool.id === song.poolId)?.name}</p>
            {previews[song.id] ? (
              // QR data URLs are generated locally; next/image is not useful here.
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={`QR ${song.id}`} className="mx-auto my-2 h-32 w-32" src={previews[song.id]} />
            ) : (
              <div className="mx-auto my-2 h-32 w-32 bg-[var(--bg-elevated)]" />
            )}
            <p className="text-xs text-[var(--muted)]">{song.id}</p>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
