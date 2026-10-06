"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { approvePayment, markPaymentFailed } from "./payments";
import { fetchWompiTransaction, processWompiTransaction, wompiConfig } from "./wompi";
import { captureOrConfirmOrder, paypalConfig } from "./paypal";

export type ConfirmProvider = "wompi" | "paypal";

export type ConfirmResult =
  | {
      estado: "ok";
      tipo: "membresia" | "libro";
      libroId: string | null;
      libroTitulo: string | null;
      venceEl: string | null;
      montoUsd: number;
      montoCobrado: number;
      moneda: string;
      referencia: string;
    }
  | { estado: "pendiente" | "rechazado" | "error" | "sin-sesion" };

async function detallesDelPago(paymentId: string, referencia: string): Promise<ConfirmResult> {
  const admin = createAdminClient();
  const { data: pago } = await admin
    .from("membership_payments")
    .select("user_id, amount_usd, amount_charged, currency, kind, libro_id")
    .eq("id", paymentId)
    .maybeSingle();
  if (!pago) return { estado: "error" };

  const esLibro = pago.kind === "book";
  const [{ data: perfil }, { data: libro }] = await Promise.all([
    esLibro ? Promise.resolve({ data: null }) : admin.from("profiles").select("membership_expires_at").eq("id", pago.user_id).maybeSingle(),
    esLibro && pago.libro_id ? admin.from("libros_catalogo").select("title").eq("id", pago.libro_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  return {
    estado: "ok",
    tipo: esLibro ? "libro" : "membresia",
    libroId: esLibro ? pago.libro_id : null,
    libroTitulo: libro?.title ?? null,
    venceEl: perfil?.membership_expires_at ?? null,
    montoUsd: Number(pago.amount_usd),
    montoCobrado: Number(pago.amount_charged),
    moneda: pago.currency,
    referencia,
  };
}

// Verifica con la pasarela el pago al que la persona acaba de volver y, si
// está aprobado, activa la membresía. Es idempotente: se puede llamar de
// nuevo ("Revisar otra vez") sin cobrar ni sumar días dos veces.
export async function confirmarPago(proveedor: ConfirmProvider, referencia: string): Promise<ConfirmResult> {
  try {
    if (proveedor === "wompi") {
      const cfg = wompiConfig();
      if (!cfg || !referencia) return { estado: "error" };
      const tx = await fetchWompiTransaction(cfg, referencia);
      if (!tx) return { estado: "error" };

      const resultado = await processWompiTransaction(tx);
      if (resultado === "aprobado") return detallesDelPago(tx.reference, tx.id);
      return { estado: resultado };
    }

    if (proveedor === "paypal") {
      const cfg = paypalConfig();
      if (!cfg || !referencia) return { estado: "error" };

      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { estado: "sin-sesion" };

      const admin = createAdminClient();
      const { data: pago } = await admin
        .from("membership_payments")
        .select("id, user_id")
        .eq("provider", "paypal")
        .eq("provider_ref", referencia)
        .maybeSingle();
      if (!pago || pago.user_id !== user.id) return { estado: "error" };

      const captura = await captureOrConfirmOrder(cfg, referencia);
      if (!captura) return { estado: "error" };
      if (captura.status === "PENDING") return { estado: "pendiente" };
      if (captura.status !== "COMPLETED") {
        await markPaymentFailed(pago.id, "declined");
        return { estado: "rechazado" };
      }

      const r = await approvePayment(pago.id, referencia, { amount: captura.amount, currency: captura.currency });
      return r.ok ? detallesDelPago(pago.id, referencia) : { estado: "error" };
    }
  } catch {
    return { estado: "error" };
  }
  return { estado: "error" };
}
