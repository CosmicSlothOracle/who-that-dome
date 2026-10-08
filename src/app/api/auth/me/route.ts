import { getAccessToken, spotifyFetch, type SpotifyProfile } from "@/lib/auth";

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return Response.json({ connected: false, reason: "no_token" });
  }

  const response = await spotifyFetch("/me");
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    return Response.json({
      connected: false,
      reason: "spotify_rejected",
      spotifyStatus: response.status,
      spotifyMessage: body.error?.message ?? null,
    });
  }

  const profile = (await response.json()) as SpotifyProfile;
  return Response.json({
    connected: true,
    displayName: profile.display_name ?? profile.id,
    product: profile.product ?? null,
    premium: profile.product === "premium",
  });
}
