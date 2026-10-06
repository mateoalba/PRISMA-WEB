"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type VolunteerOpportunity = {
  id: string;
  title: string;
  description: string;
  place: string;
  mode: "presencial" | "virtual";
  totalSeats: number;
  seatsTaken: number;
  scheduleText: string;
  commitmentText: string;
  roleLabel: string;
  joined: boolean;
};

type OpportunityRow = {
  id: string;
  title: string;
  description: string;
  place: string;
  mode: "presencial" | "virtual";
  total_seats: number;
  schedule_text: string;
  commitment_text: string;
  role_label: string;
};

export async function getVolunteerOpportunities(): Promise<VolunteerOpportunity[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: opportunities }, { data: counts }] = await Promise.all([
    supabase
      .from("volunteer_opportunities")
      .select("id, title, description, place, mode, total_seats, schedule_text, commitment_text, role_label")
      .order("position", { ascending: true }),
    supabase.rpc("volunteer_opportunity_seat_counts"),
  ]);

  let myIds = new Set<string>();
  if (user) {
    const { data: mine } = await supabase.from("volunteer_opportunity_members").select("opportunity_id").eq("user_id", user.id);
    myIds = new Set((mine ?? []).map((m) => m.opportunity_id));
  }

  const countMap = new Map<string, number>(
    (counts ?? []).map((c: { opportunity_id: string; taken_count: number }) => [c.opportunity_id, Number(c.taken_count)])
  );

  return ((opportunities ?? []) as OpportunityRow[]).map((o) => ({
    id: o.id,
    title: o.title,
    description: o.description,
    place: o.place,
    mode: o.mode,
    totalSeats: o.total_seats,
    seatsTaken: countMap.get(o.id) ?? 0,
    scheduleText: o.schedule_text,
    commitmentText: o.commitment_text,
    roleLabel: o.role_label,
    joined: myIds.has(o.id),
  }));
}

export async function toggleVolunteerSignup(opportunityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("volunteer_opportunity_members")
    .select("opportunity_id")
    .eq("opportunity_id", opportunityId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("volunteer_opportunity_members").delete().eq("opportunity_id", opportunityId).eq("user_id", user.id);
  } else {
    const [{ data: opportunity }, { count: taken }] = await Promise.all([
      supabase.from("volunteer_opportunities").select("total_seats").eq("id", opportunityId).maybeSingle(),
      supabase.from("volunteer_opportunity_members").select("*", { count: "exact", head: true }).eq("opportunity_id", opportunityId),
    ]);
    if (opportunity && (taken ?? 0) < opportunity.total_seats) {
      await supabase.from("volunteer_opportunity_members").insert({ opportunity_id: opportunityId, user_id: user.id });
    }
  }

  revalidatePath("/dimensiones/participacion-activa");
}
