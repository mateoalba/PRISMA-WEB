"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/perfil.module.css";
import type { ProfileStats } from "@/lib/profile/stats";

const TONOS = ["#c7d873", "#b3c35a", "#9fae47", "#8a983a", "#7e8c35", "#aebd52", "#8c9a5e", "#85935a", "#a3b07a", "#bccb8a"];

export function EspectroYActividad({ stats }: { stats: ProfileStats }) {
  const [animado, setAnimado] = useState(false);
  const yaAnimo = useRef(false);

  useEffect(() => {
    if (yaAnimo.current) return;
    yaAnimo.current = true;
    const id = requestAnimationFrame(() => setAnimado(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={styles.dosCol}>
      <div className={`${styles.tarjeta} ${styles.bloqueT}`}>
        <h3>Tu actividad por dimensión</h3>
        <div>
          {stats.dimensionActivity.map((d, i) => (
            <div key={d.slug} className={styles.dim}>
              <span>{d.name}</span>
              <span className={styles.dimBarra} role="img" aria-label={`${d.name} ${d.pct}%`}>
                <i style={{ background: TONOS[i % TONOS.length], width: animado ? `${d.pct}%` : 0 }} />
              </span>
              <span>{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`${styles.tarjeta} ${styles.bloqueT}`}>
        <h3>Actividad reciente</h3>
        {stats.recentActivity.length === 0 ? (
          <p className={styles.sinActividad}>Todavía no tienes actividad registrada. Explora una dimensión para empezar.</p>
        ) : (
          <ol className={styles.actividad}>
            {stats.recentActivity.map((a, i) => (
              <li key={i}>
                <b>{a.text}</b>
                <span>{a.meta}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
