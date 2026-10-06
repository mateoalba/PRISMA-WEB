"use client";

import { useState } from "react";
import styles from "@/styles/estimulacion-cognitiva-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type SentidoId = "ver" | "oir" | "sentir";
type Sentido = { id: SentidoId; t: string; n: number; c: string; ideas: string[] };

const SENTIDOS: Sentido[] = [
  { id: "ver", t: "Cosas que puedes ver", n: 3, c: "#b8a4e3", ideas: ["una planta", "la ventana", "mis manos", "una foto", "el cielo"] },
  { id: "oir", t: "Cosas que puedes escuchar", n: 2, c: "#9fd3c9", ideas: ["pájaros", "el viento", "un reloj", "mi respiración", "autos lejanos"] },
  { id: "sentir", t: "Cosa que puedes sentir", n: 1, c: "#e8c95a", ideas: ["la silla", "el sol en la piel", "la ropa suave", "mis pies en el piso"] },
];
const RADIOS: Record<SentidoId, number> = { ver: 175, oir: 120, sentir: 66 };
const ANG0: Record<SentidoId, number> = { ver: -90, oir: -30, sentir: -150 };
const PASO: Record<SentidoId, number> = { ver: 120, oir: 120, sentir: 0 };

function IconoSentido({ id }: { id: SentidoId }) {
  const paths: Record<SentidoId, React.ReactNode> = {
    ver: (
      <>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    oir: (
      <>
        <path d="M6 18.5A4 4 0 0 0 10 21c2 0 3-1.5 3.5-3s1.5-2.5 2.5-3.5A6 6 0 1 0 6 9" />
        <path d="M10 9a2 2 0 1 1 3 1.7" />
      </>
    ),
    sentir: <path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8a8 8 0 0 0 16 0v-3a2 2 0 0 0-4 0" />,
  };
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[id]}
    </svg>
  );
}

function listaTexto(a: string[]) {
  if (a.length === 0) return "";
  if (a.length === 1) return a[0];
  return `${a.slice(0, -1).join(", ")} y ${a.at(-1)}`;
}

export function PausaSentidosActividad() {
  const [palabras, setPalabras] = useState<Record<SentidoId, string[]>>({ ver: [], oir: [], sentir: [] });
  const [entradas, setEntradas] = useState<Record<SentidoId, string>>({ ver: "", oir: "", sentir: "" });
  const [guardado, setGuardado] = useState(false);

  const total = palabras.ver.length + palabras.oir.length + palabras.sentir.length;
  const completo = total === 6;

  function agregar(id: SentidoId, texto: string) {
    const t = texto.trim();
    const sentido = SENTIDOS.find((s) => s.id === id)!;
    if (!t || palabras[id].length >= sentido.n) return;
    const next = { ...palabras, [id]: [...palabras[id], t] };
    setPalabras(next);
    setEntradas({ ...entradas, [id]: "" });
    if (next.ver.length + next.oir.length + next.sentir.length === 6) {
      saveActivityProgress("estimulacion-cognitiva", "pausa-321", next);
    }
  }
  function quitar(id: SentidoId, k: number) {
    setPalabras({ ...palabras, [id]: palabras[id].filter((_, idx) => idx !== k) });
    setGuardado(false);
  }
  function guardarPausa() {
    saveActivityProgress("estimulacion-cognitiva", "pausa-321", palabras);
    setGuardado(true);
  }
  function otraPausa() {
    setPalabras({ ver: [], oir: [], sentir: [] });
    setEntradas({ ver: "", oir: "", sentir: "" });
    setGuardado(false);
  }

  return (
    <div className={`${styles.act} ${styles.pausa}`}>
      <div>
        <div className={styles.actTag}>
          <span className={styles.actNum}>02</span>
          <span className={styles.actTipo}>
            <svg className={styles.ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 20h4L19 9l-4-4L4 16z" />
              <path d="M13.5 6.5l4 4" />
            </svg>
            Reflexión
          </span>
        </div>
        <h3>Pausa de atención plena</h3>
        <p className={styles.actDesc}>Detente un momento. Nombra 3 cosas que puedas ver, 2 que puedas escuchar y 1 que puedas sentir ahora mismo. Cada una enciende un punto del círculo.</p>

        <div className={styles.sentidos}>
          {SENTIDOS.map((s, idx) => {
            const lista = palabras[s.id];
            const listo = lista.length === s.n;
            const bloq = SENTIDOS.slice(0, idx).some((anterior) => palabras[anterior.id].length !== anterior.n);
            return (
              <div key={s.id} className={`${styles.sent} ${listo ? styles.listo : ""} ${bloq ? styles.bloq : ""}`} style={{ ["--c" as string]: s.c }}>
                <span className={styles.sentIco}>
                  <IconoSentido id={s.id} />
                </span>
                <div className={styles.sentT}>
                  {s.n} {s.t.toLowerCase()} <small>{lista.length}/{s.n}</small>
                </div>
                <div className={styles.sentFila}>
                  {lista.map((w, k) => (
                    <span key={k} className={styles.palabra}>
                      {w}
                      <button type="button" aria-label={`Quitar ${w}`} onClick={() => quitar(s.id, k)}>
                        ×
                      </button>
                    </span>
                  ))}
                  {!listo && (
                    <form
                      className={styles.entrada}
                      onSubmit={(e) => {
                        e.preventDefault();
                        agregar(s.id, entradas[s.id]);
                      }}
                    >
                      <input
                        disabled={bloq}
                        aria-label={s.t}
                        placeholder={bloq ? "Primero el paso anterior" : "Escribe y presiona +"}
                        maxLength={30}
                        value={entradas[s.id]}
                        onChange={(e) => setEntradas({ ...entradas, [s.id]: e.target.value })}
                      />
                      <button type="submit" disabled={bloq} aria-label="Agregar">
                        +
                      </button>
                    </form>
                  )}
                </div>
                {!listo && !bloq && (
                  <div className={styles.ideas}>
                    <span>Ideas:</span>
                    {s.ideas
                      .filter((idea) => !lista.includes(idea))
                      .slice(0, 4)
                      .map((idea) => (
                        <button key={idea} type="button" onClick={() => agregar(s.id, idea)}>
                          {idea}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {completo && (
          <div className={styles.poema}>
            <span className={styles.eyebrow} style={{ color: "var(--lila)" }}>
              Tu momento presente
            </span>
            <p>
              Ahora mismo veo <b>{listaTexto(palabras.ver)}</b>. Escucho <b>{listaTexto(palabras.oir)}</b>. Siento <b>{palabras.sentir[0]}</b>. Estoy aquí.
            </p>
            <div className={styles.poemaAcc}>
              <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnS}`} disabled={guardado} onClick={guardarPausa}>
                {guardado ? "Guardada ✓" : "Guardar mi pausa"}
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} onClick={otraPausa}>
                Hacer otra
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.anillosWrap} aria-hidden="true">
        <svg className={`${styles.anillos} ${completo ? styles.anillosCompleto : ""}`} viewBox="0 0 400 400">
          <defs>
            <radialGradient id="gN">
              <stop offset="0" stopColor="#fff7d6" />
              <stop offset="1" stopColor="#e8c95a" />
            </radialGradient>
          </defs>
          {SENTIDOS.map((s) => {
            const r = RADIOS[s.id];
            const lista = palabras[s.id];
            return (
              <g key={s.id}>
                <circle
                  className={`${styles.aro} ${lista.length === s.n ? styles.aroAct : ""}`}
                  cx={200}
                  cy={200}
                  r={r}
                  stroke={s.c}
                  opacity={lista.length === s.n ? 1 : lista.length ? 0.7 : 0.35}
                  strokeDasharray={lista.length === s.n ? "0" : "3 7"}
                />
                {Array.from({ length: s.n }, (_, k) => {
                  const a = ((ANG0[s.id] + k * PASO[s.id]) * Math.PI) / 180;
                  const x = 200 + r * Math.cos(a);
                  const y = 200 + r * Math.sin(a);
                  const co = Math.cos(a);
                  const si = Math.sin(a);
                  const off = 20;
                  const tx = 200 + (r + off) * co;
                  const ty = 200 + (r + off) * si + 5 + (Math.abs(co) < 0.3 ? si * 8 : 0);
                  const anc = co > 0.3 ? "start" : co < -0.3 ? "end" : "middle";
                  const on = k < lista.length;
                  const palabra = on ? (lista[k].length > 16 ? `${lista[k].slice(0, 15)}…` : lista[k]) : "";
                  return (
                    <g key={k}>
                      <circle className={styles.pto} cx={x} cy={y} r={on ? 13 : 9} fill={on ? s.c : "#2d2e24"} stroke={s.c} strokeWidth={2} />
                      <text className={`${styles.w} ${on ? styles.wOn : ""}`} x={tx} y={ty} textAnchor={anc}>
                        {palabra}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
          <circle className={styles.pulso} cx={200} cy={200} r={26} fill="#e8c95a" />
          <circle className={styles.nucleo} cx={200} cy={200} r={14 + total * 3 + (completo ? 8 : 0)} fill={completo ? "url(#gN)" : total ? "#6a6250" : "#3a3b31"} />
          <text className={styles.aqui} x={200} y={205} textAnchor="middle">
            Aquí
          </text>
        </svg>
      </div>
    </div>
  );
}
