"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/bienestar.module.css";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { EXERCISE_ROUTINES, type ExerciseRoutine } from "@/lib/wellbeing/exercise-content";
import { logExerciseSession } from "@/lib/wellbeing/exercise-actions";

const LETRAS = ["L", "M", "M", "J", "V", "S", "D"];
const C = 2 * Math.PI * 60;

function mmss(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
function totalDe(r: ExerciseRoutine) {
  return r.steps.reduce((a, p) => a + p.seconds, 0);
}

function IconoRutina({ slug }: { slug: string }) {
  const paths: Record<string, string> = {
    "yoga-silla": "M12 4.5a2 2 0 1 0 0 .01M12 7v6M8 9l4 1 4-1M9 13h6v4M9 17v4M15 17v4M6 13h2v8",
    "caminata-consciente": "M13 4a2 2 0 1 0 0 .01M8 21l3-7 3 3v5M7 12l3-3 4 1 3 3",
    "estiramientos-guiados": "M12 4a2 2 0 1 0 0 .01M4 8l8 2 8-2M12 10v5l-4 6M12 15l4 6",
    "rutina-personalizada": "M12 2l2.2 6.6H21l-5.4 4 2 6.6L12 15.8 6.4 19.2l2-6.6L3 8.6h6.8z",
  };
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[slug] ?? paths["yoga-silla"]} />
    </svg>
  );
}
function IconoAnterior() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
function IconoSiguiente() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
function IconoPlay() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5l11 7-11 7z" fill="currentColor" />
    </svg>
  );
}
function IconoPausa() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" />
      <rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" />
    </svg>
  );
}

export function LowImpactRoutines({
  sessionsThisWeek,
  semana,
  personalizedRoutine,
}: {
  sessionsThisWeek: number;
  semana: (boolean | null)[];
  personalizedRoutine: ExerciseRoutine | null;
}) {
  const rutinas: ExerciseRoutine[] = personalizedRoutine ? [personalizedRoutine, ...EXERCISE_ROUTINES] : EXERCISE_ROUTINES;
  const [rutIndex, setRutIndex] = useState(0);
  const [paso, setPaso] = useState(0);
  const [restante, setRestante] = useState(rutinas[0].steps[0].seconds);
  const [corriendo, setCorriendo] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const [weekCount, setWeekCount] = useState(sessionsThisWeek);
  const [semanaLocal, setSemanaLocal] = useState(semana);
  const listaRef = useRef<HTMLUListElement>(null);

  const rutina = rutinas[rutIndex];
  const stepActual = rutina.steps[paso];

  // Referencias "vivas" que el intervalo lee directamente, para no tener
  // que reiniciarlo cada vez que cambian paso/rutina/restante.
  const pasoRef = useRef(paso);
  const rutinaRef = useRef(rutina);
  const restanteRef = useRef(restante);
  useEffect(() => {
    pasoRef.current = paso;
    rutinaRef.current = rutina;
    restanteRef.current = restante;
  });

  useEffect(() => {
    if (!corriendo || terminado) return;
    const id = setInterval(() => {
      const r = rutinaRef.current;
      const p = pasoRef.current;
      if (restanteRef.current > 1) {
        setRestante(restanteRef.current - 1);
        return;
      }
      if (p + 1 >= r.steps.length) {
        setCorriendo(false);
        setTerminado(true);
        logExerciseSession(r.slug, totalDe(r));
        setWeekCount((c) => c + 1);
        const hoy = (new Date().getDay() + 6) % 7;
        setSemanaLocal((prev) => prev.map((d, i) => (i === hoy ? true : d)));
        return;
      }
      setPaso(p + 1);
      setRestante(r.steps[p + 1].seconds);
    }, 1000);
    return () => clearInterval(id);
  }, [corriendo, terminado]);

  function elegir(i: number) {
    setRutIndex(i);
    setPaso(0);
    setRestante(rutinas[i].steps[0].seconds);
    setCorriendo(false);
    setTerminado(false);
  }

  function irPaso(n: number) {
    if (n < 0 || n >= rutina.steps.length) return;
    setPaso(n);
    setRestante(rutina.steps[n].seconds);
  }

  const f = restante / stepActual.seconds;

  return (
    <section className={styles.bloque} aria-labelledby="rut-titulo">
      <div className={styles.rutinas}>
        <div>
          <div className={styles.rutinasCab}>
            <div className={styles.eyebrow}>Muévete con calma</div>
            <h2 className={styles.seccion} id="rut-titulo">
              Rutinas de <span className={styles.enfasis}>bajo impacto</span>
            </h2>
            <p>Elige una rutina guiada. Cada paso avanza solo, con instrucciones y el tiempo en pantalla.</p>
          </div>
          <ul className={styles.lista} ref={listaRef}>
            {rutinas.map((r, i) => (
              <li key={r.slug} className={`${styles.rut} ${i === rutIndex ? styles.rutOn : ""}`}>
                <button type="button" className={styles.rutBoton} aria-pressed={i === rutIndex} onClick={() => elegir(i)}>
                  <span className={styles.rutIco}>
                    <IconoRutina slug={r.slug} />
                  </span>
                  <span>
                    <span className={styles.rutNombre}>{r.title}</span>
                    <span className={styles.rutDesc}>{r.description}</span>
                  </span>
                  <span className={styles.rutMeta}>
                    {Math.round(totalDe(r) / 60)} min
                    <small>
                      {r.level} · {r.steps.length} pasos
                    </small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.semana}>
            <span className={styles.semanaNum}>{weekCount}</span>
            <span className={styles.semanaTxt}>
              {weekCount === 1 ? "sesión" : "sesiones"}
              <br />
              esta semana
            </span>
            <span className={styles.semanaDias}>
              {LETRAS.map((l, i) => (
                <span key={i} className={semanaLocal[i] ? styles.semanaHecho : ""}>
                  <i />
                  {l}
                </span>
              ))}
            </span>
          </div>
        </div>

        <div className={styles.player} aria-live="polite">
          {terminado ? (
            <div className={styles.fin}>
              <svg className={styles.confeti} viewBox="0 0 40 40" aria-hidden="true">
                <polygon points="20,2 38,30 20,38" fill="#8a983a" />
                <polygon points="20,2 20,38 2,28" fill="#5e6926" />
                <polygon points="20,2 38,30 26,22" fill="#c7d873" opacity={0.7} />
              </svg>
              <h3>¡Rutina completada!</h3>
              <p>
                Terminaste <b>{rutina.title}</b>. Tu cuerpo te lo agradece.
              </p>
              <div className={styles.controles} style={{ justifyContent: "center" }}>
                <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={() => elegir(rutIndex)}>
                  Repetir
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnS}`}
                  onClick={() => listaRef.current?.querySelector("button")?.focus()}
                >
                  Elegir otra rutina
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.playerMedia}>
                <ImagePlaceholder label={stepActual.name} />
                <div className={styles.playerVelo} />
                <span className={styles.playerPaso}>
                  Paso {paso + 1} de {rutina.steps.length}
                </span>
                <div className={styles.temporizador}>
                  <svg viewBox="0 0 140 140" aria-hidden="true">
                    <circle className={styles.tFondo} cx={70} cy={70} r={60} />
                    <circle className={styles.tValor} cx={70} cy={70} r={60} strokeDasharray={C} strokeDashoffset={C * (1 - f)} />
                  </svg>
                  <div className={styles.temporizadorTxt}>
                    <b>{mmss(Math.max(0, restante))}</b>
                    <span>RESTANTE</span>
                  </div>
                </div>
              </div>
              <div className={styles.playerCuerpo}>
                <span className={styles.playerRut}>{rutina.title}</span>
                <h3 className={styles.playerTitulo}>{stepActual.name}</h3>
                <p className={styles.playerInstr}>{stepActual.instruction}</p>
                <div className={styles.playerPuntos} aria-hidden="true">
                  {rutina.steps.map((_, k) => (
                    <i
                      key={k}
                      className={k < paso ? styles.puntoHecho : k === paso ? styles.puntoActual : ""}
                      style={k === paso ? ({ "--p": `${(1 - f) * 100}%` } as React.CSSProperties) : undefined}
                    />
                  ))}
                </div>
                <div className={styles.controles}>
                  <button type="button" className={styles.ctrl} aria-label="Paso anterior" disabled={paso === 0} onClick={() => irPaso(paso - 1)}>
                    <IconoAnterior />
                  </button>
                  <button
                    type="button"
                    className={`${styles.ctrl} ${styles.ctrlPlay}`}
                    aria-label={corriendo ? "Pausar" : "Comenzar"}
                    onClick={() => setCorriendo((c) => !c)}
                  >
                    {corriendo ? <IconoPausa /> : <IconoPlay />}
                  </button>
                  <button type="button" className={styles.ctrl} aria-label="Siguiente paso" onClick={() => irPaso(paso + 1)}>
                    <IconoSiguiente />
                  </button>
                  <small>Duración total: {mmss(totalDe(rutina))} min</small>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
