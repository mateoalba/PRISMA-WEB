"use client";

import { useState } from "react";
import styles from "@/styles/tiempo-libre-actividades.module.css";
import { Icono, type ClaveIcono } from "./TiempoLibreIconos";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type Carta = { q: string; ico: ClaveIcono; ops: string[]; ok: number; exp: string };

const CARTAS: Carta[] = [
  {
    q: "¿Cuál de estos beneficios reales tiene tener un pasatiempo?",
    ico: "corazon",
    ops: ["Reduce el estrés y mejora el ánimo", "Elimina por completo el envejecimiento", "Sustituye la necesidad de dormir", "Garantiza ganar dinero"],
    ok: 0,
    exp: "Hacer algo que disfrutas baja el estrés y levanta el ánimo. ¡Por eso vale la pena darse ese tiempo!",
  },
  {
    q: "Si nunca has pintado, ¿qué es lo recomendable para empezar?",
    ico: "pincel",
    ops: ["Empezar con algo simple y sin presión, solo por disfrutar", "Comprar el equipo más caro que exista", "Esperar a ser experto antes de intentarlo", "No intentarlo porque ya es tarde"],
    ok: 0,
    exp: "Unos lápices de colores o acuarelas básicas bastan. Lo importante es disfrutar, no que quede perfecto.",
  },
  {
    q: "¿Qué actividad ayuda a ejercitar la memoria?",
    ico: "nota",
    ops: ["Ver el mismo programa todo el día", "Aprender la letra de una canción nueva", "Evitar cualquier cosa nueva", "Dormir más de la cuenta"],
    ok: 1,
    exp: "Aprender algo nuevo —una canción, un juego, una receta— pone a trabajar tu memoria de forma divertida.",
  },
  {
    q: "¿Es tarde para aprender a tocar un instrumento a los 70 años?",
    ico: "guitarra",
    ops: ["Sí, solo se aprende de niño", "No, se puede aprender a cualquier edad", "Solo si ya sabías de joven", "Solo si practicas 8 horas al día"],
    ok: 1,
    exp: "¡Nunca es tarde! Muchas personas empiezan después de jubilarse. Con 15 minutos al día se avanza mucho.",
  },
  {
    q: "¿Qué es una buena forma de encontrar un nuevo pasatiempo?",
    ico: "lupa",
    ops: ["Probar una clase o taller de prueba", "Esperar a que llegue solo", "Hacer lo mismo que siempre", "Elegir lo que otros digan"],
    ok: 0,
    exp: "Una clase de prueba te deja conocer algo nuevo sin compromiso. En PRISMA tienes talleres para probar.",
  },
];
const LETRAS = "ABCD";

function Pila({ tipo, n, titulo }: { tipo: "bien" | "repaso"; n: number; titulo: string }) {
  return (
    <div className={`${styles.pila} ${tipo === "bien" ? styles.pilaBien : styles.pilaRepaso}`}>
      <div className={styles.pilaCartas}>
        <i />
        {Array.from({ length: n }, (_, k) => (
          <i key={k} className={styles.c} style={{ transform: `rotate(${(k % 2 ? 1 : -1) * (3 + k * 2)}deg) translateY(${-k * 3}px)` }}>
            {k === n - 1 ? (tipo === "bien" ? "✓" : "↺") : ""}
          </i>
        ))}
      </div>
      <b>{n}</b>
      <span>{titulo}</span>
    </div>
  );
}

export function QuizCartasActividad({ initialResp }: { initialResp: (number | null)[] }) {
  const [i, setI] = useState(() => {
    const primeraSinResponder = initialResp.findIndex((r) => r === null);
    return primeraSinResponder === -1 ? CARTAS.length : primeraSinResponder;
  });
  const [resp, setResp] = useState<(number | null)[]>(initialResp);
  const [saliendo, setSaliendo] = useState<"bien" | "mal" | null>(null);

  const aciertos = resp.filter((r, k) => r !== null && r === CARTAS[k].ok).length;
  const fallos = resp.filter((r, k) => r !== null && r !== CARTAS[k].ok).length;

  function responder(k: number) {
    const next = resp.map((r, idx) => (idx === i ? k : r));
    setResp(next);
    saveActivityProgress("tiempo-libre", "quiz-cartas", { resp: next });
  }

  function siguienteCarta() {
    setSaliendo(resp[i] === CARTAS[i].ok ? "bien" : "mal");
    setTimeout(() => {
      setI((v) => v + 1);
      setSaliendo(null);
    }, 520);
  }

  function otraVez() {
    setI(0);
    setResp(CARTAS.map(() => null));
    saveActivityProgress("tiempo-libre", "quiz-cartas", { resp: CARTAS.map(() => null) });
  }

  if (i >= CARTAS.length) {
    const T = CARTAS.length;
    const [titulo, mensaje] =
      aciertos === T
        ? ["¡Todas las cartas son tuyas!", "Sabes mucho sobre disfrutar tu tiempo. Ahora, ¡a ponerlo en práctica!"]
        : aciertos >= 3
          ? ["¡Muy buena mano!", `Ganaste ${aciertos} de ${T} cartas. Las de repaso te dejaron ideas nuevas para probar.`]
          : ["¡Buena partida!", `Ganaste ${aciertos} de ${T}. Cada carta te dejó una idea; vuelve a jugar cuando quieras.`];
    return (
      <div className={`${styles.act} ${styles.quiz}`}>
        <div className={styles.quizCab}>
          <div>
            <div className={styles.actTag}>
              <span className={styles.actNum}>01</span>
              <span className={styles.actTipo}>
                <Icono clave="lupa" className={styles.ico} />
                Quiz
              </span>
            </div>
            <h3>Ideas para tu tiempo libre</h3>
            <p className={styles.actDesc}>¿Qué tanto sabes sobre disfrutar tu tiempo libre? Elige una respuesta y la carta se voltea para contarte más.</p>
          </div>
        </div>
        <div className={styles.final}>
          <div className={styles.cartasF}>
            {resp.map((r, k) => (
              <i
                key={k}
                style={{
                  background: r === CARTAS[k].ok ? "linear-gradient(150deg,#c7d873,#7d8b2f)" : "linear-gradient(150deg,#ffb48a,#c2452e)",
                  transform: `rotate(${(k - 2) * 9}deg) translateY(${Math.abs(k - 2) * 6}px)`,
                  animationDelay: `${k * 0.08}s`,
                }}
              />
            ))}
          </div>
          <span className={styles.eyebrow}>
            Tu resultado · {aciertos}/{T}
          </span>
          <h4>{titulo}</h4>
          <p>{mensaje}</p>
          <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={otraVez}>
            Barajar y jugar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const C = CARTAS[i];
  const r = resp[i];
  const respondida = r !== null;
  const bien = r === C.ok;

  return (
    <div className={`${styles.act} ${styles.quiz}`}>
      <div className={styles.quizCab}>
        <div>
          <div className={styles.actTag}>
            <span className={styles.actNum}>01</span>
            <span className={styles.actTipo}>
              <Icono clave="lupa" className={styles.ico} />
              Quiz
            </span>
          </div>
          <h3>Ideas para tu tiempo libre</h3>
          <p className={styles.actDesc}>¿Qué tanto sabes sobre disfrutar tu tiempo libre? Elige una respuesta y la carta se voltea para contarte más.</p>
        </div>
      </div>

      <div className={styles.mesa}>
        <Pila tipo="bien" n={aciertos} titulo="Aciertos" />
        <div className={styles.mazo}>
          {i < CARTAS.length - 1 && <span className={styles.mazoFondo} />}
          {i < CARTAS.length - 2 && <span className={styles.mazoFondo} />}
          <div key={i} className={`${styles.carta} ${styles.entra} ${respondida ? styles.volteada : ""} ${saliendo === "bien" ? styles.saleBien : saliendo === "mal" ? styles.saleMal : ""}`}>
            <div className={`${styles.cara} ${styles.caraFrente}`}>
              <span className={styles.caraIco}>
                <Icono clave={C.ico} className={styles.ico} />
              </span>
              <h4>{C.q}</h4>
              <div className={styles.caraPie}>
                <span>
                  Carta {i + 1} de {CARTAS.length}
                </span>
                <span>PRISMA · Tiempo libre</span>
              </div>
            </div>
            <div className={`${styles.cara} ${styles.caraAtras} ${bien ? styles.bien : styles.mal}`}>
              <span className={styles.grande}>{bien ? "¡Correcto!" : "Casi…"}</span>
              <p>{C.exp}</p>
              {!bien && respondida && <small>La respuesta era: {C.ops[C.ok]}</small>}
            </div>
          </div>
        </div>
        <Pila tipo="repaso" n={fallos} titulo="Por repasar" />
      </div>

      <div className={styles.ops} role="group" aria-label={C.q}>
        {C.ops.map((o, k) => {
          let clase = "";
          if (respondida) clase = k === C.ok ? styles.bien : k === r ? styles.mal : styles.apagada;
          return (
            <button key={k} type="button" className={`${styles.op} ${clase}`} disabled={respondida} onClick={() => responder(k)}>
              <span className={styles.opL}>{LETRAS[k]}</span>
              {o}
            </button>
          );
        })}
      </div>

      <div className={styles.quizSig}>
        {respondida && (
          <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={siguienteCarta}>
            {i === CARTAS.length - 1 ? "Ver mis cartas" : "Siguiente carta"}
            <Icono clave="sig" className={styles.ico} />
          </button>
        )}
      </div>
    </div>
  );
}
