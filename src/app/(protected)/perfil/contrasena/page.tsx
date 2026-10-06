import type { Metadata } from "next";
import { PasswordForm } from "./PasswordForm";

export const metadata: Metadata = { title: "Cambiar contraseña | Prisma" };

export default function CambiarContrasenaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cambiar contraseña</h1>
        <p className="mt-1 text-foreground/70">Elige una contraseña nueva de al menos 8 caracteres.</p>
      </div>
      <PasswordForm />
    </div>
  );
}
