"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CulturalConnection = {
  id: string;
  title: string;
  sub: string;
  tag: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  detail: string;
  scheduleText: string;
  memberCount: number;
  joined: boolean;
};

export async function getCulturalConnections(): Promise<CulturalConnection[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: connections }, { data: counts }, { data: mine }] = await Promise.all([
    supabase
      .from("cultural_connections")
      .select("id, title, sub, tag, country, country_code, lat, lon, detail, schedule_text")
      .order("position", { ascending: true }),
    supabase.rpc("cultural_connection_member_counts"),
    supabase.from("cultural_connection_members").select("connection_id").eq("user_id", user.id),
  ]);

  if (!connections) return [];

  const countByConnection = new Map<string, number>(
    (counts ?? []).map((c: { connection_id: string; member_count: number }) => [c.connection_id, c.member_count])
  );
  const joinedIds = new Set((mine ?? []).map((m) => m.connection_id));

  return connections.map((c) => ({
    id: c.id,
    title: c.title,
    sub: c.sub,
    tag: c.tag,
    country: c.country,
    countryCode: c.country_code,
    lat: c.lat,
    lon: c.lon,
    detail: c.detail,
    scheduleText: c.schedule_text,
    memberCount: countByConnection.get(c.id) ?? 0,
    joined: joinedIds.has(c.id),
  }));
}

export async function joinConnection(connectionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("cultural_connection_members").insert({ connection_id: connectionId, user_id: user.id });
  revalidatePath("/dimensiones/interculturalidad");
}

export async function leaveConnection(connectionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("cultural_connection_members").delete().eq("connection_id", connectionId).eq("user_id", user.id);
  revalidatePath("/dimensiones/interculturalidad");
}
