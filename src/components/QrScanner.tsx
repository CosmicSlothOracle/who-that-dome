"use client";

import { useEffect, useRef, useState } from "react";
import { getCatalog, parseCardPayload } from "@/lib/catalog";

export function QrScanner({
  onResult,
  onClose,
}: {
  onResult: (cardId: string) => void;
  onClose: () => void;
}) {
  const hostId = "wtd-qr-reader";
  const [manual, setManual] = useState("");
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    let scanner: { stop: () => Promise<void>; clear: () => void } | null = null;
    const known = new Set(getCatalog().songs.map((song) => song.id));

    async function start() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const instance = new Html5Qrcode(hostId);
        scanner = instance;
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            if (handled.current) return;
            const cardId = parseCardPayload(decoded, known);
            if (!cardId) {
              setError("QR-Code nicht erkannt. Erwarte eine Who-That-Dome-Karte.");
              return;
            }
            handled.current = true;
            onResult(cardId);
          },
          () => undefined,
        );
      } catch {
        setError("Kamera nicht verfügbar. HTTPS und Kamerarechte werden benötigt.");
      }
    }

    void start();

    return () => {
      if (!scanner) return;
      scanner.stop().catch(() => undefined).finally(() => {
        try {
          scanner?.clear();
        } catch {
          // already torn down
        }
      });
    };
  }, [onResult]);

  function submitManual(event: React.FormEvent) {
    event.preventDefault();
    const known = new Set(getCatalog().songs.map((song) => song.id));
    const cardId = parseCardPayload(manual, known);
    if (!cardId || !known.has(cardId)) {
      setError("Karten-ID nicht gefunden.");
      return;
    }
    onResult(cardId);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/70 p-4 sm:place-items-center">
      <div className="panel w-full max-w-md p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Karte scannen</h2>
          <button className="ghost-btn px-3 py-1 text-sm" onClick={onClose} type="button">
            Schließen
          </button>
        </div>
        <div id={hostId} className="overflow-hidden rounded-2xl bg-black" />
        {error && <p className="mt-3 text-sm text-[var(--danger)]">{error}</p>}
        <form className="mt-4 flex gap-2" onSubmit={submitManual}>
          <input
            className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 py-2"
            placeholder="oder ID eingeben, z. B. 2000er-001"
            value={manual}
            onChange={(event) => setManual(event.target.value)}
          />
          <button className="gold-btn px-4" type="submit">
            OK
          </button>
        </form>
      </div>
    </div>
  );
}
