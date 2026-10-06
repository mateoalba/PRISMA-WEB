"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { META_MAX } from "./routine-generator";

export async function getTodayHydration(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from("hydration_logs")
    .select("glasses")
    .eq("user_id", user.id)
    .eq("log_date", new Date().toISOString().slice(0, 10))
    .maybeSingle();

  return data?.glasses ?? 0;
}

const DIAS_SEMANA = ["D", "L", "M", "M", "J", "V", "S"];

export async function getHydrationHistory(): Promise<{ label: string; glasses: number }[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const hoy = new Date();
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - (6 - i));
    return d;
  });
  const desde = dias[0].toISOString().slice(0, 10);

  const { data } = await supabase
    .from("hydration_logs")
    .select("log_date, glasses")
    .eq("user_id", user.id)
    .gte("log_date", desde);

  const porFecha = new Map((data ?? []).map((r) => [r.log_date, r.glasses as number]));

  return dias.map((d) => ({
    label: DIAS_SEMANA[d.getDay()],
    glasses: porFecha.get(d.toISOString().slice(0, 10)) ?? 0,
  }));
}

export async function setHydration(glasses: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // Tope real más alto que el genérico: la meta personalizada (según peso)
  // puede llegar hasta META_MAX vasos.
  const clamped = Math.max(0, Math.min(META_MAX, glasses));

  await supabase.from("hydration_logs").upsert(
    {
      user_id: user.id,
      log_date: new Date().toISOString().slice(0, 10),
      glasses: clamped,
    },
    { onConflict: "user_id,log_date" }
  );

  revalidatePath("/dimensiones/bienestar-fisico");
}
