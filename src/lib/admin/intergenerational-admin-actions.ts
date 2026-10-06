"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./guard";

export type AdminIntergenerationalProject = {
  id: string;
  title: string;
  description: string;
  partner_name: string;
  position: number;
  created_at: string;
};

export async function getAllIntergenerationalProjects(): Promise<AdminIntergenerationalProject[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("intergenerational_projects")
    .select("id, title, description, partner_name, position, created_at")
    .order("position", { ascending: true });
  return data ?? [];
}

export async function getIntergenerationalPairs(): Promise<number | null> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("dimension_settings")
    .select("intergenerational_pairs")
    .eq("slug", "conexion-social")
    .maybeSingle();
  return data?.intergenerational_pairs ?? null;
}

export async function setIntergenerationalPairs(formData: FormData) {
  const { supabase } = await requireAdmin();

  const raw = String(formData.get("pairs") ?? "").trim();
  const pairs = raw === "" ? null : Math.max(0, Number(raw));

  await supabase
    .from("dimension_settings")
    .upsert({ slug: "conexion-social", intergenerational_pairs: pairs, updated_at: new Date().toISOString() });

  revalidatePath("/admin/encuentros");
  revalidatePath("/dimensiones/conexion-social");
}

export async function createIntergenerationalProject(formData: FormData) {
  const { supabase } = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const partnerName = String(formData.get("partner_name") ?? "").trim();

  if (!title || !description || !partnerName) return;

  await supabase.from("intergenerational_projects").insert({
    title,
    description,
    partner_name: partnerName,
  });

  revalidatePath("/admin/encuentros");
  revalidatePath("/dimensiones/conexion-social");
}

export async function updateIntergenerationalProject(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const partnerName = String(formData.get("partner_name") ?? "").trim();

  if (!id || !title || !description || !partnerName) return;

  await supabase
    .from("intergenerational_projects")
    .update({ title, description, partner_name: partnerName })
    .eq("id", id);

  revalidatePath("/admin/encuentros");
  revalidatePath("/dimensiones/conexion-social");
}

export async function deleteIntergenerationalProject(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  await supabase.from("intergenerational_projects").delete().eq("id", id);

  revalidatePath("/admin/encuentros");
  revalidatePath("/dimensiones/conexion-social");
}
