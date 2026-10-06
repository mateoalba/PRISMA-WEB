import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getLibro } from "@/lib/novedades/libros-actions";
import { calcularAcceso } from "@/lib/libros/access";
import { urlsMuestra } from "@/lib/libros/files";
import { wompiConfig } from "@/lib/membership/wompi";
import { LectorMuestra } from "./LectorMuestra";

export const metadata: Metadata = { title: "Leer la muestra | Prisma", robots: { index: false, follow: false } };

// La muestra solo se lee con sesión y dentro de la prueba gratis (o si ya se
// tiene el libro). Sin acceso se vuelve a la ficha.
export default async function LeerPage({ params }: PageProps<"/libros/[id]/leer">) {
  const { id } = await params;
  const libro = await getLibro(id);
  if (!libro || !libro.hasPdf) notFound();

  const acceso = await calcularAcceso(libro.id);
  if (acceso.estado === "anonimo") redirect(`/login?next=${encodeURIComponent(`/libros/${libro.id}/leer`)}`);
  if (acceso.estado === "bloqueado") redirect(`/libros/${libro.id}?acceso=denegado`);

  const paginas = await urlsMuestra(libro.id, libro.previewPages);
  if (paginas.length === 0) notFound();

  const cfg = wompiConfig();
  return (
    <LectorMuestra
      libroId={libro.id}
      titulo={libro.title}
      totalPaginas={libro.totalPages}
      precio={libro.price}
      precioCop={cfg ? Math.round(libro.price * cfg.copPerUsd) : null}
      paginas={paginas}
      tieneAcceso={acceso.estado === "descarga"}
      diasPrueba={acceso.diasPrueba}
    />
  );
}
