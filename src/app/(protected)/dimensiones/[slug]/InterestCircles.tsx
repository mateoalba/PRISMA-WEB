"use client";

import { useMemo, useState, useTransition } from "react";
import styles from "@/styles/conexion-social.module.css";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { joinInterestCircle, leaveInterestCircle, type InterestCircle } from "@/lib/community/circles-actions";

const TONOS = ["#c7d873", "#9fae47", "#b3c35a", "#8a983a", "#d4e57f"];

export function InterestCircles({ circulos }: { circulos: InterestCircle[] }) {
  const temas = useMemo(() => ["Todos", ...Array.from(new Set(circulos.map((c) => c.topic)))], [circulos]);
  const [tema, setTema] = useState("Todos");
  const visibles = useMemo(
    () => (tema === "Todos" ? circulos : circulos.filter((c) => c.topic === tema)),
    [circulos, tema]
  );
  const [seleccionado, setSeleccionado] = useState(0);
  const [cambiando, setCambiando] = useState(false);
  const [joined, setJoined] = useState<Set<string>>(() => new Set(circulos.filter((c) => c.joined).map((c) => c.id)));
  const [isPending, startTransition] = useTransition();

  function elegir(i: number) {
    if (i === seleccionado) return;
    setCambiando(true);
    setTimeout(() => {
      setSeleccionado(i);
      setCambiando(false);
    }, 380);
  }

  function cambiarTema(t: string) {
    setTema(t);
    setSeleccionado(0);
  }

  function toggleUnirse(circleId: string) {
    setJoined((prev) => {
      const next = new Set(prev);
      const isJoined = next.has(circleId);
      if (isJoined) next.delete(circleId);
      else next.add(circleId);
      startTransition(() => {
        if (isJoined) leaveInterestCircle(circleId);
        else joinInterestCircle(circleId);
      });
      return next;
    });
  }

  if (circulos.length === 0) {
    return (
      <section className={styles.bloque} aria-labelledby="ci-titulo">
        <div className={styles.cab}>
          <div>
            <div className={styles.eyebrow}>Encuentra tu grupo</div>
            <h2 className={styles.seccion} id="ci-titulo">
              Círculos de <span className={styles.enfasis}>interés</span>
            </h2>
            <p>Personas que comparten lo que te gusta. Elige un círculo para conocerlo.</p>
          </div>
        </div>
        <div className={styles.vacio}>Todavía no hay círculos de interés creados. Vuelve pronto.</div>
      </section>
    );
  }

  const actual = visibles[Math.min(seleccionado, visibles.length - 1)];
  const circuloJoined = actual ? joined.has(actual.id) : false;
  const memberCount = actual
    ? actual.memberCount + (circuloJoined && !actual.joined ? 1 : !circuloJoined && actual.joined ? -1 : 0)
    : 0;
  const visiblesIniciales = actual ? actual.fellowInitials.slice(0, 4) : [];
  const resto = actual ? Math.max(0, memberCount - visiblesIniciales.length - (circuloJoined ? 1 : 0)) : 0;
  const pila = actual ? (circuloJoined ? ["Tú", ...visiblesIniciales] : visiblesIniciales) : [];

  return (
    <section className={styles.bloque} aria-labelledby="ci-titulo">
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Encuentra tu grupo</div>
          <h2 className={styles.seccion} id="ci-titulo">
            Círculos de <span className={styles.enfasis}>interés</span>
          </h2>
          <p>Personas que comparten lo que te gusta. Elige un círculo para conocerlo.</p>
        </div>
      </div>

      <div className={styles.filtros} role="group" aria-label="Filtrar círculos">
        {temas.map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.filtro} ${t === tema ? styles.filtroActivo : ""}`}
            aria-pressed={t === tema}
            onClick={() => cambiarTema(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className={styles.escena}>
        <div className={styles.lista} role="tablist" aria-label="Círculos de interés">
          {visibles.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              className={`${styles.fila} ${i === seleccionado ? styles.filaSeleccionada : ""}`}
              aria-selected={i === seleccionado}
              tabIndex={i === seleccionado ? 0 : -1}
              onClick={() => elegir(i)}
            >
              <span className={styles.filaMini}>
                <ImagePlaceholder label={c.name} />
              </span>
              <span className={styles.filaTxt}>
                <b>{c.name}</b>
                <span>
                  {c.memberCount} miembros · {c.scheduleText}
                </span>
              </span>
            </button>
          ))}
        </div>

        {actual && (
          <div className={styles.escenario} role="tabpanel" aria-live="polite">
            <div className={`${styles.collage} ${cambiando ? styles.collageCambiando : ""}`}>
              <div className={`${styles.pieza} ${styles.piezaA}`}>
                <ImagePlaceholder label={`${actual.name} (principal)`} />
              </div>
              <div className={`${styles.pieza} ${styles.piezaB}`}>
                <ImagePlaceholder label={`${actual.name} (2)`} />
              </div>
              <div className={`${styles.pieza} ${styles.piezaC}`}>
                <ImagePlaceholder label={`${actual.name} (3)`} />
              </div>
            </div>
            <div className={styles.escenarioVelo} />
            <div className={styles.proxima}>
              <small>PRÓXIMA REUNIÓN</small>
              <b>{actual.scheduleText.split(" · ")[0]}</b>
              <span>{actual.scheduleText.split(" · ")[1] ?? ""}</span>
            </div>
            <div className={`${styles.escenarioInfo} ${cambiando ? styles.escenarioInfoCambiando : ""}`}>
              <span className={styles.chip} style={{ width: "fit-content" }}>
                {actual.topic}
              </span>
              <h3>{actual.name}</h3>
              <p>{actual.description}</p>
              <div className={styles.escenarioPie}>
                <div className={styles.pila}>
                  {pila.map((label, i) => (
                    <span key={i} style={{ background: TONOS[i % TONOS.length] }}>
                      {label}
                    </span>
                  ))}
                  {resto > 0 && <small>+{resto} personas más</small>}
                  {memberCount === 0 && <small>Sé la primera persona en unirte</small>}
                </div>
                <button
                  type="button"
                  className={`${styles.btn} ${circuloJoined ? styles.btnJoined : styles.btnP}`}
                  aria-pressed={circuloJoined}
                  disabled={isPending}
                  onClick={() => toggleUnirse(actual.id)}
                >
                  {circuloJoined ? "✓ Ya eres parte" : "Unirme al círculo"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
