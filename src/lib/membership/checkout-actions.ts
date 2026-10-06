"use server";

import { headers } from "next/headers";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { PRECIO_BASE } from "./pricing";
import { appOrigin, createPendingPayment, recomputeReferrerPrice, setPaymentRef, type PaymentProvider } from "./payments";
import { buildWompiCheckoutUrl, wompiConfig } from "./wompi";
import { createPaypalOrder, paypalConfig } from "./paypal";
import { calcularAcceso } from "@/lib/libros/access";

export type CheckoutResult = { ok: true; url: string } | { ok: false; error: string };

async function origenActual() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return appOrigin(host ? `${proto}://${host}` : undefined);
}

type Cobro = {
  userId: string;
  provider: PaymentProvider;
  precioUsd: number;
  kind: "membership" | "book";
  libroId?: string;
  descripcion: string;
  cancelPath: string;
};

// Crea el pago pendiente y devuelve la URL de la pasarela. El monto sale
// siempre de datos del servidor; el navegador solo elige libro y método.
async function iniciarCobro(c: Cobro): Promise<CheckoutResult> {
  const origen = await origenActual();
  try {
    if (c.provider === "wompi") {
      const cfg = wompiConfig();
      if (!cfg) return { ok: false, error: "Wompi todavía no está configurado." };
      const montoCop = Math.round(c.precioUsd * cfg.copPerUsd);
      const paymentId = await createPendingPayment({
        userId: c.userId,
        provider: "wompi",
        amountUsd: c.precioUsd,
        amountCharged: montoCop,
        currency: "COP",
        kind: c.kind,
        libroId: c.libroId,
      });
      // El firewall de Wompi responde 403 si la URL de retorno es localhost o
      // 127.0.0.1. En desarrollo se usa localtest.me, que apunta a 127.0.0.1.
      const origenWompi = origen.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/, "$1localtest.me");
      return {
        ok: true,
        url: buildWompiCheckoutUrl(cfg, {
          reference: paymentId,
          amountInCents: montoCop * 100,
          redirectUrl: `${origenWompi}/membresia/confirmando/wompi`,
        }),
      };
    }

    const cfg = paypalConfig();
    if (!cfg) return { ok: false, error: "PayPal todavía no está configurado." };
    const paymentId = await createPendingPayment({
      userId: c.userId,
      provider: "paypal",
      amountUsd: c.precioUsd,
      amountCharged: c.precioUsd,
      currency: "USD",
      kind: c.kind,
      libroId: c.libroId,
    });
    const orden = await createPaypalOrder(cfg, {
      paymentId,
      amountUsd: c.precioUsd,
      returnUrl: `${origen}/membresia/confirmando/paypal`,
      cancelUrl: `${origen}${c.cancelPath}`,
      description: c.descripcion,
    });
    await setPaymentRef(paymentId, orden.orderId);
    return { ok: true, url: orden.approveUrl };
  } catch {
    return { ok: false, error: "No pudimos iniciar el pago. Inténtalo de nuevo en unos minutos." };
  }
}

function proveedorValido(p: string): p is PaymentProvider {
  return p === "paypal" || p === "wompi";
}

export async function startMembershipCheckout(provider: PaymentProvider): Promise<CheckoutResult> {
  if (!proveedorValido(provider)) return { ok: false, error: "Método de pago no válido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Inicia sesión para pagar tu membresía." };

  await recomputeReferrerPrice(user.id);
  const { data: perfil } = await supabase.from("profiles").select("membership_price").eq("id", user.id).maybeSingle();
  return iniciarCobro({
    userId: user.id,
    provider,
    precioUsd: Number(perfil?.membership_price ?? PRECIO_BASE),
    kind: "membership",
    descripcion: "Membresía PRISMA · 1 mes",
    cancelPath: "/perfil?tab=membresia&pago=cancelado",
  });
}

// Compra de un libro suelto: acceso permanente a ese libro, sin membresía.
export async function startBookCheckout(libroId: string, provider: PaymentProvider): Promise<CheckoutResult> {
  if (!proveedorValido(provider)) return { ok: false, error: "Método de pago no válido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Inicia sesión para comprar este libro." };

  const { data: libro } = await createAdminClient().from("libros_catalogo").select("id, title, price, pdf_path").eq("id", libroId).maybeSingle();
  if (!libro || !libro.pdf_path) return { ok: false, error: "Este libro no está disponible para la compra." };
  const precio = Number(libro.price);
  if (!(precio > 0)) return { ok: false, error: "Este libro no tiene precio." };

  const acceso = await calcularAcceso(libroId);
  if (acceso.estado === "descarga") return { ok: false, error: "Ya tienes acceso a este libro." };

  return iniciarCobro({
    userId: user.id,
    provider,
    precioUsd: precio,
    kind: "book",
    libroId,
    descripcion: `Libro: ${libro.title}`,
    cancelPath: `/libros/${libroId}`,
  });
}
