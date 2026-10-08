"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchDevices } from "@/lib/playback";
import { useDeviceId } from "@/lib/use-game";
import type { SpotifyDevice } from "@/lib/types";

export function DevicePanel() {
  const [deviceId, setDeviceId] = useDeviceId();
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await fetchDevices();
      setDevices(list);
      if (!list.some((item) => item.id === deviceId)) {
        const next = list.find((item) => item.is_active && item.id) ?? list.find((item) => item.id);
        setDeviceId(next?.id ?? "");
      }
    } catch {
      setDevices([]);
    }
    setLoaded(true);
  }, [deviceId, setDeviceId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    // nur beim Öffnen laden
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="tcard p-4 normal-case">
      <div className="flex items-center justify-between gap-2">
        <strong className="text-sm">Abspielgerät</strong>
        <button className="text-sm underline" type="button" onClick={() => void refresh()}>
          Aktualisieren
        </button>
      </div>
      {devices.length > 0 ? (
        <select
          className="mt-2 w-full rounded-xl border-2 border-current bg-transparent px-3 py-3"
          value={deviceId}
          onChange={(event) => setDeviceId(event.target.value)}
        >
          {devices.map((device) =>
            device.id ? (
              <option key={device.id} value={device.id}>
                {device.name}
                {device.is_active ? " (aktiv)" : ""}
              </option>
            ) : null,
          )}
        </select>
      ) : (
        loaded && (
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            <li>Spotify-App öffnen (derselbe Account).</li>
            <li>Dort kurz einen Song abspielen und pausieren.</li>
            <li>App im Hintergrund offen lassen, dann „Aktualisieren“.</li>
          </ol>
        )
      )}
    </div>
  );
}
