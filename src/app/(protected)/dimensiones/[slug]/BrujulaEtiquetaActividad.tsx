"use client";

import { useState } from "react";
import styles from "@/styles/interculturalidad-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type Region = { id: string; t: string; e: string; ang: number };
type Interes = { id: string; t: string; e: string };

const REGIONES: Region[] = [
  { id: "andes", t: "Los Andes", e: "🏔️", ang: 200 },
  { id: "latam", t: "Latinoamérica", e: "🌎", ang: 235 },
  { id: "norte", t: "Norteamérica", e: "🗽", ang: 300 },
  { id: "europa", t: "Europa", e: "🏰", ang: 20 },
  { id: "africa", t: "África", e: "🌍", ang: 95 },
  { id: "medio", t: "Medio Oriente", e: "🕌", ang: 60 },
  { id: "asia", t: "Asia", e: "🏯", ang: 40 },
  { id: "oceania", t: "Oceanía", e: "🏝️", ang: 130 },
];
const INTERESES: Interes[] = [
  { id: "comida", t: "Su comida", e: "🍲" },
  { id: "musica", t: "Su música y bailes", e: "🎶" },
  { id: "fiesta", t: "Sus fiestas", e: "🎉" },
  { id: "ropa", t: "Su vestimenta", e: "🧣" },
  { id: "idioma", t: "Su idioma", e: "🗣️" },
  { id: "costumbre", t: "Sus costumbres", e: "🫖" },
];
const EMPUJES = ["Siempre me ha dado curiosidad…", "Me recuerda a…", "Conocí a alguien de allí que…", "Me gustaría compartirlo con…"];
const IDEAS: Record<string, string[]> = {
  comida: ["Busca una receta típica y cocínala este fin de semana.", "Visita un restaurante o mercado de esa cultura en tu ciudad.", "Pregúntale a alguien de allí cuál es su plato de infancia."],
  musica: ["Escucha una lista de música tradicional de ese lugar.", "Mira un video de sus bailes típicos y anímate a probar un paso.", "Aprende el nombre de un instrumento típico."],
  fiesta: ["Averigua cuándo es su fiesta más importante y por qué se celebra.", "Mira fotos o videos de esa celebración.", "Cuéntale a tu familia lo que aprendiste."],
  ropa: ["Busca qué significan los colores o bordados de su ropa típica.", "Visita un museo o feria de artesanías.", "Pregunta a un artesano cómo se hace."],
  idioma: ["Aprende a decir “hola”, “gracias” y “adiós”.", "Escucha una canción en ese idioma y busca su letra traducida.", "Únete a un círculo de idiomas en PRISMA."],
  costumbre: ["Lee una historia o leyenda tradicional de esa cultura.", "Mira un documental corto sobre su vida diaria.", "Conversa con alguien de allí y pregúntale qué extraña de su tierra."],
};

const CX = 150;

function BrujulaSVG({ region, giro }: { region: string | null; giro: number }) {
  const marcas = [];
  for (let a = 0; a < 360; a += 10) {
    const r1 = a % 90 === 0 ? 112 : a % 30 === 0 ? 118 : 122;
    const rad = ((a - 90) * Math.PI) / 180;
    marcas.push(
      <line
        key={a}
        x1={CX + r1 * Math.cos(rad)}
        y1={CX + r1 * Math.sin(rad)}
        x2={CX + 128 * Math.cos(rad)}
        y2={CX + 128 * Math.sin(rad)}
        stroke={`rgba(245,241,230,${a % 90 === 0 ? 0.6 : 0.22})`}
        strokeWidth={a % 90 === 0 ? 2.5 : 1.2}
      />
    );
  }
  return (
    <svg viewBox="0 0 300 300" aria-hidden="true">
      <defs>
        <radialGradient id="inter-gB" cx=".4" cy=".35">
          <stop offset="0" stopColor="#34352b" />
          <stop offset="1" stopColor="#1a1a14" />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CX} r={134} fill="url(#inter-gB)" stroke="#5a2438" strokeWidth={6} />
      <circle cx={CX} cy={CX} r={100} fill="none" stroke="rgba(227,155,182,.25)" strokeDasharray="2 6" />
      {marcas}
      <g fontFamily="var(--serif)" fontWeight={700} fontSize={18} fill="#f5f1e6" textAnchor="middle">
        <text x={CX} y={CX - 80}>N</text>
        <text x={CX + 84} y={CX + 6}>E</text>
        <text x={CX} y={CX + 92}>S</text>
        <text x={CX - 84} y={CX + 6}>O</text>
      </g>
      <path d={`M${CX} ${CX - 60} L${CX + 14} ${CX} L${CX} ${CX + 60} L${CX - 14} ${CX}Z`} fill="rgba(245,241,230,.06)" />
      <g className={styles.aguja} style={{ transform: `rotate(${giro}deg)` }}>
        <path d={`M${CX} ${CX - 96} L${CX + 11} ${CX} L${CX - 11} ${CX}Z`} fill="#e39bb6" />
        <path d={`M${CX} ${CX + 96} L${CX + 11} ${CX} L${CX - 11} ${CX}Z`} fill="#8a8878" />
      </g>
      <circle cx={CX} cy={CX} r={9} fill="#f4ecd8" stroke="#5a2438" strokeWidth={3} />
      {REGIONES.map((R) => {
        const rad = ((R.ang - 90) * Math.PI) / 180;
        const on = R.id === region;
        const anchor = Math.cos(rad) > 0.3 ? "start" : Math.cos(rad) < -0.3 ? "end" : "middle";
        return (
          <g key={R.id}>
            <circle className={styles.punto} cx={CX + 140 * Math.cos(rad)} cy={CX + 140 * Math.sin(rad)} r={on ? 7 : 4} fill={on ? "#e39bb6" : "#5a5b4f"} />
            <text className={`${styles.etq} ${on ? styles.etqOn : ""}`} x={CX + 162 * Math.cos(rad)} y={CX + 162 * Math.sin(rad) + 4} textAnchor={anchor}>
              {R.t}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

type Estado = { region: string | null; lugar: string; interes: string | null; porque: string };

export function BrujulaEtiquetaActividad({ initialEstado }: { initialEstado: Estado }) {
  const [e, setE] = useState<Estado>(initialEstado);
  const regionInicial = REGIONES.find((x) => x.id === initialEstado.region);
  const [giro, setGiro] = useState(regionInicial ? regionInicial.ang + 360 : -20);
  const [pop, setPop] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(
    !!(initialEstado.region && initialEstado.lugar && initialEstado.interes && initialEstado.porque.trim().length > 3)
  );

  function disparaPop(campo: string) {
    setPop(campo);
    setTimeout(() => setPop((p) => (p === campo ? null : p)), 400);
  }

  function elegirRegion(id: string) {
    const r = REGIONES.find((x) => x.id === id)!;
    const d = (((r.ang - giro) % 360) + 540) % 360 - 180;
    setGiro(giro + d + 360);
    setE({ ...e, region: id });
    disparaPop("etDest");
  }
  function elegirInteres(id: string) {
    setE({ ...e, interes: id });
    disparaPop("etQue");
  }
  function usarEmpuje(texto: string) {
    const next = e.porque.trim() ? `${e.porque.trim()} ${texto} ` : `${texto} `;
    setE({ ...e, porque: next });
    disparaPop("etPor");
  }

  const region = REGIONES.find((x) => x.id === e.region) ?? null;
  const interes = INTERESES.find((x) => x.id === e.interes) ?? null;
  const dest = e.lugar || region?.t || "";
  const paso1 = !!e.region;
  const paso2 = !!e.lugar;
  const paso3 = !!e.interes;
  const paso4 = e.porque.trim().length > 3;
  const faltan = [paso1, paso2, paso3, paso4].filter((x) => !x).length;

  function guardar() {
    saveActivityProgress("interculturalidad", "brujula-tradicion", e);
    setGuardado(true);
  }

  return (
    <div className={`${styles.act} ${styles.trad}`}>
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
        <h3>Una tradición que me gustaría conocer</h3>
        <p className={styles.actDesc}>Explora tu curiosidad por otra cultura. Elige hacia dónde apunta tu brújula y arma la etiqueta de tu próximo “viaje”.</p>

        <div className={styles.form}>
          <div className={`${styles.bloque} ${paso1 ? styles.ok : ""}`}>
            <span>
              <i>{paso1 ? "✓" : 1}</i>¿Hacia qué parte del mundo te lleva la curiosidad?
            </span>
            <div className={styles.chips} role="group" aria-label="Región">
              {REGIONES.map((R) => (
                <button key={R.id} type="button" className={e.region === R.id ? styles.chipOn : styles.chip} aria-pressed={e.region === R.id} onClick={() => elegirRegion(R.id)}>
                  <em>{R.e}</em>
                  {R.t}
                </button>
              ))}
            </div>
          </div>
          <div className={`${styles.bloque} ${paso2 ? styles.ok : ""}`}>
            <span>
              <i>{paso2 ? "✓" : 2}</i>
              <label htmlFor="ic-lugar">¿Qué país o cultura?</label>
            </span>
            <input
              id="ic-lugar"
              className={styles.campo}
              maxLength={40}
              placeholder="Ej: Japón, los pueblos kichwa, Marruecos…"
              autoComplete="off"
              value={e.lugar}
              onChange={(ev) => setE({ ...e, lugar: ev.target.value })}
            />
          </div>
          <div className={`${styles.bloque} ${paso3 ? styles.ok : ""}`}>
            <span>
              <i>{paso3 ? "✓" : 3}</i>¿Qué te gustaría conocer de allí?
            </span>
            <div className={styles.chips} role="group" aria-label="Interés">
              {INTERESES.map((I) => (
                <button key={I.id} type="button" className={e.interes === I.id ? styles.chipOn : styles.chip} aria-pressed={e.interes === I.id} onClick={() => elegirInteres(I.id)}>
                  <em>{I.e}</em>
                  {I.t}
                </button>
              ))}
            </div>
          </div>
          <div className={`${styles.bloque} ${paso4 ? styles.ok : ""}`}>
            <span>
              <i>{paso4 ? "✓" : 4}</i>
              <label htmlFor="ic-porque">¿Por qué te llama la atención?</label>
            </span>
            <textarea
              id="ic-porque"
              className={`${styles.campo} ${styles.campoTextarea}`}
              maxLength={240}
              placeholder="Escribe lo que sientas…"
              value={e.porque}
              onChange={(ev) => setE({ ...e, porque: ev.target.value })}
            />
            <div className={styles.empuje}>
              {EMPUJES.map((emp) => (
                <button key={emp} type="button" onClick={() => usarEmpuje(emp)}>
                  {emp}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.guardarFila}>
            <button type="button" className={`${styles.btn} ${styles.btnP}`} disabled={faltan > 0 || guardado} onClick={guardar}>
              {guardado ? "Guardada ✓" : "Guardar mi tradición"}
            </button>
            <small>{guardado ? "¡Tu etiqueta está lista!" : faltan ? `Te ${faltan === 1 ? "falta 1 paso" : `faltan ${faltan} pasos`}.` : "¡Tu etiqueta está lista!"}</small>
          </div>
        </div>

        {guardado && interes && (
          <div className={styles.sinViajar}>
            <span className={styles.eyebrow} style={{ color: "var(--rosa)" }}>
              Para acercarte sin viajar
            </span>
            <h4>
              3 ideas para conocer {interes.t.toLowerCase()} de {e.lugar || dest}
            </h4>
            <ol>
              {IDEAS[interes.id].map((idea, k) => (
                <li key={k}>{idea}</li>
              ))}
            </ol>
          </div>
        )}
      </div>

      <div className={styles.viaje}>
        <div className={styles.brujula}>
          <BrujulaSVG region={e.region} giro={giro} />
        </div>
        <article className={styles.etiqueta} aria-label="Tu etiqueta de viaje">
          <span className={styles.etFranja} />
          <div className={`${styles.etFila} ${pop === "etDest" ? styles.pop : ""}`}>
            <small>Destino</small>
            <b className={!dest ? styles.vacio : ""}>{dest || "¿A dónde?"}</b>
          </div>
          <div className={`${styles.etFila} ${pop === "etQue" ? styles.pop : ""}`}>
            <small>Quiero conocer</small>
            <b className={!interes ? styles.vacio : ""}>{interes ? `${interes.e} ${interes.t}` : "—"}</b>
          </div>
          <div className={`${styles.etPor} ${!e.porque.trim() ? styles.vacio : ""} ${pop === "etPor" ? styles.pop : ""}`}>
            {e.porque.trim() ? `"${e.porque.trim()}"` : "“Aquí irá el porqué de tu curiosidad…”"}
          </div>
          <span className={`${styles.abordo} ${guardado ? styles.abordoOn : ""}`}>A BORDO ✓</span>
        </article>
      </div>
    </div>
  );
}
