"use client";

import { useState, type ReactNode } from "react";
import styles from "@/styles/seguridad-digital.module.css";
import { CASOS } from "@/lib/security-content";

const LETRAS = ["A", "B", "C"];

function AvatarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
    </svg>
  );
}

function renderMarcado(texto: string, revelado: boolean): ReactNode[] {
  const partes: ReactNode[] = [];
  const regex = /\[\[(.+?)\|(\d)\]\]/g;
  let ultimo = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(texto))) {
    if (match.index > ultimo) partes.push(texto.slice(ultimo, match.index));
    partes.push(
      <mark key={key++}>
        {match[1]}
        {revelado && <sup>{match[2]}</sup>}
      </mark>
    );
    ultimo = match.index + match[0].length;
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return partes;
}

export function ScamSimulator() {
  const [casoIndex, setCasoIndex] = useState(0);
  const [resultados, setResultados] = useState<(boolean | undefined)[]>([]);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [sacude, setSacude] = useState(false);
  const [terminado, setTerminado] = useState(false);

  const caso = CASOS[casoIndex];
  const revelado = seleccion !== null;
  const bien = resultados.filter(Boolean).length;

  function responder(i: number) {
    const ok = i === caso.correcta;
    setSeleccion(i);
    setResultados((prev) => {
      const next = [...prev];
      next[casoIndex] = ok;
      return next;
    });
    if (!ok) {
      setSacude(false);
      requestAnimationFrame(() => setSacude(true));
    }
  }

  function siguiente() {
    if (casoIndex + 1 >= CASOS.length) {
      setTerminado(true);
      return;
    }
    setCasoIndex((i) => i + 1);
    setSeleccion(null);
  }

  function reiniciar() {
    setCasoIndex(0);
    setResultados([]);
    setSeleccion(null);
    setTerminado(false);
  }

  const finalBien = resultados.filter(Boolean).length;
  const pasosMostrados = terminado ? CASOS.length : casoIndex;

  return (
    <section className={styles.bloque} aria-labelledby="sim-titulo">
      <div className={styles.eyebrow}>Entrena tu ojo</div>
      <h2 className={styles.seccion} id="sim-titulo">
        ¿Sabrías qué <span className={styles.enfasis}>responder?</span>
      </h2>

      <div className={styles.escudoProg}>
        <svg className={styles.escudo} viewBox="0 0 58 66" aria-hidden="true">
          <defs>
            <clipPath id="seg-clip-escudo">
              <path d="M29 3 L54 12 V32 C54 48 43 58 29 63 C15 58 4 48 4 32 V12 Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#seg-clip-escudo)">
            <rect className={styles.eRelleno} x={0} y={0} width={58} height={66} style={{ transform: `scaleY(${bien / CASOS.length})` }} />
          </g>
          <path className={styles.eBorde} d="M29 3 L54 12 V32 C54 48 43 58 29 63 C15 58 4 48 4 32 V12 Z" />
          {terminado && finalBien === CASOS.length && (
            <path d="M20 33l6 6 12-13" fill="none" stroke="#181712" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
        <div>
          <b>{terminado ? `Escudo al ${Math.round((finalBien / CASOS.length) * 100)}%` : "Tu escudo digital"}</b>
          <span>
            {terminado
              ? finalBien === CASOS.length
                ? "¡Detectaste todas las estafas!"
                : "Sigue practicando para completarlo"
              : "Resuelve los casos para fortalecerlo"}
          </span>
        </div>
        <div className={styles.pasos} aria-hidden="true">
          {CASOS.map((_, i) => (
            <i
              key={i}
              className={
                resultados[i] === true
                  ? styles.pasoBien
                  : resultados[i] === false
                    ? styles.pasoMal
                    : i === pasosMostrados
                      ? styles.pasoActual
                      : ""
              }
            />
          ))}
        </div>
      </div>

      <div className={styles.sim}>
        <div className={`${styles.celular} ${revelado ? styles.revelado : ""} ${sacude ? styles.celularSacude : ""}`} onAnimationEnd={() => setSacude(false)}>
          <div className={styles.pantalla}>
            <span className={styles.notch} />
            <div className={styles.pCab}>
              <span className={styles.pAvatar}>
                <AvatarIcon />
              </span>
              <div>
                <b>{caso.de}</b>
                <small>{caso.nombre}</small>
              </div>
              <span className={styles.pTipo}>{caso.tipo}</span>
            </div>
            <div className={styles.pChat}>
              <span className={styles.pHora}>{caso.hora}</span>
              <div className={styles.pMsj}>{renderMarcado(caso.texto, revelado)}</div>
            </div>
            <div className={styles.pEscribir}>Escribe un mensaje…</div>
          </div>
          {revelado && (
            <span className={`${styles.selloAlerta} ${styles.selloOn} ${seleccion === caso.correcta ? styles.selloBien : styles.selloMal}`}>
              {seleccion === caso.correcta ? "¡Bien detectado!" : "¡Era una estafa!"}
            </span>
          )}
        </div>

        <div className={styles.simLado} aria-live="polite">
          {terminado ? (
            <div className={styles.final}>
              <div className={styles.eyebrow}>Resultado</div>
              <h3>
                {finalBien} de {CASOS.length} casos <span className={styles.enfasis}>resueltos</span>
              </h3>
              <p className={styles.pregunta}>
                {finalBien === CASOS.length
                  ? "Estás muy bien preparado/a. Comparte lo que aprendiste con tu familia."
                  : "Cada práctica te hace más difícil de engañar. Repasa las señales de alerta de abajo."}
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={reiniciar}>
                  Practicar otra vez
                </button>
                <a className={`${styles.btn} ${styles.btnS}`} href="#est-titulo">
                  Ver señales de alerta
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.eyebrow}>
                Caso {casoIndex + 1} de {CASOS.length} · {caso.tipo}
              </div>
              <h3>Te llega este mensaje</h3>
              <p className={styles.pregunta}>¿Cuál es la acción más segura?</p>
              <div className={styles.opciones} role="group" aria-label="Opciones de respuesta">
                {caso.opciones.map((o, i) => {
                  const clase = !revelado
                    ? ""
                    : i === caso.correcta
                      ? styles.opcionCorrecta
                      : i === seleccion
                        ? styles.opcionIncorrecta
                        : styles.opcionApagada;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.opcion} ${clase}`}
                      disabled={revelado}
                      onClick={() => responder(i)}
                    >
                      <span className={styles.opcionLetra}>{LETRAS[i]}</span>
                      {o}
                    </button>
                  );
                })}
              </div>
              {revelado && (
                <div className={styles.explica}>
                  <h4>{seleccion === caso.correcta ? "¡Muy bien! Esa es la opción segura." : "Casi. La opción segura es la marcada en verde."}</h4>
                  <p>{caso.explicacion}</p>
                  <ul className={styles.pistas}>
                    {caso.pistas.map((p, k) => (
                      <li key={k}>
                        <b>{k + 1}</b>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={siguiente}>
                    {casoIndex < CASOS.length - 1 ? "Siguiente caso" : "Ver mi resultado"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
