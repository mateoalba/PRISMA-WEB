"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./guard";

export type AdminInterestCircle = {
  id: string;
  name: string;
  description: string;
  topic: string;
  schedule_text: string;
  position: number;
  created_at: string;
};

export async function getAllInterestCircles(): Promise<AdminInterestCircle[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("interest_circles")
    .select("id, name, description, topic, schedule_text, position, created_at")
    .order("position", { ascending: true });
  return data ?? [];
}

export async function createInterestCircle(formData: FormData) {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const scheduleText = String(formData.get("schedule_text") ?? "").trim();

  if (!name || !description || !topic || !scheduleText) return;

  await supabase.from("interest_circles").insert({
    name,
    description,
    topic,
    schedule_text: scheduleText,
  });

  revalidatePath("/admin/circulos-interes");
  revalidatePath("/dimensiones/conexion-social");
}

export async function updateInterestCircle(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const scheduleText = String(formData.get("schedule_text") ?? "").trim();

  if (!id || !name || !description || !topic || !scheduleText) return;

  await supabase
    .from("interest_circles")
    .update({ name, description, topic, schedule_text: scheduleText })
    .eq("id", id);

  revalidatePath("/admin/circulos-interes");
  revalidatePath("/dimensiones/conexion-social");
}

export async function deleteInterestCircle(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  await supabase.from("interest_circles").delete().eq("id", id);

  revalidatePath("/admin/circulos-interes");
  revalidatePath("/dimensiones/conexion-social");
}
