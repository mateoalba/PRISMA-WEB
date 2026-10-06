import "server-only";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifica que haya sesión y que el perfil del usuario tenga role='admin'.
 * Se llama tanto en el layout del panel como dentro de cada Server Action
 * de admin (una Server Action es un endpoint POST alcanzable
 * directamente, así que no basta con proteger la página que la invoca).
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/dashboard");

  return { supabase, user };
}
