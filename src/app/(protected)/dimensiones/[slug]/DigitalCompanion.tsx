import type { DimensionCompanion } from "@/lib/dimension-content";
import styles from "@/styles/dimension-page.module.css";

export function DigitalCompanion({ companion }: { companion: DimensionCompanion }) {
  return (
    <section className={styles.bloque}>
      <div className={`${styles.companero} ${styles.vidrio}`}>
        <div className={styles.companeroMedia}>
          <div className={styles.ph} style={{ position: "absolute", inset: 0 }}>
            <span>Voluntario en videollamada</span>
          </div>
        </div>
        <div className={styles.companeroCuerpo}>
          {companion.disponible && <span className={styles.enLinea}>Hay voluntarios disponibles ahora</span>}
          <h3>{companion.titulo}</h3>
          <p>{companion.descripcion}</p>
          <div className={styles.heroAcciones}>
            <button type="button" className={`${styles.btn} ${styles.btnP}`}>
              <CamIcon />
              Videollamada
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnS}`}>
              <ChatIcon />
              Escribir por chat
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CamIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="6" width="13" height="12" rx="3" />
      <path d="M16 10l5-3v10l-5-3" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h16v11H9l-5 4z" />
    </svg>
  );
}
