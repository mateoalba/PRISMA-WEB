"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./guard";
import type { ActivityConfig, ActivityRow } from "@/lib/interactive-activities/types";

export async function getAllActivitiesAdmin(): Promise<ActivityRow[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("interactive_activities").select("id, slug, type, title, description, config, position").order("slug").order("position");
  return (data ?? []) as ActivityRow[];
}

function revalidateAll(slug: string) {
  revalidatePath("/admin/actividades");
  revalidatePath(`/dimensiones/${slug}`);
}

export async function createActivity(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const slug = String(formData.get("slug") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const configRaw = String(formData.get("config") ?? "{}");

  if (!slug || !type || !title || !description) return;

  let config: ActivityConfig;
  try {
    config = JSON.parse(configRaw);
  } catch {
    return;
  }

  const { data: maxPos } = await supabase.from("interactive_activities").select("position").eq("slug", slug).order("position", { ascending: false }).limit(1).maybeSingle();

  await supabase.from("interactive_activities").insert({ slug, type, title, description, config, position: (maxPos?.position ?? -1) + 1 });
  revalidateAll(slug);
}

export async function updateActivity(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const configRaw = String(formData.get("config") ?? "{}");

  if (!id || !slug || !type || !title || !description) return;

  let config: ActivityConfig;
  try {
    config = JSON.parse(configRaw);
  } catch {
    return;
  }

  await supabase.from("interactive_activities").update({ slug, type, title, description, config }).eq("id", id);
  revalidateAll(slug);
}

export async function deleteActivity(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  await supabase.from("interactive_activities").delete().eq("id", id);
  revalidateAll(slug);
}
