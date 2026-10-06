import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";
import { approvePayment, markPaymentFailed, type ApproveResult } from "./payments";

export type WompiConfig = {
  publicKey: string;
  integritySecret: string;
  eventsSecret: string;
  copPerUsd: number;
  apiBase: string;
};

// Devuelve null mientras falte alguna variable: el cobro con Wompi queda
// desactivado en vez de funcionar a medias.
export function wompiConfig(): WompiConfig | null {
  const publicKey = process.env.WOMPI_PUBLIC_KEY?.trim();
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET?.trim();
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET?.trim();
  const copPerUsd = Number(process.env.WOMPI_COP_PER_USD);
  if (!publicKey || !integritySecret || !eventsSecret || !(copPerUsd > 0)) return null;
  const produccion = publicKey.startsWith("pub_prod_");
  return {
    publicKey,
    integritySecret,
    eventsSecret,
    copPerUsd,
    apiBase: produccion ? "https://production.wompi.co/v1" : "https://sandbox.wompi.co/v1",
  };
}

function sha256(texto: string) {
  return createHash("sha256").update(texto).digest("hex");
}

export function buildWompiCheckoutUrl(cfg: WompiConfig, p: { reference: string; amountInCents: number; redirectUrl: string }) {
  const url = new URL("https://checkout.wompi.co/p/");
  url.searchParams.set("public-key", cfg.publicKey);
  url.searchParams.set("currency", "COP");
  url.searchParams.set("amount-in-cents", String(p.amountInCents));
  url.searchParams.set("reference", p.reference);
  url.searchParams.set("signature:integrity", sha256(`${p.reference}${p.amountInCents}COP${cfg.integritySecret}`));
  url.searchParams.set("redirect-url", p.redirectUrl);
  return url.toString();
}

type WompiEvent = {
  event?: string;
  data?: Record<string, unknown>;
  signature?: { properties?: unknown; checksum?: unknown };
  timestamp?: unknown;
};

// Verifica la firma del evento: SHA256 de los valores de las propiedades
// indicadas + timestamp + secreto de eventos, comparado con el checksum.
export function verifyWompiEvent(eventsSecret: string, event: WompiEvent): boolean {
  const props = event.signature?.properties;
  const checksum = event.signature?.checksum;
  if (!Array.isArray(props) || typeof checksum !== "string" || event.timestamp == null || !event.data) return false;

  let concatenado = "";
  for (const ruta of props) {
    if (typeof ruta !== "string") return false;
    let valor: unknown = event.data;
    for (const clave of ruta.split(".")) {
      valor = valor && typeof valor === "object" ? (valor as Record<string, unknown>)[clave] : undefined;
    }
    if (valor == null) return false;
    concatenado += String(valor);
  }
  concatenado += String(event.timestamp) + eventsSecret;

  const esperado = Buffer.from(sha256(concatenado), "utf8");
  const recibido = Buffer.from(checksum.toLowerCase(), "utf8");
  return esperado.length === recibido.length && timingSafeEqual(esperado, recibido);
}

export type WompiTransaction = {
  id: string;
  status: string;
  reference: string;
  amount_in_cents: number;
  currency: string;
};

function esTransaccion(x: unknown): x is WompiTransaction {
  if (!x || typeof x !== "object") return false;
  const t = x as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.status === "string" &&
    typeof t.reference === "string" &&
    typeof t.amount_in_cents === "number" &&
    typeof t.currency === "string"
  );
}

// Consulta la transacción directamente a Wompi: es la fuente de verdad
// cuando el usuario vuelve al sitio, sin depender de que ya haya llegado
// el webhook.
export async function fetchWompiTransaction(cfg: WompiConfig, id: string): Promise<WompiTransaction | null> {
  if (!/^[\w-]{3,64}$/.test(id)) return null;
  const res = await fetch(`${cfg.apiBase}/transactions/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: unknown };
  return esTransaccion(json.data) ? json.data : null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type WompiOutcome = "aprobado" | "pendiente" | "rechazado" | "error";

// Aplica el resultado de una transacción de Wompi a nuestro pago. La
// referencia que enviamos al crear el checkout es el id de nuestro pago.
export async function processWompiTransaction(tx: WompiTransaction): Promise<WompiOutcome> {
  if (!UUID.test(tx.reference)) return "error";

  if (tx.status === "APPROVED") {
    const r: ApproveResult = await approvePayment(tx.reference, tx.id, { amount: tx.amount_in_cents / 100, currency: tx.currency });
    return r.ok ? "aprobado" : "error";
  }
  if (tx.status === "DECLINED" || tx.status === "VOIDED") {
    await markPaymentFailed(tx.reference, "declined");
    return "rechazado";
  }
  if (tx.status === "ERROR") {
    await markPaymentFailed(tx.reference, "error");
    return "error";
  }
  return "pendiente";
}
