import { spotifyFetch } from "@/lib/auth";
import { mkdirSync, writeFileSync } from "node:fs";
import { NextRequest } from "next/server";

// Nur für den Import (Aufruf im eingeloggten Browser, schreibt .cache/; danach npm run import-playlist -- --from-file): Seit 2026 liefert Spotify
// Playlist-Tracks nur noch mit Nutzer-Token, nicht mehr mit Client Credentials.
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id || !/^[a-zA-Z0-9]+$/.test(id)) {
    return Response.json({ error: "bad_id" }, { status: 400 });
  }

  const meta = await spotifyFetch(`/playlists/${id}?fields=name,description`);
  if (!meta.ok) return Response.json({ error: "playlist", status: meta.status }, { status: meta.status });
  const { name, description } = (await meta.json()) as { name: string; description: string };

  const items: unknown[] = [];
  let path: string | null = `/playlists/${id}/items?limit=50`;
  while (path) {
    const page = await spotifyFetch(path);
    if (!page.ok) return Response.json({ error: "items", status: page.status }, { status: page.status });
    const body = (await page.json()) as { items: unknown[]; next: string | null };
    items.push(...body.items);
    path = body.next ? body.next.replace("https://api.spotify.com/v1", "") : null;
  }
  const file = `.cache/playlist-${id}.json`;
  mkdirSync(".cache", { recursive: true });
  writeFileSync(file, JSON.stringify({ name, description, items }));
  return Response.json({ saved: file, tracks: items.length });
}
