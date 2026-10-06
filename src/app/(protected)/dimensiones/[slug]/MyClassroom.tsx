"use client";

import { useEffect, useState, useTransition, type CSSProperties } from "react";
import styles from "@/styles/educacion-continua.module.css";
import { completeLesson, type ClassroomState } from "@/lib/learning/courses-actions";

function Anillito({ pct }: { pct: number }) {
  const c = 2 * Math.PI * 14;
  return (
    <svg className={styles.anillitoSvg} viewBox="0 0 34 34" aria-hidden="true">
      <circle cx={17} cy={17} r={14} stroke="var(--hair)" fill="none" strokeWidth={4} />
      <circle
        cx={17}
        cy={17}
        r={14}
        stroke="#c7d873"
        fill="none"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        transform="rotate(-90 17 17)"
      />
    </svg>
  );
}

const ESTADO_LABEL = { hecha: "Completada", actual: "En curso", bloq: "Próximamente" } as const;

export function MyClassroom({ state }: { state: ClassroomState }) {
  const [barraLista, setBarraLista] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const id = requestAnimationFrame(() => setBarraLista(true));
    return () => cancelAnimationFrame(id);
  }, [state.course?.id]);

  if (!state.course) {
    return (
      <section className={styles.bloque} aria-labelledby="aula-titulo">
        <div className={styles.eyebrow}>Mi aula de aprendizaje</div>
        <h2 className={styles.aulaCurso} id="aula-titulo" style={{ fontSize: 32 }}>
          Todavía no has empezado ningún curso
        </h2>
        <p style={{ color: "var(--ink-soft)", maxWidth: 520 }}>
          Explora los microcursos de abajo y completa tu primera lección para que aparezca aquí tu progreso.
        </p>
      </section>
    );
  }

  const actual = state.lessons.find((l) => l.status === "actual");
  const pctRuta = ((state.completedCount + 0.5) / state.totalCount) * 100;

  function marcarLeccion() {
    if (!actual) return;
    startTransition(() => {
      completeLesson(actual.id);
    });
  }

  return (
    <section className={styles.bloque} aria-labelledby="aula-titulo">
      <div className={styles.aula} id="aula">
        <div className={styles.aulaImagen} aria-hidden="true">
          <div className={styles.ph}>
            <span>Imagen: {state.course.title}</span>
          </div>
        </div>
        <div className={styles.aulaTxt}>
          <div className={styles.eyebrow}>Mi aula de aprendizaje · Continúa donde te quedaste</div>
          <h2 className={styles.aulaCurso}>{state.course.title}</h2>
          {actual && (
            <p className={styles.aulaLeccion}>
              Siguiente lección: <b>{actual.title}</b>
            </p>
          )}
          <div className={styles.porcentaje}>
            <span className={styles.porcentajeNum}>
              {state.progressPct}
              <small>%</small>
            </span>
            <span className={styles.porcentajeMeta}>
              <b>
                {state.completedCount} de {state.totalCount}
              </b>{" "}
              lecciones
              <br />
              Te faltan unos <b>{state.minutesRemaining} minutos</b>
              <br />
              Incluye certificado
            </span>
          </div>
          <div
            className={styles.barraLarga}
            role="progressbar"
            aria-valuenow={state.progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso del curso"
          >
            <i style={{ width: barraLista ? `${state.progressPct}%` : "0%" }} />
          </div>
          <div className={styles.aulaAcciones}>
            <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={marcarLeccion} disabled={!actual || isPending}>
              {actual ? "Continuar aprendiendo" : "Curso completado"}
            </button>
          </div>
          {state.otros.length > 0 && (
            <div className={styles.otros}>
              <small>También cursas:</small>
              {state.otros.map((o) => (
                <span key={o.id} className={styles.otro}>
                  <Anillito pct={o.progressPct} />
                  {o.title}
                </span>
              ))}
            </div>
          )}
        </div>
        <ol className={styles.ruta} style={{ "--hecho": `${pctRuta}%` } as CSSProperties} aria-label="Lecciones del curso">
          {state.lessons.map((l) => (
            <li
              key={l.id}
              className={l.status === "hecha" ? styles.rutaHecha : l.status === "actual" ? styles.rutaActual : styles.rutaBloq}
            >
              <b>{l.title}</b>
              <span>
                {l.durationMinutes} min · {ESTADO_LABEL[l.status]}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
