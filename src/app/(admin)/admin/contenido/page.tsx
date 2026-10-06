import type { Metadata } from "next";
import { getAggregatedContent } from "@/lib/admin/aggregated-content";
import { ContenidoClient } from "./ContenidoClient";

export const metadata: Metadata = { title: "Contenido | Panel admin Prisma" };

export default async function AdminContentPage() {
  const items = await getAggregatedContent();
  return <ContenidoClient initialItems={items} />;
}
