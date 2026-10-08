import {
  clearPkceCookies,
  exchangeCode,
  readPkceCookies,
  setAuthCookies,
} from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const pkce = await readPkceCookies();

  if (error) {
    await clearPkceCookies();
    return NextResponse.redirect(new URL(`/?auth=error&reason=${error}`, request.url));
  }

  if (!code || !state || !pkce.verifier || !pkce.redirectUri || state !== pkce.state) {
    await clearPkceCookies();
    return NextResponse.redirect(new URL("/?auth=error&reason=state", request.url));
  }

  try {
    const tokens = await exchangeCode({
      code,
      verifier: pkce.verifier,
      redirectUri: pkce.redirectUri,
    });
    await setAuthCookies(tokens);
    await clearPkceCookies();
    return NextResponse.redirect(new URL(pkce.next || "/play", request.url));
  } catch {
    await clearPkceCookies();
    return NextResponse.redirect(new URL("/?auth=error&reason=token", request.url));
  }
}
