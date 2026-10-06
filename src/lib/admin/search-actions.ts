"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "./guard";

export type SearchResult = { id: string; label: string; detail: string; href: string };

export async function searchAdminContent(query: string): Promise<SearchResult[]> {
  await requireAdmin();
  const q = query.trim();
  if (!q) return [];
  const supabase = await createClient();
  const like = `%${q}%`;

  const [{ data: programa }, { data: apoyo }, { data: interes }, { data: eventos }, { data: novedades }, { data: ofertas }, { data: libros }, { data: productos }, { data: contenido }] =
    await Promise.all([
      supabase.from("dimension_program_items").select("id, title, slug").ilike("title", like).limit(5),
      supabase.from("support_circles").select("id, name").ilike("name", like).limit(5),
      supabase.from("interest_circles").select("id, name").ilike("name", like).limit(5),
      supabase.from("community_events").select("id, title").ilike("title", like).limit(5),
      supabase.from("novedades").select("id, title").ilike("title", like).limit(5),
      supabase.from("ofertas").select("id, title").ilike("title", like).limit(5),
      supabase.from("libros_catalogo").select("id, title").ilike("title", like).limit(5),
      supabase.from("products").select("id, title").ilike("title", like).limit(5),
      supabase.from("content_items").select("id, title").ilike("title", like).limit(5),
    ]);

  const results: SearchResult[] = [
    ...(programa ?? []).map((p) => ({ id: `programa-${p.id}`, label: p.title, detail: "Programa", href: `/admin/programa?slug=${p.slug}` })),
    ...(apoyo ?? []).map((c) => ({ id: `apoyo-${c.id}`, label: c.name, detail: "Círculo de apoyo", href: "/admin/circulos" })),
    ...(interes ?? []).map((c) => ({ id: `interes-${c.id}`, label: c.name, detail: "Círculo de interés", href: "/admin/circulos-interes" })),
    ...(eventos ?? []).map((e) => ({ id: `evento-${e.id}`, label: e.title, detail: "Evento", href: "/admin/eventos" })),
    ...(novedades ?? []).map((n) => ({ id: `novedad-${n.id}`, label: n.title, detail: "Novedad", href: "/admin/novedades?tab=novedades" })),
    ...(ofertas ?? []).map((o) => ({ id: `oferta-${o.id}`, label: o.title, detail: "Oferta", href: "/admin/novedades?tab=ofertas" })),
    ...(libros ?? []).map((l) => ({ id: `libro-${l.id}`, label: l.title, detail: "Libro", href: "/admin/novedades?tab=libros" })),
    ...(productos ?? []).map((p) => ({ id: `producto-${p.id}`, label: p.title, detail: "Producto", href: "/admin/tienda" })),
    ...(contenido ?? []).map((c) => ({ id: `contenido-${c.id}`, label: c.title, detail: "Contenido", href: "/admin/contenido" })),
  ];

  return results.slice(0, 8);
}

export async function searchAdminUsers(query: string): Promise<SearchResult[]> {
  await requireAdmin();
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const users = data?.users ?? [];

  return users
    .filter((u) => {
      const name = String(u.user_metadata?.full_name ?? "").toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      return name.includes(q) || email.includes(q);
    })
    .slice(0, 4)
    .map((u) => ({
      id: `usuario-${u.id}`,
      label: u.user_metadata?.full_name || u.email || "Sin nombre",
      detail: u.email ?? "",
      href: `/admin/usuarios?buscar=${encodeURIComponent(u.email ?? "")}`,
    }));
}
