"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/educacion-continua-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

const TEMAS = ["Historia", "Un idioma", "Cocina", "Tecnología", "Arte", "Salud"];
const LUGARES = ["La sala", "El comedor", "Mi cuarto", "El jardín"];

type Estado = {
  paso: number;
  tema: string | null;
  temaOtro: string;
  lugar: number | null;
  aviso: boolean;
  min: number | null;
  agua: boolean;
  lentes: boolean;
  sinLentes: boolean;
  idea: string;
};
const ESTADO_VACIO: Estado = { paso: 0, tema: null, temaOtro: "", lugar: null, aviso: false, min: null, agua: false, lentes: false, sinLentes: false, idea: "" };

function temaTxt(e: Estado) {
  return e.tema === "otro" ? e.temaOtro.trim() : e.tema ?? "";
}
function pasoListo(e: Estado, k: number): boolean {
  if (k === 0) return !!temaTxt(e);
  if (k === 1) return e.lugar != null && e.aviso;
  if (k === 2) return e.min != null;
  if (k === 3) return e.agua && (e.lentes || e.sinLentes);
  return e.idea.trim().length > 2;
}
const CORTOS = ["Tema", "Lugar", "Tiempo", "A mano", "Idea"];
const TITULOS = [
  "Elige un tema que te dé curiosidad",
  "Busca un lugar tranquilo, sin ruido",
  "Aparta 15-20 minutos, sin más",
  "Ten a la mano agua y tus lentes si los usas",
  "Al terminar, anota una idea que aprendiste",
];

function mmss(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function EscritorioAsistenteActividad() {
  const [e, setE] = useState<Estado>(ESTADO_VACIO);
  const [restante, setRestante] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);

  useEffect(() => {
    if (!corriendo) return;
    const id = setTimeout(() => {
      if (restante <= 1) {
        setCorriendo(false);
        setRestante(0);
        mostrarToast("⏰ ¡Terminó tu sesión! Anota una idea.");
        setE((prev) => ({ ...prev, paso: 4 }));
      } else {
        setRestante((r) => r - 1);
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [corriendo, restante]);

  function mostrarToast(msg: string) {
    setToastMsg(msg);
    setToastOn(true);
    setTimeout(() => setToastOn(false), 3000);
  }

  function actualizar(patch: Partial<Estado>) {
    setE((prev) => ({ ...prev, ...patch }));
  }

  function irPaso(k: number) {
    actualizar({ paso: k });
  }
  function elegirTema(t: string) {
    actualizar({ tema: t });
  }
  function elegirLugar(idx: number) {
    actualizar({ lugar: idx });
  }
  function elegirMin(m: number) {
    setCorriendo(false);
    setRestante(m * 60);
    actualizar({ min: m });
  }
  function toggleCheck(campo: "aviso" | "agua" | "lentes" | "sinLentes") {
    const valor = !e[campo];
    const patch: Partial<Estado> = { [campo]: valor };
    if (campo === "lentes" && valor) patch.sinLentes = false;
    if (campo === "sinLentes" && valor) patch.lentes = false;
    actualizar(patch);
  }
  function siguientePaso() {
    if (e.paso === 4) {
      saveActivityProgress("educacion-continua", "escritorio-sesion", { tema: temaTxt(e), lugar: e.lugar != null ? LUGARES[e.lugar] : null, minutos: e.min, idea: e.idea });
      actualizar({ paso: 5 });
    } else {
      actualizar({ paso: e.paso + 1 });
    }
  }
  function atras() {
    actualizar({ paso: e.paso - 1 });
  }
  function toggleTimer() {
    if (corriendo) setCorriendo(false);
    else {
      if (restante <= 0) setRestante((e.min ?? 15) * 60);
      setCorriendo(true);
    }
  }
  function reiniciarTimer() {
    setCorriendo(false);
    setRestante((e.min ?? 15) * 60);
  }
  function guardarSesion() {
    saveActivityProgress("educacion-continua", "escritorio-sesion", { tema: temaTxt(e), lugar: e.lugar != null ? LUGARES[e.lugar] : null, minutos: e.min, idea: e.idea });
    setGuardado(true);
    mostrarToast("📚 Sesión guardada");
  }
  function nuevaSesion() {
    setCorriendo(false);
    setRestante(0);
    setGuardado(false);
    setE(ESTADO_VACIO);
  }

  const total = (e.min || 15) * 60;
  const r = e.min ? restante || total : total;
  const C = 2 * Math.PI * 40;

  return (
    <div className={`${styles.act} ${styles.sesion}`}>
      <div className={styles.escritorioWrap}>
        <div className={`${styles.escritorio} ${e.lugar != null ? styles.lamparaOn : ""}`} aria-hidden="true">
          <span className={styles.luz} />
          <div className={`${styles.cosa} ${styles.lamparaO}`}>
            <i />
          </div>
          <div className={`${styles.cosa} ${styles.libro} ${!temaTxt(e) ? styles.fuera : ""}`}>
            <small>Hoy aprendo</small>
            <b>{temaTxt(e) || "—"}</b>
            <span>PRISMA · Educación continua</span>
          </div>
          <div className={`${styles.cosa} ${styles.cartel} ${!e.aviso ? styles.fuera : ""}`}>🤫 NO MOLESTAR</div>
          <div className={`${styles.cosa} ${styles.temporizador} ${e.min == null ? styles.fuera : ""}`}>
            <svg viewBox="0 0 96 96">
              <circle className={styles.tempF} cx={48} cy={48} r={40} />
              <circle className={styles.tempV} cx={48} cy={48} r={40} strokeDasharray={C} strokeDashoffset={C * (1 - r / total)} />
            </svg>
            <div>
              <b>{mmss(r)}</b>
              <small>minutos</small>
            </div>
          </div>
          <div className={`${styles.cosa} ${styles.vaso} ${!e.agua ? styles.fuera : ""}`} />
          <div className={`${styles.cosa} ${styles.lentes} ${!e.lentes ? styles.fuera : ""}`}>👓</div>
          <div className={`${styles.cosa} ${styles.postit} ${e.idea.trim().length <= 2 ? styles.fuera : ""}`}>
            <small>Hoy aprendí</small>
            <span>{e.idea.trim()}</span>
          </div>
        </div>
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
        <h3>Prepara tu sesión de estudio</h3>
        <p className={styles.actDesc}>Pasos simples antes de aprender algo nuevo. Con cada uno, tu escritorio queda más listo.</p>

        <div className={styles.asist}>
          <div className={styles.puntos} role="tablist" aria-label="Pasos">
            {TITULOS.map((_, k) => {
              const listo = pasoListo(e, k);
              return (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={e.paso === k}
                  className={`${e.paso === k ? styles.puntoAct : ""} ${listo ? styles.puntoOk : ""}`}
                  aria-label={`Paso ${k + 1}: ${CORTOS[k]}`}
                  onClick={() => irPaso(k)}
                >
                  {listo ? "✓" : k + 1}
                </button>
              );
            })}
          </div>

          {e.paso === 5 ? (
            <div className={`${styles.listo} ${styles.ficha}`}>
              <b>📚 ¡Sesión completa!</b>
              <p>
                Aprendiste sobre <strong>{temaTxt(e)}</strong> durante {e.min} minutos. Tu idea quedó pegada en el escritorio.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnS}`} disabled={guardado} onClick={guardarSesion}>
                  {guardado ? "Guardada ✓" : "Guardar mi sesión"}
                </button>
                <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} onClick={nuevaSesion}>
                  Preparar otra sesión
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.ficha}>
              <span className={styles.fichaN}>Paso {e.paso + 1} de 5</span>
              <h4>{TITULOS[e.paso]}</h4>

              {e.paso === 0 && (
                <>
                  <p className={styles.ay}>Algo que siempre quisiste saber. No tiene que ser difícil.</p>
                  <div className={styles.chips}>
                    {TEMAS.map((t) => (
                      <button key={t} type="button" className={e.tema === t ? styles.chipOn : styles.chip} aria-pressed={e.tema === t} onClick={() => elegirTema(t)}>
                        {t}
                      </button>
                    ))}
                    <button type="button" className={e.tema === "otro" ? styles.chipOn : styles.chip} aria-pressed={e.tema === "otro"} onClick={() => elegirTema("otro")}>
                      Otro…
                    </button>
                  </div>
                  {e.tema === "otro" && (
                    <input
                      className={styles.campo}
                      placeholder="¿Qué quieres aprender?"
                      maxLength={40}
                      aria-label="Otro tema"
                      value={e.temaOtro}
                      onChange={(ev) => actualizar({ temaOtro: ev.target.value })}
                    />
                  )}
                </>
              )}

              {e.paso === 1 && (
                <>
                  <p className={styles.ay}>Un rincón con buena luz, lejos de la tele.</p>
                  <div className={styles.chips}>
                    {LUGARES.map((l, idx) => (
                      <button key={l} type="button" className={e.lugar === idx ? styles.chipOn : styles.chip} aria-pressed={e.lugar === idx} onClick={() => elegirLugar(idx)}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <label className={`${styles.check} ${e.aviso ? styles.checkOn : ""}`}>
                    <input type="checkbox" checked={e.aviso} onChange={() => toggleCheck("aviso")} />
                    <i>{e.aviso ? "✓" : ""}</i>
                    Avisé en casa que no me interrumpan
                  </label>
                </>
              )}

              {e.paso === 2 && (
                <>
                  <p className={styles.ay}>Mejor corto y seguido. Si quieres, activa el temporizador del escritorio.</p>
                  <div className={styles.chips}>
                    <button type="button" className={e.min === 15 ? styles.chipOn : styles.chip} aria-pressed={e.min === 15} onClick={() => elegirMin(15)}>
                      15 minutos
                    </button>
                    <button type="button" className={e.min === 20 ? styles.chipOn : styles.chip} aria-pressed={e.min === 20} onClick={() => elegirMin(20)}>
                      20 minutos
                    </button>
                  </div>
                  {e.min != null && (
                    <div className={styles.timerAcc}>
                      <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} onClick={toggleTimer}>
                        {corriendo ? "⏸ Pausar temporizador" : "▶ Iniciar temporizador"}
                      </button>
                      {(corriendo || restante < total) && (
                        <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} onClick={reiniciarTimer}>
                          Reiniciar
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {e.paso === 3 && (
                <>
                  <p className={styles.ay}>Para no levantarte a mitad de la sesión.</p>
                  <label className={`${styles.check} ${e.agua ? styles.checkOn : ""}`}>
                    <input type="checkbox" checked={e.agua} onChange={() => toggleCheck("agua")} />
                    <i>{e.agua ? "✓" : ""}</i>💧 Un vaso de agua
                  </label>
                  <label className={`${styles.check} ${e.lentes ? styles.checkOn : ""}`}>
                    <input type="checkbox" checked={e.lentes} onChange={() => toggleCheck("lentes")} />
                    <i>{e.lentes ? "✓" : ""}</i>👓 Mis lentes
                  </label>
                  <label className={`${styles.check} ${e.sinLentes ? styles.checkOn : ""}`}>
                    <input type="checkbox" checked={e.sinLentes} onChange={() => toggleCheck("sinLentes")} />
                    <i>{e.sinLentes ? "✓" : ""}</i>No uso lentes
                  </label>
                </>
              )}

              {e.paso === 4 && (
                <>
                  <p className={styles.ay}>Una sola frase basta. Se pegará como notita en tu escritorio.</p>
                  <textarea
                    className={`${styles.campo} ${styles.campoTextarea}`}
                    maxLength={120}
                    placeholder="Ej: El Renacimiento empezó en Italia."
                    aria-label="Idea que aprendiste"
                    value={e.idea}
                    onChange={(ev) => actualizar({ idea: ev.target.value })}
                  />
                </>
              )}

              <div className={styles.fichaPie}>
                {e.paso > 0 && (
                  <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} onClick={atras}>
                    ← Atrás
                  </button>
                )}
                <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnS}`} disabled={!pasoListo(e, e.paso)} onClick={siguientePaso}>
                  {e.paso === 4 ? "Terminar sesión" : "Siguiente"} →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`${styles.toast} ${toastOn ? styles.toastOn : ""}`} role="status">
        {toastMsg}
      </div>
    </div>
  );
}
