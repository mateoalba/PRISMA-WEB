"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/participacion-activa.module.css";
import type { ImpactStat } from "@/lib/participation/impact-actions";

function Cifra({ stat }: { stat: ImpactStat }) {
  const [valor, setValor] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const yaAnimo = useRef(false);

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    const observer = new IntersectionObserver(
      (entradas) => {
        if (!entradas[0].isIntersecting || yaAnimo.current) return;
        yaAnimo.current = true;
        observer.disconnect();
        const inicio = performance.now();
        const paso = (t: number) => {
          const k = Math.min(1, (t - inicio) / 1400);
          setValor(Math.round(stat.value * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(paso);
        };
        requestAnimationFrame(paso);
      },
      { threshold: 0.4 }
    );
    observer.observe(nodo);
    return () => observer.disconnect();
  }, [stat.value]);

  return (
    <div className={styles.cifra} ref={ref}>
      <b>{valor}</b>
      <span>{stat.label}</span>
    </div>
  );
}

export function ImpactStats({ stats }: { stats: ImpactStat[] }) {
  return (
    <section className={styles.bloque} aria-labelledby="hu-titulo">
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Tu huella</div>
          <h2 className={styles.seccion} id="hu-titulo">
            Lo que ya has <span className={styles.enfasis}>sembrado</span>
          </h2>
        </div>
      </div>
      <div className={styles.huella}>
        {stats.map((s) => (
          <Cifra key={s.label} stat={s} />
        ))}
      </div>
    </section>
  );
}
