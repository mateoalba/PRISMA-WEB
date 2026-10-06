import "server-only";

import { createClient } from "@/lib/supabase/server";

// anonimo: sin sesión · prueba: dentro de los 15 días gratis (solo muestra)
// bloqueado: sin prueba ni pago · descarga: membresía vigente o libro comprado
export type EstadoAcceso = "anonimo" | "prueba" | "bloqueado" | "descarga";

export type AccesoLibro = {
  estado: EstadoAcceso;
  userId: string | null;
  esMiembro: boolean;
  compro: boolean;
  diasPrueba: number; // días que le quedan; 0 si no tiene prueba activa
  tuvoPrueba: boolean; // tuvo prueba y ya terminó
};

const DIA_MS = 24 * 60 * 60 * 1000;

export async function calcularAcceso(libroId: string): Promise<AccesoLibro> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { estado: "anonimo", userId: null, esMiembro: false, compro: false, diasPrueba: 0, tuvoPrueba: false };

  const [{ data: perfil }, { data: acceso }] = await Promise.all([
    supabase.from("profiles").select("has_membership, membership_expires_at, trial_ends_at").eq("id", user.id).maybeSingle(),
    supabase.from("book_access").select("libro_id").eq("user_id", user.id).eq("libro_id", libroId).maybeSingle(),
  ]);

  const ahora = Date.now();
  const vence = perfil?.membership_expires_at ? new Date(perfil.membership_expires_at).getTime() : null;
  const esMiembro = !!perfil?.has_membership && (vence === null || vence > ahora);
  const compro = !!acceso;
  const finPrueba = perfil?.trial_ends_at ? new Date(perfil.trial_ends_at).getTime() : null;
  const diasPrueba = finPrueba && finPrueba > ahora ? Math.ceil((finPrueba - ahora) / DIA_MS) : 0;

  const estado: EstadoAcceso = esMiembro || compro ? "descarga" : diasPrueba > 0 ? "prueba" : "bloqueado";
  return { estado, userId: user.id, esMiembro, compro, diasPrueba, tuvoPrueba: finPrueba !== null && diasPrueba === 0 };
}
