import { spotifyFetch } from "@/lib/auth";
import { readSpotifyError } from "@/lib/spotify-errors";

export async function GET() {
  const response = await spotifyFetch("/me/player/devices");
  if (!response.ok) {
    const error = await readSpotifyError(response);
    return Response.json(error, { status: error.status });
  }

  return Response.json(await response.json());
}
