import type { Metadata } from "next";
import { HomeContent } from "@/components/home/HomeContent";
import { createClient } from "@/lib/supabase/server";
import { getLibrosCatalogo } from "@/lib/novedades/libros-actions";

export const metadata: Metadata = { title: "Inicio | Prisma" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("has_membership").eq("id", user.id).maybeSingle()
    : { data: null };
  const libros = (await getLibrosCatalogo()).slice(0, 6);

  return <HomeContent loggedIn libros={libros} hasMembership={!!profile?.has_membership} />;
}
