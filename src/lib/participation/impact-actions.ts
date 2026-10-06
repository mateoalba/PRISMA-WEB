"use server";

import { createClient } from "@/lib/supabase/server";
import { getMyCertificates } from "@/lib/learning/courses-actions";

export type ImpactStat = { value: number; label: string };

// Números reales calculados de tu actividad en la app — no las cifras de
// ejemplo del prototipo (34 horas, 12 personas acompañadas...), que no
// tenemos forma honesta de calcular todavía.
export async function getImpactStats(): Promise<ImpactStat[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const etiquetas = {
    voluntariado: "oportunidades de voluntariado",
    comunidad: "círculos y encuentros",
    cursos: "cursos completados",
    mentorias: "mentorías aceptadas",
  };

  if (!user) {
    return [
      { value: 0, label: etiquetas.voluntariado },
      { value: 0, label: etiquetas.comunidad },
      { value: 0, label: etiquetas.cursos },
      { value: 0, label: etiquetas.mentorias },
    ];
  }

  const [{ count: volCount }, { count: interestCount }, { count: supportCount }, { count: eventCount }, certificados, { count: mentorshipCount }] =
    await Promise.all([
      supabase.from("volunteer_opportunity_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("interest_circle_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("support_circle_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("community_event_attendees").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      getMyCertificates(),
      supabase.from("mentorship_requests").select("*", { count: "exact", head: true }).eq("mentor_id", user.id).eq("status", "accepted"),
    ]);

  return [
    { value: volCount ?? 0, label: etiquetas.voluntariado },
    { value: (interestCount ?? 0) + (supportCount ?? 0) + (eventCount ?? 0), label: etiquetas.comunidad },
    { value: certificados.filter((c) => c.obtenido).length, label: etiquetas.cursos },
    { value: mentorshipCount ?? 0, label: etiquetas.mentorias },
  ];
}
