"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./guard";

export async function getAllDimensionVideos() {
  const supabase = await createClient();
  const { data } = await supabase.from("dimension_settings").select("slug, youtube_url");
  const map: Record<string, string | null> = {};
  for (const row of data ?? []) {
    map[row.slug] = row.youtube_url;
  }
  return map;
}

export async function getDimensionVideo(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dimension_settings")
    .select("youtube_url")
    .eq("slug", slug)
    .maybeSingle();
  return data?.youtube_url ?? null;
}

export async function setDimensionVideo(slug: string, youtubeUrl: string) {
  await requireAdmin();
  const supabase = await createClient();

  await supabase
    .from("dimension_settings")
    .upsert({ slug, youtube_url: youtubeUrl.trim() || null, updated_at: new Date().toISOString() });

  revalidatePath("/admin/dimensiones");
  revalidatePath(`/dimensiones/${slug}`);
}
