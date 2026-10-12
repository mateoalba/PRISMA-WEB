import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rutaInternaSegura } from "@/lib/auth/safe-next";

// Recibe el redirect de OAuth (Google) y de enlaces mágicos de Supabase:
// intercambia el código por una sesión y continúa hacia `next`.
export async function GET(request: Request) {
  const { searchParams, origin: origenPeticion } = new URL(request.url);
  // Detrás del proxy del servidor (Caddy) la petición llega por http y
  // 127.0.0.1; la dirección pública sale de APP_URL cuando está definida.
  const origin = process.env.APP_URL?.trim().replace(/\/$/, "") || origenPeticion;
  const code = searchParams.get("code");
  const next = rutaInternaSegura(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
