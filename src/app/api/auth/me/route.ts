import { getAccessToken, getSpotifyProfile } from "@/lib/auth";

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    return Response.json({ connected: false });
  }

  const profile = await getSpotifyProfile();
  if (!profile) {
    return Response.json({ connected: false });
  }

  return Response.json({
    connected: true,
    displayName: profile.display_name ?? profile.id,
    product: profile.product ?? null,
    premium: profile.product === "premium",
  });
}
