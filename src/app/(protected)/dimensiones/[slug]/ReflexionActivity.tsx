"use client";

import { useState } from "react";
import styles from "@/styles/dimension-page.module.css";
import { saveActivityResponse } from "@/lib/interactive-activities/actions";
import type { ReflexionConfig, ReflexionResponseData } from "@/lib/interactive-activities/types";

export function ReflexionActivity({
  activityId,
  dimensionSlug,
  config,
  initialResponse,
}: {
  activityId: string;
  dimensionSlug: string;
  config: ReflexionConfig;
  initialResponse: ReflexionResponseData | null;
}) {
  const [texto, setTexto] = useState(initialResponse?.text ?? "");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  async function guardar() {
    setGuardando(true);
    await saveActivityResponse(activityId, dimensionSlug, { text: texto });
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  return (
    <div className={styles.reflexionBox}>
      <p className={styles.reflexionPrompt}>{config.prompt}</p>
      <textarea
        className={styles.reflexionTextarea}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe aquí…"
        rows={4}
      />
      <div className={styles.reflexionAcciones}>
        <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnSm}`} disabled={guardando || texto.trim() === ""} onClick={guardar}>
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        {guardado && <span className={styles.reflexionGuardado}>Guardado ✓</span>}
      </div>
    </div>
  );
}
