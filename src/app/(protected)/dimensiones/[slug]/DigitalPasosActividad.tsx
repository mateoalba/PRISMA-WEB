"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/digital-actividades.module.css";

export type PasosState = boolean[];

export const TOTAL_PASOS = 5;

const PASOS = [
  { t: "Cargar la batería al menos al 50%", tip: "Conecta el cargador y espera a que el ícono de la batería se vea más de la mitad lleno. Lo ideal es cargarlo en la noche." },
  { t: "Revisar que tengas wifi o datos activados", tip: "Desliza el dedo desde arriba de la pantalla. Si el ícono de ondas está encendido (de color), tienes internet." },
  { t: "Guardar el número de un familiar como contacto de emergencia", tip: 'Abre Contactos, busca a tu familiar y marca la estrella ☆ o la opción "Contacto de emergencia".' },
  { t: "Aprender a subir el volumen de las llamadas", tip: "Durante una llamada, presiona el botón de arriba en el costado del celular hasta que escuches bien." },
  { t: "Practicar tomar una foto y enviarla por WhatsApp", tip: "En un chat, toca el ícono de la cámara 📷, toma la foto y presiona la flecha verde para enviar." },
] as const;

function CheckIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}
function EstrellaIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4 6.8 19.2l1-5.9L3.5 9.2l5.9-.8z" />
    </svg>
  );
}
function ListaIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
    </svg>
  );
}
function WifiIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </svg>
  );
}
function BateriaIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="2" y="7" width="17" height="10" rx="2" />
      <path d="M22 11v2" />
      <path d="M11 9l-2 3h4l-2 3" />
    </svg>
  );
}
function TelIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}
function VolumenIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M11 5L6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
    </svg>
  );
}

function horaAhora() {
  return new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
}
function fechaHoy() {
  return new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
}

export function DigitalPasosActividad({
  hechos,
  setHechos,
  onCompletoNuevo,
}: {
  hechos: PasosState;
  setHechos: (h: PasosState) => void;
  onCompletoNuevo: () => void;
}) {
  const [tipAbierto, setTipAbierto] = useState<number | null>(null);
  const [foco, setFoco] = useState<number | null>(null);
  const [hora, setHora] = useState("");
  const nodosRef = useRef<(HTMLSpanElement | null)[]>([]);
  const [alturaLinea, setAlturaLinea] = useState(0);
  const primeraVezRef = useRef(true);

  // La hora de la pantalla del celular es solo decorativa — se llena
  // después del montaje para no desajustar el HTML del servidor.
  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => setHora(horaAhora()), []);

  const n = hechos.filter(Boolean).length;
  const completo = n === PASOS.length;

  useEffect(() => {
    const primerNodo = nodosRef.current[0];
    const ultimoIndex = hechos.lastIndexOf(true);
    if (ultimoIndex >= 0 && primerNodo) {
      const ultimoNodo = nodosRef.current[ultimoIndex];
      if (ultimoNodo) {
        setAlturaLinea(ultimoNodo.getBoundingClientRect().top - primerNodo.getBoundingClientRect().top);
        return;
      }
    }
    setAlturaLinea(0);
  }, [hechos]);

  useEffect(() => {
    if (completo) {
      if (primeraVezRef.current) {
        primeraVezRef.current = false;
        onCompletoNuevo();
      }
    } else {
      primeraVezRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completo]);

  function marcar(k: number) {
    const next = hechos.map((h, i) => (i === k ? !h : h));
    setHechos(next);
  }

  return (
    <div className={`${styles.act} ${styles.pasos}`}>
      <div>
        <div className={styles.actTag}>
          <span className={styles.actNum}>01</span>
          <span className={styles.actTipo}>
            <ListaIcon />
            Lista de pasos
          </span>
        </div>
        <h3>Prepara tu celular para el día a día</h3>
        <p className={styles.actDesc}>Cinco pasos simples para tener tu celular listo y a mano. Toca cada paso cuando lo hayas hecho y mira cómo cambia el celular.</p>
        <div className={styles.barra}>
          <div className={styles.barraT}>
            <i style={{ width: `${(n / PASOS.length) * 100}%` }} />
          </div>
          <b>
            {n} de {PASOS.length} listos
          </b>
        </div>

        <ol className={styles.ruta}>
          <span className={styles.rutaLleno} aria-hidden="true" style={{ height: alturaLinea }} />
          {PASOS.map((p, k) => {
            const hecho = hechos[k];
            const abierto = tipAbierto === k;
            return (
              <li key={k} className={`${styles.paso} ${hecho ? styles.hecho : ""} ${foco === k ? styles.foco : ""}`} onMouseEnter={() => setFoco(k)} onMouseLeave={() => setFoco(null)} onFocus={() => setFoco(k)} onBlur={() => setFoco(null)}>
                <div className={styles.pasoFila}>
                  <button type="button" className={styles.pasoBtn} aria-pressed={hecho} onClick={() => marcar(k)}>
                    <span
                      className={styles.pasoNodo}
                      ref={(el) => {
                        nodosRef.current[k] = el;
                      }}
                    >
                      {k + 1}
                      <CheckIcon />
                    </span>
                    <span className={styles.pasoTxt}>
                      <b>{p.t}</b>
                      <small>{hecho ? "¡Hecho!" : "Toca para marcarlo"}</small>
                    </span>
                  </button>
                  <button type="button" className={styles.pasoAyuda} aria-expanded={abierto} onClick={() => setTipAbierto(abierto ? null : k)}>
                    {abierto ? "Ocultar ayuda" : "¿Cómo lo hago?"}
                  </button>
                </div>
                {abierto && <p className={styles.pasoTip}>{p.tip}</p>}
              </li>
            );
          })}
        </ol>

        {completo && (
          <div className={styles.finPasos}>
            <EstrellaIcon />
            <span>¡Excelente! Completaste los 5 pasos.</span>
            <button type="button" className={styles.btnLink} onClick={() => setHechos(PASOS.map(() => false))}>
              Empezar de nuevo
            </button>
          </div>
        )}
      </div>

      <div className={styles.celWrap} aria-hidden="true">
        <div className={styles.cel}>
          <div className={styles.celPantalla}>
            <span className={styles.celIsla} />
            <div className={styles.celEstado}>
              <span>{hora}</span>
              <div>
                <WifiIcon className={`${styles.stWifi} ${hechos[1] ? styles.on : ""}`} />
                <span className={`${styles.stBat} ${hechos[0] ? styles.on : ""}`}>
                  <i />
                </span>
              </div>
            </div>
            <div className={styles.hora}>{hora}</div>
            <div className={styles.fechaCel}>{fechaHoy()}</div>

            <div className={`${styles.w} ${styles.wBat} ${hechos[0] ? styles.on : ""} ${foco === 0 ? styles.foco : ""}`}>
              <BateriaIcon />
              <div className={styles.wBatBarra}>
                <i />
              </div>
              <b>{hechos[0] ? "82%" : "18%"}</b>
            </div>
            <div className={`${styles.w} ${styles.wWifi} ${hechos[1] ? styles.on : ""} ${foco === 1 ? styles.foco : ""}`}>
              <WifiIcon />
              <div>
                Wi-Fi
                <small>{hechos[1] ? "Conectado" : "Desactivado"}</small>
              </div>
              <span className={styles.sw} />
            </div>
            <div className={`${styles.w} ${styles.wCont} ${hechos[2] ? styles.on : ""} ${foco === 2 ? styles.foco : ""}`}>
              <span className={styles.av}>A</span>
              <div>
                Ana · mi hija
                <small>Contacto de emergencia ♥</small>
              </div>
              <span className={styles.tel}>
                <TelIcon />
              </span>
            </div>
            <div className={`${styles.w} ${styles.wVol} ${hechos[3] ? styles.on : ""} ${foco === 3 ? styles.foco : ""}`}>
              <VolumenIcon />
              <div className={styles.wVolBarra}>
                {Array.from({ length: 10 }, (_, k) => (
                  <i key={k} style={{ height: `${20 + k * 8}%` }} />
                ))}
              </div>
            </div>
            <div className={`${styles.w} ${styles.wFoto} ${hechos[4] ? styles.on : ""} ${foco === 4 ? styles.foco : ""}`}>
              <div className={styles.burbuja}>
                <div className={styles.img} />
              </div>
              <small>Enviado ✓✓</small>
            </div>

            <div className={`${styles.celListo} ${completo ? styles.on : ""}`}>✨ ¡Tu celular está listo para el día!</div>
          </div>
        </div>
        <p className={styles.celNota}>Cada paso que marcas se refleja aquí.</p>
      </div>
    </div>
  );
}
