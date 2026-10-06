import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmandoPago } from "./ConfirmandoPago";

export const metadata: Metadata = {
  title: "Confirmando tu pago | Prisma",
  robots: { index: false, follow: false },
};

// Wompi vuelve con ?id=<transacción>; PayPal vuelve con ?token=<orden>.
export default async function ConfirmandoPage({ params, searchParams }: PageProps<"/membresia/confirmando/[proveedor]">) {
  const { proveedor } = await params;
  if (proveedor !== "wompi" && proveedor !== "paypal") notFound();

  const query = await searchParams;
  const clave = proveedor === "wompi" ? "id" : "token";
  const valor = query[clave];
  const referencia = typeof valor === "string" ? valor : "";

  return <ConfirmandoPago proveedor={proveedor} referencia={referencia} />;
}
