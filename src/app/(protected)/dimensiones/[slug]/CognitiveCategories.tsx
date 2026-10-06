"use client";

import { useState, type ReactElement } from "react";
import styles from "@/styles/estimulacion-cognitiva.module.css";
import type { CategoryLevel } from "@/lib/cognitive/categories-actions";

const ICONOS: Record<CategoryLevel["id"], ReactElement> = {
  memoria: (
    <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1" />
  ),
  logica: (
    <>
      <rect x={3} y={3} width={7} height={7} rx={1.5} />
      <rect x={14} y={3} width={7} height={7} rx={1.5} />
      <rect x={3} y={14} width={7} height={7} rx={1.5} />
      <path d="M14 17.5h7M17.5 14v7" />
    </>
  ),
  lenguaje: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  percepcion: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx={12} cy={12} r={3} />
    </>
  ),
};

const CX = 260;
const CY = 260;
const RAD = 170;

function punto(i: number, r: number, n: number) {
  const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
  return [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
}

function Radar({ categorias, sel }: { categorias: CategoryLevel[]; sel: number }) {
  const n = categorias.length;
  const redes = [0.25, 0.5, 0.75, 1].map((k, ki) => (
    <polygon key={ki} className={styles.radarRed} points={categorias.map((_, i) => punto(i, RAD * k, n).join(",")).join(" ")} />
  ));
  const ejes = categorias.map((_, i) => {
    const [x, y] = punto(i, RAD, n);
    return <line key={i} className={i === sel ? styles.radarEjeOn : styles.radarEje} x1={CX} y1={CY} x2={x} y2={y} />;
  });
  const forma = categorias.map((c, i) => punto(i, (RAD * c.levelPct) / 100, n).join(",")).join(" ");
  const vert = categorias.map((c, i) => {
    const [x, y] = punto(i, (RAD * c.levelPct) / 100, n);
    return <circle key={i} className={i === sel ? styles.radarVerticeOn : styles.radarVertice} cx={x} cy={y} r={i === sel ? 10 : 7} />;
  });
  const etq = categorias.map((c, i) => {
    const [x, y] = punto(i, RAD + 44, n);
    const anchor = Math.abs(x - CX) < 5 ? "middle" : x > CX ? "start" : "end";
    const dx = anchor === "start" ? -20 : anchor === "end" ? 20 : 0;
    return (
      <g key={i}>
        <text className={i === sel ? styles.radarEtqOn : styles.radarEtq} x={x + dx} y={y} textAnchor={anchor} dominantBaseline="middle">
          {c.nombre}
        </text>
        <text className={styles.radarPct} x={x + dx} y={y + 20} textAnchor={anchor} dominantBaseline="middle">
          {c.levelPct}%
        </text>
      </g>
    );
  });

  return (
    <svg viewBox="-60 0 640 520">
      {redes}
      {ejes}
      <polygon className={styles.radarForma} points={forma} />
      {vert}
      {etq}
    </svg>
  );
}

export function CognitiveCategories({ categorias }: { categorias: CategoryLevel[] }) {
  const [sel, setSel] = useState(0);
  const actual = categorias[sel];

  return (
    <div className={`${styles.panel} ${styles.cats}`}>
      <div>
        <div className={styles.eyebrow}>Categorías de entrenamiento</div>
        <h2 className={styles.seccion} id="cat-titulo">
          Tu mapa <span className={styles.enfasis}>mental</span>
        </h2>
        <div className={styles.catsBotones} role="tablist" aria-label="Categorías">
          {categorias.map((c, i) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              className={`${styles.cat} ${i === sel ? styles.catActiva : ""}`}
              aria-selected={i === sel}
              tabIndex={i === sel ? 0 : -1}
              onClick={() => setSel(i)}
            >
              <span className={styles.catIco}>
                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {ICONOS[c.id]}
                </svg>
              </span>
              <span>
                <b>{c.nombre}</b>
                <span>{c.statLabel}</span>
              </span>
            </button>
          ))}
        </div>
        <div role="tabpanel" aria-live="polite">
          <div className={styles.catDetalle}>
            <h4>{actual.nombre}</h4>
            <p>{actual.desc}</p>
            <div className={styles.catEjemplos}>
              {actual.ejemplos.map((e) => (
                <span key={e}>{e}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className={styles.radar} role="img" aria-label={`Tus habilidades: ${categorias.map((c) => `${c.nombre} ${c.levelPct}%`).join(", ")}`}>
          <Radar categorias={categorias} sel={sel} />
        </div>
        <p className={styles.radarNota}>Tu nivel en cada área según los ejercicios que has hecho.</p>
      </div>
    </div>
  );
}
