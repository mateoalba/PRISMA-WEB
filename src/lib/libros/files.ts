import "server-only";

import { createAdminClient } from "@/lib/supabase/server";

const BUCKET_PDF = "libros-pdf";
const BUCKET_MUESTRA = "libros-vista-previa";

// Enlaces temporales a las páginas de muestra (bucket privado). Quien llama
// debe haber comprobado antes que la persona tiene acceso.
export async function urlsMuestra(libroId: string, paginas: number): Promise<string[]> {
  const admin = createAdminClient();
  const rutas = Array.from({ length: paginas }, (_, i) => `${libroId}/p${String(i + 1).padStart(2, "0")}.jpg`);
  const { data } = await admin.storage.from(BUCKET_MUESTRA).createSignedUrls(rutas, 60 * 60);
  return (data ?? []).map((d) => d.signedUrl).filter((u): u is string => !!u);
}

// Enlace de descarga de un minuto; el navegador lo baja con nombre legible.
export async function urlDescarga(pdfPath: string, titulo: string): Promise<string | null> {
  const admin = createAdminClient();
  // Sin tildes ni signos: el nombre pasa dos veces por codificación de URL y
  // un carácter especial llegaría deformado al archivo descargado.
  const limpio = titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ._-]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  const nombre = `${limpio || "libro"}.pdf`;
  const { data } = await admin.storage.from(BUCKET_PDF).createSignedUrl(pdfPath, 60, { download: nombre });
  return data?.signedUrl ?? null;
}
