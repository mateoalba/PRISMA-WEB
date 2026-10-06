"use client";

import { useState, type FormEvent } from "react";
import styles from "@/styles/participacion-activa-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

const SABERES_SUGERIDOS = ["Cocinar", "Tejer", "Arreglar cosas", "Contar historias", "Jardinería", "Llevar cuentas", "Coser", "Consejos de vida"];
type Publico = { id: string; t: string; e: string };
const PUBLICOS: Publico[] = [
  { id: "ninos", t: "Niños", e: "🧒" },
  { id: "jovenes", t: "Jóvenes", e: "🧑" },
  { id: "vecinos", t: "Vecinos", e: "🏘️" },
  { id: "mayores", t: "Otros adultos mayores", e: "🧓" },
  { id: "familia", t: "Mi familia", e: "👨‍👩‍👧" },
];
const GANCHOS: [number, number][] = [
  [120, 150],
  [300, 150],
  [82, 212],
  [338, 212],
  [165, 108],
  [255, 108],
];
const SUELO: [number, number][] = [
  [70, 378],
  [140, 388],
  [280, 388],
  [350, 378],
  [210, 392],
];

function lista(a: string[]) {
  if (a.length <= 1) return a[0] || "";
  return `${a.slice(0, -1).join(", ")} y ${a[a.length - 1]}`;
}

type Hoja = { cx: number; cy: number; color: string; delay: number };

export function ArbolSaberActividad({
  saberes,
  onSaberesChange,
  initialPublicos,
  initialIdea,
  initialGuardado,
}: {
  saberes: string[];
  onSaberesChange: (s: string[]) => void;
  initialPublicos: string[];
  initialIdea: string;
  initialGuardado: boolean;
}) {
  const [publicos, setPublicos] = useState<string[]>(initialPublicos);
  const [idea, setIdea] = useState(initialIdea);
  const [saberIn, setSaberIn] = useState("");
  const [guardado, setGuardado] = useState(initialGuardado);
  const [hojas, setHojas] = useState<Hoja[]>([]);

  function guardarProgreso(sNext: string[], pNext: string[], iNext: string) {
    saveActivityProgress("participacion-activa", "arbol-saber", { saberes: sNext, publicos: pNext, idea: iNext, guardado });
  }

  function agregarSaber(s: string) {
    const v = s.trim();
    if (!v || saberes.length >= 6 || saberes.includes(v)) return;
    const next = [...saberes, v];
    onSaberesChange(next);
    guardarProgreso(next, publicos, idea);
  }
  function quitarSaber(k: number) {
    const next = saberes.filter((_, idx) => idx !== k);
    onSaberesChange(next);
    guardarProgreso(next, publicos, idea);
  }
  function alternarPublico(id: string) {
    const next = publicos.includes(id) ? publicos.filter((x) => x !== id) : [...publicos, id].slice(0, 5);
    setPublicos(next);
    guardarProgreso(saberes, next, idea);
  }
  function cambiarIdea(v: string) {
    setIdea(v);
    guardarProgreso(saberes, publicos, v);
  }
  function enviarFormulario(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    agregarSaber(saberIn);
    setSaberIn("");
  }
  function guardar() {
    saveActivityProgress("participacion-activa", "arbol-saber", { saberes, publicos, idea, guardado: true });
    setGuardado(true);
    setHojas(
      Array.from({ length: 12 }, (_, k) => ({
        cx: 80 + Math.random() * 260,
        cy: 60 + Math.random() * 120,
        color: ["#aebd52", "#8fd18a", "#d9c7a0"][k % 3],
        delay: Math.random() * 1.2,
      }))
    );
  }

  const okSaberes = saberes.length > 0;
  const okPublicos = publicos.length > 0;
  const okIdea = idea.trim().length > 5;
  const puedeGuardar = okSaberes && okPublicos;
  const n = saberes.length;
  const copaEsc = 0.75 + Math.min(n, 6) * 0.05;
  const copaOpacidad = 0.55 + Math.min(n, 6) * 0.075;
  const quienes = publicos.map((id) => PUBLICOS.find((p) => p.id === id)!.t.toLowerCase());

  return (
    <div className={`${styles.act} ${styles.arbolAct}`}>
      <div className={styles.arbolWrap}>
        <div className={styles.arbol} aria-hidden="true">
          <svg viewBox="0 0 420 400">
            <defs>
              <radialGradient id="part-gCopa" cx=".45" cy=".4">
                <stop offset="0" stopColor="#8fa84a" />
                <stop offset="1" stopColor="#3f4a22" />
              </radialGradient>
              <radialGradient id="part-gSombra">
                <stop offset="0" stopColor="rgba(0,0,0,.45)" />
                <stop offset="1" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>
            <ellipse cx={210} cy={380} rx={150 + n * 8} ry={22} fill="url(#part-gSombra)" />
            <g className={styles.copa} style={{ transform: `scale(${copaEsc})`, opacity: copaOpacidad }}>
              <circle cx={210} cy={120} r={92} fill="url(#part-gCopa)" />
              <circle cx={120} cy={165} r={72} fill="url(#part-gCopa)" />
              <circle cx={300} cy={165} r={72} fill="url(#part-gCopa)" />
              <circle cx={160} cy={80} r={56} fill="url(#part-gCopa)" />
              <circle cx={265} cy={80} r={56} fill="url(#part-gCopa)" />
            </g>
            <path d="M196 380 C200 320 196 270 200 220 L220 220 C224 270 220 320 226 380 Z" fill="#5a4330" />
            <g stroke="#5a4330" strokeWidth={10} fill="none" strokeLinecap="round">
              <path d="M205 240 C170 210 140 185 120 150" />
              <path d="M215 240 C250 210 280 185 300 150" />
              <path d="M200 270 C150 250 110 235 82 212" />
              <path d="M220 270 C270 250 310 235 338 212" />
              <path d="M207 215 C190 170 175 140 165 108" />
              <path d="M213 215 C230 170 245 140 255 108" />
            </g>
            <path d="M190 380 q-20 8 -40 6 M230 380 q20 8 40 6" stroke="#5a4330" strokeWidth={6} fill="none" strokeLinecap="round" />
            {saberes.map((s, k) => {
              const [x, y] = GANCHOS[k];
              const w = Math.max(70, s.length * 8.4 + 26);
              return (
                <g key={s} className={styles.letrero} style={{ animationDelay: `${k * 0.05}s` }}>
                  <g className={styles.balanceo} style={{ animationDelay: `${k * 0.7}s` }}>
                    <line x1={x} y1={y} x2={x} y2={y + 18} stroke="#d9c7a0" strokeWidth={2} />
                    <rect x={x - w / 2} y={y + 18} width={w} height={30} rx={8} fill="#d9c7a0" />
                    <text x={x} y={y + 38} textAnchor="middle">
                      {s}
                    </text>
                  </g>
                </g>
              );
            })}
            {publicos.map((id, k) => {
              const p = PUBLICOS.find((pp) => pp.id === id)!;
              const [x, y] = SUELO[k];
              return (
                <g key={id} className={styles.personaS} style={{ animationDelay: `${k * 0.08}s` }}>
                  <text x={x} y={y - 18} textAnchor="middle" style={{ fontSize: 26 }}>
                    {p.e}
                  </text>
                  <text x={x} y={y} textAnchor="middle">
                    {p.t.split(" ")[0]}
                  </text>
                </g>
              );
            })}
            <g>
              {hojas.map((h, k) => (
                <ellipse key={k} className={styles.hojaCae} cx={h.cx} cy={h.cy} rx={7} ry={4} fill={h.color} style={{ animationDelay: `${h.delay}s` }} />
              ))}
            </g>
          </svg>
        </div>
        <p className={styles.arbolCap}>
          {!n ? (
            "Tu árbol está listo para crecer."
          ) : (
            <>
              Tu árbol tiene{" "}
              <b>
                {n} {n === 1 ? "saber" : "saberes"}
              </b>
              {publicos.length > 0 && (
                <>
                  {" "}
                  y da sombra a <b>{publicos.length}</b> {publicos.length === 1 ? "grupo" : "grupos"}
                </>
              )}
              .
            </>
          )}
        </p>
      </div>

      <div>
        <div className={styles.actTag}>
          <span className={styles.actNum}>01</span>
          <span className={styles.actTipo}>
            <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 20h4L19 9l-4-4L4 16z" />
              <path d="M13.5 6.5l4 4" />
            </svg>
            Reflexión
          </span>
        </div>
        <h3>Mi aporte a la comunidad</h3>
        <p className={styles.actDesc}>Piensa en lo que sabes y a quién se lo podrías enseñar. Cada saber cuelga de una rama de tu árbol, y quienes pueden aprender llegan a su sombra.</p>

        <div className={styles.form1}>
          <div className={`${styles.bloque} ${okSaberes ? styles.ok : ""}`}>
            <label htmlFor="part-saber-in">
              <i className={styles.n}>{okSaberes ? "✓" : 1}</i>¿Qué sabes hacer bien, por experiencia de vida o de trabajo?
            </label>
            <form className={styles.agregar} onSubmit={enviarFormulario}>
              <input
                className={styles.campo}
                id="part-saber-in"
                maxLength={22}
                placeholder="Ej: hacer pan, llevar cuentas…"
                autoComplete="off"
                value={saberIn}
                onChange={(e) => setSaberIn(e.target.value)}
              />
              <button type="submit" aria-label="Agregar saber">
                +
              </button>
            </form>
            <div className={styles.chips} aria-label="Ideas">
              {SABERES_SUGERIDOS.filter((s) => !saberes.includes(s)).map((s) => (
                <button key={s} type="button" className={styles.chip} disabled={saberes.length >= 6} onClick={() => agregarSaber(s)}>
                  + {s}
                </button>
              ))}
            </div>
            <div className={styles.mios}>
              {saberes.map((s, k) => (
                <span key={s} className={styles.mio}>
                  {s}
                  <button type="button" aria-label={`Quitar ${s}`} onClick={() => quitarSaber(k)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className={`${styles.bloque} ${okPublicos ? styles.ok : ""}`}>
            <span id="part-l2">
              <i className={styles.n}>{okPublicos ? "✓" : 2}</i>¿A quién le podrías enseñar eso?
            </span>
            <div className={styles.chips} role="group" aria-labelledby="part-l2">
              {PUBLICOS.map((p) => (
                <button key={p.id} type="button" className={styles.chip} aria-pressed={publicos.includes(p.id)} onClick={() => alternarPublico(p.id)}>
                  <span>{p.e}</span>
                  {p.t}
                </button>
              ))}
            </div>
          </div>
          <div className={`${styles.bloque} ${okIdea ? styles.ok : ""}`}>
            <label htmlFor="part-idea">
              <i className={styles.n}>{okIdea ? "✓" : 3}</i>Escribe la idea con tus palabras
            </label>
            <textarea
              className={styles.campo}
              id="part-idea"
              maxLength={240}
              placeholder="Ej: Me gustaría enseñar a los jóvenes del barrio a hacer pan, como me enseñó mi mamá."
              value={idea}
              onChange={(e) => cambiarIdea(e.target.value)}
            />
          </div>
          <div className={styles.pie1}>
            <button type="button" className={`${styles.btn} ${styles.btnP}`} disabled={!puedeGuardar || guardado} onClick={guardar}>
              {guardado ? "Guardado ✓" : "Guardar mi aporte"}
            </button>
            <small>{puedeGuardar ? (okIdea ? "¡Listo para guardar!" : "Si quieres, escribe tu idea (opcional).") : "Agrega al menos un saber y a quién."}</small>
          </div>
        </div>
        {guardado && (
          <div className={styles.compromiso}>
            <span className={styles.eyebrow} style={{ color: "var(--arena)" }}>
              Mi aporte
            </span>
            <p>
              Sé <b>{lista(saberes.map((s) => s.toLowerCase()))}</b> y podría enseñárselo a <b>{lista(quienes)}</b>.{idea ? ` ${idea}` : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
