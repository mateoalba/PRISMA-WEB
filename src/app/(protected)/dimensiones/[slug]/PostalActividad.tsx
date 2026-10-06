"use client";

import { useState } from "react";
import styles from "@/styles/conexion-social-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

const VINCULOS = ["Hija/o", "Nieta/o", "Hermana/o", "Amiga/o", "Vecina/o", "Excompañera/o", "Otra persona"];
const FRASES = [
  "Hace tiempo que no hablamos y me acordé de ti.",
  "¿Cómo has estado? Me gustaría saber de tu vida.",
  "Vi algo que me recordó a ti y quise contarte.",
  "¿Te gustaría tomar un café esta semana?",
];
const NOMBRES_DIA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const LARGO_DIA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function ReflexionIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}
function SobreIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11l18-8-8 18-2-8z" />
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
function CampanaIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function PostalActividad() {
  const [dias] = useState(() =>
    Array.from({ length: 7 }, (_, k) => {
      const d = new Date();
      d.setDate(d.getDate() + k);
      return d;
    })
  );
  const [vinculo, setVinculo] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [diaIndex, setDiaIndex] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardada, setGuardada] = useState(false);
  const [popCampo, setPopCampo] = useState<string | null>(null);

  function pop(campo: string) {
    setPopCampo(campo);
    setTimeout(() => setPopCampo((c) => (c === campo ? null : c)), 400);
  }

  function elegirFrase(f: string) {
    setMensaje((prev) => (prev.trim() ? `${prev.trim()} ${f}` : f));
    pop("cuerpo");
  }

  function elegirVinculo(v: string) {
    setVinculo(v);
    pop("pVinc");
  }

  function elegirDia(k: number) {
    setDiaIndex(k);
    pop("pDia");
  }

  const diaElegido = diaIndex != null ? dias[diaIndex] : null;
  const pasos1ok = !!(vinculo && nombre.trim());
  const pasos2ok = !!mensaje.trim();
  const pasos3ok = diaIndex != null;
  const faltan = [!pasos1ok, !pasos2ok, !pasos3ok].filter(Boolean).length;

  async function guardarPostal() {
    if (!diaElegido || diaIndex == null) return;
    setGuardando(true);
    await saveActivityProgress("conexion-social", "postal", {
      vinculo,
      nombre: nombre.trim(),
      mensaje: mensaje.trim(),
      fecha: diaElegido.toISOString().slice(0, 10),
      guardadaEl: new Date().toISOString(),
    });
    setGuardando(false);
    setGuardada(true);
  }

  return (
    <div className={`${styles.act} ${styles.llamar}`}>
      <div>
        <div className={styles.actTag}>
          <span className={styles.actNum}>01</span>
          <span className={styles.actTipo}>
            <ReflexionIcon />
            Reflexión
          </span>
        </div>
        <h3>A quién quiero llamar esta semana</h3>
        <p className={styles.actDesc}>Piensa en una persona con la que no hablas hace tiempo. Arma tu postal y, cuando la guardes, te recordaremos el día que elegiste.</p>

        <div className={styles.pasosForm}>
          <div className={`${styles.pf} ${pasos1ok ? styles.ok : ""}`}>
            <span className={styles.pfT}>¿Quién es?</span>
            <div className={styles.chips} role="group" aria-label="¿Quién es?">
              {VINCULOS.map((v) => (
                <button key={v} type="button" className={`${styles.chip} ${vinculo === v ? styles.chipOn : ""}`} aria-pressed={vinculo === v} onClick={() => elegirVinculo(v)}>
                  {v}
                </button>
              ))}
            </div>
            <label htmlFor="cs-nombre" style={{ position: "absolute", left: -9999 }}>
              Nombre
            </label>
            <input
              id="cs-nombre"
              className={styles.campo}
              placeholder="Su nombre (ej: Ana)"
              maxLength={30}
              autoComplete="off"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className={`${styles.pf} ${pasos2ok ? styles.ok : ""}`}>
            <span className={styles.pfT}>¿Qué le dirías si la llamaras hoy?</span>
            <div className={styles.chips} aria-label="Ideas para empezar">
              {FRASES.map((f, k) => (
                <button key={k} type="button" className={`${styles.chip} ${styles.chipFrase}`} onClick={() => elegirFrase(f)}>
                  {f}
                </button>
              ))}
            </div>
            <textarea
              className={`${styles.campo} ${styles.campoTextarea}`}
              placeholder="Escribe aquí o toca una idea de arriba…"
              maxLength={260}
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
          </div>

          <div className={`${styles.pf} ${pasos3ok ? styles.ok : ""}`}>
            <span className={styles.pfT}>¿Qué día la llamas?</span>
            <div className={styles.dias} role="group" aria-label="¿Qué día la llamas?">
              {dias.map((d, k) => (
                <button
                  key={k}
                  type="button"
                  className={`${styles.dia} ${diaIndex === k ? styles.diaOn : ""}`}
                  aria-pressed={diaIndex === k}
                  aria-label={`${LARGO_DIA[d.getDay()]} ${d.getDate()}`}
                  onClick={() => elegirDia(k)}
                >
                  <b>{k === 0 ? "Hoy" : NOMBRES_DIA[d.getDay()]}</b>
                  <small>
                    {d.getDate()} {MESES[d.getMonth()]}
                  </small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.postalWrap}>
        <article className={styles.postal} aria-label="Vista previa de tu postal">
          <div className={styles.postalMsg}>
            <span className={styles.hola}>{nombre.trim() ? `Querida/o ${nombre.trim()}:` : "Querida persona:"}</span>
            <span className={`${styles.cuerpo} ${popCampo === "cuerpo" ? styles.pop : ""}`}>{mensaje.trim() ? mensaje.trim() : <span className={styles.vacioTexto}>Aquí aparecerá lo que le quieres decir…</span>}</span>
            <span className={styles.postalFirma}>Con cariño, yo ♥</span>
          </div>
          <div className={styles.postalDer}>
            <span className={styles.sello} aria-hidden="true">
              <div>
                <TelIcon />
              </div>
            </span>
            <span className={`${styles.matasello} ${guardada ? styles.mataselloOn : ""}`} aria-hidden="true">
              <span>
                PRISMA
                <b>{diaElegido ? NOMBRES_DIA[diaElegido.getDay()].toUpperCase() : ""}</b>
                LLAMAR
              </span>
            </span>
            <div className={styles.linea}>
              <small>Para</small>
              <span>{nombre.trim() || "—"}</span>
            </div>
            <div className={`${styles.linea} ${popCampo === "pVinc" ? styles.pop : ""}`}>
              <small>Es mi</small>
              <span>{vinculo || "—"}</span>
            </div>
            <div className={`${styles.linea} ${popCampo === "pDia" ? styles.pop : ""}`}>
              <small>La llamo el</small>
              <span>{diaElegido ? (diaIndex === 0 ? "hoy mismo" : `${LARGO_DIA[diaElegido.getDay()]} ${diaElegido.getDate()}`) : "—"}</span>
            </div>
          </div>
        </article>
        <div className={styles.postalAcc}>
          <button type="button" className={`${styles.btn} ${styles.btnP}`} disabled={faltan > 0 || guardando || guardada} onClick={guardarPostal}>
            <SobreIcon />
            {guardada ? "Guardada ✓" : guardando ? "Guardando…" : "Guardar y recordarme"}
          </button>
          <small>{guardada ? "¡Tu postal está lista!" : faltan ? `Te ${faltan === 1 ? "falta 1 paso" : `faltan ${faltan} pasos`}.` : "¡Tu postal está lista!"}</small>
        </div>
        {guardada && diaElegido && diaIndex != null && (
          <div className={styles.aviso}>
            <CampanaIcon />
            <span>
              Te recordaremos {diaIndex === 0 ? "hoy" : `el ${LARGO_DIA[diaElegido.getDay()]}`} llamar a {nombre.trim()}. ¡Le va a encantar!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
