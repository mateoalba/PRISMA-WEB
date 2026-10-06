"use server";

import { createClient } from "@/lib/supabase/server";

export type RoleStep = {
  rol: string;
  desc: string;
  estado: "hecho" | "actual" | "bloq";
  progreso?: number;
  falta?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

// Nivel para pasar de "Colaborador" a "Mentor": iniciativas reales de la
// comunidad en las que el usuario ya participa (círculos, encuentros y
// oportunidades de voluntariado), no aportes inventados.
const META_INICIATIVAS = 5;

export async function getRoleLadder(): Promise<RoleStep[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [
      { rol: "Usuario", desc: "Aprendes y participas a tu ritmo.", estado: "hecho" },
      { rol: "Colaborador", desc: "Te unes a círculos, encuentros y oportunidades de la comunidad.", estado: "bloq" },
      { rol: "Mentor", desc: "Acompañas a otros en lo que sabes.", estado: "bloq" },
      { rol: "Líder comunitario", desc: "Guías un círculo o un proyecto.", estado: "bloq" },
    ];
  }

  const [{ count: interestCount }, { count: supportCount }, { count: eventCount }, { count: volunteerCount }, { count: mentorTopicsCount }] =
    await Promise.all([
      supabase.from("interest_circle_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("support_circle_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("community_event_attendees").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("volunteer_opportunity_members").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("mentor_topics").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

  const iniciativas = (interestCount ?? 0) + (supportCount ?? 0) + (eventCount ?? 0) + (volunteerCount ?? 0);
  const esColaborador = iniciativas >= META_INICIATIVAS;
  const esMentor = (mentorTopicsCount ?? 0) > 0;

  const colaborador: RoleStep = esColaborador
    ? { rol: "Colaborador", desc: "Te unes a círculos, encuentros y oportunidades de la comunidad.", estado: "hecho" }
    : {
        rol: "Colaborador",
        desc: "Te unes a círculos, encuentros y oportunidades de la comunidad.",
        estado: "actual",
        progreso: Math.round((iniciativas / META_INICIATIVAS) * 100),
        falta: `Únete a ${META_INICIATIVAS - iniciativas} iniciativa${META_INICIATIVAS - iniciativas === 1 ? "" : "s"} más`,
        ctaLabel: "Ver oportunidades",
        ctaHref: "#op-titulo",
      };

  const mentor: RoleStep = esMentor
    ? { rol: "Mentor", desc: "Acompañas a otros en lo que sabes.", estado: "hecho" }
    : esColaborador
      ? {
          rol: "Mentor",
          desc: "Acompañas a otros en lo que sabes.",
          estado: "actual",
          progreso: 0,
          falta: "Regístrate como mentor en un tema que domines",
          ctaLabel: "Elegir mis temas",
          ctaHref: "#men-titulo",
        }
      : { rol: "Mentor", desc: "Acompañas a otros en lo que sabes.", estado: "bloq" };

  return [
    { rol: "Usuario", desc: "Aprendes y participas a tu ritmo.", estado: "hecho" },
    colaborador,
    mentor,
    { rol: "Líder comunitario", desc: "Guías un círculo o un proyecto.", estado: "bloq" },
  ];
}
