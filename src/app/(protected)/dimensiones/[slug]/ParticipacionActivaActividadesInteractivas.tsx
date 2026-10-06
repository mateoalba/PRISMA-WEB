"use client";

import { useState } from "react";
import styles from "@/styles/participacion-activa-actividades.module.css";
import { ArbolSaberActividad } from "./ArbolSaberActividad";
import { PuenteMentorActividad } from "./PuenteMentorActividad";

type EstadoPuente = {
  tema: string | null;
  ideas: [string, string, string];
  dia: number | null;
  modo: "Presencial" | "Virtual" | null;
  como: number | null;
  despues: boolean;
};

export function ParticipacionActivaActividadesInteractivas({
  initialSaberes,
  initialPublicos,
  initialIdea,
  initialGuardadoAporte,
  initialMentorTopics,
  initialEstadoPuente,
}: {
  initialSaberes: string[];
  initialPublicos: string[];
  initialIdea: string;
  initialGuardadoAporte: boolean;
  initialMentorTopics: string[];
  initialEstadoPuente: EstadoPuente;
}) {
  const [saberes, setSaberes] = useState<string[]>(initialSaberes);

  return (
    <section className={styles.practica} aria-labelledby="tituloPractica">
      <header className={styles.cab}>
        <span className={styles.eyebrow}>Práctica</span>
        <h2 id="tituloPractica">
          Actividades <span className={styles.enfasis}>interactivas</span>
        </h2>
        <p>Ejercicios cortos que puedes hacer aquí mismo, a tu ritmo. Lo que sabes vale mucho: hoy pensamos cómo compartirlo.</p>
      </header>

      <ArbolSaberActividad saberes={saberes} onSaberesChange={setSaberes} initialPublicos={initialPublicos} initialIdea={initialIdea} initialGuardado={initialGuardadoAporte} />
      <PuenteMentorActividad saberes={saberes} initialMentorTopics={initialMentorTopics} initialEstado={initialEstadoPuente} />
    </section>
  );
}
