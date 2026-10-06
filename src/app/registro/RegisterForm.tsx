"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signUp, type AuthState } from "@/lib/auth/actions";
import { resolveReferrerName } from "@/lib/membership/actions";
import styles from "@/styles/auth-screen.module.css";

const initialState: AuthState = { error: null };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldId = "nombre" | "apellido" | "correo" | "clave" | "clave2";

const REGLAS: Record<FieldId, (values: Record<FieldId, string>) => boolean> = {
  nombre: (v) => v.nombre.trim() !== "",
  apellido: (v) => v.apellido.trim() !== "",
  correo: (v) => EMAIL_RE.test(v.correo.trim()),
  clave: (v) => v.clave.length >= 8,
  clave2: (v) => v.clave2 !== "" && v.clave2 === v.clave,
};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const refCode = useSearchParams().get("ref") ?? "";
  const [referrerName, setReferrerName] = useState<string | null>(null);

  useEffect(() => {
    if (!refCode) return;
    resolveReferrerName(refCode).then(setReferrerName);
  }, [refCode]);

  const [values, setValues] = useState<Record<FieldId, string>>({
    nombre: "",
    apellido: "",
    correo: "",
    clave: "",
    clave2: "",
  });
  const [invalid, setInvalid] = useState<Partial<Record<FieldId, boolean>>>({});
  const [showClave, setShowClave] = useState(false);
  const [showClave2, setShowClave2] = useState(false);
  const [terminosTocado, setTerminosTocado] = useState(false);
  const [terminos, setTerminos] = useState(false);

  function setValue(id: FieldId, value: string) {
    const next = { ...values, [id]: value };
    setValues(next);
    if (invalid[id]) {
      setInvalid((prev) => ({ ...prev, [id]: !REGLAS[id](next) }));
    }
  }

  function onBlur(id: FieldId) {
    if (values[id] === "") return;
    setInvalid((prev) => ({ ...prev, [id]: !REGLAS[id](values) }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    const bad: Partial<Record<FieldId, boolean>> = {};
    let ok = true;
    (Object.keys(REGLAS) as FieldId[]).forEach((id) => {
      const bien = REGLAS[id](values);
      bad[id] = !bien;
      ok = ok && bien;
    });
    setInvalid(bad);
    setTerminosTocado(true);

    if (!ok || !terminos) {
      e.preventDefault();
    }
  }

  return (
    <>
      <form action={formAction} onSubmit={onSubmit} noValidate className={styles.form}>
        <input type="hidden" name="ref" value={refCode} />
        {referrerName && (
          <p className={styles.ayuda} style={{ margin: "-8px 0 4px" }}>
            Te invitó <b>{referrerName}</b>.
          </p>
        )}
        <div className={styles.dos}>
          <Field
            id="nombre"
            label="Nombre"
            type="text"
            placeholder="Ej. María"
            autoComplete="given-name"
            value={values.nombre}
            invalid={!!invalid.nombre}
            error="Escribe tu nombre."
            onChange={(v) => setValue("nombre", v)}
            onBlur={() => onBlur("nombre")}
          />
          <Field
            id="apellido"
            label="Apellido"
            type="text"
            placeholder="Ej. Pérez"
            autoComplete="family-name"
            value={values.apellido}
            invalid={!!invalid.apellido}
            error="Escribe tu apellido."
            onChange={(v) => setValue("apellido", v)}
            onBlur={() => onBlur("apellido")}
          />
        </div>

        <Field
          id="correo"
          label="Correo electrónico"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          autoComplete="email"
          value={values.correo}
          invalid={!!invalid.correo}
          error="Revisa tu correo, parece incompleto."
          onChange={(v) => setValue("correo", v)}
          onBlur={() => onBlur("correo")}
        />

        <div className={styles.campo}>
          <label htmlFor="celular">
            Celular <span className={styles.opcional}>(opcional)</span>
          </label>
          <input
            className={styles.inputField}
            id="celular"
            name="celular"
            type="tel"
            placeholder="Ej. 099 123 4567"
            autoComplete="tel"
          />
          <span className={styles.ayuda}>
            Te avisaremos por mensaje de tus actividades si lo deseas.
          </span>
        </div>

        <div className={styles.dos}>
          <div className={`${styles.campo} ${invalid.clave ? styles.campoInvalido : ""}`}>
            <label htmlFor="clave">Contraseña</label>
            <div className={styles.clave}>
              <input
                className={styles.inputField}
                id="clave"
                name="clave"
                type={showClave ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                value={values.clave}
                onChange={(e) => setValue("clave", e.target.value)}
                onBlur={() => onBlur("clave")}
              />
              <button
                type="button"
                className={styles.mostrar}
                onClick={() => setShowClave((v) => !v)}
                aria-pressed={showClave}
                aria-controls="clave"
              >
                {showClave ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {invalid.clave ? (
              <span className={styles.errorMsg}>Debe tener al menos 8 caracteres.</span>
            ) : (
              <span className={styles.ayuda}>Mínimo 8 caracteres.</span>
            )}
          </div>

          <div className={`${styles.campo} ${invalid.clave2 ? styles.campoInvalido : ""}`}>
            <label htmlFor="clave2">Repite la contraseña</label>
            <div className={styles.clave}>
              <input
                className={styles.inputField}
                id="clave2"
                name="clave2"
                type={showClave2 ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                value={values.clave2}
                onChange={(e) => setValue("clave2", e.target.value)}
                onBlur={() => onBlur("clave2")}
              />
              <button
                type="button"
                className={styles.mostrar}
                onClick={() => setShowClave2((v) => !v)}
                aria-pressed={showClave2}
                aria-controls="clave2"
              >
                {showClave2 ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {invalid.clave2 && (
              <span className={styles.errorMsg}>Las contraseñas no coinciden.</span>
            )}
          </div>
        </div>

        <div className={styles.separadorLinea} />

        <label className={styles.terminos}>
          <input
            type="checkbox"
            id="terminos"
            name="terminos"
            checked={terminos}
            onChange={(e) => {
              setTerminos(e.target.checked);
              setTerminosTocado(true);
            }}
          />
          <span>
            Acepto los <Link href="/terminos">términos de uso</Link> y la{" "}
            <Link href="/privacidad">política de privacidad</Link>.
          </span>
        </label>
        {terminosTocado && !terminos && (
          <p className={styles.errorMsg} style={{ marginTop: "-10px" }}>
            Necesitas aceptar los términos para continuar.
          </p>
        )}

        {state.error && <p className={styles.errorMsg}>{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className={`${styles.btn} ${styles.btnPrincipal}`}
        >
          {pending ? "Creando tu cuenta..." : "Crear mi cuenta"}
        </button>

        <div className={styles.seguro}>
          <ShieldIcon />
          Tus datos están protegidos y nunca los compartimos.
        </div>
      </form>

      <p className={styles.registro}>
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </>
  );
}

function Field({
  id,
  label,
  type,
  placeholder,
  autoComplete,
  value,
  invalid,
  error,
  onChange,
  onBlur,
}: {
  id: FieldId;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  value: string;
  invalid: boolean;
  error: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  return (
    <div className={`${styles.campo} ${invalid ? styles.campoInvalido : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input
        className={styles.inputField}
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      {invalid && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#aebd52"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
