import type { LearningRoute } from "@/lib/dimension-content";
import styles from "@/styles/dimension-page.module.css";

export function LearningRoutes({ routes }: { routes: LearningRoute[] }) {
  return (
    <section className={styles.bloque}>
      <div className={styles.seccionCab}>
        <div>
          <div className={styles.eyebrow}>Tu camino</div>
          <h2 className={styles.seccionTitulo}>
            Rutas de <span className={styles.enfasis}>aprendizaje</span>
          </h2>
          <p>Avanza nivel por nivel. Cada uno se desbloquea al terminar el anterior.</p>
        </div>
      </div>
      <div className={styles.rutas}>
        {routes.map((r, i) => {
          const txt = { completa: "Completado", actual: "En curso", bloqueada: "Bloqueado" }[r.estado];
          return (
            <article
              key={r.nivel}
              className={`${styles.ruta} ${r.estado === "actual" ? styles.rutaActual : ""} ${r.estado === "bloqueada" ? styles.rutaBloqueada : ""}`}
            >
              <div className={styles.rutaMedia}>
                <div className={styles.ph} style={{ height: "100%" }}>
                  <span>{r.nivel}</span>
                </div>
                <span className={`${styles.rutaNum} ${r.estado === "completa" ? styles.rutaCompletaNum : ""}`}>
                  {r.estado === "completa" ? <CheckIcon color="#181712" /> : i + 1}
                </span>
              </div>
              <div className={styles.rutaCuerpo}>
                <span className={styles.chipEstado}>{txt}</span>
                <h3>{r.nivel}</h3>
                <p>{r.descripcion}</p>
                <div className={styles.miniBarra}>
                  <div className={styles.barra}>
                    <i style={{ width: `${r.avance}%` }} />
                  </div>
                  {r.avance}%
                </div>
                <div>
                  {r.estado === "completa" && (
                    <button type="button" className={`${styles.btn} ${styles.btnS} ${styles.btnSm}`}>
                      Repasar
                    </button>
                  )}
                  {r.estado === "actual" && (
                    <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnSm}`}>
                      Continuar
                    </button>
                  )}
                  {r.estado === "bloqueada" && (
                    <span className={`${styles.btn} ${styles.btnS} ${styles.btnSm}`} aria-disabled="true">
                      <LockIcon />
                      Se desbloquea al terminar el nivel {i}
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function CheckIcon({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
