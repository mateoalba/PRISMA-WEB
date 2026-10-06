"use client";

import { useEffect, useState, useTransition } from "react";
import styles from "@/styles/participacion-activa-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";
import { addMentorTopic, removeMentorTopic } from "@/lib/participation/mentorship-actions";

type Modo = "Presencial" | "Virtual";
type EstadoPuente = {
  tema: string | null;
  ideas: [string, string, string];
  dia: number | null;
  modo: Modo | null;
  como: number | null;
  despues: boolean;
};

const PASOS = [
  { t: "Piensa en un tema donde tengas experiencia real" },
  { t: "Anímate a inscribirte como mentor en esta dimensión" },
  { t: "Prepara 2 o 3 ideas de lo que te gustaría compartir" },
  { t: "Agenda un primer encuentro breve" },
  { t: "Después de la sesión, anota cómo te fue" },
];
const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS_LARGO = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const TEMAS_RESPALDO = ["Cocina", "Oficios", "Historias de vida", "Cuentas del hogar"];
const X0 = 250;
const ANCHO = 100;

function Figura({ x, color, texto, lado, completo }: { x: number; color: string; texto: string; lado: -1 | 1; completo: boolean }) {
  return (
    <g className={styles.caminante} style={{ transform: `translateX(${x}px)` }}>
      <circle cx={0} cy={96} r={13} fill={color} />
      <path d="M-11 112 h22 l4 30 h-30z" fill={color} />
      <path d="M-6 142 v8 M6 142 v8" stroke={color} strokeWidth={5} strokeLinecap="round" />
      <text x={completo ? lado * 16 : 0} y={74} textAnchor={completo ? (lado < 0 ? "end" : "start") : "middle"}>
        {texto}
      </text>
    </g>
  );
}

export function PuenteMentorActividad({
  saberes,
  initialMentorTopics,
  initialEstado,
}: {
  saberes: string[];
  initialMentorTopics: string[];
  initialEstado: EstadoPuente;
}) {
  const [M, setM] = useState<EstadoPuente>(initialEstado);
  const [topicsLocal, setTopicsLocal] = useState<string[]>(initialMentorTopics);
  const [angosto, setAngosto] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- lee el ancho de ventana en cliente para acercar la vista del puente en celulares */
    setAngosto(window.innerWidth < 600);
    function actualizar() {
      setAngosto(window.innerWidth < 600);
    }
    window.addEventListener("resize", actualizar);
    return () => window.removeEventListener("resize", actualizar);
  }, []);

  const inscrito = M.tema !== null && topicsLocal.includes(M.tema);
  const listoVals = [!!M.tema, inscrito, M.ideas.filter((i) => i.trim().length > 2).length >= 2, M.dia !== null && !!M.modo, M.como !== null || M.despues];
  const n = listoVals.filter(Boolean).length;
  const completo = n === 5;
  let seguidas = 0;
  while (seguidas < 5 && listoVals[seguidas]) seguidas++;
  const xYo = completo ? 470 : 200 + seguidas * ANCHO;
  const xEl = completo ? 530 : 800;

  function guardar(next: EstadoPuente) {
    setM(next);
    saveActivityProgress("participacion-activa", "puente-mentor", next);
  }
  function elegirTema(t: string) {
    guardar({ ...M, tema: t });
  }
  function alternarInscrito() {
    if (!M.tema) return;
    const tema = M.tema;
    if (inscrito) {
      setTopicsLocal((prev) => prev.filter((t) => t !== tema));
      startTransition(() => {
        removeMentorTopic(tema);
      });
    } else {
      setTopicsLocal((prev) => [...prev, tema]);
      startTransition(() => {
        addMentorTopic(tema);
      });
    }
  }
  function cambiarIdea(idx: number, v: string) {
    const ideas = [...M.ideas] as [string, string, string];
    ideas[idx] = v;
    guardar({ ...M, ideas });
  }
  function elegirDia(d: number) {
    guardar({ ...M, dia: d });
  }
  function elegirModo(modo: Modo) {
    guardar({ ...M, modo });
  }
  function elegirComo(c: number) {
    guardar({ ...M, como: c, despues: false });
  }
  function alternarDespues() {
    const activando = !M.despues;
    guardar({ ...M, despues: activando, como: activando ? null : M.como });
  }
  function otraVez() {
    guardar({ tema: null, ideas: ["", "", ""], dia: null, modo: null, como: null, despues: false });
  }

  const temas = saberes.length ? saberes : TEMAS_RESPALDO;

  function cuerpoPaso(k: number) {
    if (k === 0)
      return (
        <>
          <div className={styles.chips}>
            {temas.map((t) => (
              <button key={t} type="button" className={styles.chip} aria-pressed={M.tema === t} onClick={() => elegirTema(t)}>
                {t}
              </button>
            ))}
          </div>
          {!saberes.length && <p style={{ fontSize: ".78rem", color: "var(--ink-muted)", margin: "8px 0 0" }}>Tip: los saberes que pongas en tu árbol aparecerán aquí.</p>}
        </>
      );
    if (k === 1)
      return inscrito ? (
        <>
          <div className={styles.insignia}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#221c10" strokeWidth={2}>
              <circle cx="12" cy="9" r="6" />
              <path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7" />
            </svg>
            Mentor en formación
          </div>
          <button type="button" className={styles.linkTxt} onClick={alternarInscrito}>
            Deshacer
          </button>
        </>
      ) : (
        <button type="button" className={styles.btnIns} disabled={!M.tema} onClick={alternarInscrito}>
          Sí, quiero ser mentor
        </button>
      );
    if (k === 2)
      return (
        <>
          {M.ideas.map((v, i) => (
            <input
              key={i}
              className={styles.campo}
              maxLength={40}
              placeholder={`Idea ${i + 1}${i === 2 ? " (opcional)" : ""}`}
              value={v}
              aria-label={`Idea ${i + 1}`}
              onChange={(e) => cambiarIdea(i, e.target.value)}
            />
          ))}
        </>
      );
    if (k === 3)
      return (
        <>
          <div className={styles.chips} style={{ marginBottom: 8 }}>
            {DIAS.map((d, i) => (
              <button key={d} type="button" className={styles.chip} aria-pressed={M.dia === i} onClick={() => elegirDia(i)}>
                {d}
              </button>
            ))}
          </div>
          <div className={styles.chips}>
            {(["Presencial", "Virtual"] as Modo[]).map((m) => (
              <button key={m} type="button" className={styles.chip} aria-pressed={M.modo === m} onClick={() => elegirModo(m)}>
                {m}
              </button>
            ))}
          </div>
        </>
      );
    return (
      <>
        <div className={styles.caritas} role="group" aria-label="¿Cómo te fue?">
          {["😊", "🙂", "😅"].map((c, i) => (
            <button key={c} type="button" aria-pressed={M.como === i} aria-label={["Muy bien", "Bien", "Me costó"][i]} onClick={() => elegirComo(i)}>
              {c}
            </button>
          ))}
        </div>
        <button type="button" className={styles.linkTxt} aria-pressed={M.despues} onClick={alternarDespues}>
          {M.despues ? "✓ " : ""}Lo anoto después de la sesión
        </button>
      </>
    );
  }

  return (
    <div className={styles.act}>
      <div className={styles.puenteCab}>
        <div>
          <div className={styles.actTag}>
            <span className={styles.actNum}>02</span>
            <span className={styles.actTipo}>
              <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 16h20M4 16V10M20 16V10M4 10c4 4 12 4 16 0M8 16v-3M12 16v-2M16 16v-3" />
              </svg>
              Paso a paso
            </span>
          </div>
          <h3>Cómo empezar a ser mentor</h3>
          <p className={styles.actDesc}>Primeros pasos para compartir tu experiencia. Cada paso pone una tabla del puente hasta que te encuentras con quien quiere aprender.</p>
        </div>
        <div className={styles.tablasN}>
          {n}/5<small>tablas puestas</small>
        </div>
      </div>

      <div className={`${styles.puente} ${completo ? styles.unido : ""}`} aria-hidden="true">
        <svg viewBox={angosto ? "170 20 660 230" : "0 0 1000 250"}>
          <path d={`M0 150 H${X0} V250 H0Z`} fill="#3a3b31" />
          <path d={`M${X0 + 500} 150 H1000 V250 H${X0 + 500}Z`} fill="#3a3b31" />
          <path d={`M0 150 H${X0}`} stroke="#aebd52" strokeWidth={5} />
          <path d={`M${X0 + 500} 150 H1000`} stroke="#aebd52" strokeWidth={5} />
          <path d={`M${X0} 120 Q500 ${completo ? 150 : 175} ${X0 + 500} 120`} stroke="#6b6d5a" strokeWidth={3} fill="none" />
          <line x1={X0} y1={110} x2={X0} y2={150} stroke="#6b6d5a" strokeWidth={6} />
          <line x1={X0 + 500} y1={110} x2={X0 + 500} y2={150} stroke="#6b6d5a" strokeWidth={6} />
          <path d={`M${X0} 250 Q500 200 ${X0 + 500} 250`} fill="rgba(159,211,201,.08)" />
          {Array.from({ length: 5 }, (_, k) => (
            <g key={k} className={`${styles.tabla} ${listoVals[k] ? "" : styles.fuera}`}>
              <rect x={X0 + k * ANCHO + 3} y={150} width={ANCHO - 6} height={20} rx={4} fill="#8a6a45" stroke="#5a4330" strokeWidth={2} />
              <line x1={X0 + k * ANCHO + 12} y1={160} x2={X0 + k * ANCHO + ANCHO - 12} y2={160} stroke="#6b5036" strokeWidth={2} />
            </g>
          ))}
          <Figura x={xYo} color="#d9c7a0" texto="Tú" lado={-1} completo={completo} />
          <Figura x={xEl} color="#9fd3c9" texto="Quien aprende" lado={1} completo={completo} />
          <g className={styles.saludo}>
            <text x={500} y={40} textAnchor="middle" style={{ fontSize: 30 }}>
              🤝
            </text>
          </g>
        </svg>
      </div>

      <ol className={styles.pasos}>
        {PASOS.map((p, k) => {
          const ok = listoVals[k];
          const previos = Array.from({ length: k }, (_, j) => j).every((j) => listoVals[j]);
          return (
            <li key={p.t} className={`${styles.paso} ${ok ? styles.ok : ""} ${!previos ? styles.bloq : ""}`}>
              <span className={styles.pasoN}>
                Paso {k + 1}
                {ok ? " · ✓" : !previos ? " · 🔒" : ""}
              </span>
              <h4>{p.t}</h4>
              {cuerpoPaso(k)}
            </li>
          );
        })}
      </ol>

      {completo && M.tema && M.dia !== null && M.modo && (
        <div className={styles.fin2}>
          <div>
            <b>🤝 ¡Cruzaste el puente!</b>
            <span>
              Tu primer encuentro de <strong>{M.tema}</strong> es el {DIAS_LARGO[M.dia]} ({M.modo.toLowerCase()}). Tu experiencia puede cambiarle el día a alguien.
            </span>
          </div>
          <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} onClick={otraVez}>
            Preparar otro encuentro
          </button>
        </div>
      )}
    </div>
  );
}
