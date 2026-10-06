"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { PRECIO_BASE } from "./pricing";

export type ReferidoEstado = {
  id: string;
  name: string;
  active: boolean;
};

export type MembershipState = {
  hasMembership: boolean;
  price: number;
  provider: "paypal" | "wompi" | null;
  startedAt: string | null;
  expiresAt: string | null;
  trialDaysLeft: number; // días de prueba gratis que le quedan (0 = sin prueba activa)
  trialEnded: boolean;
  referralCode: string;
  referredByName: string | null;
  referrals: ReferidoEstado[];
  ahorroMensual: number;
};

function trialDias(finPrueba: string | null): number {
  if (!finPrueba) return 0;
  const ms = new Date(finPrueba).getTime() - Date.now();
  return ms > 0 ? Math.ceil(ms / (24 * 60 * 60 * 1000)) : 0;
}

export async function getMembershipState(): Promise<MembershipState | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("has_membership, membership_price, membership_provider, membership_started_at, membership_expires_at, trial_ends_at, referral_code, referred_by")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  let referralCode = profile.referral_code;
  if (!referralCode) {
    referralCode = Math.random().toString(36).slice(2, 10);
    await supabase.from("profiles").update({ referral_code: referralCode }).eq("id", user.id);
  }

  let referredByName: string | null = null;
  if (profile.referred_by) {
    const { data: referrer } = await supabase.from("profiles").select("full_name").eq("id", profile.referred_by).maybeSingle();
    referredByName = referrer?.full_name ?? null;
  }

  const { data: referidos } = await supabase
    .from("profiles")
    .select("id, full_name, has_membership")
    .eq("referred_by", user.id);

  const referrals: ReferidoEstado[] = (referidos ?? []).map((r) => ({
    id: r.id,
    name: r.full_name || "Sin nombre",
    active: r.has_membership,
  }));

  return {
    hasMembership: profile.has_membership,
    price: Number(profile.membership_price),
    provider: profile.membership_provider,
    startedAt: profile.membership_started_at,
    expiresAt: profile.membership_expires_at,
    trialDaysLeft: trialDias(profile.trial_ends_at),
    trialEnded: !!profile.trial_ends_at && trialDias(profile.trial_ends_at) === 0,
    referralCode,
    referredByName,
    referrals,
    ahorroMensual: PRECIO_BASE - Number(profile.membership_price),
  };
}

// Usa el cliente admin porque el trigger de alta ya resolvió referred_by
// desde el ?ref=código, pero necesitamos leer el perfil recién creado
// desde una Server Action que corre antes de que haya sesión.
export async function resolveReferrerName(refCode: string): Promise<string | null> {
  if (!refCode.trim()) return null;
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("full_name").eq("referral_code", refCode.trim()).maybeSingle();
  return data?.full_name ?? null;
}
