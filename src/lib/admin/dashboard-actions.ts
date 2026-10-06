import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "./guard";
import { getAllDimensionVideos } from "./dimension-settings-actions";
import { DIMENSIONS } from "@/lib/dimensions";
import { dimensionAdminColor } from "@/lib/admin/dimension-admin-colors";

export type Kpi = { label: string; value: number; delta: string; deltaStrong?: string; color: string; href: string };
export type PendingItem = { text: string; subtitle: string; tono: "alerta" | "aviso" | "ok"; href: string };
export type WeekBar = { label: string; value: number; hoy?: boolean };
export type SpectrumRow = { slug: string; name: string; count: number; pct: number; color: string; href: string };
export type AgendaItem = { title: string; day: number; month: string; when: string };

export type DashboardData = {
  adminFirstName: string;
  pendingCount: number;
  upcomingEventsCount: number;
  kpis: Kpi[];
  weekBars: WeekBar[];
  pending: PendingItem[];
  spectrum: SpectrumRow[];
  agenda: AgendaItem[];
};

const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function startOfWeek(d: Date) {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = (day + 6) % 7; // lunes como inicio de semana
  copy.setDate(copy.getDate() - diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export async function getDashboardData(): Promise<DashboardData> {
  const { supabase, user } = await requireAdmin();
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();

  const [
    { data: profile },
    { data: usersData },
    { count: contentItems },
    { count: programaTotal },
    { data: programaRows },
    { data: apoyoRows },
    { data: interesRows },
    { data: ofertasRows },
    { data: productosRows },
    { data: eventosRows },
    { data: profilesOnboarding },
    videos,
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabase.from("content_items").select("*", { count: "exact", head: true }),
    supabase.from("dimension_program_items").select("*", { count: "exact", head: true }),
    supabase.from("dimension_program_items").select("slug"),
    supabase.from("support_circles").select("id, is_live"),
    supabase.from("interest_circles").select("id"),
    supabase.from("ofertas").select("id, title, ends_at"),
    supabase.from("products").select("id, image_url, published, featured"),
    supabase.from("community_events").select("id, title, event_at").gte("event_at", nowIso).order("event_at", { ascending: true }),
    supabase.from("profiles").select("id").is("onboarding_completed_at", null),
    getAllDimensionVideos(),
  ]);

  const users = usersData && "users" in usersData ? usersData.users : [];
  const totalUsuarios = usersData && "total" in usersData ? usersData.total : users.length;

  // --- Barras: altas por semana (últimas 8 semanas) ---
  const hoy = new Date();
  const semanas = Array.from({ length: 8 }, (_, i) => {
    const inicio = startOfWeek(hoy);
    inicio.setDate(inicio.getDate() - (7 - i) * 7);
    return inicio;
  });
  const conteosSemana = semanas.map((inicioSemana) => {
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(finSemana.getDate() + 7);
    return users.filter((u) => {
      const creado = new Date(u.created_at);
      return creado >= inicioSemana && creado < finSemana;
    }).length;
  });
  const weekBars: WeekBar[] = conteosSemana.map((v, i) => ({
    label: i === conteosSemana.length - 1 ? "Esta" : `S${conteosSemana.length - 1 - i}`,
    value: v,
    hoy: i === conteosSemana.length - 1,
  }));
  const nuevosEstaSemana = conteosSemana.at(-1) ?? 0;

  // --- KPIs ---
  const circulosLive = (apoyoRows ?? []).filter((c) => c.is_live).length;
  const circulosTotal = (apoyoRows ?? []).length + (interesRows ?? []).length;
  const totalContenido =
    (contentItems ?? 0) + (programaTotal ?? 0) + circulosTotal + (eventosRows ?? []).length + (ofertasRows ?? []).length + (productosRows ?? []).length;
  const productosPublicados = (productosRows ?? []).filter((p) => p.published).length;
  const productosVitrina = (productosRows ?? []).filter((p) => p.featured).length;
  const proximoEvento = eventosRows?.[0];

  const kpis: Kpi[] = [
    {
      label: "Usuarios registrados",
      value: totalUsuarios,
      delta: `+${nuevosEstaSemana} esta semana`,
      color: "#aebd52",
      href: "/admin/usuarios",
    },
    {
      label: "Elementos de contenido",
      value: totalContenido,
      delta: "en 10 dimensiones",
      color: "#9fd3c9",
      href: "/admin/contenido",
    },
    {
      label: "Círculos activos",
      value: circulosTotal,
      delta: circulosLive > 0 ? `${circulosLive} en vivo ahora` : "ninguno en vivo",
      deltaStrong: circulosLive > 0 ? `${circulosLive} en vivo` : undefined,
      color: "#ff8a74",
      href: "/admin/circulos",
    },
    {
      label: "Próximos eventos",
      value: (eventosRows ?? []).length,
      delta: proximoEvento ? `el próximo: ${new Date(proximoEvento.event_at).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}` : "sin eventos",
      color: "#ffb48a",
      href: "/admin/eventos",
    },
    {
      label: "Productos publicados",
      value: productosPublicados,
      delta: `${productosVitrina} en vitrina`,
      color: "#b8a4e3",
      href: "/admin/tienda",
    },
  ];

  // --- Por revisar ---
  const dimensionesSinVideo = DIMENSIONS.filter((d) => !videos[d.slug]);
  const slugsConPrograma = new Set((programaRows ?? []).map((r) => r.slug));
  const dimensionesSinPrograma = DIMENSIONS.filter((d) => !slugsConPrograma.has(d.slug));
  const en5dias = new Date();
  en5dias.setDate(en5dias.getDate() + 5);
  const ofertasPorVencer = (ofertasRows ?? []).filter((o) => new Date(o.ends_at) <= en5dias && new Date(o.ends_at) >= new Date());
  const productosSinImagen = (productosRows ?? []).filter((p) => !p.image_url);
  const usuariosPendientes = profilesOnboarding ?? [];

  const pending: PendingItem[] = [];
  if (dimensionesSinVideo.length > 0) {
    pending.push({
      text: `${dimensionesSinVideo.length} dimensión${dimensionesSinVideo.length === 1 ? "" : "es"} sin video`,
      subtitle: dimensionesSinVideo.map((d) => d.title).join(", "),
      tono: "alerta",
      href: "/admin/dimensiones",
    });
  }
  if (dimensionesSinPrograma.length > 0) {
    pending.push({
      text: `${dimensionesSinPrograma.length} dimensión${dimensionesSinPrograma.length === 1 ? "" : "es"} sin programa`,
      subtitle: "Agrega entrenamientos, materiales o actividades",
      tono: "alerta",
      href: `/admin/programa?slug=${dimensionesSinPrograma[0].slug}`,
    });
  }
  if (ofertasPorVencer.length > 0) {
    pending.push({
      text: `${ofertasPorVencer.length} oferta${ofertasPorVencer.length === 1 ? "" : "s"} por vencer`,
      subtitle: ofertasPorVencer.map((o) => o.title).join(", "),
      tono: "aviso",
      href: "/admin/novedades?tab=ofertas",
    });
  }
  if (productosSinImagen.length > 0) {
    pending.push({
      text: `${productosSinImagen.length} producto${productosSinImagen.length === 1 ? "" : "s"} sin imagen`,
      subtitle: "Se ven con un marcador en la tienda",
      tono: "aviso",
      href: "/admin/tienda",
    });
  }
  if (usuariosPendientes.length > 0) {
    pending.push({
      text: "Usuarios pendientes de confirmar",
      subtitle: "Todavía no completan sus intereses",
      tono: "aviso",
      href: "/admin/usuarios",
    });
  }

  // --- Espectro por dimensión ---
  const conteoPorDim = new Map<string, number>();
  for (const r of programaRows ?? []) conteoPorDim.set(r.slug, (conteoPorDim.get(r.slug) ?? 0) + 1);
  const maxConteo = Math.max(1, ...DIMENSIONS.map((d) => conteoPorDim.get(d.slug) ?? 0));
  const spectrum: SpectrumRow[] = DIMENSIONS.map((d) => {
    const count = conteoPorDim.get(d.slug) ?? 0;
    return {
      slug: d.slug,
      name: d.title,
      count,
      pct: Math.round((count / maxConteo) * 100),
      color: dimensionAdminColor(d.slug),
      href: `/admin/programa?slug=${d.slug}`,
    };
  });

  // --- Agenda ---
  const agenda: AgendaItem[] = (eventosRows ?? []).slice(0, 4).map((e) => {
    const fecha = new Date(e.event_at);
    return {
      title: e.title,
      day: fecha.getDate(),
      month: MESES_CORTOS[fecha.getMonth()],
      when: fecha.toLocaleString("es-CO", { hour: "numeric", minute: "2-digit" }),
    };
  });

  return {
    adminFirstName: (profile?.full_name ?? "").split(" ")[0] || "",
    pendingCount: pending.length,
    upcomingEventsCount: (eventosRows ?? []).length,
    kpis,
    weekBars,
    pending,
    spectrum,
    agenda,
  };
}
