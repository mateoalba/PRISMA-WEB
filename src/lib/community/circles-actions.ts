"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type InterestCircle = {
  id: string;
  name: string;
  description: string;
  topic: string;
  scheduleText: string;
  memberCount: number;
  joined: boolean;
  fellowInitials: string[];
};

function initialsFrom(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

export async function getInterestCircles(): Promise<InterestCircle[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: circles }, { data: counts }, { data: myMemberships }] = await Promise.all([
    supabase
      .from("interest_circles")
      .select("id, name, description, topic, schedule_text")
      .order("position", { ascending: true }),
    supabase.rpc("interest_circle_member_counts"),
    supabase.from("interest_circle_members").select("circle_id").eq("user_id", user.id),
  ]);

  if (!circles || circles.length === 0) return [];

  const countByCircle = new Map<string, number>(
    (counts ?? []).map((c: { circle_id: string; member_count: number }) => [c.circle_id, c.member_count])
  );
  const joinedIds = new Set((myMemberships ?? []).map((m) => m.circle_id));

  const joinedCircleIds = circles.map((c) => c.id).filter((id) => joinedIds.has(id));
  const fellowByCircle = new Map<string, string[]>();
  if (joinedCircleIds.length > 0) {
    const { data: fellowRows } = await supabase
      .from("interest_circle_members")
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
    topic: c.topic,
    scheduleText: c.schedule_text,
    memberCount: countByCircle.get(c.id) ?? 0,
    joined: joinedIds.has(c.id),
    fellowInitials: fellowByCircle.get(c.id) ?? [],
  }));
}

export async function joinInterestCircle(circleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("interest_circle_members").insert({ circle_id: circleId, user_id: user.id });
  revalidatePath("/dimensiones/conexion-social");
}

export async function leaveInterestCircle(circleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("interest_circle_members").delete().eq("circle_id", circleId).eq("user_id", user.id);
  revalidatePath("/dimensiones/conexion-social");
}
