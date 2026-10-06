"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/perfil.module.css";
import type { ProfileStats } from "@/lib/profile/stats";

const MESES_CORTOS = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

export function ResumenStats({ stats }: { stats: ProfileStats }) {
  const [nivel, setNivel] = useState(0);
  const yaAnimo = useRef(false);

  useEffect(() => {
    if (yaAnimo.current) return;
    yaAnimo.current = true;
    const id = requestAnimationFrame(() => setNivel(stats.hydrationToday / stats.hydrationGoal));
    return () => cancelAnimationFrame(id);
  }, [stats.hydrationToday, stats.hydrationGoal]);

  const registros = stats.moodWeek.filter((m) => m.nivel > 0).length;
  const desde = stats.memberSince ? new Date(stats.memberSince) : null;
  const dias = stats.daysAsMember;

  return (
    <div className={styles.stats}>
      <div className={`${styles.tarjeta} ${styles.stat}`}>
        <svg className={`${styles.statVis} ${styles.gotaAgua}`} viewBox="0 0 92 92" aria-hidden="true">
          <defs>
            <clipPath id="perfil-clip-gota">
              <path d="M46 6C46 6 14 44 14 62a32 32 0 0 0 64 0C78 44 46 6 46 6z" />
            </clipPath>
            <linearGradient id="perfil-gota-agua" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#b9e6dc" />
              <stop offset="1" stopColor="#4d8a7e" />
            </linearGradient>
          </defs>
          <path d="M46 6C46 6 14 44 14 62a32 32 0 0 0 64 0C78 44 46 6 46 6z" fill="var(--color-surface)" />
          <g clipPath="url(#perfil-clip-gota)">
            <rect x="0" y="0" width="92" height="92" fill="url(#perfil-gota-agua)" style={{ transform: `translateY(${92 - 86 * nivel}px)` }} />
          </g>
          <path d="M46 6C46 6 14 44 14 62a32 32 0 0 0 64 0C78 44 46 6 46 6z" fill="none" stroke="#9fd3c9" strokeWidth="2" />
        </svg>
        <div>
          <div className={styles.eyebrow}>Hidratación hoy</div>
          <b>
            {stats.hydrationToday} / {stats.hydrationGoal}
          </b>
          <span>vasos de agua</span>
          <br />
          <Link href="/dimensiones/bienestar-fisico">Registrar un vaso →</Link>
        </div>
      </div>

      <div className={`${styles.tarjeta} ${styles.stat}`}>
        <div className={`${styles.statVis} ${styles.animoPuntos}`} aria-hidden="true">
          {stats.moodWeek.map((m, i) => (
            <i key={i} style={{ height: `${m.nivel ? m.nivel * 20 : 6}%`, opacity: m.nivel ? 1 : 0.25 }} />
          ))}
        </div>
        <div>
          <div className={styles.eyebrow}>Ánimo esta semana</div>
          <b>{registros} de 7</b>
          <span>días registrados</span>
          <br />
          <Link href="/dimensiones/salud-mental">¿Cómo te sientes hoy? →</Link>
        </div>
      </div>

      <div className={`${styles.tarjeta} ${styles.stat}`}>
        <div className={`${styles.statVis} ${styles.calendario}`} aria-hidden="true">
          {desde && (
            <>
              <small>{MESES_CORTOS[desde.getMonth()]}</small>
              <b>{desde.getFullYear()}</b>
            </>
          )}
        </div>
        <div>
          <div className={styles.eyebrow}>Miembro desde</div>
          <b style={{ fontSize: "1.5rem" }}>
            {desde
              ? desde.toLocaleDateString("es-EC", { month: "long", year: "numeric" })
              : "—"}
          </b>
          <span>{dias} días aprendiendo con nosotros</span>
        </div>
      </div>
    </div>
  );
}
