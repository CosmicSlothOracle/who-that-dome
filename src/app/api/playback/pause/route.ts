import { spotifyFetch } from "@/lib/auth";
import { readSpotifyError } from "@/lib/spotify-errors";

export async function POST() {
  const response = await spotifyFetch("/me/player/pause", { method: "PUT" });
  if (!response.ok && response.status !== 204) {
    const error = await readSpotifyError(response);
    return Response.json(error, { status: error.status });
  }
  return Response.json({ ok: true });
}
