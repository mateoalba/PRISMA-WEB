"use client";

import { useState } from "react";
import styles from "@/styles/educacion-continua-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type Pregunta = { q: string; ops: string[]; ok: number; exp: string };

const PREGUNTAS: Pregunta[] = [
  {
    q: "¿Cuál es una buena forma de aprender algo nuevo a cualquier edad?",
    ops: ["Practicar un poco cada día, sin prisa", "Intentar aprenderlo todo en una sola tarde", 'Evitarlo porque "ya no es edad para eso"', "Copiar sin entender"],
    ok: 0,
    exp: "Poquito y seguido gana: 15 minutos diarios rinden más que 3 horas un solo día.",
  },
  {
    q: "Si algo no te queda claro en una lección, ¿qué es lo mejor que puedes hacer?",
    ops: ["Volver a repasarla o preguntar", "Abandonar el curso por completo", "Fingir que lo entendiste", "Culparte por no entender rápido"],
    ok: 0,
    exp: "Preguntar es de valientes. Y repasar con calma casi siempre aclara las dudas.",
  },
  {
    q: "¿Qué ayuda más a recordar lo que aprendiste?",
    ops: ["Leerlo una sola vez", "Explicárselo a otra persona", "Memorizarlo sin entenderlo", "Dejarlo para dentro de un mes"],
    ok: 1,
    exp: "Cuando le explicas algo a alguien, tu cerebro lo ordena y lo guarda mejor.",
  },
  {
    q: "¿Cuánto tiempo es ideal para una sesión de estudio?",
    ops: ["4 horas seguidas sin descanso", "15 a 20 minutos, con pausas", "Solo 1 minuto", "Toda la noche"],
    ok: 1,
    exp: "Sesiones cortas con pausas mantienen la atención fresca y evitan el cansancio.",
  },
  {
    q: "¿Qué hacer cuando te equivocas mientras aprendes?",
    ops: ["Rendirte", "Verlo como parte del aprendizaje", "Esconder el error", "Pensar que no sirves para eso"],
    ok: 1,
    exp: "¡Los errores enseñan! Cada error te muestra qué repasar.",
  },
];
const LET = "ABCD";

function EscaleraSVG({ aciertos, terminado }: { aciertos: number; terminado: boolean }) {
  const T = PREGUNTAS.length;
  const n = aciertos;
  const px = 20 + Math.max(0, n) * 30 - 8;
  const py = 200 - n * 32;
  return (
    <div className={`${styles.escalera} ${terminado && n === T ? styles.escaleraFin : ""}`}>
      <svg viewBox="0 0 220 230" aria-hidden="true">
        {Array.from({ length: T }, (_, k) => (
          <rect
            key={k}
            className={`${styles.escPaso} ${k < n ? styles.escPasoOn : ""}`}
            x={20 + k * 30}
            y={200 - (k + 1) * 32}
            width={200 - (20 + k * 30)}
            height={32}
            fill="#2d2e24"
            stroke="#131310"
            strokeWidth={2}
          />
        ))}
        <g className={styles.birrete} transform="translate(180 20)">
          <path d="M-22 0 L0 -10 L22 0 L0 10Z" fill="#e8c95a" />
          <rect x={-10} y={2} width={20} height={10} fill="#c9a93a" />
          <path d="M18 2 v14" stroke="#e8c95a" strokeWidth={2} />
        </g>
        <g className={styles.persona} style={{ transform: `translate(${px}px, ${py}px)` }}>
          <circle cx={0} cy={-34} r={8} fill="#f5f1e6" />
          <path d="M-9 -24 h18 l3 22 h-24z" fill="#7fb7e6" />
          <path d="M-5 -2 v10 M5 -2 v10" stroke="#f5f1e6" strokeWidth={4} strokeLinecap="round" />
        </g>
      </svg>
      <div className={styles.escTxt}>
        <b>
          {n}/{T}
        </b>
        escalones
      </div>
    </div>
  );
}

export function PizarraEscaleraActividad() {
  const [i, setI] = useState(0);
  const [resp, setResp] = useState<(number | null)[]>(PREGUNTAS.map(() => null));
  const [fecha] = useState(() => new Date().toLocaleDateString("es", { day: "numeric", month: "long" }));
  const [fechaLarga] = useState(() => new Date().toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" }));

  const aciertos = resp.filter((r, k) => r === PREGUNTAS[k].ok).length;
  const terminado = i >= PREGUNTAS.length;

  function responder(k: number) {
    const next = resp.map((r, idx) => (idx === i ? k : r));
    setResp(next);
    saveActivityProgress("educacion-continua", "pizarra-quiz", { resp: next });
  }
  function siguiente() {
    setI(i + 1);
  }
  function repetir() {
    setI(0);
    setResp(PREGUNTAS.map(() => null));
  }

  if (terminado) {
    const T = PREGUNTAS.length;
    const txt =
      aciertos === T
        ? "por responder todas las lecciones y demostrar que aprender no tiene edad."
        : `por completar ${T} lecciones sobre cómo aprender mejor, con ${aciertos} respuestas correctas. ¡Cada intento cuenta!`;
    return (
      <div className={`${styles.act} ${styles.quiz}`}>
        <div className={styles.quizCab}>
          <div className={styles.actTag}>
            <span className={styles.actNum}>01</span>
            <span className={styles.actTipo}>
              <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01" />
              </svg>
              Quiz
            </span>
          </div>
          <h3>Hábitos para aprender mejor</h3>
          <p className={styles.actDesc}>Ideas útiles para aprender algo nuevo a cualquier edad. Cada respuesta correcta te sube un escalón hacia tu diploma.</p>
        </div>
        <div className={styles.aula}>
          <div>
            <div className={styles.diploma}>
              <small>PRISMA · Educación continua</small>
              <h4>{aciertos === T ? "Diploma de honor" : "Diploma de buen aprendiz"}</h4>
              <p>
                Se otorga a <b>ti</b> {txt}
              </p>
              <div className={styles.firma}>
                <span>{fechaLarga}</span>
                <span>Equipo PENSER</span>
              </div>
              <span className={styles.sello}>
                {aciertos}/{T}
              </span>
            </div>
            <div className={styles.diplomaAcc}>
              <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={repetir}>
                Repasar las lecciones
              </button>
            </div>
          </div>
          <EscaleraSVG aciertos={aciertos} terminado={terminado} />
        </div>
      </div>
    );
  }

  const P = PREGUNTAS[i];
  const r = resp[i];
  const respondida = r !== null;
  const bien = r === P.ok;

  return (
    <div className={`${styles.act} ${styles.quiz}`}>
      <div className={styles.quizCab}>
        <div className={styles.actTag}>
          <span className={styles.actNum}>01</span>
          <span className={styles.actTipo}>
            <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01" />
            </svg>
            Quiz
          </span>
        </div>
        <h3>Hábitos para aprender mejor</h3>
        <p className={styles.actDesc}>Ideas útiles para aprender algo nuevo a cualquier edad. Cada respuesta correcta te sube un escalón hacia tu diploma.</p>
      </div>
      <div className={styles.aula}>
        <div className={styles.pizarra}>
          <div className={styles.pizTop}>
            <span>
              Lección {i + 1} de {PREGUNTAS.length}
            </span>
            <span>{fecha}</span>
          </div>
          <p className={styles.pizQ}>{P.q}</p>
          <div className={styles.ops} role="group" aria-label={P.q}>
            {P.ops.map((o, k) => {
              let clase = "";
              if (respondida) clase = k === P.ok ? styles.bien : k === r ? styles.mal : styles.apagada;
              return (
                <button key={k} type="button" className={`${styles.op} ${clase}`} disabled={respondida} onClick={() => responder(k)}>
                  <i>{clase === styles.bien ? "✓" : clase === styles.mal ? "✕" : LET[k]}</i>
                  {o}
                </button>
              );
            })}
          </div>
          {respondida && (
            <div className={styles.notaTiza}>
              <span className={styles.circ}>{bien ? "✓" : "!"}</span>
              <div>
                <b>{bien ? "¡Muy bien! Subes un escalón" : "Casi… ¡a repasar!"}</b>
                <p>{P.exp}</p>
              </div>
            </div>
          )}
          <div className={styles.pizPie}>
            {respondida && (
              <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnS}`} onClick={siguiente}>
                {i === PREGUNTAS.length - 1 ? "Ver mi diploma" : "Siguiente lección"} →
              </button>
            )}
          </div>
          <span className={styles.tizas} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
        <EscaleraSVG aciertos={aciertos} terminado={terminado} />
      </div>
    </div>
  );
}
