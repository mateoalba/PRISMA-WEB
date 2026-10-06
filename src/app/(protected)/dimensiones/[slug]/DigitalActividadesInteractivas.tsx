"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/digital-actividades.module.css";
import { DigitalPasosActividad, TOTAL_PASOS, type PasosState } from "./DigitalPasosActividad";
import { DigitalQuizActividad, SegsQuiz, TOTAL_PREGUNTAS, type QuizResp } from "./DigitalQuizActividad";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

const COLORES_CONFETI = ["#aebd52", "#c7d873", "#9fd3c9", "#ffb48a", "#f5f1e6", "#7fb7e6"];

type PiezaConfeti = { id: number; left: number; color: string; duracion: number; retraso: number; redonda: boolean };

export function DigitalActividadesInteractivas({ initialHechos, initialResp }: { initialHechos: PasosState; initialResp: QuizResp }) {
  const [hechos, setHechos] = useState<PasosState>(initialHechos);
  const [resp, setResp] = useState<QuizResp>(initialResp);
  const [confeti, setConfeti] = useState<PiezaConfeti[]>([]);
  const confetiId = useRef(0);
  const primeraCargaPasos = useRef(true);
  const primeraCargaQuiz = useRef(true);

  useEffect(() => {
    if (primeraCargaPasos.current) {
      primeraCargaPasos.current = false;
      return;
    }
    saveActivityProgress("digital", "pasos-celular", { hechos });
  }, [hechos]);

  useEffect(() => {
    if (primeraCargaQuiz.current) {
      primeraCargaQuiz.current = false;
      return;
    }
    saveActivityProgress("digital", "quiz-memoria", { resp });
  }, [resp]);

  function dispararConfeti() {
    if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const piezas = Array.from({ length: 70 }, () => ({
      id: confetiId.current++,
      left: Math.random() * 100,
      color: COLORES_CONFETI[Math.floor(Math.random() * COLORES_CONFETI.length)],
      duracion: 2 + Math.random() * 2,
      retraso: Math.random() * 0.5,
      redonda: Math.random() > 0.5,
    }));
    setConfeti(piezas);
    setTimeout(() => setConfeti([]), 4600);
  }

  const nPasos = hechos.filter(Boolean).length;
  const nQuiz = resp.filter((r) => r !== null).length;
  const practicaCompleta = nPasos === TOTAL_PASOS && nQuiz === TOTAL_PREGUNTAS;

  return (
    <section className={styles.practica} aria-labelledby="tituloPractica">
      <header className={styles.cab}>
        <div>
          <span className={styles.eyebrow}>Práctica</span>
          <h2 id="tituloPractica">
            Actividades <span className={styles.enfasis}>interactivas</span>
          </h2>
          <p>Ejercicios cortos que puedes hacer aquí mismo, a tu ritmo. Tu avance se guarda solo.</p>
        </div>
        <div className={styles.avance} aria-label="Tu avance">
          <div className={styles.avanceItem}>
            <span>
              Lista de pasos{" "}
              <b>
                {nPasos}/{TOTAL_PASOS}
              </b>
            </span>
            <div className={styles.segs}>
              {hechos.map((h, k) => (
                <i key={k} className={h ? styles.on : ""} />
              ))}
            </div>
          </div>
          <div className={styles.avanceItem}>
            <span>
              Quiz{" "}
              <b>
                {nQuiz}/{TOTAL_PREGUNTAS}
              </b>
            </span>
            <SegsQuiz resp={resp} />
          </div>
          <span className={`${styles.sello} ${practicaCompleta ? styles.on : ""}`}>
            <svg className={styles.ico} viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
              <path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.4 6.8 19.2l1-5.9L3.5 9.2l5.9-.8z" />
            </svg>
            ¡Práctica completa!
          </span>
        </div>
      </header>

      <DigitalPasosActividad hechos={hechos} setHechos={setHechos} onCompletoNuevo={dispararConfeti} />
      <DigitalQuizActividad resp={resp} setResp={setResp} onPerfecto={dispararConfeti} />

      {confeti.length > 0 && (
        <div className={styles.confeti} aria-hidden="true">
          {confeti.map((p) => (
            <i
              key={p.id}
              style={{
                left: `${p.left}%`,
                background: p.color,
                animationDuration: `${p.duracion}s`,
                animationDelay: `${p.retraso}s`,
                borderRadius: p.redonda ? "50%" : "2px",
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
