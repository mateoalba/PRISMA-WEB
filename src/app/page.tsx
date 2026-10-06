import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { HomeContent } from "@/components/home/HomeContent";
import { getLibrosCatalogo } from "@/lib/novedades/libros-actions";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let headerUser: { initial: string; isAdmin: boolean } | null = null;
  let hasMembership = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, has_membership")
      .eq("id", user.id)
      .maybeSingle();
    headerUser = {
      initial: (profile?.full_name?.trim()?.[0] ?? user.email?.[0] ?? "?").toUpperCase(),
      isAdmin: profile?.role === "admin",
    };
    hasMembership = !!profile?.has_membership;
  }
  const libros = (await getLibrosCatalogo()).slice(0, 6);

  return (
    <>
      <SiteHeader user={headerUser} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <HomeContent loggedIn={!!user} libros={libros} hasMembership={hasMembership} />
      </main>

      <PublicFooter />
    </>
  );
}
