import { createClient } from "@/lib/supabase/server";
import { DIMENSIONS } from "@/lib/dimensions";
import { getExerciseRoutine } from "@/lib/wellbeing/exercise-content";

export const HYDRATION_GOAL = 8;
const META_ACTIVIDAD = 5;
const MOOD_NIVEL: Record<string, number> = { radiante: 5, bien: 4, neutral: 3, cansado: 2, triste: 1 };
const DIAS_SEMANA = ["D", "L", "M", "M", "J", "V", "S"];

export type DimensionActivity = { slug: string; name: string; pct: number };
export type ActivityItem = { text: string; meta: string; at: string };

export type ProfileStats = {
  hydrationToday: number;
  hydrationGoal: number;
  moodWeek: { label: string; nivel: number }[];
  moodCheckinsThisWeek: number;
  memberSince: string | null;
  daysAsMember: number;
  dimensionActivity: DimensionActivity[];
  recentActivity: ActivityItem[];
};

function vacio(): ProfileStats {
  return {
    hydrationToday: 0,
    hydrationGoal: HYDRATION_GOAL,
    moodWeek: DIAS_SEMANA.map((label) => ({ label, nivel: 0 })),
    moodCheckinsThisWeek: 0,
    memberSince: null,
    daysAsMember: 0,
    dimensionActivity: DIMENSIONS.map((d) => ({ slug: d.slug, name: d.title, pct: 0 })),
    recentActivity: [],
  };
}

export async function getProfileStats(): Promise<ProfileStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return vacio();

  const today = new Date().toISOString().slice(0, 10);
  const hoy = new Date();
  const dias7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - (6 - i));
    return d;
  });
  const desde7 = dias7[0].toISOString().slice(0, 10);
  const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: hydration },
    { data: moodsWeek },
    { count: moodCount },
    { count: moodTotal },
    { count: supportCircles },
    { count: interestCircles },
    { count: eventAttendance },
    { count: purposeSignups },
    { count: cognitiveDaily },
    { data: cognitiveScore },
    { count: lessonsDone },
    { count: culturalConnections },
    { count: globalEventReminders },
    { count: exerciseSessionsCount },
    { count: hydrationDays },
    { count: volunteerSignups },
    { count: mentorshipsAccepted },
  ] = await Promise.all([
    supabase.from("hydration_logs").select("glasses").eq("user_id", user.id).eq("log_date", today).maybeSingle(),
    supabase.from("mood_checkins").select("mood, created_at").eq("user_id", user.id).gte("created_at", desde7),
    supabase.from("mood_checkins").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", weekAgoIso),
    supabase.from("mood_checkins").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("support_circle_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("interest_circle_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("community_event_attendees").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("purpose_activity_signups").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("cognitive_daily_completions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("cognitive_game_scores").select("best_score").eq("user_id", user.id).maybeSingle(),
    supabase.from("lesson_progress").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("cultural_connection_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("global_event_reminders").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("exercise_sessions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("hydration_logs").select("*", { count: "exact", head: true }).eq("user_id", user.id).gt("glasses", 0),
    supabase.from("volunteer_opportunity_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("mentorship_requests").select("*", { count: "exact", head: true }).eq("mentor_id", user.id).eq("status", "accepted"),
  ]);

  const porFecha = new Map<string, number>();
  for (const m of moodsWeek ?? []) {
    const fecha = m.created_at.slice(0, 10);
    porFecha.set(fecha, MOOD_NIVEL[m.mood] ?? 0);
  }
  const moodWeek = dias7.map((d) => ({
    label: DIAS_SEMANA[d.getDay()],
    nivel: porFecha.get(d.toISOString().slice(0, 10)) ?? 0,
  }));

  function pct(raw: number) {
    return Math.min(100, Math.round((raw / META_ACTIVIDAD) * 100));
  }

  const crudos: Record<string, number> = {
    digital: 0,
    "salud-mental": (supportCircles ?? 0) + (moodTotal ?? 0),
    "conexion-social": (interestCircles ?? 0) + (eventAttendance ?? 0),
    "tiempo-libre": purposeSignups ?? 0,
    "estimulacion-cognitiva": (cognitiveDaily ?? 0) + ((cognitiveScore?.best_score ?? 0) > 0 ? 1 : 0),
    "educacion-continua": lessonsDone ?? 0,
    interculturalidad: (culturalConnections ?? 0) + (globalEventReminders ?? 0),
    "bienestar-fisico": (exerciseSessionsCount ?? 0) + (hydrationDays ?? 0),
    "seguridad-digital": 0,
    "participacion-activa": (volunteerSignups ?? 0) + (mentorshipsAccepted ?? 0),
  };

  const dimensionActivity: DimensionActivity[] = DIMENSIONS.map((d) => ({
    slug: d.slug,
    name: d.title,
    pct: pct(crudos[d.slug] ?? 0),
  }));

  const recentActivity = await getRecentActivity(user.id);

  return {
    hydrationToday: hydration?.glasses ?? 0,
    hydrationGoal: HYDRATION_GOAL,
    moodWeek,
    moodCheckinsThisWeek: moodCount ?? 0,
    memberSince: user.created_at ?? null,
    daysAsMember: user.created_at ? Math.max(1, Math.round((Date.now() - new Date(user.created_at).getTime()) / 86400000)) : 0,
    dimensionActivity,
    recentActivity,
  };
}

function relativo(iso: string) {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Ayer";
  return `Hace ${dias} días`;
}

async function getRecentActivity(userId: string): Promise<ActivityItem[]> {
  const supabase = await createClient();

  const [{ data: leccion }, { data: mood }, { data: circuloInteres }, { data: circuloApoyo }, { data: cognitivo }, { data: voluntariado }, { data: ejercicio }] =
    await Promise.all([
      supabase
        .from("lesson_progress")
        .select("completed_at, course_lessons(title, courses(title))")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("mood_checkins").select("mood, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase
        .from("interest_circle_members")
        .select("joined_at, interest_circles(name)")
        .eq("user_id", userId)
        .order("joined_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("support_circle_members")
        .select("joined_at, support_circles(name)")
        .eq("user_id", userId)
        .order("joined_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("cognitive_daily_completions")
        .select("completed_date")
        .eq("user_id", userId)
        .order("completed_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("volunteer_opportunity_members")
        .select("joined_at, volunteer_opportunities(title)")
        .eq("user_id", userId)
        .order("joined_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("exercise_sessions").select("completed_at, routine_slug").eq("user_id", userId).order("completed_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

  const items: ActivityItem[] = [];

  const leccionInfo = leccion?.course_lessons as unknown as { title: string; courses: { title: string } | { title: string }[] | null } | null;
  if (leccion && leccionInfo) {
    const curso = Array.isArray(leccionInfo.courses) ? leccionInfo.courses[0] : leccionInfo.courses;
    items.push({
      text: `Completaste la lección «${leccionInfo.title}»`,
      meta: `${relativo(leccion.completed_at)} · ${curso?.title ?? "Educación continua"}`,
      at: leccion.completed_at,
    });
  }

  if (mood) {
    const MOOD_LABEL: Record<string, string> = { radiante: "Radiante", bien: "Bien", neutral: "Neutral", cansado: "Cansado", triste: "Triste" };
    items.push({
      text: `Registraste tu ánimo: ${MOOD_LABEL[mood.mood] ?? mood.mood}`,
      meta: `${relativo(mood.created_at)} · Salud mental`,
      at: mood.created_at,
    });
  }

  const interesInfo = circuloInteres?.interest_circles as unknown as { name: string } | { name: string }[] | null;
  if (circuloInteres && interesInfo) {
    const nombre = Array.isArray(interesInfo) ? interesInfo[0]?.name : interesInfo.name;
    items.push({
      text: `Te uniste al círculo «${nombre}»`,
      meta: `${relativo(circuloInteres.joined_at)} · Conexión social`,
      at: circuloInteres.joined_at,
    });
  }

  const apoyoInfo = circuloApoyo?.support_circles as unknown as { name: string } | { name: string }[] | null;
  if (circuloApoyo && apoyoInfo) {
    const nombre = Array.isArray(apoyoInfo) ? apoyoInfo[0]?.name : apoyoInfo.name;
    items.push({
      text: `Te uniste al círculo de apoyo «${nombre}»`,
      meta: `${relativo(circuloApoyo.joined_at)} · Salud mental`,
      at: circuloApoyo.joined_at,
    });
  }

  if (cognitivo) {
    items.push({
      text: "Completaste el desafío del día",
      meta: `${relativo(cognitivo.completed_date)} · Estimulación cognitiva`,
      at: cognitivo.completed_date,
    });
  }

  const voluntariadoInfo = voluntariado?.volunteer_opportunities as unknown as { title: string } | { title: string }[] | null;
  if (voluntariado && voluntariadoInfo) {
    const titulo = Array.isArray(voluntariadoInfo) ? voluntariadoInfo[0]?.title : voluntariadoInfo.title;
    items.push({
      text: `Te inscribiste en «${titulo}»`,
      meta: `${relativo(voluntariado.joined_at)} · Participación activa`,
      at: voluntariado.joined_at,
    });
  }

  if (ejercicio) {
    const rutina = getExerciseRoutine(ejercicio.routine_slug);
    items.push({
      text: `Completaste la rutina «${rutina?.title ?? ejercicio.routine_slug}»`,
      meta: `${relativo(ejercicio.completed_at)} · Bienestar físico`,
      at: ejercicio.completed_at,
    });
  }

  return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 5);
}
