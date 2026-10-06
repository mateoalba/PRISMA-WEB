"use server";

import { createClient } from "@/lib/supabase/server";

// Progreso de actividades "a medida" (con diseño propio por dimensión,
// como Inclusión digital). El contenido vive en el componente; esto solo
// guarda el avance real de cada persona.
export async function getActivityProgress<T = Record<string, unknown>>(dimensionSlug: string, activityKey: string): Promise<T | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("activity_progress")
    .select("progress")
    .eq("user_id", user.id)
    .eq("dimension_slug", dimensionSlug)
    .eq("activity_key", activityKey)
    .maybeSingle();

  return (data?.progress as T) ?? null;
}

export async function saveActivityProgress(dimensionSlug: string, activityKey: string, progress: Record<string, unknown>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("activity_progress")
    .upsert(
      { user_id: user.id, dimension_slug: dimensionSlug, activity_key: activityKey, progress, updated_at: new Date().toISOString() },
      { onConflict: "user_id,dimension_slug,activity_key" }
    );
}
