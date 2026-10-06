"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export type Oferta = {
  id: string;
  title: string;
  price: number;
  priceBefore: number;
  imageUrl: string | null;
  stock: number;
  totalStock: number;
  endsAt: string;
};

type OfertaRow = {
  id: string;
  title: string;
  price: number;
  price_before: number;
  image_url: string | null;
  stock: number;
  total_stock: number;
  ends_at: string;
};

function toOferta(o: OfertaRow): Oferta {
  return {
    id: o.id,
    title: o.title,
    price: Number(o.price),
    priceBefore: Number(o.price_before),
    imageUrl: o.image_url,
    stock: o.stock,
    totalStock: o.total_stock,
    endsAt: o.ends_at,
  };
}

export async function getActiveOfertas(): Promise<Oferta[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ofertas")
    .select("id, title, price, price_before, image_url, stock, total_stock, ends_at")
    .gt("ends_at", new Date().toISOString())
    .order("position", { ascending: true });
  return ((data ?? []) as OfertaRow[]).map(toOferta);
}

export async function getAllOfertas(): Promise<Oferta[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase
    .from("ofertas")
    .select("id, title, price, price_before, image_url, stock, total_stock, ends_at")
    .order("position", { ascending: true });
  return ((data ?? []) as OfertaRow[]).map(toOferta);
}

export async function createOferta(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const title = String(formData.get("title") ?? "").trim();
  const price = Number(formData.get("price"));
  const priceBefore = Number(formData.get("price_before"));
  const stock = Number(formData.get("stock"));
  const endsAt = String(formData.get("ends_at") ?? "");
  const imageUrl = String(formData.get("image_url") ?? "").trim();

  if (!title || !price || !priceBefore || !stock || !endsAt) return;

  await supabase.from("ofertas").insert({
    title,
    price,
    price_before: priceBefore,
    stock,
    total_stock: stock,
    ends_at: new Date(endsAt).toISOString(),
    image_url: imageUrl || null,
  });

  revalidatePath("/admin/novedades");
  revalidatePath("/novedades");
}

export async function updateOferta(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const price = Number(formData.get("price"));
  const priceBefore = Number(formData.get("price_before"));
  const stock = Number(formData.get("stock"));
  const endsAt = String(formData.get("ends_at") ?? "");
  const imageUrl = String(formData.get("image_url") ?? "").trim();

  if (!id || !title || !price || !priceBefore || !endsAt) return;

  await supabase
    .from("ofertas")
    .update({
      title,
      price,
      price_before: priceBefore,
      stock,
      ends_at: new Date(endsAt).toISOString(),
      image_url: imageUrl || null,
    })
    .eq("id", id);

  revalidatePath("/admin/novedades");
  revalidatePath("/novedades");
}

export async function deleteOferta(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase.from("ofertas").delete().eq("id", id);
  revalidatePath("/admin/novedades");
  revalidatePath("/novedades");
}
