"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./guard";

export type NovedadType = "curso" | "libro" | "producto" | "evento" | "taller" | "actividad" | "general";
export type TileSize = "normal" | "grande" | "ancha" | "alta";

export type Novedad = {
  id: string;
  title: string;
  description: string;
  type: NovedadType;
  link_href: string | null;
  image_url: string | null;
  meta_text: string | null;
  cta_label: string;
  featured: boolean;
  tile_size: TileSize;
  published: boolean;
  created_at: string;
};

const COLUMNS = "id, title, description, type, link_href, image_url, meta_text, cta_label, featured, tile_size, published, created_at";

export async function getPublishedNovedades() {
  const supabase = await createClient();
  const { data } = await supabase.from("novedades").select(COLUMNS).eq("published", true).order("created_at", { ascending: false });
  return (data ?? []) as Novedad[];
}

export async function getAllNovedades() {
  const supabase = await createClient();
  const { data } = await supabase.from("novedades").select(COLUMNS).order("created_at", { ascending: false });
  return (data ?? []) as Novedad[];
}

export async function createNovedad(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "general");
  const linkHref = String(formData.get("link_href") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const metaText = String(formData.get("meta_text") ?? "").trim();
  const ctaLabel = String(formData.get("cta_label") ?? "").trim();
  const featured = formData.get("featured") === "on";
  const tileSize = String(formData.get("tile_size") ?? "normal");

  if (!title || !description) return;

  await supabase.from("novedades").insert({
    title,
    description,
    type,
    link_href: linkHref || null,
    image_url: imageUrl || null,
    meta_text: metaText || null,
    cta_label: ctaLabel || "Ver más",
    featured,
    tile_size: tileSize,
  });

  revalidatePath("/admin/novedades");
  revalidatePath("/novedades");
}

export async function updateNovedad(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "general");
  const linkHref = String(formData.get("link_href") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const metaText = String(formData.get("meta_text") ?? "").trim();
  const ctaLabel = String(formData.get("cta_label") ?? "").trim();
  const featured = formData.get("featured") === "on";
  const tileSize = String(formData.get("tile_size") ?? "normal");

  if (!id || !title || !description) return;

  await supabase
    .from("novedades")
    .update({
      title,
      description,
      type,
      link_href: linkHref || null,
      image_url: imageUrl || null,
      meta_text: metaText || null,
      cta_label: ctaLabel || "Ver más",
      featured,
      tile_size: tileSize,
    })
    .eq("id", id);

  revalidatePath("/admin/novedades");
  revalidatePath("/novedades");
}

export async function toggleNovedadPublished(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";

  await supabase.from("novedades").update({ published: !published }).eq("id", id);

  revalidatePath("/admin/novedades");
  revalidatePath("/novedades");
}

export async function toggleNovedadFeatured(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const featured = formData.get("featured") === "true";

  await supabase.from("novedades").update({ featured: !featured }).eq("id", id);

  revalidatePath("/admin/novedades");
  revalidatePath("/novedades");
}

export async function deleteNovedad(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  await supabase.from("novedades").delete().eq("id", id);

  revalidatePath("/admin/novedades");
  revalidatePath("/novedades");
}
