"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SupportCircle = {
  id: string;
  name: string;
  description: string;
  scheduleText: string;
  capacity: number;
  moderatorName: string;
  isLive: boolean;
  memberCount: number;
  joined: boolean;
  // Iniciales de otros miembros, solo visibles si el usuario actual
  // también pertenece al círculo (ver política support_circle_members_select_fellow).
  fellowInitials: string[];
};

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

export async function getSupportCircles(): Promise<SupportCircle[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: circles }, { data: counts }, { data: myMemberships }] = await Promise.all([
    supabase
      .from("support_circles")
      .select("id, name, description, schedule_text, capacity, moderator_name, is_live")
      .order("position", { ascending: true }),
    supabase.rpc("support_circle_member_counts"),
    supabase.from("support_circle_members").select("circle_id").eq("user_id", user.id),
  ]);

  if (!circles || circles.length === 0) return [];

  const countByCircle = new Map<string, number>(
    (counts ?? []).map((c: { circle_id: string; member_count: number }) => [
      c.circle_id,
      c.member_count,
    ])
  );
  const joinedIds = new Set((myMemberships ?? []).map((m) => m.circle_id));

  // Para círculos a los que el usuario pertenece, traemos los nombres de
  // sus compañeros (la política RLS solo permite ver esas filas).
  const joinedCircleIds = circles.map((c) => c.id).filter((id) => joinedIds.has(id));
  const fellowByCircle = new Map<string, string[]>();
  if (joinedCircleIds.length > 0) {
    const { data: fellowRows } = await supabase
      .from("support_circle_members")
      .select("circle_id, user_id")
      .in("circle_id", joinedCircleIds);

    const otherUserIds = Array.from(
      new Set((fellowRows ?? []).map((r) => r.user_id).filter((id) => id !== user.id))
    );
    const namesById = new Map<string, string>();
    if (otherUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", otherUserIds);
      for (const p of profiles ?? []) {
        if (p.full_name) namesById.set(p.id, p.full_name);
      }
    }
    for (const row of fellowRows ?? []) {
      if (row.user_id === user.id) continue;
      const name = namesById.get(row.user_id);
      if (!name) continue;
      const list = fellowByCircle.get(row.circle_id) ?? [];
      list.push(initialsFrom(name));
      fellowByCircle.set(row.circle_id, list);
    }
  }

  return circles.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    scheduleText: c.schedule_text,
    capacity: c.capacity,
    moderatorName: c.moderator_name,
    isLive: c.is_live,
    memberCount: countByCircle.get(c.id) ?? 0,
    joined: joinedIds.has(c.id),
    fellowInitials: fellowByCircle.get(c.id) ?? [],
  }));
}

export async function joinSupportCircle(circleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("support_circle_members").insert({ circle_id: circleId, user_id: user.id });
  revalidatePath("/dimensiones/salud-mental");
}

export async function leaveSupportCircle(circleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("support_circle_members")
    .delete()
    .eq("circle_id", circleId)
    .eq("user_id", user.id);
  revalidatePath("/dimensiones/salud-mental");
}
