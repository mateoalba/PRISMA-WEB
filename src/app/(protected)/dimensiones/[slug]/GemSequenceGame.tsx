"use client";

import { useEffect, useRef, useState, useTransition, type CSSProperties, type ReactElement } from "react";
import styles from "@/styles/estimulacion-cognitiva.module.css";
import { saveBestScore } from "@/lib/cognitive/game-actions";
import { GEMAS, type Gema } from "@/lib/cognitive-content";

const VELOCIDADES = [
  { value: 1000, label: "Pausada" },
  { value: 700, label: "Normal" },
  { value: 450, label: "Rápida" },
];

const SIMBOLO: Record<Gema["forma"], ReactElement> = {
  circulo: <circle cx={50} cy={50} r={11} fill="#fff" opacity={0.92} />,
  triangulo: <polygon points="50,37 62,59 38,59" fill="#fff" opacity={0.92} />,
  cuadrado: <rect x={40} y={40} width={20} height={20} rx={2} fill="#fff" opacity={0.92} />,
  estrella: <polygon points="50,36 54,46 65,46 56,53 59,64 50,57 41,64 44,53 35,46 46,46" fill="#fff" opacity={0.92} />,
};

function GemaSVG({ g }: { g: Gema }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="50,2 98,50 50,98 2,50" fill={g.color} />
      <polygon points="50,2 98,50 50,50" fill={g.claro} opacity={0.55} />
      <polygon points="50,2 50,50 2,50" fill="#fff" opacity={0.22} />
      <polygon points="2,50 50,50 50,98" fill="#000" opacity={0.18} />
      <polygon points="98,50 50,98 50,50" fill="#000" opacity={0.32} />
      <polygon points="50,24 76,50 50,76 24,50" fill={g.color} stroke="rgba(255,255,255,.55)" strokeWidth={1} />
      <polygon points="50,2 98,50 50,98 2,50" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth={1.2} />
      {SIMBOLO[g.forma]}
    </svg>
  );
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Fase = "listo" | "mira" | "tu" | "error";

const MENSAJES_ACIERTO = ["¡Muy bien!", "¡Excelente memoria!", "¡Perfecto!", "¡Sigue así!"];

export function GemSequenceGame({ initialBestScore }: { initialBestScore: number }) {
  const [puntos, setPuntos] = useState(0);
  const [record, setRecord] = useState(initialBestScore);
  const [vidas, setVidas] = useState(3);
  const [vel, setVel] = useState(1000);
  const [sonido, setSonido] = useState(true);
  const [jugando, setJugando] = useState(false);
  const [empezado, setEmpezado] = useState(false);
  const [fase, setFase] = useState<Fase>("listo");
  const [mensaje, setMensaje] = useState('Pulsa "Iniciar reto" para observar la secuencia.');
  const [ronda, setRonda] = useState(1);
  const [pasosHechos, setPasosHechos] = useState(0);
  const [pasosTotal, setPasosTotal] = useState(0);
  const [botonesActivos, setBotonesActivos] = useState(false);
  const [gemaActiva, setGemaActiva] = useState<string | null>(null);
  const [temblor, setTemblor] = useState(false);
  const [acierto, setAcierto] = useState(false);
  const [luz, setLuz] = useState<string | undefined>(undefined);
  const [, startTransition] = useTransition();

  const secuenciaRef = useRef<string[]>([]);
  const pasoRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // El servidor no tiene localStorage, así que este ajuste se aplaza a
    // después del montaje para no desalinear el primer render del cliente
    // con el HTML que envió el servidor.
    try {
      const local = Number(localStorage.getItem("prisma_record_gemas") ?? 0);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecord((r) => Math.max(r, local));
    } catch {
      // localStorage no disponible
    }
  }, []);

  function tono(freq: number) {
    if (!sonido) return;
    try {
      audioCtxRef.current =
        audioCtxRef.current ??
        new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.5);
    } catch {
      // audio no disponible en este navegador
    }
  }

  async function encender(id: string, ms: number) {
    const g = GEMAS.find((x) => x.id === id)!;
    setGemaActiva(id);
    setLuz(g.color);
    tono(g.nota);
    await esperar(ms);
    setGemaActiva(null);
    setLuz(undefined);
  }

  async function mostrarSecuencia() {
    setBotonesActivos(false);
    pasoRef.current = 0;
    setPasosHechos(0);
    setPasosTotal(secuenciaRef.current.length);
    setRonda(secuenciaRef.current.length);
    setFase("mira");
    const n = secuenciaRef.current.length;
    setMensaje(`Observa con atención… (${n} ${n === 1 ? "gema" : "gemas"})`);
    await esperar(700);
    for (const id of secuenciaRef.current) {
      await encender(id, vel * 0.7);
      await esperar(vel * 0.35);
    }
    setFase("tu");
    setMensaje("¡Tu turno! Toca las gemas en el mismo orden.");
    setBotonesActivos(true);
  }

  function nuevaRonda() {
    // Solo se llama desde manejadores de eventos (iniciar/tocar), nunca
    // durante el render, así que el azar aquí no afecta la pureza del
    // componente.
    // eslint-disable-next-line react-hooks/purity
    const siguiente = GEMAS[Math.floor(Math.random() * 4)].id;
    secuenciaRef.current = [...secuenciaRef.current, siguiente];
    mostrarSecuencia();
  }

  function guardarRecordSiAplica(nuevoPuntaje: number) {
    setRecord((r) => {
      if (nuevoPuntaje <= r) return r;
      try {
        localStorage.setItem("prisma_record_gemas", String(nuevoPuntaje));
      } catch {
        // localStorage no disponible
      }
      startTransition(() => {
        saveBestScore(nuevoPuntaje);
      });
      return nuevoPuntaje;
    });
  }

  function iniciar() {
    secuenciaRef.current = [];
    setPuntos(0);
    setVidas(3);
    setJugando(true);
    setEmpezado(true);
    nuevaRonda();
  }

  async function tocar(id: string) {
    if (!botonesActivos || !jugando) return;
    encender(id, 280);
    if (id === secuenciaRef.current[pasoRef.current]) {
      pasoRef.current += 1;
      setPasosHechos(pasoRef.current);
      if (pasoRef.current === secuenciaRef.current.length) {
        setBotonesActivos(false);
        const nuevosPuntos = puntos + secuenciaRef.current.length;
        setPuntos(nuevosPuntos);
        guardarRecordSiAplica(nuevosPuntos);
        setAcierto(false);
        requestAnimationFrame(() => setAcierto(true));
        setFase("tu");
        setMensaje(MENSAJES_ACIERTO[secuenciaRef.current.length % 4]);
        await esperar(900);
        nuevaRonda();
      }
    } else {
      const nuevasVidas = vidas - 1;
      setVidas(nuevasVidas);
      setBotonesActivos(false);
      setTemblor(false);
      requestAnimationFrame(() => setTemblor(true));
      if (nuevasVidas > 0) {
        setFase("error");
        setMensaje(`Casi. Te quedan ${nuevasVidas} ${nuevasVidas === 1 ? "intento" : "intentos"}. Vamos a repetirla.`);
        await esperar(1500);
        mostrarSecuencia();
      } else {
        setJugando(false);
        setFase("error");
        setMensaje(`Buen trabajo: llegaste a ${secuenciaRef.current.length - 1} gemas y sumaste ${puntos} puntos.`);
      }
    }
  }

  const faseClass =
    fase === "mira" ? styles.estadoMira : fase === "tu" ? styles.estadoTu : fase === "error" ? styles.estadoError : "";

  return (
    <div className={`${styles.panel} ${styles.juego}`} id="juego" style={luz ? ({ "--luz": luz } as CSSProperties) : undefined}>
      <div className={styles.juegoInfo}>
        <div className={styles.eyebrow}>Memoria y atención</div>
        <h3>
          Secuencia de <span className={styles.enfasis}>gemas</span>
        </h3>
        <p>Observa cómo se encienden las gemas y repite el mismo orden. Cada ronda suma una más.</p>
        <div className={styles.marcadores}>
          <div className={styles.marcador}>
            <b>{puntos}</b>
            <span>Puntaje</span>
          </div>
          <div className={styles.marcador}>
            <b>{record}</b>
            <span>Tu récord</span>
          </div>
          <div className={styles.marcador}>
            <div className={styles.vidas} aria-label={`${vidas} intentos`}>
              {[0, 1, 2].map((i) => (
                <i key={i} className={i >= vidas ? styles.vidaPerdida : ""} />
              ))}
            </div>
            <span style={{ display: "block", marginTop: 8 }}>Intentos</span>
          </div>
        </div>
        <div className={styles.ajustes}>
          <span>Velocidad:</span>
          <div className={styles.seg} role="group" aria-label="Velocidad">
            {VELOCIDADES.map((v) => (
              <button
                key={v.value}
                type="button"
                aria-pressed={vel === v.value}
                className={vel === v.value ? styles.segActivo : ""}
                onClick={() => setVel(v.value)}
              >
                {v.label}
              </button>
            ))}
          </div>
          <button type="button" className={styles.sonido} aria-pressed={sonido} onClick={() => setSonido((s) => !s)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9z" />
              <path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" />
            </svg>
            <span>{sonido ? "Sonido activado" : "Sin sonido"}</span>
          </button>
        </div>
        <div className={`${styles.estado} ${faseClass}`} role="status">
          <span className={styles.estadoPunto} />
          <span>{mensaje}</span>
        </div>
        <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={iniciar}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5l11 7-11 7z" fill="currentColor" />
          </svg>
          {!empezado ? "Iniciar reto" : jugando ? "Reiniciar" : "Jugar otra vez"}
        </button>
      </div>

      <div>
        <div className={`${styles.tablero} ${temblor ? styles.tableroTemblor : ""}`} onAnimationEnd={() => setTemblor(false)}>
          {GEMAS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`${styles.gema} ${styles[`gema${g.id.toUpperCase()}`]} ${gemaActiva === g.id ? styles.gemaOn : ""}`}
              style={{ "--c": g.color } as CSSProperties}
              aria-label={g.nombre}
              disabled={!botonesActivos}
              onClick={() => tocar(g.id)}
            >
              <GemaSVG g={g} />
              <span className={styles.gemaNombre}>{g.nombre}</span>
            </button>
          ))}
          <div className={`${styles.nucleo} ${acierto ? styles.nucleoAcierto : ""}`} aria-hidden="true" onAnimationEnd={() => setAcierto(false)}>
            <div>
              <b>{ronda}</b>
              <span>RONDA</span>
            </div>
          </div>
          <div className={styles.pasos} aria-hidden="true">
            {Array.from({ length: pasosTotal }, (_, i) => (
              <i key={i} className={i < pasosHechos ? styles.pasoHecho : ""} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
