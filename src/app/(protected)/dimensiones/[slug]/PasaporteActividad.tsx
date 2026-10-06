"use client";

import { useState } from "react";
import styles from "@/styles/interculturalidad-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type Sello = { s: string; l: string; c: string };
type Pregunta = { q: string; ops: string[]; ok: number; exp: string; sello: Sello };

const PREGUNTAS: Pregunta[] = [
  {
    q: "¿Qué es una buena forma de acercarte a una cultura distinta a la tuya?",
    ops: ["Con curiosidad y respeto, preguntando y escuchando", "Evitando todo contacto", "Asumiendo que ya sabes cómo son", "Burlándote de sus costumbres"],
    ok: 0,
    exp: "Preguntar y escuchar sin juzgar abre puertas. Todas las culturas tienen algo que enseñarnos.",
    sello: { s: "Konnichiwa", l: "Japonés", c: "#b0305a" },
  },
  {
    q: "¿Cuál de estas es una forma real de conectar con otra cultura sin viajar?",
    ops: ["Probar su comida, su música o conversar con alguien de allí", "Solo se puede conociendo el país en persona", "No hay forma de hacerlo sin viajar", "Viendo solo noticias sobre ese país"],
    ok: 0,
    exp: "Una receta, una canción o una charla con un vecino de otro país ya son un viaje.",
    sello: { s: "Allin puncha", l: "Kichwa", c: "#3f6f2a" },
  },
  {
    q: "Si alguien saluda de una forma distinta a la tuya (con una reverencia, por ejemplo), ¿qué haces?",
    ops: ["Me río porque es raro", "Respondo con respeto e intento imitarlo", "Lo ignoro", "Le digo que lo está haciendo mal"],
    ok: 1,
    exp: "Devolver el saludo a su manera es un gesto de respeto que la otra persona agradece.",
    sello: { s: "Namasté", l: "Hindi", c: "#b3561c" },
  },
  {
    q: "¿Qué significa que Ecuador sea un país intercultural?",
    ops: ["Que todos hablan un solo idioma", "Que conviven varios pueblos, idiomas y tradiciones", "Que no tiene tradiciones propias", "Que solo hay una cultura"],
    ok: 1,
    exp: "En Ecuador conviven pueblos indígenas, afroecuatorianos, montubios y mestizos, con 14 lenguas ancestrales.",
    sello: { s: "Hallo", l: "Alemán", c: "#2a5a8a" },
  },
  {
    q: "¿Cuál es un buen primer paso para aprender sobre una tradición nueva?",
    ops: ["Preguntar a alguien que la vive", "Inventar lo que significa", "Copiarla sin entenderla", "Decir que la tuya es mejor"],
    ok: 0,
    exp: "Quien vive una tradición es la mejor persona para contarte su sentido y su historia.",
    sello: { s: "Jambo", l: "Suajili", c: "#7a3a8a" },
  },
];
const LET = "ABCD";
const ROT = [-8, 6, -4, 9, -10];

export function PasaporteActividad({ initialResp }: { initialResp: (number | null)[] }) {
  const hechasInicio = initialResp.filter((r) => r !== null).length;
  const [i, setI] = useState(hechasInicio >= PREGUNTAS.length ? PREGUNTAS.length : hechasInicio);
  const [resp, setResp] = useState<(number | null)[]>(initialResp);

  const hechas = resp.filter((r) => r !== null).length;
  const terminado = i >= PREGUNTAS.length;

  function responder(k: number) {
    const next = resp.map((r, idx) => (idx === i ? k : r));
    setResp(next);
    saveActivityProgress("interculturalidad", "pasaporte-quiz", { resp: next });
  }
  function siguiente() {
    setI(i + 1);
  }
  function otraVez() {
    setI(0);
    setResp(PREGUNTAS.map(() => null));
  }

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
        <h3>¿Cuánto sabes de otras culturas?</h3>
        <p className={styles.actDesc}>Reflexiones cortas sobre cómo acercarte a culturas distintas. Cada respuesta deja un sello en tu pasaporte con un saludo del mundo.</p>
      </div>

      <div className={styles.pasaporte}>
        <div className={`${styles.pag} ${styles.pagIzq}`}>
          <div className={styles.pagTop}>
            <span>Visados · Sellos</span>
            <span>
              {hechas}/{PREGUNTAS.length}
            </span>
          </div>
          <div className={styles.sellos}>
            {PREGUNTAS.map((P, k) => {
              const r = resp[k];
              if (r === null) return <span key={k} className={styles.hueco}>Sello {k + 1}</span>;
              const ok = r === P.ok;
              return (
                <span key={k} className={`${styles.sello} ${ok ? "" : styles.repaso}`} style={{ ["--c" as string]: P.sello.c, transform: `rotate(${ROT[k]}deg)` }}>
                  <span>
                    <b>{P.sello.s}</b>
                    <small>{P.sello.l}</small>
                    <em>{ok ? "✓ Aprobado" : "Por repasar"}</em>
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        <div className={styles.pagDer} aria-live="polite">
          {terminado ? (
            (() => {
              const n = resp.filter((r, k) => r === PREGUNTAS[k].ok).length;
              const T = PREGUNTAS.length;
              const titulo = n === T ? "¡Ciudadano del mundo!" : n >= 3 ? "¡Gran viajero!" : "¡Buen primer viaje!";
              return (
                <div className={styles.finalPas}>
                  <div className={styles.pagTop} style={{ width: "100%" }}>
                    <span>Pasaporte completo</span>
                    <span>
                      {n}/{T}
                    </span>
                  </div>
                  <span style={{ fontSize: "3rem" }}>🧳</span>
                  <h4>{titulo}</h4>
                  <p>
                    Aprobaste {n} de {T} sellos y aprendiste a saludar en {T} idiomas. {n < T ? "Repasa los sellos pálidos cuando quieras." : ""}
                  </p>
                  <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} onClick={otraVez}>
                    Viajar de nuevo
                  </button>
                </div>
              );
            })()
          ) : (
            (() => {
              const P = PREGUNTAS[i];
              const r = resp[i];
              const respondida = r !== null;
              return (
                <>
                  <div className={styles.pagTop}>
                    <span>
                      Pregunta {i + 1} de {PREGUNTAS.length}
                    </span>
                    <span>PRISMA</span>
                  </div>
                  <p className={styles.pq}>{P.q}</p>
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
                    <div className={styles.exp}>
                      <b>{r === P.ok ? "¡Sello aprobado! 🌍" : "Sello por repasar"}</b>
                      {P.exp}
                    </div>
                  )}
                  <div className={styles.pagPie}>
                    <small>{respondida ? `"${P.sello.s}" = hola en ${P.sello.l.toLowerCase()}` : ""}</small>
                    {respondida && (
                      <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnS}`} onClick={siguiente}>
                        {i === PREGUNTAS.length - 1 ? "Cerrar pasaporte" : "Siguiente"} →
                      </button>
                    )}
                  </div>
                </>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
