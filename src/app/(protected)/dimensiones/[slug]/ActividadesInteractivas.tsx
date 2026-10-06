"use client";

import { useState } from "react";
import styles from "@/styles/dimension-page.module.css";
import { QuizActivity } from "./QuizActivity";
import { ChecklistActivity } from "./ChecklistActivity";
import { ReflexionActivity } from "./ReflexionActivity";
import { isResponseComplete, type ActivityWithProgress, type QuizConfig, type ChecklistConfig, type ReflexionConfig, type QuizResponseData, type ChecklistResponseData, type ReflexionResponseData } from "@/lib/interactive-activities/types";

function IcoQuiz() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
function IcoChecklist() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
    </svg>
  );
}
function IcoReflexion() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}
function IcoCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

const ICONOS = { quiz: IcoQuiz, checklist: IcoChecklist, reflexion: IcoReflexion };
const ETIQUETAS = { quiz: "Quiz", checklist: "Lista de pasos", reflexion: "Reflexión" };

export function ActividadesInteractivas({ dimensionSlug, activities }: { dimensionSlug: string; activities: ActivityWithProgress[] }) {
  const [abierta, setAbierta] = useState<string | null>(null);

  if (activities.length === 0) return null;

  return (
    <section className={styles.bloque} id="actividades" aria-labelledby="act-titulo">
      <div className={styles.seccionCab}>
        <div>
          <div className={styles.eyebrow}>Practica</div>
          <h2 className={styles.seccionTitulo} id="act-titulo">
            Actividades <span className={styles.enfasis}>interactivas</span>
          </h2>
          <p>Ejercicios cortos que puedes hacer aquí mismo, a tu ritmo.</p>
        </div>
      </div>

      <div className={styles.actividadesGrid}>
        {activities.map((a) => {
          const Icono = ICONOS[a.type];
          const hecha = isResponseComplete(a, a.response);
          const estaAbierta = abierta === a.id;
          return (
            <article key={a.id} className={`${styles.actividadCard} ${estaAbierta ? styles.actividadCardAbierta : ""}`}>
              <button type="button" className={styles.actividadCabecera} onClick={() => setAbierta(estaAbierta ? null : a.id)} aria-expanded={estaAbierta}>
                <span className={styles.actividadIco}>
                  <Icono />
                </span>
                <span className={styles.actividadTextos}>
                  <span className={styles.actividadTipo}>{ETIQUETAS[a.type]}</span>
                  <h3>{a.title}</h3>
                  <p>{a.description}</p>
                </span>
                {hecha && (
                  <span className={styles.actividadHecho} title="Completada">
                    <IcoCheck />
                  </span>
                )}
              </button>

              {estaAbierta && (
                <div className={styles.actividadCuerpo}>
                  {a.type === "quiz" && <QuizActivity activityId={a.id} dimensionSlug={dimensionSlug} config={a.config as QuizConfig} initialResponse={a.response as QuizResponseData | null} />}
                  {a.type === "checklist" && (
                    <ChecklistActivity activityId={a.id} dimensionSlug={dimensionSlug} config={a.config as ChecklistConfig} initialResponse={a.response as ChecklistResponseData | null} />
                  )}
                  {a.type === "reflexion" && (
                    <ReflexionActivity activityId={a.id} dimensionSlug={dimensionSlug} config={a.config as ReflexionConfig} initialResponse={a.response as ReflexionResponseData | null} />
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
