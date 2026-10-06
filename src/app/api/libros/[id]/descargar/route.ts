import { NextResponse } from "next/server";
import { getLibro } from "@/lib/novedades/libros-actions";
import { calcularAcceso } from "@/lib/libros/access";
import { urlDescarga } from "@/lib/libros/files";
import { createAdminClient } from "@/lib/supabase/server";

// Entrega el PDF completo solo a quien tiene la membresía vigente o compró
// ese libro. El archivo vive en un bucket privado: lo único que sale de aquí
// es un enlace temporal de un minuto.
export async function GET(request: Request, { params }: RouteContext<"/api/libros/[id]/descargar">) {
  const { id } = await params;
  const origen = new URL(request.url).origin;

  const libro = await getLibro(id);
  if (!libro) return new NextResponse("Libro no encontrado", { status: 404 });

  const acceso = await calcularAcceso(libro.id);
  if (acceso.estado === "anonimo") {
    return NextResponse.redirect(`${origen}/login?next=${encodeURIComponent(`/libros/${libro.id}`)}`);
  }
  if (acceso.estado !== "descarga") {
    return NextResponse.redirect(`${origen}/libros/${libro.id}?acceso=denegado`);
  }

  // pdf_path no se expone en el tipo público del libro: se lee aparte.
  const { data } = await createAdminClient().from("libros_catalogo").select("pdf_path").eq("id", libro.id).maybeSingle();
  if (!data?.pdf_path) return new NextResponse("Este libro todavía no tiene archivo", { status: 404 });

  const enlace = await urlDescarga(data.pdf_path, libro.title);
  if (!enlace) return new NextResponse("No se pudo preparar la descarga", { status: 500 });
  return NextResponse.redirect(enlace);
}
