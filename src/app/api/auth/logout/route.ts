import { clearAuthCookies } from "@/lib/auth";
import { getAppUrl } from "@/lib/config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await clearAuthCookies();
  return NextResponse.redirect(new URL("/", getAppUrl(request.nextUrl.origin)), { status: 303 });
}

export async function GET(request: NextRequest) {
  await clearAuthCookies();
  return NextResponse.redirect(new URL("/", getAppUrl(request.nextUrl.origin)));
}
