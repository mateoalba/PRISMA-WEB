import type { Metadata } from "next";
import { getAllNovedades } from "@/lib/admin/novedades-actions";
import { getAllOfertas } from "@/lib/novedades/ofertas-actions";
import { getAllLibros } from "@/lib/novedades/libros-actions";
import { NovedadesClient } from "./NovedadesClient";

export const metadata: Metadata = { title: "Novedades | Panel admin Prisma" };

export default async function AdminNovedadesPage() {
  const [novedades, ofertas, libros] = await Promise.all([getAllNovedades(), getAllOfertas(), getAllLibros()]);
  return <NovedadesClient initialNovedades={novedades} initialOfertas={ofertas} initialLibros={libros} />;
}
