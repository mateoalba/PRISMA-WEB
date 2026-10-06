"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/digital-actividades.module.css";

export type QuizResp = (number | null)[];

type Pregunta = {
  q: string;
  ico: "lupa" | "llave" | "nube" | "escudo" | "atras";
  ops: string[];
  ok: number;
  exp: string;
};

const PREGUNTAS: Pregunta[] = [
  {
    q: "¿Para qué sirve el ícono de una lupa en una aplicación?",
    ico: "lupa",
    ops: ["Para buscar algo", "Para cerrar la app", "Para tomar una foto", "Para cambiar el idioma"],
    ok: 0,
    exp: 'La lupa casi siempre significa "buscar". Tócala y escribe lo que necesitas encontrar.',
  },
  {
    q: "Si una app te pide una contraseña que ya olvidaste, ¿qué deberías buscar?",
    ico: "llave",
    ops: ['La opción "¿Olvidaste tu contraseña?"', "Cerrar la app y no volver a abrirla", "Crear una cuenta nueva", "Pedirle el celular a un desconocido"],
    ok: 0,
    exp: 'Casi todas las apps tienen "¿Olvidaste tu contraseña?". Te envían un código a tu correo o a tu teléfono para crear una nueva.',
  },
  {
    q: "¿Qué significa el ícono de una nube en tu celular?",
    ico: "nube",
    ops: ["Que tus fotos también se guardan en internet", "Que va a llover", "Que la batería está baja", "Que tienes una llamada perdida"],
    ok: 0,
    exp: "La nube indica que tus archivos tienen una copia en internet. Si pierdes el celular, tus fotos no se pierden.",
  },
  {
    q: "Te llega un mensaje de un número desconocido pidiendo tu clave del banco. ¿Qué haces?",
    ico: "escudo",
    ops: ["Se la envío para no tener problemas", "No respondo y bloqueo el número", "Le reenvío el mensaje a mis contactos", "Llamo al número para preguntar"],
    ok: 1,
    exp: "Ningún banco pide tu clave por mensaje. No respondas, bloquea el número y, si tienes dudas, llama al número oficial de tu banco.",
  },
  {
    q: "¿Qué hace el botón con una flecha curva hacia atrás ↩?",
    ico: "atras",
    ops: ["Apaga el celular", "Borra todas tus fotos", "Te regresa a la pantalla anterior", "Sube el volumen"],
    ok: 2,
    exp: 'La flecha hacia atrás te devuelve a donde estabas antes. Es tu "salida segura" si te pierdes en una app.',
  },
];

export const TOTAL_PREGUNTAS = PREGUNTAS.length;

const LETRAS = "ABCD";

function IconoPorClave(clave: Pregunta["ico"] | "estrella" | "flecha") {
  switch (clave) {
    case "lupa":
      return (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </>
      );
    case "llave":
      return (
        <>
          <circle cx="8" cy="15" r="4" />
          <path d="M11 12l9-9M17 6l3 3M14 9l2 2" />
        </>
      );
    case "nube":
      return (
        <>
          <path d="M7 18h10a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.5 1.5A3.8 3.8 0 0 0 7 18z" />
          <path d="M12 11v5M9.5 13.5L12 11l2.5 2.5" />
        </>
      );
    case "escudo":
      return (
        <>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
          <path d="M9 12l2 2 4-4" />
        </>
      );
    case "atras":
      return (
        <>
          <path d="M9 14L4 9l5-5" />
          <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
        </>
      );
    case "flecha":
      return <path d="M5 12h14M13 6l6 6-6 6" />;
    case "estrella":
      return <path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4 6.8 19.2l1-5.9L3.5 9.2l5.9-.8z" />;
  }
}
function Ico({ clave, className }: { clave: Pregunta["ico"] | "estrella" | "flecha"; className?: string }) {
  return (
    <svg className={className ?? styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      {IconoPorClave(clave)}
    </svg>
  );
}

export function SegsQuiz({ resp }: { resp: QuizResp }) {
  return (
    <div className={styles.segs}>
      {PREGUNTAS.map((p, k) => (
        <i key={k} className={resp[k] === null ? "" : resp[k] === p.ok ? styles.on : styles.mal} />
      ))}
    </div>
  );
}

export function DigitalQuizActividad({
  resp,
  setResp,
  onPerfecto,
}: {
  resp: QuizResp;
  setResp: (r: QuizResp) => void;
  onPerfecto: () => void;
}) {
  const [i, setI] = useState(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const anilloRef = useRef<SVGCircleElement>(null);
  const perfectoNotificadoRef = useRef(false);

  const P = PREGUNTAS[i];
  const respondida = resp[i] !== null;
  const ultimo = i === PREGUNTAS.length - 1;
  const figuraKey = mostrarResultado ? "resultado" : i;

  const C = 2 * Math.PI * 52;
  const bien = resp.filter((r, k) => r === PREGUNTAS[k].ok).length;

  useEffect(() => {
    if (!mostrarResultado) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (anilloRef.current) anilloRef.current.style.strokeDashoffset = String(C * (1 - bien / PREGUNTAS.length));
      })
    );
    if (bien === PREGUNTAS.length && !perfectoNotificadoRef.current) {
      perfectoNotificadoRef.current = true;
      onPerfecto();
    }
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mostrarResultado]);

  function responder(k: number) {
    const next = resp.map((r, idx) => (idx === i ? k : r));
    setResp(next);
  }

  function siguiente() {
    if (ultimo) setMostrarResultado(true);
    else setI(i + 1);
  }

  function otraVez() {
    setResp(PREGUNTAS.map(() => null));
    setI(0);
    setMostrarResultado(false);
    perfectoNotificadoRef.current = false;
  }

  const [titulo, mensaje] =
    bien === PREGUNTAS.length
      ? ["¡Memoria digital de campeón!", "Respondiste todo bien. Estás más que listo para usar tu celular con confianza."]
      : bien >= PREGUNTAS.length - 2
        ? ["¡Muy buen trabajo!", "Vas muy bien. Revisa abajo las que fallaste y vuelve a intentarlo cuando quieras."]
        : ["¡Buen comienzo!", "Cada intento te enseña algo nuevo. Lee las explicaciones y prueba otra vez."];

  return (
    <div className={`${styles.act} ${styles.quiz}`}>
      <div className={styles.quizLado}>
        <div className={styles.intro}>
          <div className={styles.actTag}>
            <span className={styles.actNum}>02</span>
            <span className={styles.actTipo}>
              <Ico clave="escudo" />
              Quiz
            </span>
          </div>
          <h3>¿Qué tan lista está tu memoria digital?</h3>
          <p className={styles.actDesc}>Un quiz corto sobre cosas que usas todos los días en tu celular. Sin apuro: no hay tiempo límite.</p>
        </div>
        <div className={styles.figura}>
          <span className={styles.figuraForma} />
          <span key={figuraKey} className={`${styles.figuraIco} ${styles.cambia}`}>
            <Ico clave={mostrarResultado ? "estrella" : P.ico} className={styles.ico} />
          </span>
          <span className={styles.figuraN}>{mostrarResultado ? "★" : String(i + 1).padStart(2, "0")}</span>
        </div>
      </div>

      <div className={styles.quizMain} aria-live="polite">
        {!mostrarResultado ? (
          <>
            <div className={styles.quizTop}>
              <span>
                Pregunta {i + 1} de {PREGUNTAS.length}
              </span>
              <SegsQuiz resp={resp} />
            </div>
            <h4 className={styles.preg}>{P.q}</h4>
            <div className={styles.ops} role="group" aria-label={P.q}>
              {P.ops.map((o, k) => {
                let clase = "";
                if (respondida) {
                  clase = k === P.ok ? styles.bien : k === resp[i] ? styles.mal : styles.apagada;
                }
                return (
                  <button key={k} type="button" className={`${styles.op} ${clase}`} disabled={respondida} onClick={() => responder(k)}>
                    <span className={styles.opL}>{LETRAS[k]}</span>
                    <span>{o}</span>
                    <span className={styles.opM}>{clase === styles.bien ? "✓" : clase === styles.mal ? "✕" : ""}</span>
                  </button>
                );
              })}
            </div>
            {respondida && (
              <div className={`${styles.fb} ${resp[i] === P.ok ? styles.bien : styles.mal}`}>
                <span className={styles.emo}>{resp[i] === P.ok ? "🎉" : "💡"}</span>
                <div>
                  <b>{resp[i] === P.ok ? "¡Muy bien!" : `Casi… la correcta es la ${LETRAS[P.ok]}`}</b>
                  <p>{P.exp}</p>
                </div>
              </div>
            )}
            <div className={styles.quizPie}>
              {i > 0 && (
                <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={() => setI(i - 1)}>
                  Anterior
                </button>
              )}
              <button type="button" className={`${styles.btn} ${styles.btnP}`} disabled={!respondida} onClick={siguiente}>
                {ultimo ? "Ver mi resultado" : "Siguiente pregunta"} <Ico clave="flecha" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.res}>
              <div className={styles.anillo}>
                <svg viewBox="0 0 120 120">
                  <circle className={styles.anilloF} cx={60} cy={60} r={52} />
                  <circle ref={anilloRef} className={styles.anilloV} cx={60} cy={60} r={52} strokeDasharray={C} strokeDashoffset={C} />
                </svg>
                <b>
                  {bien}/{PREGUNTAS.length}
                  <small>correctas</small>
                </b>
              </div>
              <div>
                <span className={styles.eyebrow}>Tu resultado</span>
                <h4>{titulo}</h4>
                <p>{mensaje}</p>
              </div>
              <ul className={styles.repaso}>
                {PREGUNTAS.map((preg, k) => {
                  const ok = resp[k] === preg.ok;
                  return (
                    <li key={k}>
                      <i className={ok ? styles.repasoBien : styles.repasoMal}>{ok ? "✓" : "✕"}</i>
                      <span>
                        <b>{preg.q}</b>
                        {ok ? "Respondiste bien." : `Correcta: ${preg.ops[preg.ok]}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className={styles.quizPie}>
              <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={otraVez}>
                Intentar de nuevo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
