"use client";

import { useAccessibilityPrefs, type TextSize, type Theme } from "@/lib/accessibility/AccessibilityContext";
import styles from "@/styles/perfil.module.css";
import { useToast } from "./ToastContext";

const TAMANOS: { escala: TextSize; letra: string; nombre: string; fontSize: number }[] = [
  { escala: "normal", letra: "A", nombre: "Normal", fontSize: 22 },
  { escala: "grande", letra: "A+", nombre: "Grande", fontSize: 30 },
  { escala: "muy-grande", letra: "A++", nombre: "Muy grande", fontSize: 38 },
];

const TEMAS: { tema: Theme; nombre: string; clase: string }[] = [
  { tema: "oscuro", nombre: "Oscuro", clase: styles.temaMiniOscuro },
  { tema: "claro", nombre: "Claro", clase: styles.temaMiniClaro },
  { tema: "auto", nombre: "Automático", clase: styles.temaMiniAuto },
];

export function AccesibilidadPanel() {
  const {
    textSize,
    setTextSize,
    theme,
    setTheme,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    voiceReadout,
    setVoiceReadout,
    reminders,
    setReminders,
  } = useAccessibilityPrefs();
  const { notify } = useToast();

  return (
    <div className={styles.acc}>
      <div className={styles.tarjeta}>
        <h3>Tamaño de texto</h3>
        <p>Elige el tamaño más cómodo. Se aplica al instante en toda la aplicación.</p>
        <div className={styles.tamanos} role="radiogroup" aria-label="Tamaño de texto">
          {TAMANOS.map((t) => (
            <button
              key={t.escala}
              type="button"
              role="radio"
              aria-checked={textSize === t.escala}
              className={`${styles.tam} ${textSize === t.escala ? styles.tamOn : ""}`}
              onClick={() => {
                setTextSize(t.escala);
                notify("Tamaño de texto actualizado");
              }}
            >
              <b style={{ fontSize: t.fontSize }}>{t.letra}</b>
              <span>{t.nombre}</span>
            </button>
          ))}
        </div>
        <div className={styles.muestra} aria-hidden="true">
          <b>Así se verá tu texto</b>
          <span>Hoy es un buen día para aprender algo nuevo.</span>
        </div>
      </div>

      <div className={styles.tarjeta}>
        <h3>Apariencia</h3>
        <p>Elige los colores de la aplicación.</p>
        <div className={styles.temas} role="radiogroup" aria-label="Tema">
          {TEMAS.map((t) => (
            <button
              key={t.tema}
              type="button"
              role="radio"
              aria-checked={theme === t.tema}
              className={`${styles.tema} ${theme === t.tema ? styles.temaOn : ""}`}
              onClick={() => {
                setTheme(t.tema);
                notify("Apariencia actualizada");
              }}
            >
              <span className={`${styles.temaMini} ${t.clase}`} aria-hidden="true">
                <i />
                <i />
                <i />
                <span className={styles.temaMiniB} />
              </span>
              {t.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tarjeta} style={{ gridColumn: "1 / -1" }}>
        <h3>Ayudas adicionales</h3>
        <div className={styles.interruptores}>
          <label className={styles.inter}>
            <span>
              <b>Alto contraste</b>
              <small>Textos y bordes más marcados.</small>
            </span>
            <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
            <span className={styles.interSw} />
          </label>
          <label className={styles.inter}>
            <span>
              <b>Reducir movimiento</b>
              <small>Quita las animaciones de la aplicación.</small>
            </span>
            <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} />
            <span className={styles.interSw} />
          </label>
          <label className={styles.inter}>
            <span>
              <b>Leer en voz alta</b>
              <small>Muestra un botón para escuchar los textos.</small>
            </span>
            <input type="checkbox" checked={voiceReadout} onChange={(e) => setVoiceReadout(e.target.checked)} />
            <span className={styles.interSw} />
          </label>
          <label className={styles.inter}>
            <span>
              <b>Recordatorios</b>
              <small>Avisos de hidratación, actividades y medicinas.</small>
            </span>
            <input type="checkbox" checked={reminders} onChange={(e) => setReminders(e.target.checked)} />
            <span className={styles.interSw} />
          </label>
        </div>
      </div>
    </div>
  );
}
