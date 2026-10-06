"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CommunityEventMode = "presencial" | "virtual";

export type CommunityEvent = {
  id: string;
  title: string;
  description: string;
  eventAt: string;
  mode: CommunityEventMode;
  location: string;
  attendeeCount: number;
  attending: boolean;
};

export async function getUpcomingEvents(): Promise<CommunityEvent[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: events }, { data: counts }, { data: myAttendance }] = await Promise.all([
    supabase
      .from("community_events")
      .select("id, title, description, event_at, mode, location")
      .gte("event_at", new Date().toISOString())
      .order("event_at", { ascending: true }),
    supabase.rpc("community_event_attendee_counts"),
    supabase.from("community_event_attendees").select("event_id").eq("user_id", user.id),
  ]);

  if (!events || events.length === 0) return [];

  const countByEvent = new Map<string, number>(
    (counts ?? []).map((c: { event_id: string; attendee_count: number }) => [c.event_id, c.attendee_count])
  );
  const attendingIds = new Set((myAttendance ?? []).map((a) => a.event_id));

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    eventAt: e.event_at,
    mode: e.mode,
    location: e.location,
    attendeeCount: countByEvent.get(e.id) ?? 0,
    attending: attendingIds.has(e.id),
  }));
}

export async function attendEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("community_event_attendees").insert({ event_id: eventId, user_id: user.id });
  revalidatePath("/dimensiones/conexion-social");
}

export async function unattendEvent(eventId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("community_event_attendees").delete().eq("event_id", eventId).eq("user_id", user.id);
  revalidatePath("/dimensiones/conexion-social");
}
