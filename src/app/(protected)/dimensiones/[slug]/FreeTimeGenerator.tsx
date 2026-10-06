"use client";

import { useRef, useState } from "react";
import styles from "@/styles/tiempo-libre.module.css";
import {
  MOOD_OPTIONS,
  TIME_OPTIONS,
  FREE_TIME_SUGGESTIONS,
  type FreeTimeMood,
  type FreeTimeLength,
  type FreeTimeSuggestion,
} from "@/lib/purpose-content";

function DiceIcon() {
  return (
    <svg className={styles.dado} viewBox="0 0 40 40" aria-hidden="true">
      <polygon points="20,2 38,30 20,38" fill="#8a983a" />
      <polygon points="20,2 20,38 2,28" fill="#5e6926" />
      <polygon points="20,2 38,30 26,22" fill="#c7d873" opacity=".6" />
    </svg>
  );
}
function ShuffleIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={spinning ? styles.genBotonGirando : ""}
      style={{ display: "inline-block" }}
    >
      <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function elegirIdea(mood: FreeTimeMood, time: FreeTimeLength, evitar: FreeTimeSuggestion | null) {
  let pool = FREE_TIME_SUGGESTIONS.filter((s) => s.mood === mood && s.time === time);
  if (pool.length === 0) pool = FREE_TIME_SUGGESTIONS.filter((s) => s.mood === mood);
  if (pool.length > 1 && evitar) pool = pool.filter((s) => s !== evitar);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function FreeTimeGenerator() {
  const [mood, setMood] = useState<FreeTimeMood>(MOOD_OPTIONS[0].value);
  const [time, setTime] = useState<FreeTimeLength>(TIME_OPTIONS[0].value);
  const [resultado, setResultado] = useState<FreeTimeSuggestion | null>(null);
  const [girando, setGirando] = useState(false);
  const [hecho, setHecho] = useState(false);
  const [guardadas, setGuardadas] = useState<string[]>([]);
  const ultimaRef = useRef<FreeTimeSuggestion | null>(null);

  function generar(e: React.FormEvent) {
    e.preventDefault();
    setGirando(true);
    setTimeout(() => setGirando(false), 650);
    const idea = elegirIdea(mood, time, ultimaRef.current);
    ultimaRef.current = idea;
    setResultado(idea);
    setHecho(false);
  }

  function guardar() {
    if (!resultado) return;
    setGuardadas((prev) => (prev.includes(resultado.title) ? prev : [...prev, resultado.title]));
  }

  const yaGuardada = resultado ? guardadas.includes(resultado.title) : false;
  const moodLabel = resultado ? MOOD_OPTIONS.find((m) => m.value === resultado.mood)?.label : "";
  const timeLabel = resultado ? TIME_OPTIONS.find((t) => t.value === resultado.time)?.label : "";

  return (
    <section className={styles.bloque} aria-labelledby="it-titulo">
      <div className={styles.gen}>
        <form className={styles.genPanel} onSubmit={generar}>
          <div>
            <div className={styles.eyebrow}>Hecho a tu medida</div>
            <h3 id="it-titulo">
              Ideas para tu <span className={styles.enfasis}>tiempo libre</span>
            </h3>
          </div>
          <fieldset className={styles.pregunta}>
            <legend>¿Cómo te sientes para hoy?</legend>
            <div className={styles.opciones}>
              {MOOD_OPTIONS.map((m) => (
                <label key={m.value} className={`${styles.opcion} ${mood === m.value ? styles.opcionActiva : ""}`}>
                  <input type="radio" name="animo" value={m.value} checked={mood === m.value} onChange={() => setMood(m.value)} />
                  {m.label}
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className={styles.pregunta}>
            <legend>¿Cuánto tiempo tienes?</legend>
            <div className={styles.opciones}>
              {TIME_OPTIONS.map((t) => (
                <label key={t.value} className={`${styles.opcion} ${time === t.value ? styles.opcionActiva : ""}`}>
                  <input type="radio" name="tiempo" value={t.value} checked={time === t.value} onChange={() => setTime(t.value)} />
                  {t.label}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className={`${styles.btn} ${styles.btnP}`}>
            <ShuffleIcon spinning={girando} />
            {resultado ? "Otra idea" : "Sugiéreme algo"}
          </button>
        </form>

        <div className={styles.genRes} aria-live="polite">
          {!resultado ? (
            <div className={styles.vacioRes}>
              <div>
                <DiceIcon />
                <b>Tu próxima idea te espera</b>
                Elige cómo te sientes y cuánto tiempo tienes.
              </div>
            </div>
          ) : (
            <>
              <div className={styles.resImg}>
                <div className={styles.ph}>
                  <span>Imagen: {resultado.title}</span>
                </div>
              </div>
              <div className={styles.resVelo} />
              <div className={styles.resCuerpo}>
                <div className={styles.eyebrow}>Te sugerimos</div>
                <h4>{resultado.title}</h4>
                <p>{resultado.description}</p>
                <div className={styles.resMeta}>
                  <span>{timeLabel}</span>
                  <span>{resultado.place}</span>
                  <span>{moodLabel}</span>
                </div>
                <div className={styles.resAcciones}>
                  <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnSm}`} onClick={() => setHecho(true)}>
                    {hecho ? "✓ ¡Genial, disfrútalo!" : "¡Lo haré hoy!"}
                  </button>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnS} ${styles.btnSm}`}
                    aria-pressed={yaGuardada}
                    disabled={yaGuardada}
                    onClick={guardar}
                  >
                    {yaGuardada ? "✓ Guardada" : "Guardar para después"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {guardadas.length > 0 && (
        <div className={styles.guardadas}>
          <span className={styles.guardadasT}>Guardadas para después:</span>
          {guardadas.map((t) => (
            <span key={t} className={styles.guardada}>
              {t}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
