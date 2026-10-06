"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export type Libro = {
  id: string;
  title: string;
  author: string;
  format: string;
  imageUrl: string | null;
  price: number;
  totalPages: number | null;
  previewPages: number;
  hasPdf: boolean;
};

const COLUMNS = "id, title, author, format, image_url, price, pdf_path, preview_pages, total_pages";

type LibroRow = {
  id: string;
  title: string;
  author: string;
  format: string;
  image_url: string | null;
  price: number | string;
  pdf_path: string | null;
  preview_pages: number;
  total_pages: number | null;
};

function toLibro(l: LibroRow): Libro {
  return {
    id: l.id,
    title: l.title,
    author: l.author,
    format: l.format,
    imageUrl: l.image_url,
    price: Number(l.price),
    totalPages: l.total_pages,
    previewPages: l.preview_pages,
    hasPdf: !!l.pdf_path,
  };
}

export async function getLibrosCatalogo(): Promise<Libro[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("libros_catalogo").select(COLUMNS).order("position", { ascending: true });
  return (data ?? []).map(toLibro);
}

export async function getLibro(id: string): Promise<Libro | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("libros_catalogo").select(COLUMNS).eq("id", id).maybeSingle();
  return data ? toLibro(data) : null;
}

export async function getAllLibros(): Promise<Libro[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("libros_catalogo").select(COLUMNS).order("position", { ascending: true });
  return (data ?? []).map(toLibro);
}

export async function createLibro(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);

  if (!title || !author || !format) return;

  await supabase.from("libros_catalogo").insert({ title, author, format, image_url: imageUrl || null, price: Number.isFinite(price) ? price : 0 });

  revalidatePath("/admin/novedades");
  revalidatePath("/novedades");
}

export async function updateLibro(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);

  if (!id || !title || !author || !format) return;

  await supabase
    .from("libros_catalogo")
    .update({ title, author, format, image_url: imageUrl || null, price: Number.isFinite(price) ? price : 0 })
    .eq("id", id);

  revalidatePath("/admin/novedades");
  revalidatePath("/novedades");
}

export async function deleteLibro(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase.from("libros_catalogo").delete().eq("id", id);
  revalidatePath("/admin/novedades");
  revalidatePath("/novedades");
}
