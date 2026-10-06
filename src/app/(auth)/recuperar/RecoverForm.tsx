"use client";

import { useActionState } from "react";
import { requestPasswordReset, type EmailActionState } from "@/lib/auth/actions";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";

const initialState: EmailActionState = { error: null, sent: false };

export function RecoverForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialState);

  if (state.sent) {
    return (
      <p className="text-sm text-foreground/80">
        Si el correo está registrado, te enviamos un enlace para restablecer tu
        contraseña. Revisa tu bandeja de entrada.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input id="email" name="email" type="email" label="Correo" required autoComplete="email" />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <SubmitButton>Enviar enlace de recuperación</SubmitButton>
    </form>
  );
}
