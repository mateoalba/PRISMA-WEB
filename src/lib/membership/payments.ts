import "server-only";

import { createAdminClient } from "@/lib/supabase/server";
import { calcularPrecioMembresia } from "./pricing";

export type PaymentProvider = "paypal" | "wompi";

// Cada pago aprobado compra este tiempo de membresía. No hay cobro
// automático recurrente: al vencer, la persona renueva pagando de nuevo.
export const DIAS_POR_PAGO = 30;

export function appOrigin(requestUrl?: string): string {
  const fromEnv = process.env.APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (requestUrl) return new URL(requestUrl).origin;
  return "http://localhost:3000";
}

// Recalcula el precio de un usuario según cuántos de sus referidos tienen
// la membresía activa. Usa la service role porque modifica el perfil de
// OTRA persona (quien refirió), que la sesión normal no puede tocar.
export async function recomputeReferrerPrice(referrerId: string) {
  const admin = createAdminClient();
  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("referred_by", referrerId)
    .eq("has_membership", true);
  await admin.from("profiles").update({ membership_price: calcularPrecioMembresia(count ?? 0) }).eq("id", referrerId);
}

export async function createPendingPayment(p: {
  userId: string;
  provider: PaymentProvider;
  amountUsd: number;
  amountCharged: number;
  currency: string;
  kind?: "membership" | "book";
  libroId?: string;
}): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("membership_payments")
    .insert({
      user_id: p.userId,
      provider: p.provider,
      amount_usd: p.amountUsd,
      amount_charged: p.amountCharged,
      currency: p.currency,
      kind: p.kind ?? "membership",
      libro_id: p.libroId ?? null,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error("No se pudo registrar el pago");
  return data.id as string;
}

export async function setPaymentRef(paymentId: string, providerRef: string) {
  const admin = createAdminClient();
  await admin.from("membership_payments").update({ provider_ref: providerRef }).eq("id", paymentId);
}

export async function markPaymentFailed(paymentId: string, status: "declined" | "error") {
  const admin = createAdminClient();
  await admin.from("membership_payments").update({ status }).eq("id", paymentId).eq("status", "pending");
}

export type ApproveResult = { ok: true; already: boolean } | { ok: false; reason: string };

// Aprueba un pago y extiende la membresía. Es idempotente: el mismo pago
// (webhook + retorno del navegador, reintentos de la pasarela) solo cuenta
// una vez. Antes de activar nada compara el monto y la moneda que la
// pasarela dice haber cobrado contra lo que se acordó al crear el pago.
export async function approvePayment(
  paymentId: string,
  providerRef: string,
  charged: { amount: number; currency: string }
): Promise<ApproveResult> {
  const admin = createAdminClient();

  const { data: pago } = await admin
    .from("membership_payments")
    .select("id, user_id, provider, amount_charged, currency, status, kind, libro_id")
    .eq("id", paymentId)
    .maybeSingle();
  if (!pago) return { ok: false, reason: "Pago no encontrado" };
  if (pago.status === "approved") return { ok: true, already: true };

  const esperadoCentavos = Math.round(Number(pago.amount_charged) * 100);
  const cobradoCentavos = Math.round(charged.amount * 100);
  if (pago.currency !== charged.currency || esperadoCentavos !== cobradoCentavos) {
    await admin.from("membership_payments").update({ status: "error" }).eq("id", paymentId).eq("status", "pending");
    return { ok: false, reason: "El monto cobrado no coincide con el acordado" };
  }

  // Reclama el pago de forma atómica: solo una llamada concurrente lo logra.
  const { data: reclamado, error: errReclamo } = await admin
    .from("membership_payments")
    .update({ status: "approved", provider_ref: providerRef, paid_at: new Date().toISOString() })
    .eq("id", paymentId)
    .neq("status", "approved")
    .select("id")
    .maybeSingle();
  if (errReclamo) return { ok: false, reason: "No se pudo registrar la aprobación" };
  if (!reclamado) return { ok: true, already: true };

  // Compra de un libro suelto: da acceso a ese libro y no toca la membresía.
  if (pago.kind === "book") {
    if (!pago.libro_id) return { ok: false, reason: "Pago de libro sin libro asociado" };
    const { error: errAcceso } = await admin
      .from("book_access")
      .upsert({ user_id: pago.user_id, libro_id: pago.libro_id, payment_id: pago.id }, { onConflict: "user_id,libro_id", ignoreDuplicates: true });
    if (errAcceso) return { ok: false, reason: "No se pudo dar acceso al libro" };
    return { ok: true, already: false };
  }

  const { data: perfil } = await admin
    .from("profiles")
    .select("has_membership, membership_started_at, membership_expires_at, referred_by")
    .eq("id", pago.user_id)
    .maybeSingle();
  if (!perfil) return { ok: false, reason: "Perfil no encontrado" };

  const ahora = new Date();
  const vigenteHasta = perfil.has_membership && perfil.membership_expires_at ? new Date(perfil.membership_expires_at) : null;
  const base = vigenteHasta && vigenteHasta > ahora ? vigenteHasta : ahora;
  const nuevoVencimiento = new Date(base.getTime() + DIAS_POR_PAGO * 24 * 60 * 60 * 1000);

  await admin
    .from("profiles")
    .update({
      has_membership: true,
      membership_provider: pago.provider,
      membership_started_at: perfil.has_membership && perfil.membership_started_at ? perfil.membership_started_at : ahora.toISOString(),
      membership_cancelled_at: null,
      membership_expires_at: nuevoVencimiento.toISOString(),
    })
    .eq("id", pago.user_id);

  if (perfil.referred_by) await recomputeReferrerPrice(perfil.referred_by);
  return { ok: true, already: false };
}

// Da de baja las membresías pagadas que ya vencieron y recalcula el precio
// de quienes refirieron a esas personas (su descuento deja de aplicar).
// Las membresías activadas a mano por un admin no tienen vencimiento y no
// se tocan.
export async function expireLapsedMemberships(): Promise<number> {
  const admin = createAdminClient();
  const ahora = new Date().toISOString();

  const { data: vencidos } = await admin
    .from("profiles")
    .select("id, referred_by")
    .eq("has_membership", true)
    .not("membership_expires_at", "is", null)
    .lt("membership_expires_at", ahora);
  if (!vencidos?.length) return 0;

  await admin
    .from("profiles")
    .update({ has_membership: false, membership_cancelled_at: ahora })
    .in(
      "id",
      vencidos.map((v) => v.id)
    );

  const referidores = [...new Set(vencidos.map((v) => v.referred_by).filter((id): id is string => !!id))];
  for (const id of referidores) await recomputeReferrerPrice(id);
  return vencidos.length;
}
