import { spotifyFetch } from "@/lib/auth";
import { readSpotifyError } from "@/lib/spotify-errors";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { percent?: number; deviceId?: string };
  const percent = Math.round(Number(body.percent));
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    return Response.json({ error: "bad_volume", message: "percent 0–100 nötig." }, { status: 400 });
  }
  const params = new URLSearchParams({ volume_percent: String(percent) });
  if (body.deviceId) params.set("device_id", body.deviceId);
  const response = await spotifyFetch(`/me/player/volume?${params}`, { method: "PUT" });
  if (!response.ok && response.status !== 204) {
    const error = await readSpotifyError(response);
    return Response.json(error, { status: error.status });
  }
  return Response.json({ ok: true });
}
