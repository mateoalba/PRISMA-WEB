"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Condition, WellnessProfile } from "./routine-generator";

const CONDICIONES_VALIDAS: Condition[] = ["hipertension", "diabetes", "articular", "cardiaco"];

export async function getWellnessProfile(): Promise<WellnessProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("wellness_profiles").select("age, weight_kg, conditions").eq("user_id", user.id).maybeSingle();
  if (!data) return null;

  return { age: data.age, weightKg: data.weight_kg !== null ? Number(data.weight_kg) : null, conditions: (data.conditions ?? []) as Condition[] };
}

export async function saveWellnessProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const ageRaw = String(formData.get("age") ?? "").trim();
  const weightRaw = String(formData.get("weight_kg") ?? "").trim();
  const age = ageRaw ? Math.max(0, Math.min(120, Math.round(Number(ageRaw)))) : null;
  const weightKg = weightRaw ? Math.max(0, Math.min(300, Number(weightRaw))) : null;
  const conditions = formData.getAll("conditions").map(String).filter((c): c is Condition => CONDICIONES_VALIDAS.includes(c as Condition));

  await supabase
    .from("wellness_profiles")
    .upsert({ user_id: user.id, age, weight_kg: weightKg, conditions, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

  revalidatePath("/dimensiones/bienestar-fisico");
}
