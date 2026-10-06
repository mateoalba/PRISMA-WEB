"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/educacion-continua.module.css";
import type { Microcurso } from "@/lib/learning/courses-actions";

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

function FlechaIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Microcursos({ cursos }: { cursos: Microcurso[] }) {
  const temas = useMemo(() => ["Todos", ...Array.from(new Set(cursos.map((c) => c.topic)))], [cursos]);
  const [tema, setTema] = useState("Todos");
  const [hover, setHover] = useState<Microcurso | null>(null);

  const visibles = tema === "Todos" ? cursos : cursos.filter((c) => c.topic === tema);

  if (cursos.length === 0) {
    return (
      <section className={styles.bloque} aria-labelledby="micro-titulo">
        <div className={styles.eyebrow}>Aprende en minutos</div>
        <h2 className={styles.seccion} id="micro-titulo">
          Micro<span className={styles.enfasis}>cursos</span>
        </h2>
        <div className={styles.vacio}>Todavía no hay microcursos publicados.</div>
      </section>
    );
  }

  return (
    <section className={styles.bloque} aria-labelledby="micro-titulo">
      <div className={styles.microCab}>
        <div>
          <div className={styles.eyebrow}>Aprende en minutos</div>
          <h2 className={styles.seccion} id="micro-titulo">
            Micro<span className={styles.enfasis}>cursos</span>
          </h2>
          <p>Sesiones cortas de cultura, arte y tecnología práctica para el día a día.</p>
        </div>
        <div className={styles.temas} role="group" aria-label="Filtrar microcursos">
          {temas.map((t) => (
            <button
              key={t}
              type="button"
              className={`${styles.tema} ${t === tema ? styles.temaActivo : ""}`}
              aria-pressed={t === tema}
              onClick={() => setTema(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.indiceConVista}>
        <ol className={styles.indiceLista + " " + styles.indice} onMouseLeave={() => setHover(null)}>
          {visibles.map((m, i) => (
            <li key={m.id} className={styles.item}>
              <button type="button" className={styles.itemBoton} onMouseEnter={() => setHover(m)} onFocus={() => setHover(m)}>
                <span className={styles.itemNum} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className={styles.itemTitulo}>{m.title}</span>
                  <span className={styles.itemDesc}>{m.description}</span>
                </span>
                <span className={styles.itemMeta}>
                  {m.progressPct > 0 ? (
                    <span className={styles.miniProg}>
                      <Anillito pct={m.progressPct} />
                      {m.progressPct}% completado
                    </span>
                  ) : m.isNuevo ? (
                    <span className={styles.estadoNuevo}>Nuevo</span>
                  ) : null}
                  <small>
                    {m.topic} · {m.leccionesCount} lecciones · {m.totalMinutes} min
                  </small>
                </span>
                <span className={styles.itemIr} aria-hidden="true">
                  <FlechaIcon />
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className={styles.vistaPanel} aria-hidden="true">
          <div className={styles.ph}>
            <span>Imagen: {hover ? hover.title : "elige un microcurso"}</span>
          </div>
          <span className={styles.vistaBorde} />
        </div>
      </div>
    </section>
  );
}
