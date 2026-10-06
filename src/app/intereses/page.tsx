import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InterestsDialog } from "@/components/onboarding/InterestsDialog";

export const metadata: Metadata = { title: "Elige tus intereses | Prisma" };

export default async function InteresesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, onboarding_completed_at")
    .eq("id", user.id)
    .maybeSingle();

  // Ya eligió sus intereses (u omitió) antes: no se vuelve a mostrar.
  if (profile?.onboarding_completed_at) redirect("/dashboard");

  const firstName =
    profile?.full_name?.trim()?.split(" ")[0] ?? user.email?.split("@")[0] ?? "";

  return <InterestsDialog name={firstName} />;
}
