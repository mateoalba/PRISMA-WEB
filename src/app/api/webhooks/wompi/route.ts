import { verifyWompiEvent, wompiConfig, processWompiTransaction, type WompiTransaction } from "@/lib/membership/wompi";

// Wompi avisa aquí cada cambio de estado de una transacción. Se rechaza
// todo evento cuya firma no se pueda verificar con el secreto de eventos.
export async function POST(request: Request) {
  const cfg = wompiConfig();
  if (!cfg) return new Response("Wompi no configurado", { status: 503 });

  let evento: Parameters<typeof verifyWompiEvent>[1];
  try {
    evento = await request.json();
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }

  if (!verifyWompiEvent(cfg.eventsSecret, evento)) return new Response("Firma inválida", { status: 401 });
  if (evento.event !== "transaction.updated") return new Response("ignorado", { status: 200 });

  const tx = (evento.data as { transaction?: WompiTransaction } | undefined)?.transaction;
  if (!tx) return new Response("sin transacción", { status: 400 });

  await processWompiTransaction(tx);
  return new Response("ok", { status: 200 });
}
