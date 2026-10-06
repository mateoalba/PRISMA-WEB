"use client";

import { useActionState } from "react";
import { changePassword, type PasswordState } from "@/lib/auth/actions";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";

const initialState: PasswordState = { error: null, success: false };

export function PasswordForm() {
  const [state, formAction] = useActionState(changePassword, initialState);

  return (
    <form action={formAction} className="flex max-w-sm flex-col gap-4">
      <Input id="password" name="password" type="password" label="Contraseña nueva" autoComplete="new-password" required minLength={8} />
      <Input
        id="passwordConfirm"
        name="passwordConfirm"
        type="password"
        label="Confirma la contraseña"
        autoComplete="new-password"
        required
        minLength={8}
      />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-brand">Contraseña actualizada.</p>}

      <SubmitButton>Guardar contraseña</SubmitButton>
    </form>
  );
}
