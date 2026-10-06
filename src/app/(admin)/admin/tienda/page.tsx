import type { Metadata } from "next";
import { getAllProducts, getCategories } from "@/lib/tienda/products-actions";
import { TiendaClient } from "./TiendaClient";

export const metadata: Metadata = { title: "Tienda | Panel admin Prisma" };

export default async function AdminTiendaPage() {
  const [productos, categorias] = await Promise.all([getAllProducts(), getCategories()]);
  return <TiendaClient initialProducts={productos} categorias={categorias} />;
}
