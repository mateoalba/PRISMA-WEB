// Solo se aceptan rutas internas del propio sitio como destino tras iniciar
// sesión. Cualquier otra cosa ("https://…", "//sitio", "/\sitio", "@sitio")
// se descarta para que ?next= no sirva para llevar a alguien a otro dominio.
export function rutaInternaSegura(next: string | null | undefined, porDefecto = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return porDefecto;
  if (/[\u0000-\u001f]/.test(next)) return porDefecto;
  return next;
}
