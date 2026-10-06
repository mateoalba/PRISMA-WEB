"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./guard";

export type AdminCircle = {
  id: string;
  name: string;
  description: string;
  schedule_text: string;
  capacity: number;
  moderator_name: string;
  is_live: boolean;
  position: number;
  created_at: string;
};

export async function getAllCircles(): Promise<AdminCircle[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("support_circles")
    .select("id, name, description, schedule_text, capacity, moderator_name, is_live, position, created_at")
    .order("position", { ascending: true });
  return data ?? [];
}

export async function createCircle(formData: FormData) {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const scheduleText = String(formData.get("schedule_text") ?? "").trim();
  const capacity = Number(formData.get("capacity") ?? 0);
  const moderatorName = String(formData.get("moderator_name") ?? "").trim();
  const isLive = formData.get("is_live") === "on";

  if (!name || !description || !scheduleText || !moderatorName || !capacity) return;

  await supabase.from("support_circles").insert({
    name,
    description,
    schedule_text: scheduleText,
    capacity,
    moderator_name: moderatorName,
    is_live: isLive,
  });

  revalidatePath("/admin/circulos");
  revalidatePath("/dimensiones/salud-mental");
}

export async function updateCircle(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const scheduleText = String(formData.get("schedule_text") ?? "").trim();
  const capacity = Number(formData.get("capacity") ?? 0);
  const moderatorName = String(formData.get("moderator_name") ?? "").trim();
  const isLive = formData.get("is_live") === "on";

  if (!id || !name || !description || !scheduleText || !moderatorName || !capacity) return;

  await supabase
    .from("support_circles")
    .update({
      name,
      description,
      schedule_text: scheduleText,
      capacity,
      moderator_name: moderatorName,
      is_live: isLive,
    })
    .eq("id", id);

  revalidatePath("/admin/circulos");
  revalidatePath("/dimensiones/salud-mental");
}

export async function setCircleLive(id: string, isLive: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("support_circles").update({ is_live: isLive }).eq("id", id);
  revalidatePath("/admin/circulos");
  revalidatePath("/dimensiones/salud-mental");
}

export async function deleteCircle(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  await supabase.from("support_circles").delete().eq("id", id);

  revalidatePath("/admin/circulos");
  revalidatePath("/dimensiones/salud-mental");
}
