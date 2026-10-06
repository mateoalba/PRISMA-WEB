"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signIn, type AuthState } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";
import styles from "@/styles/auth-screen.module.css";

const initialState: AuthState = { error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setGoogleLoading(false);
    }
  }

  return (
    <>
      <form id="login-form" action={formAction} className={styles.form}>
        <input type="hidden" name="next" value={next} />

        <div className={styles.campo}>
          <label htmlFor="correo">Correo electrónico</label>
          <input
            className={styles.inputField}
            id="correo"
            name="email"
            type="email"
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="clave">Contraseña</label>
          <div className={styles.clave}>
            <input
              className={styles.inputField}
              id="clave"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.mostrar}
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-controls="clave"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>

        <div className={styles.fila}>
          <label className={styles.recordar}>
            <input type="checkbox" name="recordar" defaultChecked />
            Recordarme
          </label>
          <Link href="/recuperar" className={styles.olvide}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {state.error && <p className={styles.errorMsg}>{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className={`${styles.btn} ${styles.btnPrincipal}`}
        >
          {pending ? "Un momento..." : "Iniciar sesión"}
        </button>
      </form>

      <div className={styles.separador}>o también</div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className={`${styles.btn} ${styles.btnSecundario}`}
      >
        <GoogleIcon />
        {googleLoading ? "Conectando..." : "Iniciar sesión con Google"}
      </button>

      <p className={styles.registro}>
        ¿No tienes cuenta? <Link href="/registro">Regístrate gratis</Link>
      </p>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 34.7 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.7 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.6C41.9 35.7 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}
