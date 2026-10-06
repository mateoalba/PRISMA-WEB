import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getDimension } from "@/lib/dimensions";

export type AggregatedTipo = "Contenido" | "Programa" | "Círculo" | "Encuentro" | "Evento" | "Novedad" | "Oferta" | "Libro" | "Producto";

export type AggregatedItem = {
  id: string;
  tipo: AggregatedTipo;
  title: string;
  detail: string;
  publicado: boolean | null;
  href: string;
  contentItemId?: string;
};

export async function getAggregatedContent(): Promise<AggregatedItem[]> {
  const supabase = await createClient();

  const [
    { data: contenido },
    { data: programa },
    { data: apoyo },
    { data: interes },
    { data: proyectos },
    { data: eventos },
    { data: novedades },
    { data: ofertas },
    { data: libros },
    { data: productos },
  ] = await Promise.all([
    supabase.from("content_items").select("id, title, description, category, published").order("created_at", { ascending: false }),
    supabase.from("dimension_program_items").select("id, title, meta, slug"),
    supabase.from("support_circles").select("id, name, schedule_text"),
    supabase.from("interest_circles").select("id, name, topic"),
    supabase.from("intergenerational_projects").select("id, title, partner_name"),
    supabase.from("community_events").select("id, title, event_at"),
    supabase.from("novedades").select("id, title, type, published"),
    supabase.from("ofertas").select("id, title, ends_at"),
    supabase.from("libros_catalogo").select("id, title, author"),
    supabase.from("products").select("id, title, price, published"),
  ]);

  const items: AggregatedItem[] = [
    ...(contenido ?? []).map((c) => ({
      id: `contenido-${c.id}`,
      contentItemId: c.id,
      tipo: "Contenido" as const,
      title: c.title,
      detail: getDimension(c.category)?.title ?? c.category,
      publicado: c.published,
      href: `/dimensiones/${c.category}`,
    })),
    ...(programa ?? []).map((p) => ({
      id: `programa-${p.id}`,
      tipo: "Programa" as const,
      title: p.title,
      detail: `${getDimension(p.slug)?.title ?? p.slug}${p.meta ? ` · ${p.meta}` : ""}`,
      publicado: null,
      href: `/admin/programa?slug=${p.slug}`,
    })),
    ...(apoyo ?? []).map((c) => ({ id: `apoyo-${c.id}`, tipo: "Círculo" as const, title: c.name, detail: c.schedule_text, publicado: null, href: "/admin/circulos" })),
    ...(interes ?? []).map((c) => ({ id: `interes-${c.id}`, tipo: "Círculo" as const, title: c.name, detail: c.topic, publicado: null, href: "/admin/circulos-interes" })),
    ...(proyectos ?? []).map((p) => ({ id: `proyecto-${p.id}`, tipo: "Encuentro" as const, title: p.title, detail: p.partner_name, publicado: null, href: "/admin/encuentros" })),
    ...(eventos ?? []).map((e) => ({
      id: `evento-${e.id}`,
      tipo: "Evento" as const,
      title: e.title,
      detail: new Date(e.event_at).toLocaleDateString("es-CO", { day: "numeric", month: "short" }),
      publicado: null,
      href: "/admin/eventos",
    })),
    ...(novedades ?? []).map((n) => ({ id: `novedad-${n.id}`, tipo: "Novedad" as const, title: n.title, detail: n.type, publicado: n.published, href: "/admin/novedades?tab=novedades" })),
    ...(ofertas ?? []).map((o) => ({
      id: `oferta-${o.id}`,
      tipo: "Oferta" as const,
      title: o.title,
      detail: `Termina ${new Date(o.ends_at).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}`,
      publicado: null,
      href: "/admin/novedades?tab=ofertas",
    })),
    ...(libros ?? []).map((l) => ({ id: `libro-${l.id}`, tipo: "Libro" as const, title: l.title, detail: l.author, publicado: null, href: "/admin/novedades?tab=libros" })),
    ...(productos ?? []).map((p) => ({ id: `producto-${p.id}`, tipo: "Producto" as const, title: p.title, detail: `$${p.price}`, publicado: p.published, href: "/admin/tienda" })),
  ];

  return items;
}
