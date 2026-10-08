import { spotifyFetch } from "@/lib/auth";
import { readSpotifyError } from "@/lib/spotify-errors";

/** Setzt die Wiedergabe dort fort, wo sie pausiert wurde (play ohne Body). */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { deviceId?: string };
  const query = body.deviceId ? `?device_id=${encodeURIComponent(body.deviceId)}` : "";
  const response = await spotifyFetch(`/me/player/play${query}`, { method: "PUT" });
  if (!response.ok && response.status !== 204) {
    const error = await readSpotifyError(response);
    return Response.json(error, { status: error.status });
  }
  return Response.json({ ok: true });
}
