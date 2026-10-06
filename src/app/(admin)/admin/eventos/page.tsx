import type { Metadata } from "next";
import { getAllCommunityEvents } from "@/lib/admin/community-events-actions";
import { EventosClient } from "./EventosClient";

export const metadata: Metadata = { title: "Eventos | Panel admin Prisma" };

export default async function AdminEventosPage() {
  const events = await getAllCommunityEvents();
  return <EventosClient initialEvents={events} />;
}
