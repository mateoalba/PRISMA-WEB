"use client";

import { useState } from "react";
import styles from "@/styles/tiempo-libre-actividades.module.css";
import { Icono, IconoPaths, type ClaveIcono } from "./TiempoLibreIconos";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type Actividad = { id: string; t: string; ico: ClaveIcono; mats: string[] };

const ACTIVIDADES: Actividad[] = [
  { id: "leer", t: "Leer", ico: "libro", mats: ["Un libro o revista que te guste", "Tus lentes de lectura", "Una luz cómoda", "Una bebida caliente"] },
  { id: "cocinar", t: "Cocinar", ico: "olla", mats: ["La receta escrita o en el celular", "Los ingredientes", "Un delantal", "Música de fondo"] },
  { id: "caminar", t: "Caminar", ico: "zapato", mats: ["Zapatos cómodos", "Una botella de agua", "Sombrero o gorra", "Tu celular cargado"] },
  { id: "pintar", t: "Pintar", ico: "pincel", mats: ["Papel o cuaderno", "Colores o acuarelas", "Un vaso con agua", "Un trapito para limpiar"] },
  { id: "musica", t: "Música", ico: "nota", mats: ["Tu lista de canciones favoritas", "Audífonos o parlante", "Un lugar cómodo para sentarte"] },
  { id: "jardin", t: "Jardinería", ico: "planta", mats: ["Guantes", "Una regadera", "Tierra o abono", "Macetas o semillas"] },
];
const SENTIRES = [
  { e: "😌", t: "Relajado" },
  { e: "😊", t: "Contento" },
  { e: "🤩", t: "¡Me encantó!" },
  { e: "😐", t: "Normal" },
];
const DIAS = ["Hoy", "Mañana", "Sábado", "Domingo"];
const HORAS = ["15:00", "16:00", "17:00", "18:00"];
const DURACIONES = [30, 45, 60, 90];
const PALETAS = [
  ["#6fa8d6", "#bfe0ea", "#f6e7b8"],
  ["#7aa3cf", "#e6d6a8", "#f7c98a"],
  ["#8a8fc4", "#f0b98a", "#f59f6e"],
  ["#6c6aa8", "#e98a78", "#f6a86a"],
  ["#4a4a86", "#c7708a", "#f39a6a"],
  ["#2d2f5e", "#8a5a8a", "#e98a6a"],
];

type Estado = {
  actId: string | null;
  dia: number | null;
  hora: number | null;
  dur: number | null;
  mats: number[];
  comp: "solo" | "con" | null;
  quien: string;
  sentir: number | null;
  pendiente: boolean;
};

function pasosDe(e: Estado) {
  const actv = ACTIVIDADES.find((a) => a.id === e.actId);
  return [
    { t: "Elige una actividad que te dé curiosidad", listo: !!e.actId, resumen: actv?.t ?? "" },
    { t: "Aparta al menos 30 minutos sin interrupciones", listo: e.dia != null && e.hora != null && e.dur != null, resumen: e.dia != null && e.hora != null && e.dur != null ? `${DIAS[e.dia]} · ${HORAS[e.hora]} · ${DURACIONES[e.dur]} min` : "" },
    { t: "Prepara lo que necesites con anticipación", listo: !!e.actId && actv != null && e.mats.length === actv.mats.length, resumen: "Todo listo" },
    { t: "Invita a alguien si quieres compañía", listo: e.comp === "solo" || (e.comp === "con" && e.quien.trim() !== ""), resumen: e.comp === "solo" ? "Un rato para mí" : e.comp === "con" ? `Con ${e.quien.trim()}` : "" },
    { t: "Al terminar, anota cómo te sentiste", listo: e.sentir != null || e.pendiente, resumen: e.pendiente ? "Lo anoto después" : e.sentir != null ? `${SENTIRES[e.sentir].e} ${SENTIRES[e.sentir].t}` : "" },
  ];
}

export function ArmaTuTardeActividad({ initialEstado }: { initialEstado: Estado }) {
  const [e, setE] = useState<Estado>(initialEstado);
  const [abierto, setAbierto] = useState(0);
  const [guardado, setGuardado] = useState(false);

  function actualizar(patch: Partial<Estado>) {
    const next = { ...e, ...patch };
    setE(next);
    saveActivityProgress("tiempo-libre", "arma-tarde", next);
  }

  const pasos = pasosDe(e);
  const actv = ACTIVIDADES.find((a) => a.id === e.actId);
  const n = pasos.filter((p) => p.listo).length;
  const todo = pasos.every((p) => p.listo);
  const listo3 = !!e.actId && e.dia != null && e.hora != null && e.dur != null;

  function elegirActividad(id: string) {
    actualizar({ actId: id, mats: e.actId !== id ? [] : e.mats });
  }
  function toggleMaterial(idx: number) {
    const mats = e.mats.includes(idx) ? e.mats.filter((x) => x !== idx) : [...e.mats, idx];
    actualizar({ mats });
  }
  function elegirCompania(c: "solo" | "con") {
    actualizar({ comp: c });
  }
  function elegirSentir(idx: number) {
    actualizar({ sentir: idx, pendiente: false });
  }
  function togglePendiente() {
    actualizar({ pendiente: !e.pendiente, sentir: !e.pendiente ? null : e.sentir });
  }
  function continuar() {
    const sig = pasos.findIndex((p, k) => k > abierto && !p.listo);
    setAbierto(sig === -1 ? (abierto + 1 <= 4 ? abierto + 1 : -1) : sig);
  }
  function abrirPaso(k: number) {
    setAbierto(abierto === k ? -1 : k);
  }
  function guardarPlan() {
    setGuardado(true);
  }

  const pal = PALETAS[n];
  const f = n / 5;
  const solX = 70 + f * 260;
  const solY = 120 + Math.pow(f, 1.6) * 230;
  const horaTxt = e.hora != null ? `${DIAS[e.dia ?? 0]} · ${HORAS[e.hora]}` : "Tu tarde";

  return (
    <div className={`${styles.act} ${styles.tarde}`}>
      <div className={styles.ventanaWrap}>
        <div className={styles.ventana} aria-hidden="true">
          <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="tl-cielo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={pal[0]} />
                <stop offset=".6" stopColor={pal[1]} />
                <stop offset="1" stopColor={pal[2]} />
              </linearGradient>
              <radialGradient id="tl-gSol">
                <stop offset="0" stopColor="#fffbe6" />
                <stop offset=".45" stopColor="#ffe27a" />
                <stop offset="1" stopColor="#ffe27a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width={400} height={500} fill="url(#tl-cielo)" />
            <g className={styles.estrellas} opacity={n === 5 ? 0.9 : 0} fill="#fff">
              <circle cx={60} cy={80} r={1.6} />
              <circle cx={140} cy={50} r={1.2} />
              <circle cx={300} cy={70} r={1.8} />
              <circle cx={350} cy={140} r={1.2} />
              <circle cx={230} cy={110} r={1.4} />
            </g>
            <g className={styles.sol} style={{ transform: `translate(${solX}px, ${solY}px)` }}>
              <circle r={70} fill="url(#tl-gSol)" />
              <circle r={30} fill={n >= 4 ? "#ffc48a" : "#fff3b0"} />
            </g>
            <path d="M0 360 C 80 310, 150 330, 220 350 S 340 320, 400 340 V500 H0Z" fill={n >= 4 ? "#3f4a22" : "#5c6a1c"} />
            <path d="M0 400 C 90 370, 170 390, 250 400 S 360 380, 400 390 V500 H0Z" fill="#3f4718" />
            <g transform="translate(250 382)" fill="#2b2a22">
              <rect x={0} y={0} width={90} height={8} rx={3} />
              <rect x={0} y={-22} width={90} height={7} rx={3} />
              <rect x={8} y={8} width={6} height={22} />
              <rect x={76} y={8} width={6} height={22} />
            </g>
            <g className={`${styles.sticker} ${!e.actId ? styles.oculto : ""}`} transform="translate(120 330)">
              <circle r={46} fill="#fffaf0" stroke="#e8c95a" strokeWidth={4} />
              {actv && (
                <g transform="translate(-26 -26) scale(2.17)" fill="none" stroke="#2b2a22" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <IconoPaths clave={actv.ico} />
                </g>
              )}
            </g>
          </svg>
          <span className={styles.ventanaHora}>{horaTxt}</span>
        </div>
        {listo3 && actv && (
          <div className={styles.boleto}>
            <span className={styles.boletoIco}>
              <Icono clave={actv.ico} className={styles.ico} />
            </span>
            <div>
              <small>Tu tarde ideal</small>
              <b>
                {actv.t} · {DURACIONES[e.dur!]} min
              </b>
              <span>
                {DIAS[e.dia!]} a las {HORAS[e.hora!]}
                {e.comp === "con" && e.quien.trim() ? ` · con ${e.quien.trim()}` : e.comp === "solo" ? " · solo para mí" : ""}
              </span>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className={styles.actTag}>
          <span className={styles.actNum}>02</span>
          <span className={styles.actTipo}>
            <svg className={styles.ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 11l3 3 8-8" />
              <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
            </svg>
            Lista de pasos
          </span>
        </div>
        <h3>Arma tu tarde ideal</h3>
        <p className={styles.actDesc}>Organiza un rato solo para ti, sin culpa. Mira cómo cambia el cielo de tu ventana mientras avanzas.</p>

        <ol className={styles.pasos}>
          {pasos.map((p, k) => {
            const ab = abierto === k;
            return (
              <li key={k} className={`${styles.paso} ${p.listo ? styles.hecho : ""} ${ab ? styles.abierto : ""}`}>
                <button type="button" className={styles.pasoCab} aria-expanded={ab} onClick={() => abrirPaso(k)}>
                  <span className={styles.pasoN}>{p.listo ? "✓" : k + 1}</span>
                  <span className={styles.pasoT}>
                    <b>{p.t}</b>
                    <span>{p.listo ? p.resumen : ab ? "Elige una opción" : "Toca para abrir"}</span>
                  </span>
                  <span className={styles.pasoFlecha}>
                    <Icono clave="flecha" className={styles.ico} />
                  </span>
                </button>
                {ab && (
                  <div className={styles.pasoCuerpo}>
                    {k === 0 && (
                      <div className={styles.acts} role="group" aria-label="Actividades">
                        {ACTIVIDADES.map((a) => (
                          <button key={a.id} type="button" className={e.actId === a.id ? styles.actvOn : styles.actv} aria-pressed={e.actId === a.id} onClick={() => elegirActividad(a.id)}>
                            <Icono clave={a.ico} className={styles.ico} />
                            {a.t}
                          </button>
                        ))}
                      </div>
                    )}
                    {k === 1 && (
                      <>
                        <div className={styles.grupo}>
                          <span>¿Qué día?</span>
                          <div className={styles.chips}>
                            {DIAS.map((d, idx) => (
                              <button key={idx} type="button" className={e.dia === idx ? styles.chipOn : styles.chip} aria-pressed={e.dia === idx} onClick={() => actualizar({ dia: idx })}>
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className={styles.grupo}>
                          <span>¿A qué hora?</span>
                          <div className={styles.chips}>
                            {HORAS.map((h, idx) => (
                              <button key={idx} type="button" className={e.hora === idx ? styles.chipOn : styles.chip} aria-pressed={e.hora === idx} onClick={() => actualizar({ hora: idx })}>
                                {h}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className={styles.grupo}>
                          <span>¿Cuánto tiempo?</span>
                          <div className={styles.chips}>
                            {DURACIONES.map((d, idx) => (
                              <button key={idx} type="button" className={e.dur === idx ? styles.chipOn : styles.chip} aria-pressed={e.dur === idx} onClick={() => actualizar({ dur: idx })}>
                                {d} min
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className={styles.nota}>Tip: silencia el celular o avisa en casa que es tu momento.</p>
                      </>
                    )}
                    {k === 2 &&
                      (!actv ? (
                        <p className={styles.nota}>Primero elige una actividad en el paso 1 y te diremos qué preparar.</p>
                      ) : (
                        <ul className={styles.mats}>
                          {actv.mats.map((m, idx) => (
                            <li key={idx}>
                              <label className={styles.mat}>
                                <input type="checkbox" checked={e.mats.includes(idx)} onChange={() => toggleMaterial(idx)} />
                                <i>{e.mats.includes(idx) ? "✓" : ""}</i>
                                <span>{m}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      ))}
                    {k === 3 && (
                      <>
                        <div className={styles.chips}>
                          <button type="button" className={e.comp === "solo" ? styles.chipOn : styles.chip} aria-pressed={e.comp === "solo"} onClick={() => elegirCompania("solo")}>
                            Solo para mí
                          </button>
                          <button type="button" className={e.comp === "con" ? styles.chipOn : styles.chip} aria-pressed={e.comp === "con"} onClick={() => elegirCompania("con")}>
                            Invitar a alguien
                          </button>
                        </div>
                        {e.comp === "con" && (
                          <input
                            className={styles.campo}
                            placeholder="¿A quién? (ej: mi vecina Carmen)"
                            aria-label="Nombre de quien invitas"
                            value={e.quien}
                            onChange={(ev) => actualizar({ quien: ev.target.value })}
                          />
                        )}
                        <p className={styles.nota}>{e.comp === "solo" ? "Estar a solas con algo que disfrutas también es un regalo." : "Compartir lo que te gusta duplica la alegría."}</p>
                      </>
                    )}
                    {k === 4 && (
                      <>
                        <div className={styles.sentires} role="group" aria-label="¿Cómo te sentiste?">
                          {SENTIRES.map((s, idx) => (
                            <button key={idx} type="button" className={e.sentir === idx ? styles.sentOn : styles.sent} aria-pressed={e.sentir === idx} onClick={() => elegirSentir(idx)}>
                              <em>{s.e}</em>
                              {s.t}
                            </button>
                          ))}
                        </div>
                        <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} style={{ marginTop: 12 }} onClick={togglePendiente}>
                          {e.pendiente ? "✓ " : ""}Aún no la hago, lo anoto después
                        </button>
                      </>
                    )}
                    {p.listo && k < 4 && (
                      <div className={styles.pasoOk}>
                        <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnS}`} onClick={continuar}>
                          Continuar
                          <Icono clave="sig" className={styles.ico} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {todo && (
          <div className={styles.fin}>
            <b>🌇 ¡Tu tarde ideal está lista!</b>
            <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnS}`} disabled={guardado} onClick={guardarPlan}>
              {guardado ? "Guardado ✓" : "Guardar mi plan"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
