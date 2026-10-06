"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "@/styles/salud-mental-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type Animo = "tormenta" | "nublado" | "parcial" | "sol" | "arcoiris";
type Momento = { fecha: string; animo: Animo; pregunta: string; texto: string };

const ANIMOS: { id: Animo; t: string; c: string }[] = [
  { id: "tormenta", t: "Muy mal", c: "#8e9bd6" },
  { id: "nublado", t: "Bajito", c: "#9fb4c7" },
  { id: "parcial", t: "Más o menos", c: "#9fd3c9" },
  { id: "sol", t: "Bien", c: "#e8c95a" },
  { id: "arcoiris", t: "¡Muy bien!", c: "#aebd52" },
];

const PREGUNTAS_REFLEXION = [
  "Tómate un minuto. ¿Cómo te sientes hoy, de verdad?",
  "¿Qué pequeña cosa te hizo sonreír esta semana?",
  "¿Qué te está preocupando y qué parte de eso sí depende de ti?",
  "¿A quién te gustaría agradecerle algo y por qué?",
  "Si pudieras decirle algo a tu “yo” de hace 20 años, ¿qué sería?",
  "¿Qué necesitas hoy para sentirte un poquito mejor?",
];

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function fechaCorta(iso: string) {
  const d = new Date(iso + "T12:00");
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

function ReflexionIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}
function CandadoIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function OtraIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}
function CorazonIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.3-9.6C1.4 7.8 4 4 7.6 4c2 0 3.4 1.1 4.4 2.6C13 5.1 14.4 4 16.4 4 20 4 22.6 7.8 21.3 11.4 19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

// Caritas-clima para el ánimo, igual que en el diseño.
function CaraAnimo({ id, c }: { id: Animo; c: string }) {
  const caras: Record<Animo, React.ReactNode> = {
    tormenta: (
      <>
        <path d="M20 38q5-4 10 0" />
        <circle cx="19" cy="30" r="1.8" fill="#181712" />
        <circle cx="31" cy="30" r="1.8" fill="#181712" />
      </>
    ),
    nublado: (
      <>
        <path d="M20 36h10" />
        <circle cx="19" cy="30" r="1.8" fill="#181712" />
        <circle cx="31" cy="30" r="1.8" fill="#181712" />
      </>
    ),
    parcial: (
      <>
        <path d="M20 35q5 2 10 0" />
        <circle cx="19" cy="30" r="1.8" fill="#181712" />
        <circle cx="31" cy="30" r="1.8" fill="#181712" />
      </>
    ),
    sol: (
      <>
        <path d="M19 34q6 5 12 0" />
        <circle cx="19" cy="29" r="1.8" fill="#181712" />
        <circle cx="31" cy="29" r="1.8" fill="#181712" />
      </>
    ),
    arcoiris: (
      <>
        <path d="M18 33q7 7 14 0z" fill="#181712" />
        <path d="M16 29q3-3 6 0M28 29q3-3 6 0" />
      </>
    ),
  };
  const extra: Record<Animo, React.ReactNode> = {
    tormenta: <path d="M36 6l-4 7h5l-4 7" stroke="#ffe27a" strokeWidth={2.2} fill="none" />,
    nublado: <ellipse cx="38" cy="12" rx="9" ry="5.5" fill="#c9d1d8" stroke="none" />,
    parcial: <circle cx="40" cy="10" r="5" fill="#e8c95a" stroke="none" />,
    sol: (
      <g stroke="#e8c95a" strokeWidth={2}>
        <path d="M25 3v4M25 43v4M3 25h4M43 25h4M9 9l3 3M38 38l3 3M9 41l3-3M38 12l3-3" />
      </g>
    ),
    arcoiris: (
      <>
        <path d="M6 16a19 19 0 0 1 38 0" stroke="#ff8a74" strokeWidth={2.4} fill="none" />
        <path d="M10 16a15 15 0 0 1 30 0" stroke="#e8c95a" strokeWidth={2.4} fill="none" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 50 50" aria-hidden="true">
      {extra[id]}
      <circle cx={25} cy={31} r={14} fill={c} />
      <g stroke="#181712" strokeWidth={2.2} strokeLinecap="round" fill="none">
        {caras[id]}
      </g>
    </svg>
  );
}

export function SaludMentalReflexionActividad({ initialMoments }: { initialMoments: Momento[] }) {
  const [animo, setAnimo] = useState<Animo | null>(null);
  const [pregIndex, setPregIndex] = useState(0);
  const [otraGira, setOtraGira] = useState(false);
  const [texto, setTexto] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [momentos, setMomentos] = useState<Momento[]>(initialMoments);
  const [fase, setFase] = useState<"in" | "out" | null>(null);
  const [cicloTxt, setCicloTxt] = useState("Listo");
  const [subTxt, setSubTxt] = useState("Un minuto: inhala mientras crece, exhala mientras se achica.");
  const respirandoRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [fechaHoy, setFechaHoy] = useState("");

  useEffect(() => {
    // La fecha de hoy se llena después del montaje para no desajustar el
    // HTML del servidor (que no conoce la hora local de quien lee).
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setFechaHoy(new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" }));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const animoActual = ANIMOS.find((a) => a.id === animo);
  const colorAnimo = animoActual?.c ?? "#9fd3c9";

  function ponerPregunta(i: number) {
    setPregIndex(i);
  }

  function elegirAnimo(id: Animo) {
    setAnimo(id);
    if (id === "tormenta" || id === "nublado") ponerPregunta(5);
    else if (id === "arcoiris") ponerPregunta(1);
  }

  function otraPregunta() {
    setOtraGira((g) => !g);
    ponerPregunta((pregIndex + 1) % PREGUNTAS_REFLEXION.length);
  }

  const palabras = texto.trim() ? texto.trim().split(/\s+/).length : 0;

  async function guardar() {
    setGuardando(true);
    const nuevo: Momento = {
      fecha: new Date().toISOString().slice(0, 10),
      animo: animo ?? "parcial",
      pregunta: PREGUNTAS_REFLEXION[pregIndex],
      texto: texto.trim(),
    };
    const siguientes = [nuevo, ...momentos].slice(0, 20);
    setMomentos(siguientes);
    await saveActivityProgress("salud-mental", "reflexion", { moments: siguientes });
    setGuardando(false);
    setGuardado(true);
  }

  function escribirOtro() {
    setTexto("");
    setGuardado(false);
    ponerPregunta((pregIndex + 1) % PREGUNTAS_REFLEXION.length);
  }

  function toggleRespirar() {
    if (respirandoRef.current) {
      if (timerRef.current) clearTimeout(timerRef.current);
      respirandoRef.current = false;
      setFase(null);
      setCicloTxt("Listo");
      setSubTxt("Un minuto: inhala mientras crece, exhala mientras se achica.");
      return;
    }
    respirandoRef.current = true;
    let ciclo = 0;
    const paso = (f: "in" | "out") => {
      if (f === "in") {
        if (ciclo === 6) {
          respirandoRef.current = false;
          setFase(null);
          setCicloTxt("¡Muy bien!");
          setSubTxt("Ahora sí: cuéntanos cómo te sientes.");
          return;
        }
        ciclo++;
        setFase("in");
        setCicloTxt("Inhala…");
        setSubTxt(`Respiración ${ciclo} de 6`);
        timerRef.current = setTimeout(() => paso("out"), 4000);
      } else {
        setFase("out");
        setCicloTxt("Exhala…");
        timerRef.current = setTimeout(() => paso("in"), 6000);
      }
    };
    paso("in");
  }

  const respirando = fase !== null;

  return (
    <div className={`${styles.act} ${styles.refl}`} style={{ ["--animo" as string]: colorAnimo } as CSSProperties}>
      <div>
        <div className={styles.actTag}>
          <span className={styles.actNum}>01</span>
          <span className={styles.actTipo}>
            <ReflexionIcon />
            Reflexión
          </span>
        </div>
        <h3>Un momento para ti</h3>
        <p className={styles.actDesc}>Primero respira un poco, luego cuéntanos cómo amaneciste y escribe lo que sientas. Nadie más leerá esto.</p>

        <div className={styles.respira}>
          <div className={`${styles.orbe} ${fase === "in" ? styles.inhala : fase === "out" ? styles.exhala : ""}`} aria-hidden="true">
            <span className={styles.orbeAnillo} />
            <span className={styles.orbeBola} />
            <b>{cicloTxt}</b>
          </div>
          <div className={styles.respiraTxt}>
            <b>Respira conmigo</b>
            <span>{subTxt}</span>
            <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={toggleRespirar}>
              <PlayIcon />
              {respirando ? "Detener" : cicloTxt === "¡Muy bien!" ? "Otra vez" : "Empezar"}
            </button>
          </div>
        </div>

        <p className={styles.animoT} id="animoT">
          ¿Cómo te sientes hoy?
        </p>
        <div className={styles.animos} role="group" aria-labelledby="animoT">
          {ANIMOS.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`${styles.animo} ${animo === a.id ? styles.animoOn : ""}`}
              aria-pressed={animo === a.id}
              style={{ ["--c" as string]: a.c } as CSSProperties}
              onClick={() => elegirAnimo(a.id)}
            >
              <CaraAnimo id={a.id} c={a.c} />
              <span>{a.t}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className={styles.hoja}>
          <div className={styles.hojaTop}>
            <span>{fechaHoy}</span>
            <span className={styles.priv}>
              <CandadoIcon />
              Solo tú lo ves
            </span>
          </div>
          <div className={styles.pregunta}>
            <p>{PREGUNTAS_REFLEXION[pregIndex]}</p>
            <button type="button" className={`${styles.otra} ${otraGira ? styles.otraGira : ""}`} aria-label="Mostrar otra pregunta" title="Otra pregunta" onClick={otraPregunta}>
              <OtraIcon />
            </button>
          </div>
          <label htmlFor="sm-texto" className={styles.eyebrow} style={{ position: "absolute", left: -9999 }}>
            Tu reflexión
          </label>
          <textarea id="sm-texto" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe lo primero que se te venga a la mente, sin juzgarte…" />
          <div className={styles.hojaPie}>
            <span className={styles.contador}>{palabras === 0 ? "0 palabras" : palabras === 1 ? "1 palabra" : `${palabras} palabras`}</span>
            <button type="button" className={`${styles.btn} ${styles.btnP}`} disabled={palabras === 0 || guardando} onClick={guardar}>
              <CheckIcon />
              {guardando ? "Guardando…" : "Guardar mi momento"}
            </button>
          </div>
          {guardado && (
            <div className={styles.guardado}>
              <CorazonIcon />
              <b>Gracias por darte este momento</b>
              <span>Quedó guardado en “Mis momentos”. Volver a leerte con el tiempo también es cuidarte.</span>
              <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={escribirOtro}>
                Escribir otro
              </button>
            </div>
          )}
        </div>

        <div className={styles.momentos}>
          <div className={styles.momentosT}>
            <b>Mis momentos</b>
            <small>{momentos.length === 0 ? "" : momentos.length === 1 ? "1 guardado" : `${momentos.length} guardados`}</small>
          </div>
          {momentos.length === 0 ? (
            <p className={styles.vacioMomentos}>Todavía no has guardado ningún momento. El primero que escribas aparecerá aquí.</p>
          ) : (
            <div className={styles.tira}>
              {momentos.map((m, i) => {
                const a = ANIMOS.find((x) => x.id === m.animo) ?? ANIMOS[2];
                return (
                  <div key={i} className={styles.mom} style={{ ["--c" as string]: a.c } as CSSProperties}>
                    <b>
                      {fechaCorta(m.fecha)} · {a.t}
                    </b>
                    <p>{m.texto}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
