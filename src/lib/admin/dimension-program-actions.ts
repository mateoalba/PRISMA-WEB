"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./guard";
import type { ProgramCategory, ProgramItemType, ProgramItemRow } from "./dimension-program-types";

export type { ProgramCategory, ProgramItemType, ProgramItemRow };

export async function getProgramItems(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dimension_program_items")
    .select("id, slug, category, title, meta, description, type, link, position, created_at")
    .eq("slug", slug)
    .order("position", { ascending: true });

  const grouped: Record<ProgramCategory, ProgramItemRow[]> = {
    entrenamiento: [],
    materiales: [],
    formacion: [],
    actividades: [],
  };
  for (const row of (data ?? []) as ProgramItemRow[]) {
    grouped[row.category].push(row);
  }
  return grouped;
}

export async function getAllProgramItems() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("dimension_program_items")
    .select("id, slug, category, title, meta, description, type, link, position, created_at")
    .order("slug", { ascending: true })
    .order("category", { ascending: true })
    .order("position", { ascending: true });
  return (data ?? []) as ProgramItemRow[];
}

export async function createProgramItem(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const slug = String(formData.get("slug") ?? "");
  const category = String(formData.get("category") ?? "") as ProgramCategory;
  const title = String(formData.get("title") ?? "").trim();
  const meta = String(formData.get("meta") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "guia") as ProgramItemType;
  const link = String(formData.get("link") ?? "").trim();

  if (!slug || !category || !title || !description) return;

  await supabase.from("dimension_program_items").insert({
    slug,
    category,
    title,
    meta: meta || null,
    description,
    type,
    link: link || null,
  });

  revalidatePath("/admin/programa");
  revalidatePath(`/dimensiones/${slug}`);
}

export async function updateProgramItem(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const meta = String(formData.get("meta") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "guia") as ProgramItemType;
  const link = String(formData.get("link") ?? "").trim();

  if (!id || !title || !description) return;

  await supabase
    .from("dimension_program_items")
    .update({ title, meta: meta || null, description, type, link: link || null })
    .eq("id", id);

  revalidatePath("/admin/programa");
  revalidatePath(`/dimensiones/${slug}`);
}

export async function deleteProgramItem(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!id) return;

  await supabase.from("dimension_program_items").delete().eq("id", id);

  revalidatePath("/admin/programa");
  revalidatePath(`/dimensiones/${slug}`);
}
