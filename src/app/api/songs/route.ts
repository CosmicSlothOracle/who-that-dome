import { getCatalog, getSong } from "@/lib/catalog";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("card");
  if (cardId) {
    const song = getSong(cardId);
    if (!song) return Response.json({ error: "not_found" }, { status: 404 });
    return Response.json({ song });
  }
  return Response.json(getCatalog());
}
