"use server";

import { createClient } from "@/lib/supabase/server";

export type DuoPartner = {
  name: string;
  initial: string;
};

export async function getDuoQueueCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("cognitive_duo_queue")
    .select("user_id", { count: "exact", head: true })
    .neq("user_id", user.id);

  return count ?? 0;
}

// Empareja con la persona que lleva más tiempo esperando. Si nadie más
// está buscando, te deja en la cola y devuelve null — no inventa un
// rival.
export async function findDuoPartner(): Promise<DuoPartner | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: waiting } = await supabase
    .from("cognitive_duo_queue")
    .select("user_id, joined_at")
    .neq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1);

  const partnerRow = waiting?.[0];

  if (!partnerRow) {
    await supabase.from("cognitive_duo_queue").upsert({ user_id: user.id, joined_at: new Date().toISOString() });
    return null;
  }

  await supabase.from("cognitive_duo_queue").delete().in("user_id", [user.id, partnerRow.user_id]);

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", partnerRow.user_id)
    .maybeSingle();

  const name = profile?.full_name?.trim() || "Alguien de la comunidad";
  const initial = name.charAt(0).toUpperCase() || "?";

  return { name, initial };
}

export async function leaveDuoQueue() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("cognitive_duo_queue").delete().eq("user_id", user.id);
}
