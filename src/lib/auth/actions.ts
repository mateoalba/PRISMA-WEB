"use server";

import { rutaInternaSegura } from "./safe-next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error: string | null;
};

export async function signIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = rutaInternaSegura(String(formData.get("next") ?? ""));

  if (!email || !password) {
    return { error: "Ingresa correo y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect(next);
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const email = String(formData.get("correo") ?? "").trim();
  const phone = String(formData.get("celular") ?? "").trim();
  const password = String(formData.get("clave") ?? "");
  const passwordConfirm = String(formData.get("clave2") ?? "");
  const acceptedTerms = formData.get("terminos") === "on";
  const refCode = String(formData.get("ref") ?? "").trim();

  if (!nombre || !apellido || !email || !password) {
    return { error: "Completa todos los campos requeridos." };
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  if (password !== passwordConfirm) {
    return { error: "Las contraseñas no coinciden." };
  }

  if (!acceptedTerms) {
    return { error: "Debes aceptar los términos de uso y la política de privacidad." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${nombre} ${apellido}`.trim(),
        phone: phone || null,
        ref_code: refCode || null,
      },
    },
  });

  if (error) {
    return {
      error:
        error.code === "user_already_exists"
          ? "Ya existe una cuenta con ese correo."
          : error.message,
    };
  }

  redirect("/intereses");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type EmailActionState = {
  error: string | null;
  sent: boolean;
};

export async function requestPasswordReset(
  _prevState: EmailActionState,
  formData: FormData
): Promise<EmailActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Ingresa tu correo.", sent: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    return { error: "No pudimos procesar la solicitud. Intenta de nuevo.", sent: false };
  }

  return { error: null, sent: true };
}

export type PasswordState = { error: string | null; success: boolean };

export async function changePassword(
  _prevState: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres.", success: false };
  }
  if (password !== passwordConfirm) {
    return { error: "Las contraseñas no coinciden.", success: false };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "No se pudo cambiar la contraseña.", success: false };
  }

  return { error: null, success: true };
}
