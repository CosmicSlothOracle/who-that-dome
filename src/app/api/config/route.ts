import { getPlaybackMode, isSpotifyConfigured } from "@/lib/config";

export async function GET() {
  return Response.json({
    playbackMode: getPlaybackMode(),
    spotifyConfigured: isSpotifyConfigured(),
  });
}
