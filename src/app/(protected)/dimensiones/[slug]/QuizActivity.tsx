"use client";

import { useState } from "react";
import styles from "@/styles/dimension-page.module.css";
import { saveActivityResponse } from "@/lib/interactive-activities/actions";
import type { QuizConfig, QuizResponseData } from "@/lib/interactive-activities/types";

export function QuizActivity({
  activityId,
  dimensionSlug,
  config,
  initialResponse,
}: {
  activityId: string;
  dimensionSlug: string;
  config: QuizConfig;
  initialResponse: QuizResponseData | null;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(initialResponse?.answers ?? config.questions.map(() => null));

  function elegir(qIndex: number, optIndex: number) {
    if (answers[qIndex] !== null) return; // ya respondida, no se cambia
    const next = answers.map((a, i) => (i === qIndex ? optIndex : a));
    setAnswers(next);
    saveActivityResponse(activityId, dimensionSlug, { answers: next });
  }

  return (
    <div className={styles.quizLista}>
      {config.questions.map((q, qi) => {
        const elegida = answers[qi];
        return (
          <div key={qi} className={styles.quizPregunta}>
            <p className={styles.quizEnunciado}>{q.question}</p>
            <div className={styles.quizOpciones}>
              {q.options.map((op, oi) => {
                const esElegida = elegida === oi;
                const esCorrecta = oi === q.correctIndex;
                let estado = "";
                if (elegida !== null) {
                  if (esCorrecta) estado = styles.quizOpcionCorrecta;
                  else if (esElegida) estado = styles.quizOpcionIncorrecta;
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    className={`${styles.quizOpcion} ${estado}`}
                    disabled={elegida !== null}
                    onClick={() => elegir(qi, oi)}
                  >
                    {op}
                  </button>
                );
              })}
            </div>
            {elegida !== null && q.explanation && <p className={styles.quizExplicacion}>{q.explanation}</p>}
          </div>
        );
      })}
    </div>
  );
}
