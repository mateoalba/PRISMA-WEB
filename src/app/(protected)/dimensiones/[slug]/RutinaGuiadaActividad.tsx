"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/bienestar-fisico-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type Pose = "brazos" | "cuello" | "piernas" | "caminar" | "agua";
type Ejercicio = { pose: Pose; nombre: string; t: string; seg: number; d: string; cue: [string, string] };

const RUTINA: Ejercicio[] = [
  {
    pose: "brazos",
    nombre: "Brazos",
    t: "Estira los brazos hacia arriba y respira profundo",
    seg: 45,
    d: "Sube los brazos despacio mientras tomas aire por la nariz. Bájalos soltando el aire por la boca.",
    cue: ["Inhala… sube", "Exhala… baja"],
  },
  {
    pose: "cuello",
    nombre: "Cuello",
    t: "Gira suavemente el cuello a cada lado",
    seg: 40,
    d: "Lleva la oreja hacia el hombro, sin subir el hombro. Cuenta hasta tres y cambia de lado.",
    cue: ["Hacia un lado", "Hacia el otro"],
  },
  {
    pose: "piernas",
    nombre: "Piernas",
    t: "Estira las piernas sentado, sin forzar",
    seg: 60,
    d: "Sentado en una silla firme, estira una pierna al frente con el talón en el aire. Alterna cada pocos segundos.",
    cue: ["Estira", "Descansa"],
  },
  {
    pose: "caminar",
    nombre: "Caminar",
    t: "Camina un par de minutos por la casa",
    seg: 120,
    d: "Camina a tu ritmo, moviendo los brazos. Si quieres, pon una canción que te guste.",
    cue: ["Un paso", "Otro paso"],
  },
  {
    pose: "agua",
    nombre: "Agua",
    t: "Bebe un vaso de agua al terminar",
    seg: 20,
    d: "Tu cuerpo lo agradece. Bebe a sorbos pequeños y con calma.",
    cue: ["A sorbitos", "¡Salud!"],
  },
];
const TOTAL = RUTINA.reduce((a, p) => a + p.seg, 0);
const C = 2 * Math.PI * 94;
const DIAS_LETRA = ["L", "M", "X", "J", "V", "S", "D"];

function mmss(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function poseClase(pose: Pose): string {
  return { brazos: styles.pBrazos, cuello: styles.pCuello, piernas: styles.pPiernas, caminar: styles.pCaminar, agua: styles.pAgua }[pose];
}

function FiguraSVG({ pose }: { pose: Pose | "quieto" | "listo" }) {
  const cabeza = (
    <g className={styles.cabG}>
      <line className={styles.cuerpo} x1={100} y1={82} x2={100} y2={70} />
      <circle className={styles.cabeza} cx={100} cy={52} r={17} />
    </g>
  );
  if (pose === "piernas") {
    return (
      <svg viewBox="0 0 200 230">
        <line className={styles.piso} x1={30} y1={222} x2={170} y2={222} />
        <path className={styles.silla} d="M70 150 H130 M78 150 V220 M122 150 V220 M70 150 V90" />
        <g className={styles.torsoG}>
          {cabeza}
          <line className={styles.cuerpo} x1={100} y1={82} x2={100} y2={148} />
          <g className={styles.brazoI}>
            <path className={styles.cuerpo} d="M100 90 L88 118 L108 140" />
          </g>
          <g className={styles.brazoD}>
            <path className={styles.cuerpo} d="M100 90 L114 118 L118 142" />
          </g>
        </g>
        <path className={styles.cuerpo} d="M100 150 L124 152 L124 218" />
        <g className={styles.pierD}>
          <path className={styles.cuerpo} d="M100 150 L128 152 L130 216" stroke="#8fd18a" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 230">
      <line className={styles.piso} x1={30} y1={222} x2={170} y2={222} />
      <g className={styles.todo}>
        {cabeza}
        <line className={styles.cuerpo} x1={100} y1={82} x2={100} y2={142} />
        {pose === "agua" ? (
          <>
            <g className={styles.brazoI}>
              <path className={styles.cuerpo} d="M100 82 L80 110 L74 138" />
            </g>
            <g className={styles.brazoD}>
              <path className={styles.cuerpo} d="M100 82 L120 110 L126 138" />
              <rect x={120} y={128} width={16} height={22} rx={3} fill="#9fd3c9" stroke="#f5f1e6" strokeWidth={3} />
            </g>
          </>
        ) : (
          <>
            <g className={styles.brazoI}>
              <path className={styles.cuerpo} d="M100 82 L80 110 L74 138" />
            </g>
            <g className={styles.brazoD}>
              <path className={styles.cuerpo} d="M100 82 L120 110 L126 138" />
            </g>
          </>
        )}
        <g className={styles.pierI}>
          <path className={styles.cuerpo} d="M100 142 L88 180 L84 218" />
        </g>
        <g className={styles.pierD}>
          <path className={styles.cuerpo} d="M100 142 L112 180 L116 218" />
        </g>
      </g>
    </svg>
  );
}

export function RutinaGuiadaActividad({ initialCompletados }: { initialCompletados: string[] }) {
  const [i, setI] = useState(-1);
  const [rest, setRest] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [hechos, setHechos] = useState<boolean[]>(RUTINA.map(() => false));
  const [terminado, setTerminado] = useState(false);
  const [completados, setCompletados] = useState<string[]>(initialCompletados);
  const ringRef = useRef<SVGCircleElement>(null);
  const [semanaInfo] = useState(() => {
    const hoy = new Date();
    const dow = (hoy.getDay() + 6) % 7;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - dow);
    return Array.from({ length: 7 }, (_, k) => {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + k);
      return d.toISOString().slice(0, 10);
    });
  });

  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => setRest((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [corriendo]);

  useEffect(() => {
    if (!corriendo || rest > 0 || i < 0) return;
    const id = setTimeout(() => {
      setHechos((h) => h.map((v, idx) => (idx === i ? true : v)));
      if (i < RUTINA.length - 1) {
        setI(i + 1);
        setRest(RUTINA[i + 1].seg);
      } else {
        setTerminado(true);
        setCorriendo(false);
      }
    }, 0);
    return () => clearTimeout(id);
  }, [rest, corriendo, i]);

  useEffect(() => {
    if (!terminado) return;
    const id = setTimeout(() => {
      const hoy = new Date().toISOString().slice(0, 10);
      const next = completados.includes(hoy) ? completados : [...completados, hoy];
      setCompletados(next);
      saveActivityProgress("bienestar-fisico", "rutina-guiada", { completados: next });
    }, 0);
    return () => clearTimeout(id);
  }, [terminado, completados]);

  useEffect(() => {
    const el = ringRef.current;
    if (!el) return;
    el.style.transition = "none";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "";
      });
    });
  }, [i]);

  function alternar() {
    if (terminado) return otraVez();
    if (i < 0) {
      setI(0);
      setRest(RUTINA[0].seg);
      setCorriendo(true);
      return;
    }
    setCorriendo((c) => !c);
  }
  function otraVez() {
    setTerminado(false);
    setHechos(RUTINA.map(() => false));
    setI(0);
    setRest(RUTINA[0].seg);
    setCorriendo(true);
  }
  function saltar() {
    setHechos((h) => h.map((v, idx) => (idx === i ? true : v)));
    if (i < RUTINA.length - 1) {
      setI(i + 1);
      setRest(RUTINA[i + 1].seg);
    } else {
      setTerminado(true);
      setCorriendo(false);
    }
  }
  function irA(k: number) {
    if (terminado) return;
    setI(k);
    setRest(RUTINA[k].seg);
  }

  const ejercicio = i >= 0 && i < RUTINA.length ? RUTINA[i] : null;
  const transcurrido = ejercicio ? ejercicio.seg - rest : 0;
  const mitad = Math.floor(transcurrido / 4) % 2;
  const cueTexto = terminado ? "¡Lo lograste!" : i < 0 ? "¿Empezamos?" : corriendo ? ejercicio!.cue[mitad] : "En pausa";
  const contadorTexto = terminado ? "✓" : i < 0 ? mmss(TOTAL) : mmss(rest);
  const dashoffset = terminado ? 0 : ejercicio ? C * (1 - rest / ejercicio.seg) : 0;
  const figuraClase = terminado
    ? `${styles.figura} ${styles.pListo}`
    : i < 0
      ? styles.figura
      : `${styles.figura} ${poseClase(ejercicio!.pose)} ${corriendo ? "" : styles.pausa}`;
  const textoBoton = terminado ? "Hacerla otra vez" : i < 0 ? "Empezar rutina" : corriendo ? "Pausar" : "Continuar";

  return (
    <div className={`${styles.act} ${styles.rutina}`}>
      <div className={styles.escena}>
        <div className={styles.aro}>
          <svg className={styles.anillo} viewBox="0 0 200 200" aria-hidden="true">
            <circle className={styles.f} cx={100} cy={100} r={94} />
            <circle ref={ringRef} className={styles.v} cx={100} cy={100} r={94} style={{ strokeDasharray: C, strokeDashoffset: dashoffset }} />
          </svg>
          <span className={styles.cue}>{cueTexto}</span>
          <div className={figuraClase}>
            <FiguraSVG pose={terminado ? "listo" : i < 0 ? "quieto" : ejercicio!.pose} />
          </div>
          <span className={styles.contador} aria-live="off">
            {contadorTexto}
          </span>
        </div>
      </div>

      <div>
        <div className={styles.actTag}>
          <span className={styles.actNum}>01</span>
          <span className={styles.actTipo}>
            <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 11l3 3 8-8" />
              <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
            </svg>
            Rutina guiada
          </span>
        </div>
        <h3>Rutina de estiramiento matutino</h3>
        <p className={styles.actDesc}>Cinco minutos para despertar el cuerpo con calma. No tienes que marcar nada: solo sigue a la figura y el reloj te avisa cuándo cambiar.</p>

        <div className={styles.pasoInfo} aria-live="polite" style={{ marginTop: 26 }}>
          {terminado ? (
            <>
              <span className={styles.n}>Rutina completa</span>
              <h4>¡Tu cuerpo ya despertó!</h4>
              <p>Hiciste unos 5 minutos de movimiento suave. Repetirla cada mañana es un gran hábito.</p>
            </>
          ) : i < 0 ? (
            <>
              <span className={styles.n}>Antes de empezar</span>
              <h4>Busca un espacio cómodo y una silla firme</h4>
              <p>Usa ropa suelta y ten un vaso de agua cerca. Son 5 ejercicios suaves; puedes pausar cuando quieras.</p>
              <div className={styles.cuidado}>
                <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 9v4M12 17h.01" />
                  <path d="M10.3 3.9L2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                </svg>
                Si sientes dolor o mareo, detente y descansa.
              </div>
            </>
          ) : (
            <>
              <span className={styles.n}>
                Ejercicio {i + 1} de {RUTINA.length}
              </span>
              <h4>{ejercicio!.t}</h4>
              <p>{ejercicio!.d}</p>
            </>
          )}
        </div>

        <div className={styles.controles}>
          <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={alternar}>
            <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
              {terminado ? (
                <>
                  <path d="M20 11a8 8 0 1 0-2.3 5.7" />
                  <path d="M20 4v7h-7" />
                </>
              ) : corriendo ? (
                <path d="M8 5v14M16 5v14" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
            <span>{textoBoton}</span>
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} disabled={i < 0 || terminado} onClick={saltar}>
            {i === RUTINA.length - 1 ? "Terminar ✓" : "Siguiente ejercicio →"}
          </button>
        </div>

        <ol className={styles.linea}>
          {RUTINA.map((p, k) => {
            const pct = hechos[k] ? 100 : k === i ? ((p.seg - rest) / p.seg) * 100 : 0;
            return (
              <li key={p.nombre} className={`${hechos[k] ? styles.hecho : ""} ${k === i ? styles.lineaActiva : ""}`} onClick={() => irA(k)} title={p.t}>
                <i style={{ width: `${pct}%` }} />
                <span>{p.nombre}</span>
                <small>{p.seg < 60 ? `${p.seg} s` : `${p.seg / 60} min`}</small>
              </li>
            );
          })}
        </ol>

        {terminado && (
          <div className={styles.fin}>
            <b>🌿 ¡Rutina completa!</b>
            <span style={{ color: "var(--ink-soft)" }}>Esta semana llevas estos días:</span>
            <div className={styles.semana}>
              {DIAS_LETRA.map((d, k) => (
                <span key={d} className={completados.includes(semanaInfo[k]) ? styles.on : ""}>
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
