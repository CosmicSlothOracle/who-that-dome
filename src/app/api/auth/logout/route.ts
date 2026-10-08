import { clearAuthCookies } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await clearAuthCookies();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

export async function GET(request: NextRequest) {
  await clearAuthCookies();
  return NextResponse.redirect(new URL("/", request.url));
}
