"use client";

import { useMemo, useState, useTransition } from "react";
import styles from "@/styles/participacion-activa.module.css";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { toggleVolunteerSignup, type VolunteerOpportunity } from "@/lib/participation/volunteer-actions";

function PresencialIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function VirtualIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

export function VolunteerOpportunities({ oportunidades }: { oportunidades: VolunteerOpportunity[] }) {
  const modos = useMemo(() => ["Todas", ...Array.from(new Set(oportunidades.map((o) => o.mode)))], [oportunidades]);
  const [modo, setModo] = useState("Todas");
  const [seleccion, setSeleccion] = useState(0);
  const [joined, setJoined] = useState<Set<string>>(() => new Set(oportunidades.filter((o) => o.joined).map((o) => o.id)));
  const [isPending, startTransition] = useTransition();

  const visibles = modo === "Todas" ? oportunidades : oportunidades.filter((o) => o.mode === modo);
  const actual = visibles[seleccion] ?? visibles[0];

  function elegir(i: number) {
    setSeleccion(i);
  }

  function cambiarFiltro(m: string) {
    setModo(m);
    setSeleccion(0);
  }

  function toggle(id: string) {
    setJoined((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    startTransition(() => {
      toggleVolunteerSignup(id);
    });
  }

  if (oportunidades.length === 0) {
    return (
      <section className={styles.bloque} aria-labelledby="op-titulo">
        <div className={styles.cab}>
          <div>
            <div className={styles.eyebrow}>Tu aporte hace la diferencia</div>
            <h2 className={styles.seccion} id="op-titulo">
              Oportunidades de <span className={styles.enfasis}>voluntariado</span>
            </h2>
          </div>
        </div>
        <p>Todavía no hay oportunidades publicadas. Vuelve pronto.</p>
      </section>
    );
  }

  return (
    <section className={styles.bloque} aria-labelledby="op-titulo">
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Tu aporte hace la diferencia</div>
          <h2 className={styles.seccion} id="op-titulo">
            Oportunidades de <span className={styles.enfasis}>voluntariado</span>
          </h2>
          <p>Proyectos comunitarios donde tu experiencia es justo lo que falta.</p>
        </div>
        <div className={styles.filtros} role="group" aria-label="Filtrar oportunidades">
          {modos.map((m) => (
            <button
              key={m}
              type="button"
              className={`${styles.filtro} ${m === modo ? styles.filtroOn : ""}`}
              aria-pressed={m === modo}
              onClick={() => cambiarFiltro(m)}
            >
              {m === "Todas" ? "Todas" : m === "presencial" ? "Presencial" : "Virtual"}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.opGrid}>
        <div>
          <ul className={styles.ops}>
            {visibles.map((o, i) => {
              const seatsFree = o.totalSeats - o.seatsTaken;
              return (
                <li key={o.id} className={`${styles.op} ${i === seleccion ? styles.opOn : ""}`}>
                  <button type="button" className={styles.opBoton} aria-pressed={i === seleccion} onClick={() => elegir(i)}>
                    <span>
                      <span className={styles.opTitulo}>{o.title}</span>
                      <span className={styles.opDesc}>{o.description}</span>
                      <span className={styles.opLugar}>
                        {o.mode === "virtual" ? <VirtualIcon /> : <PresencialIcon />}
                        {o.place} · {o.mode === "virtual" ? "Virtual" : "Presencial"}
                      </span>
                    </span>
                    <span className={styles.plazas} aria-label={`${seatsFree} plazas libres de ${o.totalSeats}`}>
                      <span className={styles.asientos} aria-hidden="true">
                        {Array.from({ length: o.totalSeats }, (_, k) => (
                          <i key={k} className={`${styles.asiento} ${k < seatsFree ? styles.asientoLibre : ""}`} />
                        ))}
                      </span>
                      <small className={`${styles.plazasTexto} ${seatsFree <= 2 ? styles.plazasPocas : ""}`}>
                        {seatsFree <= 0 ? "Sin plazas por ahora" : seatsFree <= 2 ? `¡Últimas ${seatsFree} plazas!` : `${seatsFree} plazas libres`}
                      </small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        {actual && (
          <article className={styles.vista} aria-live="polite">
            <div className={styles.vistaImg}>
              <ImagePlaceholder label={actual.title} />
            </div>
            <div className={styles.vistaCuerpo}>
              <div className={styles.eyebrow}>Rol: {actual.roleLabel}</div>
              <h3>{actual.title}</h3>
              <p>{actual.description}</p>
              <div className={styles.datos}>
                <span>
                  Cuándo<b>{actual.scheduleText}</b>
                </span>
                <span>
                  Compromiso<b>{actual.commitmentText}</b>
                </span>
                <span>
                  Lugar<b>{actual.place}</b>
                </span>
                <span>
                  Plazas<b>{actual.totalSeats - actual.seatsTaken} de {actual.totalSeats}</b>
                </span>
              </div>
              <div>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnP}`}
                  aria-pressed={joined.has(actual.id)}
                  disabled={isPending || (!joined.has(actual.id) && actual.seatsTaken >= actual.totalSeats)}
                  onClick={() => toggle(actual.id)}
                >
                  {joined.has(actual.id) ? "✓ Te inscribiste" : "Quiero participar"}
                </button>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
