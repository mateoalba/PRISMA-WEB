"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "@/styles/salud-mental-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type HabitoIco = "luna" | "hoja" | "chat" | "sol" | "pausa";

const HABITOS: { t: string; ico: HabitoIco; c: string; no: string }[] = [
  { t: "¿Dormiste al menos 6-7 horas?", ico: "luna", c: "#8e9bd6", no: "Una siesta corta de 20 minutos por la tarde también ayuda." },
  { t: "¿Comiste algo nutritivo hoy?", ico: "hoja", c: "#8fd18a", no: "Una fruta o un vaso de agua ahora mismo ya cuenta." },
  { t: "¿Hablaste con alguien, aunque sea un momento?", ico: "chat", c: "#ffb48a", no: "¿Y si le mandas un audio corto a alguien que quieres?" },
  { t: "¿Saliste o te asomaste al sol un rato?", ico: "sol", c: "#e8c95a", no: "Diez minutos junto a la ventana o en el patio te hacen bien." },
  { t: "¿Te diste un momento sin pantallas?", ico: "pausa", c: "#9fd3c9", no: "Prueba dejar el celular en otra habitación por 15 minutos." },
];

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

function IconoHabito({ clave }: { clave: HabitoIco }) {
  const paths: Record<HabitoIco, React.ReactNode> = {
    luna: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
    hoja: (
      <>
        <path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z" />
        <path d="M5 19l8-8" />
      </>
    ),
    chat: (
      <>
        <path d="M4 5h16v11H9l-5 4z" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),
    sol: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    pausa: (
      <>
        <rect x="6" y="3" width="12" height="18" rx="2" />
        <path d="M10 9v6M14 9v6" />
      </>
    ),
  };
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      {paths[clave]}
    </svg>
  );
}

function fechaISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function SaludMentalChequeoActividad({ initialWeek }: { initialWeek: Record<string, number> }) {
  const [respuestas, setRespuestas] = useState<(boolean | null)[]>(HABITOS.map(() => null));
  const [guardando, setGuardando] = useState(false);
  const [guardadoHoy, setGuardadoHoy] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    []
  );

  function mostrarToast(msg: string) {
    setToastMsg(msg);
    setToastOn(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastOn(false), 3000);
  }

  function responder(k: number, valor: boolean) {
    setRespuestas((prev) => prev.map((v, i) => (i === k ? valor : v)));
  }

  const si = respuestas.filter((v) => v === true).length;
  const respondidas = respuestas.filter((v) => v !== null).length;
  const completo = respondidas === HABITOS.length;

  async function guardarChequeo() {
    setGuardando(true);
    const hoy = fechaISO(new Date());
    // El progreso es un solo registro por actividad: hay que mandar el
    // mapa completo (historial + hoy), no solo el día de hoy, o se
    // perdería lo guardado en días anteriores.
    await saveActivityProgress("salud-mental", "chequeo", { byDate: { ...initialWeek, [hoy]: si } });
    setGuardando(false);
    setGuardadoHoy(true);
    mostrarToast("🌸 Chequeo de hoy guardado");
  }

  const [titulo, mensaje] =
    respondidas < HABITOS.length
      ? ["Tu flor de hoy", respondidas ? `Llevas ${respondidas} de 5 respuestas.` : "Responde las preguntas y mírala crecer."]
      : si === 5
        ? ["¡Floreciste por completo!", "Hoy te cuidaste en todo. Date un aplauso."]
        : si >= 3
          ? ["Tu flor va creciendo", "Te cuidaste bastante hoy. Mira las ideas para lo que falta."]
          : ["Mañana es otra oportunidad", "Está bien tener días así. Elige una sola idea de la lista y pruébala."];

  const [diasOrden] = useState(() =>
    Array.from({ length: 7 }, (_, k) => {
      const d = new Date();
      d.setDate(d.getDate() + (k - 6));
      return d;
    })
  );

  const cx = 150;
  const cy = 130;
  const radio = 30 + si * 2;

  return (
    <div className={`${styles.act} ${styles.cheq}`}>
      <div>
        <div className={styles.actTag}>
          <span className={styles.actNum}>02</span>
          <span className={styles.actTipo}>
            <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 11l3 3 8-8" />
              <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
            </svg>
            Chequeo diario
          </span>
        </div>
        <h3>Chequeo de autocuidado</h3>
        <p className={styles.actDesc}>Cinco preguntas rápidas sobre cómo te has cuidado hoy. Cada “sí” hace florecer un pétalo.</p>

        <ul className={styles.habitos}>
          {HABITOS.map((h, k) => {
            const v = respuestas[k];
            return (
              <li key={k} className={`${styles.hab} ${v === true ? styles.habSi : ""}`} style={{ ["--c" as string]: h.c } as CSSProperties}>
                <span className={styles.habIco}>
                  <IconoHabito clave={h.ico} />
                </span>
                <span className={styles.habQ}>
                  {h.t}
                  {v !== null && <span className={`${styles.habSug} ${v ? styles.habSugBien : ""}`}>{v ? "¡Qué bien! Sigue así." : `💡 ${h.no}`}</span>}
                </span>
                <span className={styles.resp} role="group" aria-label={h.t}>
                  <button type="button" className={v === true ? styles.bSiOn : ""} aria-pressed={v === true} onClick={() => responder(k, true)}>
                    Sí
                  </button>
                  <button type="button" className={v === false ? styles.bNoOn : ""} aria-pressed={v === false} onClick={() => responder(k, false)}>
                    Aún no
                  </button>
                </span>
              </li>
            );
          })}
        </ul>

        <div className={styles.cheqPie}>
          <button type="button" className={`${styles.btn} ${styles.btnP}`} disabled={!completo || guardando || guardadoHoy} onClick={guardarChequeo}>
            {guardadoHoy ? "Guardado ✓" : guardando ? "Guardando…" : "Guardar el chequeo de hoy"}
          </button>
          <small>{completo ? "Listo para guardar." : "Responde las 5 para guardar."}</small>
        </div>
      </div>

      <div className={styles.florWrap}>
        <svg className={styles.flor} viewBox="0 0 300 330" role="img" aria-labelledby="florMsgT">
          <defs>
            <radialGradient id="sm-gc" cx=".4" cy=".35">
              <stop offset="0" stopColor="#fff7c9" />
              <stop offset="1" stopColor="#e8c95a" />
            </radialGradient>
          </defs>
          <path className={styles.tallo} d="M150 150 C 150 220, 138 260, 150 325" />
          <path d="M149 262 C 120 250, 104 226, 100 206 C 128 212, 146 232, 149 262 Z" fill="#6f7d2b" />
          <path d="M151 290 C 180 280, 196 258, 200 238 C 172 244, 154 264, 151 290 Z" fill="#5c6a1c" />
          {HABITOS.map((h, k) => {
            const ang = k * 72;
            const abierto = respuestas[k] === true;
            return (
              <g key={k} transform={`rotate(${ang} ${cx} ${cy})`}>
                <path
                  className={`${styles.petalo} ${abierto ? styles.abierto : styles.cerrado}`}
                  d={`M${cx} ${cy} C ${cx - 42} ${cy - 40}, ${cx - 30} ${cy - 108}, ${cx} ${cy - 118} C ${cx + 30} ${cy - 108}, ${cx + 42} ${cy - 40}, ${cx} ${cy} Z`}
                  fill={h.c}
                />
              </g>
            );
          })}
          <circle className={styles.centro} cx={cx} cy={cy} r={radio} fill="url(#sm-gc)" />
          <circle className={styles.brillo} cx={cx - 9} cy={cy - 10} r={6} fill="#fff" opacity={0.6} />
          <text x={cx} y={cy + 9} textAnchor="middle" fontSize={24}>
            {si}/5
          </text>
        </svg>
        <div className={styles.florMsg} aria-live="polite">
          <b id="florMsgT">{titulo}</b>
          <span>{mensaje}</span>
        </div>
        <div className={styles.semana} aria-label="Tus últimos 7 días">
          {diasOrden.map((d, k) => {
            const esHoy = k === 6;
            const valor = esHoy ? (completo ? si : null) : initialWeek[fechaISO(d)] ?? null;
            const p = (valor ?? 0) * 20;
            return (
              <span key={k} className={`${styles.dia} ${esHoy ? styles.diaHoy : ""}`}>
                <i style={{ ["--p" as string]: p } as CSSProperties} title={valor == null ? "Sin datos" : `${valor} de 5`} />
                {esHoy ? "Hoy" : DIAS[d.getDay() === 0 ? 6 : d.getDay() - 1]}
              </span>
            );
          })}
        </div>
      </div>

      <div className={`${styles.toast} ${toastOn ? styles.toastOn : ""}`} role="status">
        {toastMsg}
      </div>
    </div>
  );
}
