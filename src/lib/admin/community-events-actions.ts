"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./guard";

export type AdminCommunityEvent = {
  id: string;
  title: string;
  description: string;
  event_at: string;
  mode: "presencial" | "virtual";
  location: string;
  position: number;
  created_at: string;
};

export async function getAllCommunityEvents(): Promise<AdminCommunityEvent[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("community_events")
    .select("id, title, description, event_at, mode, location, position, created_at")
    .order("event_at", { ascending: true });
  return data ?? [];
}

export async function createCommunityEvent(formData: FormData) {
  const { supabase } = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const eventAt = String(formData.get("event_at") ?? "");
  const mode = String(formData.get("mode") ?? "presencial");
  const location = String(formData.get("location") ?? "").trim();

  if (!title || !description || !eventAt || !location) return;

  await supabase.from("community_events").insert({
    title,
    description,
    event_at: new Date(eventAt).toISOString(),
    mode,
    location,
  });

  revalidatePath("/admin/eventos");
  revalidatePath("/dimensiones/conexion-social");
}

export async function updateCommunityEvent(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const eventAt = String(formData.get("event_at") ?? "");
  const mode = String(formData.get("mode") ?? "presencial");
  const location = String(formData.get("location") ?? "").trim();

  if (!id || !title || !description || !eventAt || !location) return;

  await supabase
    .from("community_events")
    .update({
      title,
      description,
      event_at: new Date(eventAt).toISOString(),
      mode,
      location,
    })
    .eq("id", id);

  revalidatePath("/admin/eventos");
  revalidatePath("/dimensiones/conexion-social");
}

export async function deleteCommunityEvent(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  await supabase.from("community_events").delete().eq("id", id);

  revalidatePath("/admin/eventos");
  revalidatePath("/dimensiones/conexion-social");
}
