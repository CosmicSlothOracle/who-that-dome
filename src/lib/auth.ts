import { cookies } from "next/headers";
import { COOKIE, getSpotifyClientId, getSpotifyClientSecret } from "./config";

const SPOTIFY_ACCOUNTS = "https://accounts.spotify.com";
const SPOTIFY_API = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
].join(" ");

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
};

export type SpotifyProfile = {
  id: string;
  display_name: string | null;
  product?: string;
};

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export async function setAuthCookies(tokens: TokenResponse): Promise<void> {
  const store = await cookies();
  store.set(COOKIE.access, tokens.access_token, {
    ...cookieBase(),
    maxAge: tokens.expires_in,
  });
  if (tokens.refresh_token) {
    store.set(COOKIE.refresh, tokens.refresh_token, {
      ...cookieBase(),
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE.access);
  store.delete(COOKIE.refresh);
  store.delete(COOKIE.verifier);
  store.delete(COOKIE.state);
  store.delete(COOKIE.next);
  store.delete(COOKIE.redirect);
}

export async function setPkceCookies(input: {
  verifier: string;
  state: string;
  next: string;
  redirectUri: string;
}): Promise<void> {
  const store = await cookies();
  const base = { ...cookieBase(), maxAge: 60 * 10 };
  store.set(COOKIE.verifier, input.verifier, base);
  store.set(COOKIE.state, input.state, base);
  store.set(COOKIE.next, input.next, base);
  store.set(COOKIE.redirect, input.redirectUri, base);
}

export async function readPkceCookies(): Promise<{
  verifier?: string;
  state?: string;
  next?: string;
  redirectUri?: string;
}> {
  const store = await cookies();
  return {
    verifier: store.get(COOKIE.verifier)?.value,
    state: store.get(COOKIE.state)?.value,
    next: store.get(COOKIE.next)?.value,
    redirectUri: store.get(COOKIE.redirect)?.value,
  };
}

export async function clearPkceCookies(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE.verifier);
  store.delete(COOKIE.state);
  store.delete(COOKIE.next);
  store.delete(COOKIE.redirect);
}

function tokenHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const secret = getSpotifyClientSecret();
  const clientId = getSpotifyClientId();
  if (secret && clientId) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`;
  }
  return headers;
}

export async function exchangeCode(input: {
  code: string;
  verifier: string;
  redirectUri: string;
}): Promise<TokenResponse> {
  const clientId = getSpotifyClientId();
  if (!clientId) throw new Error("SPOTIFY_CLIENT_ID fehlt");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
    client_id: clientId,
    code_verifier: input.verifier,
  });

  const response = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: "POST",
    headers: tokenHeaders(),
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token-Tausch fehlgeschlagen: ${response.status} ${text}`);
  }

  return (await response.json()) as TokenResponse;
}

async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const clientId = getSpotifyClientId();
  if (!clientId) throw new Error("SPOTIFY_CLIENT_ID fehlt");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const response = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: "POST",
    headers: tokenHeaders(),
    body,
  });

  if (!response.ok) {
    throw new Error(`Refresh fehlgeschlagen: ${response.status}`);
  }

  return (await response.json()) as TokenResponse;
}

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  const access = store.get(COOKIE.access)?.value;
  if (access) return access;

  const refresh = store.get(COOKIE.refresh)?.value;
  if (!refresh) return null;

  try {
    const tokens = await refreshAccessToken(refresh);
    await setAuthCookies(tokens);
    return tokens.access_token;
  } catch {
    await clearAuthCookies();
    return null;
  }
}

export async function spotifyFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    return new Response(JSON.stringify({ error: "not_connected" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${SPOTIFY_API}${path}`, { ...init, headers });
}

export async function getSpotifyProfile(): Promise<SpotifyProfile | null> {
  const response = await spotifyFetch("/me");
  if (!response.ok) return null;
  return (await response.json()) as SpotifyProfile;
}

export function authorizeUrl(input: {
  clientId: string;
  redirectUri: string;
  state: string;
  challenge: string;
}): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    scope: SPOTIFY_SCOPES,
    state: input.state,
    code_challenge_method: "S256",
    code_challenge: input.challenge,
  });
  return `${SPOTIFY_ACCOUNTS}/authorize?${params.toString()}`;
}
