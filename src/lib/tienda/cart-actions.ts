"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "./products-actions";

export type CartLine = { product: Product; quantity: number };

type CartRow = {
  quantity: number;
  products: {
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
  } | null;
};

function toProduct(p: NonNullable<CartRow["products"]>): Product {
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
    published: p.published,
    createdAt: p.created_at,
    libroId: p.libro_id,
  };
}

export async function getCart(): Promise<CartLine[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("cart_items")
    .select(
      "quantity, products(id, category_id, title, description, details, price, price_before, badge, image_url, featured, published, created_at, libro_id, product_categories(slug))"
    )
    .eq("user_id", user.id);

  return ((data ?? []) as unknown as CartRow[])
    .filter((row) => row.products)
    .map((row) => ({ product: toProduct(row.products!), quantity: row.quantity }));
}

export async function changeCartQuantity(productId: string, delta: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  const next = Math.max(0, (existing?.quantity ?? 0) + delta);

  if (next === 0) {
    await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
  } else if (existing) {
    await supabase.from("cart_items").update({ quantity: next }).eq("user_id", user.id).eq("product_id", productId);
  } else {
    await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity: next });
  }

  revalidatePath("/tienda");
}

export async function removeFromCart(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
  revalidatePath("/tienda");
}
