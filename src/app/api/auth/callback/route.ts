import {
  clearPkceCookies,
  exchangeCode,
  readPkceCookies,
  setAuthCookies,
} from "@/lib/auth";
import { getAppUrl } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const pkce = await readPkceCookies();
  const base = getAppUrl(request.nextUrl.origin);

  if (error) {
    await clearPkceCookies();
    return NextResponse.redirect(new URL(`/?auth=error&reason=${error}`, base));
  }

  if (!code || !state || !pkce.verifier || !pkce.redirectUri || state !== pkce.state) {
    await clearPkceCookies();
    return NextResponse.redirect(new URL("/?auth=error&reason=state", base));
  }

  try {
    const tokens = await exchangeCode({
      code,
      verifier: pkce.verifier,
      redirectUri: pkce.redirectUri,
    });
    await setAuthCookies(tokens);
    await clearPkceCookies();
    return NextResponse.redirect(new URL(pkce.next || "/play", base));
  } catch {
    await clearPkceCookies();
    return NextResponse.redirect(new URL("/?auth=error&reason=token", base));
  }
}
