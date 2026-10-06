import "server-only";

export type PaypalConfig = { clientId: string; secret: string; apiBase: string };

// Devuelve null mientras falte alguna variable: el cobro con PayPal queda
// desactivado en vez de funcionar a medias. PAYPAL_ENV=live para producción;
// cualquier otro valor usa el sandbox.
export function paypalConfig(): PaypalConfig | null {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !secret) return null;
  return {
    clientId,
    secret,
    apiBase: process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com",
  };
}

async function accessToken(cfg: PaypalConfig): Promise<string> {
  const res = await fetch(`${cfg.apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${cfg.clientId}:${cfg.secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("PayPal rechazó las credenciales");
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("PayPal no devolvió token");
  return json.access_token;
}

export async function createPaypalOrder(
  cfg: PaypalConfig,
  p: { paymentId: string; amountUsd: number; returnUrl: string; cancelUrl: string; description?: string }
): Promise<{ orderId: string; approveUrl: string }> {
  const token = await accessToken(cfg);
  const res = await fetch(`${cfg.apiBase}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "PayPal-Request-Id": p.paymentId },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: p.paymentId,
          custom_id: p.paymentId,
          description: (p.description ?? "Membresía PRISMA · 1 mes").slice(0, 120),
          amount: { currency_code: "USD", value: p.amountUsd.toFixed(2) },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "PRISMA",
            locale: "es-EC",
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
            return_url: p.returnUrl,
            cancel_url: p.cancelUrl,
          },
        },
      },
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("PayPal no pudo crear la orden");
  const json = (await res.json()) as { id?: string; links?: { rel: string; href: string }[] };
  const approveUrl = json.links?.find((l) => l.rel === "payer-action" || l.rel === "approve")?.href;
  if (!json.id || !approveUrl) throw new Error("PayPal no devolvió el enlace de pago");
  return { orderId: json.id, approveUrl };
}

export type PaypalCapture = { status: string; amount: number; currency: string } | null;

type PaypalOrder = {
  status?: string;
  purchase_units?: { payments?: { captures?: { status?: string; amount?: { value?: string; currency_code?: string } }[] } }[];
};

function leerCaptura(order: PaypalOrder): PaypalCapture {
  const c = order.purchase_units?.[0]?.payments?.captures?.[0];
  if (!c?.status || !c.amount?.value || !c.amount.currency_code) return null;
  return { status: c.status, amount: Number(c.amount.value), currency: c.amount.currency_code };
}

// Captura la orden (cobra de verdad). Si ya estaba capturada —por ejemplo
// el usuario recarga la página de retorno— consulta la orden y devuelve el
// estado real de la captura existente.
export async function captureOrConfirmOrder(cfg: PaypalConfig, orderId: string): Promise<PaypalCapture> {
  if (!/^[\w-]{5,40}$/.test(orderId)) return null;
  const token = await accessToken(cfg);
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const res = await fetch(`${cfg.apiBase}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: { ...headers, "PayPal-Request-Id": `capture-${orderId}` },
    cache: "no-store",
  });
  if (res.ok) return leerCaptura((await res.json()) as PaypalOrder);

  const consulta = await fetch(`${cfg.apiBase}/v2/checkout/orders/${encodeURIComponent(orderId)}`, { headers, cache: "no-store" });
  if (!consulta.ok) return null;
  return leerCaptura((await consulta.json()) as PaypalOrder);
}
