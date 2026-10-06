import type { Metadata } from "next";
import Link from "next/link";
import { RecoverForm } from "./RecoverForm";

export const metadata: Metadata = { title: "Recuperar contraseña | Prisma" };

export default function RecoverPage() {
  return (
    <>
      <h1 className="mb-2 text-xl font-bold text-foreground">
        Recupera tu contraseña
      </h1>
      <p className="mb-6 text-sm text-foreground/70">
        Ingresa el correo con el que te registraste y te enviaremos un enlace
        para crear una nueva contraseña.
      </p>
      <RecoverForm />
      <p className="mt-6 text-center text-sm text-foreground/70">
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </>
  );
}
