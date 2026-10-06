"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/estimulacion-cognitiva-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type Objeto = { e: string; n: string; fruta?: boolean };

const OBJETOS: Objeto[] = [
  { e: "🍎", n: "Manzana", fruta: true },
  { e: "🍌", n: "Plátano", fruta: true },
  { e: "🍇", n: "Uvas", fruta: true },
  { e: "🍊", n: "Naranja", fruta: true },
  { e: "🍐", n: "Pera", fruta: true },
  { e: "🔑", n: "Llave" },
  { e: "👓", n: "Lentes" },
  { e: "☕", n: "Taza" },
  { e: "📚", n: "Libros" },
  { e: "⏰", n: "Reloj" },
  { e: "✂️", n: "Tijeras" },
  { e: "🧶", n: "Lana" },
  { e: "📱", n: "Celular" },
  { e: "🌻", n: "Girasol" },
  { e: "🎩", n: "Sombrero" },
  { e: "🧦", n: "Medias" },
];

function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Opcion = Objeto | number;
type Pregunta = { tipo: 0 | 1 | 2 | 3; num?: boolean; ops: Opcion[]; ok: Opcion };

function generarMesa(n: number): Objeto[] {
  const frutas = mezclar(OBJETOS.filter((o) => o.fruta)).slice(0, 1 + ((Math.random() * 3) | 0));
  const otros = mezclar(OBJETOS.filter((o) => !o.fruta)).slice(0, n - frutas.length);
  return mezclar([...frutas, ...otros]);
}
function generarPreguntas(mesa: Objeto[]): Pregunta[] {
  const fuera = mezclar(OBJETOS.filter((o) => !mesa.includes(o)));
  const dentro = mezclar(mesa);
  const nFrutas = mesa.filter((o) => o.fruta).length;
  const numsSet = [...new Set([nFrutas, nFrutas + 1, Math.max(0, nFrutas - 1), nFrutas + 2])];
  const nums = mezclar(numsSet).slice(0, 4);
  while (nums.length < 4) nums.push(nums.length + 3);
  const esquina = mesa[0];
  return [
    { tipo: 0, ops: mezclar([dentro[0], ...fuera.slice(0, 3)]), ok: dentro[0] },
    { tipo: 1, ops: mezclar([fuera[3], ...dentro.slice(1, 4)]), ok: fuera[3] },
    { tipo: 2, num: true, ops: nums.sort((a, b) => (a as number) - (b as number)), ok: nFrutas },
    { tipo: 3, ops: mezclar([esquina, ...mezclar(mesa.slice(1)).slice(0, 3)]), ok: esquina },
  ];
}
function textoPregunta(tipo: Pregunta["tipo"]) {
  switch (tipo) {
    case 0:
      return (
        <>
          ¿Cuál de estos objetos <em>estaba</em> en la mesa?
        </>
      );
    case 1:
      return (
        <>
          ¿Cuál de estos <em>NO</em> estaba en la mesa?
        </>
      );
    case 2:
      return (
        <>
          ¿Cuántas <em>frutas</em> había?
        </>
      );
    case 3:
      return (
        <>
          ¿Qué había en la <em>esquina de arriba a la izquierda</em>?
        </>
      );
  }
}
function esObjeto(o: Opcion): o is Objeto {
  return typeof o === "object";
}
function mismaOpcion(a: Opcion, b: Opcion) {
  return esObjeto(a) && esObjeto(b) ? a.n === b.n : a === b;
}

type Fase = "intro" | "memorizando" | "pregunta" | "resultado";

export function RetoMemoriaActividad() {
  const [nivel, setNivel] = useState<6 | 8>(6);
  const [fase, setFase] = useState<Fase>("intro");
  const [mesa, setMesa] = useState<Objeto[]>(() => generarMesa(6));
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [respuestas, setRespuestas] = useState<(number | null)[]>([]);
  const [i, setI] = useState(0);
  const [segRestantes, setSegRestantes] = useState(10);
  const segs = nivel === 8 ? 15 : 10;

  useEffect(() => {
    if (fase !== "memorizando") return;
    const id = setTimeout(() => {
      if (segRestantes <= 1) setFase("pregunta");
      else setSegRestantes((s) => s - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [fase, segRestantes]);

  function elegirNivel(n: 6 | 8) {
    setNivel(n);
    setMesa(generarMesa(n));
  }

  function memorizar(nivelUsar?: 6 | 8) {
    const nv = nivelUsar ?? nivel;
    const nuevaMesaObj = generarMesa(nv);
    setMesa(nuevaMesaObj);
    setPreguntas(generarPreguntas(nuevaMesaObj));
    setRespuestas([null, null, null, null]);
    setI(0);
    setSegRestantes(nv === 8 ? 15 : 10);
    setFase("memorizando");
  }

  function tapar() {
    setFase("pregunta");
  }

  function responder(k: number) {
    const next = respuestas.map((r, idx) => (idx === i ? k : r));
    setRespuestas(next);
  }
  function siguientePregunta() {
    if (i === preguntas.length - 1) {
      const bien = respuestas.filter((r, k) => r !== null && mismaOpcion(preguntas[k].ops[r], preguntas[k].ok)).length;
      saveActivityProgress("estimulacion-cognitiva", "reto-memoria", { nivel, aciertos: bien, total: preguntas.length });
      setFase("resultado");
    } else {
      setI(i + 1);
    }
  }
  function otraRonda() {
    memorizar();
  }
  function probarReto() {
    setNivel(8);
    memorizar(8);
  }

  const C = 2 * Math.PI * 30;

  return (
    <div className={`${styles.act} ${styles.reto}`}>
      <div className={styles.mesaWrap}>
        {fase === "memorizando" && (
          <div className={styles.reloj}>
            <svg viewBox="0 0 72 72">
              <circle className={styles.relojF} cx={36} cy={36} r={30} />
              <circle className={styles.relojV} cx={36} cy={36} r={30} strokeDasharray={C} strokeDashoffset={C * (1 - segRestantes / segs)} />
            </svg>
            <b>{segRestantes}</b>
          </div>
        )}
        <div className={styles.mesa}>
          <div className={`${styles.tablero} ${nivel === 8 ? styles.n8 : ""}`}>
            {mesa.map((o, k) => (
              <div key={k} className={styles.obj} style={{ animationDelay: `${k * 0.06}s` }}>
                <em>{o.e}</em>
                <span>{o.n}</span>
              </div>
            ))}
          </div>
          <div className={`${styles.mantel} ${fase !== "memorizando" ? styles.cubre : ""}`}>
            <div>
              {fase === "intro" ? (
                <>
                  <b>Una mesa llena de cosas</b>
                  <small>Destápala y memorízala</small>
                </>
              ) : (
                <>
                  <b>¿Qué había en la mesa?</b>
                  <small>Responde de memoria</small>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.panelQ}>
        <div className={styles.actTag}>
          <span className={styles.actNum}>01</span>
          <span className={styles.actTipo}>
            <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01" />
            </svg>
            Quiz
          </span>
        </div>
        <h3>Reto de memoria rápida</h3>

        {fase === "intro" && (
          <div>
            <p className={styles.actDesc}>Pequeñas preguntas sobre memoria y atención. Así funciona:</p>
            <ol className={styles.introList}>
              <li>
                <b>1</b>Destapas la mesa y miras los objetos con calma.
              </li>
              <li>
                <b>2</b>Un mantel la cubre cuando se acaba el tiempo.
              </li>
              <li>
                <b>3</b>Respondes 4 preguntas de memoria. ¡Sin apuro!
              </li>
            </ol>
            <div className={styles.nivel} role="group" aria-label="Nivel">
              <button type="button" className={nivel === 6 ? styles.nivelOn : ""} aria-pressed={nivel === 6} onClick={() => elegirNivel(6)}>
                Tranquilo · 6 objetos
              </button>
              <button type="button" className={nivel === 8 ? styles.nivelOn : ""} aria-pressed={nivel === 8} onClick={() => elegirNivel(8)}>
                Reto · 8 objetos
              </button>
            </div>
            <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={() => memorizar()}>
              Destapar la mesa
            </button>
          </div>
        )}

        {fase === "memorizando" && (
          <div>
            <div className={styles.fase}>
              Mira con atención <i />
            </div>
            <p className={styles.pq}>
              Fíjate en <em>qué objetos</em> hay y <em>dónde</em> están.
            </p>
            <p className={styles.actDesc}>Tip: nómbralos en voz alta o inventa una pequeña historia con ellos.</p>
            <div className={styles.pqPie}>
              <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} onClick={tapar}>
                Ya lo memoricé
              </button>
            </div>
          </div>
        )}

        {fase === "pregunta" && preguntas[i] && (
          <div>
            <div className={styles.fase}>
              Pregunta {i + 1} de {preguntas.length} <i />
            </div>
            <p className={styles.pq}>{textoPregunta(preguntas[i].tipo)}</p>
            <div className={styles.tiles} role="group" aria-label="Opciones">
              {preguntas[i].ops.map((o, k) => {
                const r = respuestas[i];
                const respondida = r !== null;
                let clase = "";
                if (respondida) clase = mismaOpcion(o, preguntas[i].ok) ? styles.bien : k === r ? styles.mal : styles.apagada;
                return (
                  <button key={k} type="button" className={`${styles.tile} ${preguntas[i].num ? styles.num : ""} ${clase}`} disabled={respondida} onClick={() => responder(k)}>
                    {esObjeto(o) ? (
                      <>
                        <em>{o.e}</em>
                        {o.n}
                      </>
                    ) : (
                      o
                    )}
                  </button>
                );
              })}
            </div>
            {respuestas[i] !== null && (
              <div className={`${styles.fb} ${mismaOpcion(preguntas[i].ops[respuestas[i]!], preguntas[i].ok) ? styles.bien : styles.mal}`}>
                {mismaOpcion(preguntas[i].ops[respuestas[i]!], preguntas[i].ok)
                  ? "✓ ¡Excelente memoria!"
                  : `✕ Era: ${esObjeto(preguntas[i].ok) ? `${preguntas[i].ok.e} ${preguntas[i].ok.n}` : preguntas[i].ok}`}
              </div>
            )}
            <div className={styles.pqPie}>
              {respuestas[i] !== null && (
                <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnS}`} onClick={siguientePregunta}>
                  {i === preguntas.length - 1 ? "Ver resultado" : "Siguiente"} →
                </button>
              )}
              <div className={styles.puntos}>
                {respuestas.map((x, k) => (
                  <i key={k} className={x === null ? "" : mismaOpcion(preguntas[k].ops[x], preguntas[k].ok) ? styles.puntoB : styles.puntoM} />
                ))}
              </div>
            </div>
          </div>
        )}

        {fase === "resultado" &&
          (() => {
            const bien = respuestas.filter((x, k) => x !== null && mismaOpcion(preguntas[k].ops[x], preguntas[k].ok)).length;
            const T = preguntas.length;
            const [titulo, mensaje] =
              bien === T
                ? ["¡Memoria de elefante!", "Acertaste todo. ¿Te animas con el nivel Reto?"]
                : bien >= 2
                  ? ["¡Muy bien!", "Así estaba la mesa. Mírala otra vez y prueba una nueva ronda."]
                  : ["¡Buen entrenamiento!", "La memoria se fortalece con práctica. Cada ronda cuenta."];
            return (
              <div className={styles.res}>
                <div className={styles.fase}>
                  Así estaba la mesa <i />
                </div>
                <div className={styles.cerebro} aria-hidden="true">
                  {Array.from({ length: T }, (_, k) => (
                    <i key={k} style={{ height: k < bien ? 30 + k * 12 : 12, background: k < bien ? "var(--lila)" : undefined }} />
                  ))}
                </div>
                <span className={styles.eyebrow}>
                  {bien} de {T} correctas
                </span>
                <h4>{titulo}</h4>
                <p>{mensaje}</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnS}`} onClick={otraRonda}>
                    Otra ronda
                  </button>
                  {nivel === 6 && (
                    <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} onClick={probarReto}>
                      Probar nivel Reto
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
