"use client";

import { useEffect, useState, useTransition } from "react";
import styles from "@/styles/estimulacion-cognitiva.module.css";
import { completeDailyChallenge, type DailyChallengeState } from "@/lib/cognitive/daily-challenge-actions";

function calcularCuenta() {
  const ahora = new Date();
  const medianoche = new Date(ahora);
  medianoche.setHours(24, 0, 0, 0);
  const ms = medianoche.getTime() - ahora.getTime();
  const h = Math.floor(ms / 3600000);
  const min = Math.floor(ms / 60000) % 60;
  return `${h} h ${min} min`;
}

function useCuentaRegresiva() {
  const [texto, setTexto] = useState(calcularCuenta);
  useEffect(() => {
    const id = setInterval(() => setTexto(calcularCuenta()), 60000);
    return () => clearInterval(id);
  }, []);
  return texto;
}

const R = 80;
const C = 2 * Math.PI * R;

export function DailyChallenge({ state }: { state: DailyChallengeState }) {
  const [hecho, setHecho] = useState(state.completedToday);
  const [semana, setSemana] = useState(state.week);
  const [isPending, startTransition] = useTransition();
  const cuentaTexto = useCuentaRegresiva();

  const progresoPct = Math.round((semana.filter((d) => d.done).length / 7) * 100);

  function marcarHecho() {
    if (hecho) return;
    setHecho(true);
    setSemana((prev) => prev.map((d) => (d.isToday ? { ...d, done: true } : d)));
    startTransition(() => {
      completeDailyChallenge();
    });
  }

  return (
    <article className={styles.desafio} aria-labelledby="dd-titulo">
      <div className={styles.anilloProg} aria-label={`Llevas ${progresoPct}% de la semana del desafío`}>
        <svg viewBox="0 0 190 190" aria-hidden="true">
          <defs>
            <linearGradient id="cog-grad-anillo">
              <stop offset="0" stopColor="#8a983a" />
              <stop offset="1" stopColor="#d4e57f" />
            </linearGradient>
          </defs>
          <circle className={styles.anilloFondo} cx={95} cy={95} r={R} />
          <circle
            className={styles.anilloValor}
            cx={95}
            cy={95}
            r={R}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progresoPct / 100)}
          />
        </svg>
        <div className={styles.anilloTxt}>
          <b>{semana.filter((d) => d.done).length}</b>
          <span>DE 7 DÍAS</span>
        </div>
      </div>
      <div>
        <div className={styles.eyebrow}>Desafío del día</div>
        <h3 id="dd-titulo">
          {state.challenge.title.split(" ")[0]}{" "}
          <span className={styles.enfasis}>{state.challenge.title.split(" ").slice(1).join(" ")}</span>
        </h3>
        <p>{state.challenge.description}</p>
        <div className={styles.racha} aria-label="Tu racha de esta semana">
          {semana.map((d, i) => (
            <span key={i} className={`${styles.rachaDia} ${d.done ? styles.rachaHecho : d.isToday ? styles.rachaHoy : ""}`}>
              <i />
              {d.label}
            </span>
          ))}
        </div>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnP} ${styles.btnSm}`}
          disabled={hecho || isPending}
          onClick={marcarHecho}
        >
          {hecho ? "✓ Hecho por hoy" : "Marcar como hecho"}
        </button>
        <div className={styles.nuevoEn}>
          Nuevo desafío en <b>{cuentaTexto}</b>
        </div>
      </div>
    </article>
  );
}
