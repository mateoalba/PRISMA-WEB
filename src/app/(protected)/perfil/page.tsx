import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getProfileStats } from "@/lib/profile/stats";
import { getRoleLadder } from "@/lib/participation/roles-actions";
import { getMembershipState } from "@/lib/membership/actions";
import { PerfilTabs } from "./PerfilTabs";

export const metadata: Metadata = { title: "Mi perfil | Prisma" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, stats, roles, membership] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, last_name, phone, city, emergency_contact_name, emergency_contact_phone, avatar_url, has_membership")
      .eq("id", user!.id)
      .maybeSingle(),
    getProfileStats(),
    getRoleLadder(),
    getMembershipState(),
  ]);

  const rolActual = [...roles].reverse().find((r) => r.estado === "hecho")?.rol ?? "Usuario";

  return (
    <PerfilTabs
      email={user!.email ?? ""}
      fullName={profile?.full_name ?? ""}
      lastName={profile?.last_name ?? ""}
      phone={profile?.phone ?? ""}
      city={profile?.city ?? ""}
      emergencyContactName={profile?.emergency_contact_name ?? ""}
      emergencyContactPhone={profile?.emergency_contact_phone ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
      hasMembership={profile?.has_membership ?? false}
      rol={rolActual}
      stats={stats}
      membership={membership}
    />
  );
}
