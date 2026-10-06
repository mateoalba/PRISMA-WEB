"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DIMENSIONS } from "@/lib/dimensions";
import { completeOnboarding } from "@/lib/onboarding/actions";
import styles from "@/styles/interests-dialog.module.css";

export function InterestsDialog({ name }: { name: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    const preventCancel = (e: Event) => e.preventDefault();
    dialog?.addEventListener("cancel", preventCancel);
    return () => dialog?.removeEventListener("cancel", preventCancel);
  }, []);

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      prev.size === DIMENSIONS.length ? new Set() : new Set(DIMENSIONS.map((d) => d.slug))
    );
  }

  function finish(interests: string[]) {
    startTransition(async () => {
      await completeOnboarding(interests);
      router.push("/dashboard");
      router.refresh();
    });
  }

  const n = selected.size;

  return (
    <div className={styles.pagina}>
      <div className={`${styles.orbe} ${styles.orbeUno}`} />
      <div className={`${styles.orbe} ${styles.orbeDos}`} />

      <dialog
        ref={dialogRef}
        className={styles.ventana}
        aria-labelledby="titulo-intereses"
        aria-describedby="desc-intereses"
      >
        <form
          method="dialog"
          style={{ display: "contents" }}
          onSubmit={(e) => {
            e.preventDefault();
            finish([...selected]);
          }}
        >
          <div className={styles.cuerpo}>
            <div className={styles.encabezado}>
              <div className={styles.encabezadoTexto}>
                <div className={styles.eyebrow}>¡Bienvenido/a, {name}! · Primer paso</div>
                <h1 id="titulo-intereses">
                  ¿Qué te gustaría <span className={styles.enfasis}>explorar?</span>
                </h1>
                <p id="desc-intereses">
                  Elige los temas que más te interesan y te mostraremos primero lo que va
                  contigo. Puedes cambiarlos cuando quieras desde tu perfil.
                </p>
              </div>
            </div>

            <div className={styles.accionesRapidas}>
              <span className={styles.contador} role="status" aria-live="polite">
                {n === 0 ? (
                  "Aún no has elegido ninguno"
                ) : (
                  <>
                    <strong>{n}</strong> {n === 1 ? "tema elegido" : "temas elegidos"}
                  </>
                )}
              </span>
              <button type="button" className={styles.enlaceBtn} onClick={toggleAll}>
                {n === DIMENSIONS.length ? "Quitar todas" : "Elegir todas"}
              </button>
            </div>

            <fieldset className={styles.opciones}>
              <legend
                className={styles.eyebrow}
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  clip: "rect(0 0 0 0)",
                }}
              >
                Dimensiones de PRISMA
              </legend>
              {DIMENSIONS.map((d) => (
                <label key={d.slug} className={styles.opcion}>
                  <input
                    type="checkbox"
                    checked={selected.has(d.slug)}
                    onChange={() => toggle(d.slug)}
                  />
                  <FacetIcon />
                  <span className={styles.opcionTexto}>
                    <span className={styles.opcionTitulo}>{d.title}</span>
                    <span className={styles.opcionSub}>{d.short}</span>
                  </span>
                  <span className={styles.opcionCheck} aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#181712"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  </span>
                </label>
              ))}
            </fieldset>
          </div>

          <div className={styles.pie}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnTexto}`}
              disabled={pending}
              onClick={() => finish([])}
            >
              Omitir por ahora
            </button>
            <span className={styles.nota}>
              {n === 0 ? "Elige al menos uno para continuar" : "Podrás cambiarlos cuando quieras"}
            </span>
            <button
              type="submit"
              className={`${styles.btn} ${styles.btnPrincipal}`}
              disabled={n === 0 || pending}
            >
              {pending ? "Guardando..." : "Continuar"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

function FacetIcon() {
  return (
    <svg className={styles.opcionIcono} viewBox="0 0 40 40" fill="var(--olive-light)" aria-hidden="true">
      <polygon points="8,4 32,4 20,18" opacity=".95" />
      <polygon points="8,4 20,18 8,22" opacity=".55" />
      <polygon points="20,18 32,22 20,36" opacity=".8" />
      <polygon points="8,22 20,18 20,36" opacity=".4" />
    </svg>
  );
}
