"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

export type ProductCategory = {
  id: string;
  slug: string;
  name: string;
  iconKey: string;
};

export type Product = {
  id: string;
  categoryId: string;
  categorySlug: string;
  title: string;
  description: string;
  details: string[];
  price: number;
  priceBefore: number | null;
  badge: string | null;
  imageUrl: string | null;
  featured: boolean;
  published: boolean;
  createdAt: string;
  libroId: string | null;
};

type ProductRow = {
  id: string;
  category_id: string;
  title: string;
  description: string;
  details: string[];
  price: number;
  price_before: number | null;
  badge: string | null;
  image_url: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  libro_id: string | null;
  product_categories: { slug: string } | { slug: string }[] | null;
};

function toProduct(p: ProductRow): Product {
  const cat = Array.isArray(p.product_categories) ? p.product_categories[0] : p.product_categories;
  return {
    id: p.id,
    categoryId: p.category_id,
    categorySlug: cat?.slug ?? "",
    title: p.title,
    description: p.description,
    details: p.details ?? [],
    price: Number(p.price),
    priceBefore: p.price_before != null ? Number(p.price_before) : null,
    badge: p.badge,
    imageUrl: p.image_url,
    featured: p.featured,
    libroId: p.libro_id,
    published: p.published,
    createdAt: p.created_at,
  };
}

const PRODUCT_COLUMNS =
  "id, category_id, title, description, details, price, price_before, badge, image_url, featured, published, created_at, libro_id, product_categories(slug)";

export async function getCategories(): Promise<ProductCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("product_categories").select("id, slug, name, icon_key").order("position", { ascending: true });
  return (data ?? []).map((c) => ({ id: c.id, slug: c.slug, name: c.name, iconKey: c.icon_key }));
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("published", true)
    .order("position", { ascending: true });
  return ((data ?? []) as unknown as ProductRow[]).map(toProduct);
}

export async function getAllProducts(): Promise<Product[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(PRODUCT_COLUMNS).order("position", { ascending: true });
  return ((data ?? []) as unknown as ProductRow[]).map(toProduct);
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const categoryId = String(formData.get("category_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const detailsRaw = String(formData.get("details") ?? "");
  const price = Number(formData.get("price"));
  const priceBeforeRaw = String(formData.get("price_before") ?? "").trim();
  const badge = String(formData.get("badge") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const featured = formData.get("featured") === "on";

  if (!categoryId || !title || !description || !price) return;

  const details = detailsRaw
    .split("\n")
    .map((d) => d.trim())
    .filter(Boolean);

  await supabase.from("products").insert({
    category_id: categoryId,
    title,
    description,
    details,
    price,
    price_before: priceBeforeRaw ? Number(priceBeforeRaw) : null,
    badge: badge || null,
    image_url: imageUrl || null,
    featured,
  });

  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const categoryId = String(formData.get("category_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const detailsRaw = String(formData.get("details") ?? "");
  const price = Number(formData.get("price"));
  const priceBeforeRaw = String(formData.get("price_before") ?? "").trim();
  const badge = String(formData.get("badge") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();

  if (!id || !categoryId || !title || !description || !price) return;

  const details = detailsRaw
    .split("\n")
    .map((d) => d.trim())
    .filter(Boolean);

  await supabase
    .from("products")
    .update({
      category_id: categoryId,
      title,
      description,
      details,
      price,
      price_before: priceBeforeRaw ? Number(priceBeforeRaw) : null,
      badge: badge || null,
      image_url: imageUrl || null,
    })
    .eq("id", id);

  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
}

export async function toggleProductPublished(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";
  await supabase.from("products").update({ published: !published }).eq("id", id);
  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
}

export async function toggleProductFeatured(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const featured = formData.get("featured") === "true";
  await supabase.from("products").update({ featured: !featured }).eq("id", id);
  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/tienda");
  revalidatePath("/tienda");
}
