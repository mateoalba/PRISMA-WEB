import { timingSafeEqual } from "node:crypto";
import { expireLapsedMemberships } from "@/lib/membership/payments";

// Tarea diaria: da de baja las membresías pagadas que vencieron y recalcula
// el precio de quienes refirieron a esas personas. Protegida con
// CRON_SECRET (Vercel Cron lo envía como "Authorization: Bearer ...").
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET?.trim();
  if (!secreto) return new Response("CRON_SECRET no configurado", { status: 503 });

  const recibido = Buffer.from(request.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${secreto}`);
  if (recibido.length !== esperado.length || !timingSafeEqual(recibido, esperado)) {
    return new Response("No autorizado", { status: 401 });
  }

  const vencidas = await expireLapsedMemberships();
  return Response.json({ vencidas });
}
