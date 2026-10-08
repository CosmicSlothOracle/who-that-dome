import { spotifyFetch } from "@/lib/auth";
import { readSpotifyError } from "@/lib/spotify-errors";
import { spotifyUri } from "@/lib/catalog";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    trackId?: string;
    deviceId?: string;
  };

  if (!body.trackId) {
    return Response.json({ error: "missing_track", message: "trackId fehlt." }, { status: 400 });
  }

  let deviceId = body.deviceId;
  if (!deviceId) {
    const devicesResponse = await spotifyFetch("/me/player/devices");
    if (devicesResponse.ok) {
      const devicesBody = (await devicesResponse.json()) as {
        devices: { id: string | null; is_active: boolean }[];
      };
      const active = devicesBody.devices.find((device) => device.is_active && device.id);
      const any = devicesBody.devices.find((device) => device.id);
      deviceId = active?.id ?? any?.id ?? undefined;
    }
  }

  if (!deviceId) {
    return Response.json(
      {
        error: "no_device",
        message: "Kein Spotify-Gerät gefunden. Öffne die Spotify-App und starte kurz irgendetwas.",
      },
      { status: 409 },
    );
  }

  const path = `/me/player/play?device_id=${encodeURIComponent(deviceId)}`;
  const response = await spotifyFetch(path, {
    method: "PUT",
    body: JSON.stringify({ uris: [spotifyUri(body.trackId)] }),
  });

  if (!response.ok && response.status !== 204) {
    const error = await readSpotifyError(response);
    return Response.json(error, { status: error.status });
  }

  return Response.json({ ok: true, deviceId });
}
