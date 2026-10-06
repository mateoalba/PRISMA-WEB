"use client";

import { useRef, useState, useTransition } from "react";
import styles from "@/styles/bienestar.module.css";
import { setHydration } from "@/lib/wellbeing/actions";

// Umbrales como fracción de la meta, para que el mensaje tenga sentido
// sin importar si la meta son 6, 8 o 12 vasos.
function mensajePara(vasos: number, meta: number) {
  if (vasos <= 0) return "Empieza tu día con un vaso de agua.";
  if (vasos === 1) return "¡Buen comienzo! Sigue así.";
  if (vasos >= meta - 1) return "Solo te falta uno.";
  if (vasos / meta >= 0.5) return "¡Más de la mitad! Ya casi.";
  return "Vas muy bien, tu cuerpo lo agradece.";
}

function GotaSVG() {
  return (
    <svg viewBox="0 0 64 76" aria-hidden="true">
      <path className={styles.gFondo} d="M32 4 C32 4 8 34 8 50 a24 24 0 0 0 48 0 C56 34 32 4 32 4z" />
      <path className={styles.gAgua} d="M32 4 C32 4 8 34 8 50 a24 24 0 0 0 48 0 C56 34 32 4 32 4z" />
    </svg>
  );
}

export function HydrationPrism({
  initialGlasses,
  history,
  goal,
}: {
  initialGlasses: number;
  history: { label: string; glasses: number }[];
  goal: number;
}) {
  const [vasos, setVasos] = useState(initialGlasses);
  const [recordar, setRecordar] = useState(false);
  const [saltando, setSaltando] = useState<number | null>(null);
  const [burbujas, setBurbujas] = useState<{ id: number; left: number; delay: number; size: number }[]>([]);
  const [isPending, startTransition] = useTransition();
  const vasoRef = useRef<HTMLDivElement>(null);
  const burbujaId = useRef(0);

  function lanzarBurbujas() {
    const nuevas = Array.from({ length: 6 }, () => ({
      id: burbujaId.current++,
      left: 90 + Math.random() * 160,
      delay: Math.random() * 0.7,
      size: 5 + Math.random() * 7,
    }));
    setBurbujas((prev) => [...prev, ...nuevas]);
    setTimeout(() => {
      setBurbujas((prev) => prev.filter((b) => !nuevas.some((n) => n.id === b.id)));
    }, 2400);
  }

  function tocar(n: number) {
    const antes = vasos;
    const next = n <= vasos ? n - 1 : n;
    setVasos(next);
    setSaltando(n);
    setTimeout(() => setSaltando(null), 500);
    if (next > antes) lanzarBurbujas();
    startTransition(() => {
      setHydration(next);
    });
  }

  function deshacer() {
    const next = Math.max(0, vasos - 1);
    setVasos(next);
    startTransition(() => {
      setHydration(next);
    });
  }

  const nivel = 420 - (vasos / goal) * 392;
  const historialConHoy = history.length > 0 ? [...history.slice(0, -1), { ...history[history.length - 1], glasses: vasos }] : [];

  return (
    <section className={styles.bloque} aria-labelledby="hid-titulo">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <linearGradient id="bienGradAgua" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b9e6dc" stopOpacity={0.95} />
            <stop offset=".5" stopColor="#7fbfb2" />
            <stop offset="1" stopColor="#4d8a7e" />
          </linearGradient>
          <linearGradient id="bienGradGota" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c8efe6" />
            <stop offset="1" stopColor="#6fb2a4" />
          </linearGradient>
          <clipPath id="bienClipVaso">
            <polygon points="70,20 270,20 300,120 270,420 70,420 40,120" />
          </clipPath>
        </defs>
      </svg>

      <div className={styles.hidra}>
        <div className={styles.vaso} ref={vasoRef} aria-label={`${vasos} de ${goal} vasos`}>
          <svg viewBox="0 0 340 440" aria-hidden="true">
            <g clipPath="url(#bienClipVaso)">
              <g style={{ transform: `translateY(${nivel}px)`, transition: "transform 1.1s cubic-bezier(.3,1.2,.4,1)" }}>
                <g className={styles.olaMov2}>
                  <path className={styles.ola2} d="M0 10 Q50 -6 100 10 T200 10 T300 10 T400 10 T500 10 T600 10 V500 H0Z" />
                </g>
                <g className={styles.olaMov}>
                  <path className={styles.ola1} fill="url(#bienGradAgua)" d="M0 16 Q50 2 100 16 T200 16 T300 16 T400 16 T500 16 T600 16 V500 H0Z" />
                </g>
              </g>
            </g>
            <polygon className={styles.contorno} points="70,20 270,20 300,120 270,420 70,420 40,120" />
            <path className={styles.faceta} d="M40 120 H300 M70 20 L120 120 L170 20 L220 120 L270 20 M120 120 L110 420 M220 120 L230 420" />
            <polygon className={styles.brillo} points="78,130 96,130 90,400 80,400" />
          </svg>
          <div className={styles.vasoNum} aria-hidden="true">
            <b>
              {vasos}
              <span className={styles.vasoNumMeta}>/{goal}</span>
            </b>
            <span className={styles.vasoNumEtq}>VASOS HOY</span>
          </div>
          {burbujas.map((b) => (
            <span
              key={b.id}
              className={styles.burbuja}
              style={{ left: b.left, width: b.size, height: b.size, animationDelay: `${b.delay}s` }}
            />
          ))}
        </div>

        <div className={styles.hidraTxt}>
          <div className={styles.eyebrow}>Registro de hidratación</div>
          <h2 className={styles.seccion} id="hid-titulo">
            Un vaso <span className={styles.enfasis}>a la vez</span>
          </h2>
          <p className={styles.intro}>Toca una gota cada vez que bebas un vaso de agua. Tu prisma se irá llenando a lo largo del día.</p>
          <div className={styles.gotas} role="group" aria-label="Vasos de agua de hoy">
            {Array.from({ length: goal }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.gota} ${n <= vasos ? styles.gotaLlena : ""} ${saltando === n ? styles.gotaSalta : ""}`}
                aria-pressed={n <= vasos}
                aria-label={`Vaso ${n}`}
                disabled={isPending}
                onClick={() => tocar(n)}
              >
                <GotaSVG />
                <span>{n}</span>
              </button>
            ))}
          </div>
          <div className={styles.mensaje} role="status">
            {vasos >= goal ? (
              <>
                <b>¡Meta cumplida!</b> Te hidrataste muy bien hoy.
              </>
            ) : (
              mensajePara(vasos, goal)
            )}
          </div>
          <div className={styles.hidraPie}>
            <label className={styles.interruptor}>
              <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
              <i />
              Recordarme cada 2 horas
            </label>
            {vasos > 0 && (
              <button type="button" className={styles.deshacer} onClick={deshacer}>
                Deshacer último vaso
              </button>
            )}
          </div>
          {historialConHoy.length > 0 && (
            <div className={styles.historial} aria-label="Vasos de agua de los últimos días">
              <span className={styles.historialT}>Esta semana</span>
              {historialConHoy.map((d, i) => (
                <span key={i} className={`${styles.historialDia} ${i === historialConHoy.length - 1 ? styles.historialHoy : ""}`} title={`${d.glasses} vasos`}>
                  <i style={{ height: Math.max(4, (d.glasses / goal) * 44) }} />
                  {i === historialConHoy.length - 1 ? "Hoy" : d.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
