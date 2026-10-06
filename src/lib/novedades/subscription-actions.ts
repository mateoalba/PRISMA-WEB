"use server";

import { createClient } from "@/lib/supabase/server";

export type NovedadesSubscription = { email: string; topics: string[] } | null;

export async function getMySubscription(): Promise<NovedadesSubscription> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("novedades_subscriptions").select("email, topics").eq("user_id", user.id).maybeSingle();
  return data ? { email: data.email, topics: data.topics } : null;
}

export async function saveSubscription(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const email = String(formData.get("email") ?? "").trim();
  const topics = formData.getAll("topics").map(String);
  if (!email) return;

  await supabase.from("novedades_subscriptions").upsert({ user_id: user.id, email, topics, updated_at: new Date().toISOString() });
}
