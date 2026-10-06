"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function logExerciseSession(routineSlug: string, durationSeconds: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("exercise_sessions").insert({
    user_id: user.id,
    routine_slug: routineSlug,
    duration_seconds: Math.max(0, Math.round(durationSeconds)),
  });

  revalidatePath("/dimensiones/bienestar-fisico");
}

export async function getExerciseSessionsThisWeek() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("exercise_sessions")
    .select("id")
    .eq("user_id", user.id)
    .gte("completed_at", weekAgo);

  return data?.length ?? 0;
}

// Sesiones hechas de lunes a domingo de esta semana; null = día que
// todavía no llega (para no mostrarlo como "no hecho" antes de tiempo).
export async function getWeekSemana(): Promise<(boolean | null)[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [false, false, false, false, false, false, false];

  const hoy = new Date();
  const diaSemana = (hoy.getDay() + 6) % 7; // 0 = lunes
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - diaSemana);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return d;
  });

  const { data } = await supabase
    .from("exercise_sessions")
    .select("completed_at")
    .eq("user_id", user.id)
    .gte("completed_at", dias[0].toISOString());

  const fechasHechas = new Set((data ?? []).map((r) => new Date(r.completed_at).toDateString()));

  return dias.map((d, i) => (i > diaSemana ? null : fechasHechas.has(d.toDateString())));
}
