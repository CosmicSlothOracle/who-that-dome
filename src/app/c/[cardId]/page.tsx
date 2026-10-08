import { CardPage } from "@/components/CardPage";
import { getSong } from "@/lib/catalog";
import { notFound } from "next/navigation";

export default async function ScannedCardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const song = getSong(decodeURIComponent(cardId));
  if (!song) notFound();
  return <CardPage song={song} />;
}
