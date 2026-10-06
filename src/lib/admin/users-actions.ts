"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireAdmin } from "./guard";
import { recomputeReferrerPrice } from "@/lib/membership/payments";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  banned: boolean;
  onboardingPending: boolean;
  interests: string[];
  hasMembership: boolean;
  membershipPrice: number;
  referredByName: string | null;
};

export async function getAllUsersWithProfiles(): Promise<AdminUser[]> {
  const { supabase } = await requireAdmin();
  const admin = createAdminClient();

  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 500 });
  const users = data && "users" in data ? data.users : [];
  const ids = users.map((u) => u.id);

  const { data: profiles } = ids.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, last_name, interests, onboarding_completed_at, has_membership, membership_price, referred_by")
        .in("id", ids)
    : {
        data: [] as {
          id: string;
          full_name: string | null;
          last_name: string | null;
          interests: string[];
          onboarding_completed_at: string | null;
          has_membership: boolean;
          membership_price: number;
          referred_by: string | null;
        }[],
      };

  const porId = new Map((profiles ?? []).map((p) => [p.id, p]));

  return users
    .map((u) => {
      const p = porId.get(u.id);
      const nombre = [p?.full_name, p?.last_name].filter(Boolean).join(" ") || (u.user_metadata?.full_name as string) || "";
      const referrer = p?.referred_by ? porId.get(p.referred_by) : null;
      return {
        id: u.id,
        name: nombre,
        email: u.email ?? "",
        createdAt: u.created_at,
        banned: !!u.banned_until && new Date(u.banned_until) > new Date(),
        onboardingPending: !p?.onboarding_completed_at,
        interests: p?.interests ?? [],
        hasMembership: p?.has_membership ?? false,
        membershipPrice: Number(p?.membership_price ?? 50),
        referredByName: referrer ? [referrer.full_name, referrer.last_name].filter(Boolean).join(" ") || null : null,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function setUserBanned(userId: string, banned: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.auth.admin.updateUserById(userId, { ban_duration: banned ? "876000h" : "none" });
  revalidatePath("/admin/usuarios");
}

// Activación o baja manual de la membresía por un admin (cortesías,
// pagos fuera de línea). No tiene vencimiento: solo la pasarela de pago
// pone fecha de vencimiento. Escribe con la service role porque la sesión
// del admin no puede editar el perfil de otra persona. Al cambiar,
// recalcula el precio de quien lo haya referido.
export async function setUserMembership(userId: string, active: boolean) {
  await requireAdmin();
  const admin = createAdminClient();

  const { data: profile } = await admin.from("profiles").select("referred_by").eq("id", userId).maybeSingle();

  await admin
    .from("profiles")
    .update({
      has_membership: active,
      membership_provider: null,
      membership_started_at: active ? new Date().toISOString() : null,
      membership_cancelled_at: active ? null : new Date().toISOString(),
      membership_expires_at: null,
    })
    .eq("id", userId);

  if (profile?.referred_by) {
    await recomputeReferrerPrice(profile.referred_by);
  }

  revalidatePath("/admin/usuarios");
}
