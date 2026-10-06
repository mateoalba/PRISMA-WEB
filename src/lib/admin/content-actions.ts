"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./guard";

export type ContentFormState = {
  error: string | null;
};

export async function createContentItem(
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  const { supabase } = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!title) {
    return { error: "El título es obligatorio." };
  }

  const { error } = await supabase
    .from("content_items")
    .insert({ title, description, category, published: true });

  if (error) {
    return { error: "No se pudo crear el contenido." };
  }

  revalidatePath("/admin/contenido");
  revalidatePath("/dimensiones");
  revalidatePath("/dimensiones/[slug]", "page");
  return { error: null };
}

export async function togglePublished(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  if (!id) return;

  await supabase.from("content_items").update({ published: !published }).eq("id", id);

  revalidatePath("/admin/contenido");
  revalidatePath("/dimensiones");
  revalidatePath("/dimensiones/[slug]", "page");
}

export async function deleteContentItem(formData: FormData) {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("content_items").delete().eq("id", id);

  revalidatePath("/admin/contenido");
  revalidatePath("/dimensiones");
  revalidatePath("/dimensiones/[slug]", "page");
}
