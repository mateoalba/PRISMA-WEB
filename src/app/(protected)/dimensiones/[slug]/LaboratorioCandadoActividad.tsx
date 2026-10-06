"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/seguridad-digital-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type TipoPieza = "palabra" | "numero" | "simbolo" | "trampa";
type PiezaElegida = { tipo: TipoPieza; v: string };

const PIEZAS: Record<TipoPieza, { t: string; c: string; items: string[] }> = {
  palabra: { t: "Palabras que solo tú asocias", c: "#9fd3c9", items: ["Girasol", "Tango", "Montaña", "Café", "Luna", "Guitarra"] },
  numero: { t: "Números (que no sean tu fecha)", c: "#e8c95a", items: ["7", "42", "315"] },
  simbolo: { t: "Símbolos", c: "#b8a4e3", items: ["!", "#", "*", "-"] },
  trampa: { t: "Trampas comunes (pruébalas y mira qué pasa)", c: "#ff8a74", items: ["123456", "contraseña", "MiNombre", "15/03/1958"] },
};
const NIVELES = [
  { t: "Menos de 1 segundo", n: "Muy débil", c: "#ff8a74" },
  { t: "Unos minutos", n: "Débil", c: "#ffb48a" },
  { t: "Unos meses", n: "Regular", c: "#e8c95a" },
  { t: "Cientos de años", n: "Fuerte", c: "#c7d873" },
  { t: "Miles de siglos", n: "¡Muy fuerte!", c: "#8fd18a" },
];

function evaluar(P: PiezaElegida[]) {
  const txt = P.map((p) => p.v).join("");
  const trampa = P.some((p) => p.tipo === "trampa");
  const palabras = P.filter((p) => p.tipo === "palabra").length;
  const crit = [
    { t: "12 caracteres o más", ok: txt.length >= 12, mal: false },
    { t: "2 palabras o más", ok: palabras >= 2, mal: false },
    { t: "Tiene un número", ok: P.some((p) => p.tipo === "numero"), mal: false },
    { t: "Tiene un símbolo", ok: P.some((p) => p.tipo === "simbolo"), mal: false },
    { t: "Sin datos fáciles de adivinar", ok: P.length > 0 && !trampa, mal: trampa },
  ];
  let score = 0;
  if (P.length) {
    score = crit.slice(0, 4).filter((c) => c.ok).length;
    if (txt.length < 8) score = Math.min(score, 1);
    if (trampa) score = 0;
  }
  return { txt, crit, score, trampa };
}

export function LaboratorioCandadoActividad() {
  const [P, setP] = useState<PiezaElegida[]>([]);
  const { crit, score, trampa } = evaluar(P);
  const nivel = NIVELES[score];

  useEffect(() => {
    if (score === 4) saveActivityProgress("seguridad-digital", "candado", { logrado: true });
  }, [score]);

  function agregarPieza(tipo: TipoPieza, v: string) {
    if (P.length >= 7) return;
    if (tipo !== "trampa" && P.some((p) => p.v === v)) return;
    setP([...P, { tipo, v }]);
  }
  function quitarUltima() {
    setP(P.slice(0, -1));
  }
  function limpiar() {
    setP([]);
  }
  function ejemplo() {
    setP([
      { tipo: "palabra", v: "Girasol" },
      { tipo: "simbolo", v: "-" },
      { tipo: "palabra", v: "Tango" },
      { tipo: "numero", v: "42" },
      { tipo: "simbolo", v: "!" },
    ]);
  }

  return (
    <div className={`${styles.act} ${styles.lab}`}>
      <div className={styles.candadoWrap} style={{ ["--nivel" as string]: P.length ? nivel.c : "#a8a493" }}>
        <div className={`${styles.candado} ${score >= 3 ? styles.cerrado : ""}`} aria-hidden="true">
          <svg viewBox="0 0 200 230">
            <g className={styles.arco}>
              <path d="M55 108 V70 a45 45 0 0 1 90 0 V108" fill="none" stroke="#a8a493" strokeWidth={16} strokeLinecap="round" />
            </g>
            <rect className={styles.cuerpoC} x={30} y={100} width={140} height={120} rx={22} fill={P.length ? nivel.c : "#3a3b31"} />
            <g>
              {[0, 1, 2, 3].map((k) => (
                <rect key={k} className={styles.barraC} x={48 + k * 28} y={192} width={20} height={12} rx={4} fill={k < score ? "#131310" : "rgba(19,19,16,.25)"} />
              ))}
            </g>
            <circle cx={100} cy={148} r={12} fill="#131310" />
            <rect x={95} y={152} width={10} height={24} rx={4} fill="#131310" />
            <path className={styles.brilloC} d="M44 112 h40" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.45} />
          </svg>
        </div>
        <div className={styles.tiempo} aria-live="polite">
          <small>Tiempo para adivinarla</small>
          <b>{P.length ? nivel.t : "—"}</b>
          <span>{!P.length ? "Arma una contraseña" : trampa ? "⚠️ Tiene una trampa: se adivina al instante" : nivel.n}</span>
        </div>
      </div>

      <div>
        <div className={styles.actTag}>
          <span className={styles.actNum}>01</span>
          <span className={styles.actTipo}>
            <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            Laboratorio
          </span>
        </div>
        <h3>Contraseñas seguras</h3>
        <p className={styles.actDesc}>Aprende a reconocer una contraseña fuerte y una trampa común. Arma una con las piezas de abajo y mira cómo se cierra el candado.</p>

        <div className={styles.campoPass} aria-live="polite" aria-label="Contraseña de práctica">
          {P.length ? (
            P.map((p, k) => (
              <span key={k} className={`${styles.piezaEn} ${styles[p.tipo]}`}>
                {p.v}
              </span>
            ))
          ) : (
            <span className={styles.vacio}>Toca las piezas para armar tu contraseña de práctica…</span>
          )}
        </div>
        <div className={styles.campoAcc}>
          <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} disabled={!P.length} onClick={quitarUltima}>
            ⌫ Quitar la última pieza
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} disabled={!P.length} onClick={limpiar}>
            Empezar de nuevo
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} onClick={ejemplo}>
            Ver un ejemplo fuerte
          </button>
        </div>
        <div>
          {(Object.entries(PIEZAS) as [TipoPieza, (typeof PIEZAS)[TipoPieza]][]).map(([tipo, g]) => (
            <div key={tipo} className={styles.grupo}>
              <span>{g.t}</span>
              <div className={styles.piezas}>
                {g.items.map((v) => {
                  const deshabilitada = P.length >= 7 || (tipo !== "trampa" && P.some((p) => p.v === v));
                  return (
                    <button key={v} type="button" className={styles.pieza} style={{ ["--c" as string]: g.c }} disabled={deshabilitada} onClick={() => agregarPieza(tipo, v)}>
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <ul className={styles.criterios}>
          {crit.map((c) => (
            <li key={c.t} className={c.mal ? styles.mal : c.ok ? styles.ok : ""}>
              <i>{c.mal ? "✕" : c.ok ? "✓" : ""}</i>
              {c.t}
            </li>
          ))}
        </ul>
        <p className={styles.notaSeg}>
          <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          Es solo una práctica: nunca escribas tu contraseña real en ningún lugar que no sea la app o página oficial.
        </p>
      </div>
    </div>
  );
}
