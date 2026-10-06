import "server-only";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getAllDimensionVideos } from "./dimension-settings-actions";
import { DIMENSIONS } from "@/lib/dimensions";

export type AdminNavCounts = {
  contenido: number;
  dimensionesSinVideo: number;
  programa: number;
  actividades: number;
  apoyo: number;
  interes: number;
  encuentros: number;
  eventosProximos: number;
  novedades: number;
  tienda: number;
  usuarios: number;
};

export async function getAdminNavCounts(): Promise<AdminNavCounts> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [
    { count: contentItems },
    { count: programa },
    { count: actividades },
    { count: apoyo },
    { count: interes },
    { count: encuentros },
    { count: eventosProximos },
    { count: novedades },
    { count: ofertas },
    { count: libros },
    { count: tienda },
    videos,
  ] = await Promise.all([
    supabase.from("content_items").select("*", { count: "exact", head: true }),
    supabase.from("dimension_program_items").select("*", { count: "exact", head: true }),
    supabase.from("interactive_activities").select("*", { count: "exact", head: true }),
    supabase.from("support_circles").select("*", { count: "exact", head: true }),
    supabase.from("interest_circles").select("*", { count: "exact", head: true }),
    supabase.from("intergenerational_projects").select("*", { count: "exact", head: true }),
    supabase.from("community_events").select("*", { count: "exact", head: true }).gte("event_at", nowIso),
    supabase.from("novedades").select("*", { count: "exact", head: true }),
    supabase.from("ofertas").select("*", { count: "exact", head: true }),
    supabase.from("libros_catalogo").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    getAllDimensionVideos(),
  ]);

  const dimensionesSinVideo = DIMENSIONS.filter((d) => !videos[d.slug]).length;

  let usuarios = 0;
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    usuarios = data && "total" in data ? data.total : 0;
  } catch {
    usuarios = 0;
  }

  return {
    contenido:
      (contentItems ?? 0) +
      (programa ?? 0) +
      (actividades ?? 0) +
      (apoyo ?? 0) +
      (interes ?? 0) +
      (encuentros ?? 0) +
      (eventosProximos ?? 0) +
      (novedades ?? 0) +
      (ofertas ?? 0) +
      (libros ?? 0) +
      (tienda ?? 0),
    dimensionesSinVideo,
    programa: programa ?? 0,
    actividades: actividades ?? 0,
    apoyo: apoyo ?? 0,
    interes: interes ?? 0,
    encuentros: encuentros ?? 0,
    eventosProximos: eventosProximos ?? 0,
    novedades: (novedades ?? 0) + (ofertas ?? 0) + (libros ?? 0),
    tienda: tienda ?? 0,
    usuarios,
  };
}
