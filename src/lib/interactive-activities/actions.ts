"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActivityRow, ActivityWithProgress, ResponseData } from "./types";

export async function getActivitiesForDimension(slug: string): Promise<ActivityWithProgress[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: activities } = await supabase
    .from("interactive_activities")
    .select("id, slug, type, title, description, config, position")
    .eq("slug", slug)
    .order("position", { ascending: true });

  const rows = (activities ?? []) as ActivityRow[];
  if (rows.length === 0) return [];

  let completions: { activity_id: string; response: ResponseData | null; completed_at: string }[] = [];
  if (user) {
    const { data } = await supabase
      .from("interactive_activity_completions")
      .select("activity_id, response, completed_at")
      .eq("user_id", user.id)
      .in(
        "activity_id",
        rows.map((r) => r.id)
      );
    completions = data ?? [];
  }
  const porActividad = new Map(completions.map((c) => [c.activity_id, c]));

  return rows.map((r) => {
    const c = porActividad.get(r.id);
    return { ...r, response: c?.response ?? null, completedAt: c?.completed_at ?? null };
  });
}

// Guarda la respuesta real de la persona para una actividad (quiz al
// enviar, checklist en cada marca, reflexión al escribir). Si ya está
// completa o no lo decide quien lee el response (ver isResponseComplete).
export async function saveActivityResponse(activityId: string, dimensionSlug: string, response: ResponseData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("interactive_activity_completions")
    .upsert({ activity_id: activityId, user_id: user.id, response, completed_at: new Date().toISOString() }, { onConflict: "activity_id,user_id" });

  revalidatePath(`/dimensiones/${dimensionSlug}`);
}
