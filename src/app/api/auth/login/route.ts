import { authorizeUrl, setPkceCookies } from "@/lib/auth";
import { getSpotifyClientId } from "@/lib/config";
import { createPkcePair, randomUrlSafe } from "@/lib/pkce";
import { NextRequest, NextResponse } from "next/server";

function safeNext(value: string | null): string {
  if (!value) return "/play";
  if (!value.startsWith("/") || value.startsWith("//")) return "/play";
  return value;
}

export async function GET(request: NextRequest) {
  const clientId = getSpotifyClientId();
  if (!clientId) {
    return NextResponse.json(
      { error: "not_configured", message: "SPOTIFY_CLIENT_ID fehlt." },
      { status: 500 },
    );
  }

  const redirectUri =
    process.env.SPOTIFY_REDIRECT_URI ??
    `${request.nextUrl.origin}/api/auth/callback`;
  const { verifier, challenge } = await createPkcePair();
  const state = randomUrlSafe(16);
  const next = safeNext(request.nextUrl.searchParams.get("next"));

  await setPkceCookies({ verifier, state, next, redirectUri });

  return NextResponse.redirect(
    authorizeUrl({ clientId, redirectUri, state, challenge }),
  );
}
