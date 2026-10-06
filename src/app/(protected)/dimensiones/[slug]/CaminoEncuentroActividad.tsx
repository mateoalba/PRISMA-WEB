"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/conexion-social-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type Evento = { t: string; f: string; dia: string };

const EVENTOS: Evento[] = [
  { t: "Tertulia de tango", f: "Jueves 18:00", dia: "jueves 8 de octubre, 18:00" },
  { t: "Círculo de jardinería", f: "Sábado 10:00", dia: "sábado 10 de octubre, 10:00" },
  { t: "Café de los viernes", f: "Viernes 16:00", dia: "viernes 9 de octubre, 16:00" },
];
const PARADAS: { t: string; extra: "evento" | "fecha" | "idea" | "aviso" | "llega" }[] = [
  { t: "Elige un círculo o evento que te interese", extra: "evento" },
  { t: "Anota la fecha y la hora en un lugar visible", extra: "fecha" },
  { t: "Piensa en un tema o pregunta para romper el hielo", extra: "idea" },
  { t: "Avisa a alguien de tu familia a dónde vas", extra: "aviso" },
  { t: "Llega con 10 minutos de anticipación", extra: "llega" },
];
const ROMPEHIELOS = [
  "¿Hace cuánto vienes a este grupo?",
  "¿Cuál es tu canción favorita para bailar?",
  "¿De qué ciudad eres? Yo nací en…",
  "¿Qué es lo que más te gusta de venir aquí?",
  "Me encanta tu bufanda, ¿la tejiste tú?",
];
const FR = [0.14, 0.31, 0.5, 0.68, 0.84];
const RUTA_D = "M60 120 C 170 30, 250 30, 300 100 S 420 170, 500 110 S 640 30, 700 90 S 820 160, 940 90";

function ListaIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
    </svg>
  );
}
function CalIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
function IdeaIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z" />
    </svg>
  );
}

function ExtraContenido({
  tipo,
  eventoIndex,
  ideaIndex,
  onElegirEvento,
  onPedirIdea,
}: {
  tipo: (typeof PARADAS)[number]["extra"];
  eventoIndex: number | null;
  ideaIndex: number | null;
  onElegirEvento: (i: number) => void;
  onPedirIdea: () => void;
}) {
  if (tipo === "evento") {
    return (
      <div className={styles.miniEv} role="group" aria-label="Elige un evento">
        {EVENTOS.map((e, i) => (
          <button key={i} type="button" className={eventoIndex === i ? styles.miniEvOn : ""} aria-pressed={eventoIndex === i} onClick={() => onElegirEvento(i)}>
            <span>
              <b>{e.t}</b>
              <span>{e.f}</span>
            </span>
          </button>
        ))}
      </div>
    );
  }
  if (tipo === "fecha") {
    return eventoIndex != null ? (
      <span className={styles.cal}>
        <CalIcon />
        {EVENTOS[eventoIndex].dia}
      </span>
    ) : (
      <span>Pégalo en la refri o en el calendario de tu celular.</span>
    );
  }
  if (tipo === "idea") {
    return (
      <>
        {ideaIndex != null && <div className={styles.idea}>“{ROMPEHIELOS[ideaIndex]}”</div>}
        <button type="button" className={styles.btnTxt} onClick={onPedirIdea}>
          <IdeaIcon />
          {ideaIndex != null ? "Dame otra idea" : "Dame una idea"}
        </button>
      </>
    );
  }
  if (tipo === "aviso") {
    return <span>Un mensaje corto basta: “Voy a {eventoIndex != null ? EVENTOS[eventoIndex].t : "un encuentro"}, vuelvo a las…”</span>;
  }
  return <span>Así eliges asiento con calma y saludas sin apuro.</span>;
}

export function CaminoEncuentroActividad({ initialHechas, initialEventoIndex }: { initialHechas: boolean[]; initialEventoIndex: number | null }) {
  const [hechas, setHechas] = useState<boolean[]>(initialHechas);
  const [eventoIndex, setEventoIndex] = useState<number | null>(initialEventoIndex);
  const [ideaIndex, setIdeaIndex] = useState<number | null>(null);
  const [foco, setFoco] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const [largo, setLargo] = useState(0);
  const [paradaPos, setParadaPos] = useState<{ x: number; y: number }[]>([]);
  const [viajeroPos, setViajeroPos] = useState<{ x: number; y: number } | null>(null);

  const rutaRef = useRef<SVGPathElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const path = rutaRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    setLargo(total);
    setParadaPos(FR.map((f) => path.getPointAtLength(total * f)));
    setViajeroPos(path.getPointAtLength(0));
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    const path = rutaRef.current;
    if (!path || largo === 0) return;
    let seguidas = 0;
    while (seguidas < 5 && hechas[seguidas]) seguidas++;
    const fr = seguidas === 0 ? 0 : seguidas === 5 ? 1 : FR[seguidas - 1];
    setViajeroPos(path.getPointAtLength(largo * fr));
  }, [hechas, largo]);

  function mostrarToast(msg: string) {
    setToastMsg(msg);
    setToastOn(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 3200);
  }

  function guardarPaso(nuevasHechas: boolean[], nuevoEvento: number | null) {
    saveActivityProgress("conexion-social", "camino", { hechas: nuevasHechas, evento: nuevoEvento });
  }

  function toggleHecho(k: number) {
    const next = hechas.map((h, i) => (i === k ? !h : h));
    setHechas(next);
    if (next.every(Boolean)) mostrarToast("🎉 ¡Llegaste al encuentro!");
    guardarPaso(next, eventoIndex);
  }

  function elegirEvento(i: number) {
    setEventoIndex(i);
    const next = hechas.map((h, idx) => (idx === 0 ? true : h));
    setHechas(next);
    guardarPaso(next, i);
  }

  function pedirIdea() {
    let n: number;
    do {
      n = Math.floor(Math.random() * ROMPEHIELOS.length);
    } while (n === ideaIndex && ROMPEHIELOS.length > 1);
    setIdeaIndex(n);
  }

  function reiniciar() {
    setHechas(PARADAS.map(() => false));
    setEventoIndex(null);
    setIdeaIndex(null);
    guardarPaso(
      PARADAS.map(() => false),
      null
    );
  }

  const n = hechas.filter(Boolean).length;
  let seguidas = 0;
  while (seguidas < 5 && hechas[seguidas]) seguidas++;
  const fracHecha = seguidas === 0 ? 0 : seguidas === 5 ? 1 : FR[seguidas - 1];
  const llego = n === 5;
  const metaTxt = n === 0 ? "¡Vamos! Empieza por la primera." : n === 5 ? "¡Llegaste!" : n >= 3 ? "Ya casi llegas." : "Vas por buen camino.";

  return (
    <div className={styles.act}>
      <div className={styles.caminoCab}>
        <div>
          <div className={styles.actTag}>
            <span className={styles.actNum}>02</span>
            <span className={styles.actTipo}>
              <ListaIcon />
              Lista de pasos
            </span>
          </div>
          <h3>Prepárate para un encuentro</h3>
          <p className={styles.actDesc}>Cinco paradas para ir tranquilo a un círculo o evento nuevo. Con cada paso avanzas en el camino.</p>
        </div>
        <div className={styles.meta}>
          <span className={styles.metaN}>{n}/5</span>
          <span>
            paradas
            <small>{metaTxt}</small>
          </span>
        </div>
      </div>

      <div className={styles.mapa} aria-hidden="true">
        <svg viewBox="0 0 1000 190">
          <defs>
            <linearGradient id="gRuta" x1="0" x2="1">
              <stop offset="0" stopColor="#9fd3c9" />
              <stop offset=".5" stopColor="#ffb48a" />
              <stop offset="1" stopColor="#aebd52" />
            </linearGradient>
          </defs>
          <path className={styles.rutaBase} d={RUTA_D} />
          <path className={styles.rutaGuia} d={RUTA_D} />
          <path
            ref={rutaRef}
            className={styles.rutaHecha}
            d={RUTA_D}
            style={{ strokeDasharray: largo, strokeDashoffset: largo * (1 - fracHecha) }}
          />
          <g transform="translate(24 116)">
            <path d="M0 22 L36 -6 L72 22 V60 H0 Z" transform="scale(.7)" fill="#2d2e24" stroke="#9fd3c9" strokeWidth={3} />
            <rect x={18} y={20} width={12} height={20} fill="#9fd3c9" opacity={0.7} />
          </g>
          <text className={styles.mapaEtq} x={10} y={182}>
            Tu casa
          </text>
          <g>
            {paradaPos.map((p, k) => (
              <g key={k} className={hechas[k] ? styles.paradaOn : ""} transform={`translate(${p.x} ${p.y})`} style={{ opacity: foco !== null && foco !== k ? 0.55 : 1 }}>
                <circle className={styles.paradaCirc} r={19} />
                <text className={styles.paradaTexto} textAnchor="middle" y={7}>
                  {k + 1}
                </text>
              </g>
            ))}
          </g>
          <g className={llego ? styles.destinoLlego : ""} transform="translate(940 90)">
            <circle r={22} fill="#aebd52" opacity={0.18} />
            <line x1={0} y1={0} x2={0} y2={-62} stroke="#d9d5c6" strokeWidth={3} />
            <path className={styles.bandera} d="M0 -62 L34 -52 L0 -40 Z" fill="#aebd52" />
          </g>
          <text className={styles.mapaEtq} x={990} y={145} textAnchor="end">
            {eventoIndex != null ? EVENTOS[eventoIndex].t : "El encuentro"}
          </text>
          {viajeroPos && (
            <g className={styles.viajero} transform={`translate(${viajeroPos.x} ${viajeroPos.y})`}>
              <circle className={styles.halo} r={20} />
              <circle r={12} fill="#f5f1e6" stroke="#aebd52" strokeWidth={4} />
            </g>
          )}
        </svg>
      </div>

      <ol className={styles.paradas} onMouseLeave={() => setFoco(null)}>
        {PARADAS.map((p, k) => (
          <li key={k} className={`${styles.par} ${hechas[k] ? styles.parOk : ""} ${foco === k ? styles.parFoco : ""}`} onMouseOver={() => setFoco(k)}>
            <span className={styles.parN}>Parada {k + 1}</span>
            <span className={styles.parT}>{p.t}</span>
            <button type="button" className={styles.hecho} aria-pressed={hechas[k]} onClick={() => toggleHecho(k)}>
              <i>{hechas[k] ? "✓" : ""}</i>
              {hechas[k] ? "Hecho" : "Marcar"}
            </button>
            <div className={styles.extra}>
              <ExtraContenido tipo={p.extra} eventoIndex={eventoIndex} ideaIndex={ideaIndex} onElegirEvento={elegirEvento} onPedirIdea={pedirIdea} />
            </div>
          </li>
        ))}
      </ol>

      {llego && (
        <div className={styles.llegada}>
          <div>
            <b>¡Todo listo para tu encuentro!</b>
            <br />
            <span>{eventoIndex != null ? `Nos vemos en ${EVENTOS[eventoIndex].t}, ${EVENTOS[eventoIndex].f}.` : "Disfruta, conoce gente y pásala bien."}</span>
          </div>
          <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={reiniciar}>
            Preparar otro encuentro
          </button>
        </div>
      )}

      <div className={`${styles.toast} ${toastOn ? styles.toastOn : ""}`} role="status">
        {toastMsg}
      </div>
    </div>
  );
}
