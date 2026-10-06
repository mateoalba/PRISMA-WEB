"use client";

import { useState } from "react";
import styles from "@/styles/bienestar-fisico-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type Frase = { f: string; v: boolean; e: string };

const FRASES: Frase[] = [
  { f: "Se recomiendan al menos 150 minutos de actividad moderada a la semana.", v: true, e: "Es lo que sugiere la OMS: por ejemplo, 30 minutos, 5 días a la semana. Caminar a buen ritmo cuenta." },
  { f: "Si respiras un poco más rápido mientras te mueves, debes parar de inmediato.", v: false, e: "Respirar un poco más rápido es normal: significa que tu corazón está trabajando. Debes poder hablar mientras lo haces." },
  { f: "Un dolor agudo o un mareo son señales para detener el ejercicio.", v: true, e: "Si sientes dolor fuerte, mareo o falta de aire, detente, siéntate y avisa a alguien." },
  { f: "Hacer todo el ejercicio el fin de semana compensa el resto de la semana sin moverse.", v: false, e: "Es mejor repartirlo: moverse un poco cada día cuida más tus articulaciones y tu corazón." },
  { f: "Después de los 60, lo mejor es descansar siempre y no moverse mucho.", v: false, e: "¡Al contrario! Moverse ayuda al equilibrio, a los huesos y al ánimo, a cualquier edad." },
  { f: "Nunca es tarde para empezar a hacer actividad física.", v: true, e: "Empezar con poco, como 10 minutos al día, ya trae beneficios. Lo importante es la constancia." },
  { f: "Sudar mucho significa que el ejercicio funcionó mejor.", v: false, e: "Sudar depende del calor y de cada persona. No mide qué tan bueno fue el ejercicio." },
];

export function MitoVerdadActividad({ initialI, initialResp }: { initialI: number; initialResp: (boolean | undefined)[] }) {
  const [i, setI] = useState(initialI);
  const [resp, setResp] = useState<(boolean | undefined)[]>(initialResp);
  const [saliendo, setSaliendo] = useState<"vaIzq" | "vaDer" | null>(null);
  const [brillaCol, setBrillaCol] = useState<"mito" | "verdad" | null>(null);

  const terminado = i >= FRASES.length;
  const aciertos = resp.filter((r, k) => r !== undefined && r === FRASES[k].v).length;

  function elegir(v: boolean) {
    const next = resp.map((r, idx) => (idx === i ? v : r));
    setResp(next);
    saveActivityProgress("bienestar-fisico", "mito-o-verdad", { i, resp: next });
    const col: "mito" | "verdad" = FRASES[i].v ? "verdad" : "mito";
    setBrillaCol(col);
    setTimeout(() => setBrillaCol((c) => (c === col ? null : c)), 700);
  }
  function siguiente() {
    const F = FRASES[i];
    setSaliendo(F.v ? "vaDer" : "vaIzq");
    setTimeout(() => {
      setSaliendo(null);
      const nextI = i + 1;
      setI(nextI);
      saveActivityProgress("bienestar-fisico", "mito-o-verdad", { i: nextI, resp });
    }, 420);
  }
  function otraVez() {
    setI(0);
    setResp([]);
    saveActivityProgress("bienestar-fisico", "mito-o-verdad", { i: 0, resp: [] });
  }

  const mitoItems = FRASES.map((f, k) => ({ f, k })).filter(({ f, k }) => k < i && !f.v);
  const verdadItems = FRASES.map((f, k) => ({ f, k })).filter(({ f, k }) => k < i && f.v);
  const tituloFinal = aciertos === FRASES.length ? "¡Experto en movimiento!" : aciertos >= 5 ? "¡Muy bien informado!" : "¡Ahora sabes más!";

  return (
    <div className={`${styles.act} ${styles.mitos}`}>
      <div className={styles.mitosCab}>
        <div>
          <div className={styles.actTag}>
            <span className={styles.actNum}>02</span>
            <span className={styles.actTipo}>
              <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01" />
              </svg>
              Quiz
            </span>
          </div>
          <h3>Mitos y verdades del movimiento</h3>
          <p className={styles.actDesc}>Datos reales sobre actividad física para sentirte mejor. Lee cada frase y decide: ¿es un mito o es verdad? Se irá a su columna.</p>
        </div>
        <div className={styles.marcador}>
          {aciertos}/{FRASES.length}
          <small>aciertos</small>
        </div>
      </div>

      <div className={styles.tablero}>
        <div className={`${styles.col} ${brillaCol === "mito" ? styles.brilla : ""}`} style={{ ["--c" as string]: "var(--coral)" }}>
          <div className={styles.colT}>
            <span>✕</span>Mitos
          </div>
          <ul>
            {mitoItems.length === 0 ? (
              <li className={styles.vacio}>Aquí caerán los mitos…</li>
            ) : (
              mitoItems.map(({ f, k }) => (
                <li key={k} className={resp[k] === f.v ? "" : styles.mal}>
                  {f.f}
                </li>
              ))
            )}
          </ul>
        </div>

        {terminado ? (
          <div className={styles.frase} aria-live="polite">
            <div className={styles.finalM}>
              <span style={{ fontSize: "3rem" }}>🏃</span>
              <span className={styles.eyebrow}>
                {aciertos} de {FRASES.length} bien clasificadas
              </span>
              <h4>{tituloFinal}</h4>
              <p>Mira las dos columnas: ahí quedaron los mitos y las verdades para repasar cuando quieras.</p>
              <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} onClick={otraVez}>
                Jugar otra vez
              </button>
            </div>
          </div>
        ) : (
          <div key={i} className={`${styles.frase} ${saliendo ? styles[saliendo] : ""} ${styles.entra}`} aria-live="polite">
            <span className={styles.fraseN}>
              Frase {i + 1} de {FRASES.length}
            </span>
            <blockquote>{FRASES[i].f}</blockquote>
            {resp[i] === undefined ? (
              <div className={styles.decide} role="group" aria-label={FRASES[i].f}>
                <button type="button" style={{ ["--c" as string]: "var(--coral)" }} onClick={() => elegir(false)}>
                  <span>✕</span>Mito
                </button>
                <button type="button" style={{ ["--c" as string]: "var(--verde)" }} onClick={() => elegir(true)}>
                  <span>✓</span>Verdad
                </button>
              </div>
            ) : (
              <div className={styles.revela}>
                <div className={styles.res} style={{ color: FRASES[i].v ? "var(--verde)" : "var(--coral)" }}>
                  <i style={{ background: FRASES[i].v ? "var(--verde)" : "var(--coral)" }}>{FRASES[i].v ? "✓" : "✕"}</i>
                  {resp[i] === FRASES[i].v ? "¡Acertaste!" : "No exactamente…"} Es {FRASES[i].v ? "verdad" : "un mito"}.
                </div>
                <p>{FRASES[i].e}</p>
                <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnS}`} onClick={siguiente}>
                  {i === FRASES.length - 1 ? "Ver resultado" : "Siguiente frase"} →
                </button>
              </div>
            )}
          </div>
        )}

        <div className={`${styles.col} ${brillaCol === "verdad" ? styles.brilla : ""}`} style={{ ["--c" as string]: "var(--verde)" }}>
          <div className={styles.colT}>
            <span>✓</span>Verdades
          </div>
          <ul>
            {verdadItems.length === 0 ? (
              <li className={styles.vacio}>Aquí caerán las verdades…</li>
            ) : (
              verdadItems.map(({ f, k }) => (
                <li key={k} className={resp[k] === f.v ? "" : styles.mal}>
                  {f.f}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <p className={styles.avisoMedico}>
        <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
        Esta información es general. Antes de empezar una rutina nueva, consulta con tu médico, sobre todo si tienes alguna condición de salud.
      </p>
    </div>
  );
}
