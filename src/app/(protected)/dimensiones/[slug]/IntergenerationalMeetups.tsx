import styles from "@/styles/conexion-social.module.css";
import { ImagePlaceholder } from "./ImagePlaceholder";
import type { IntergenerationalProject } from "@/lib/community/intergenerational-actions";

function PairsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M3 20c.8-3 2.8-4.5 5-4.5s4.2 1.5 5 4.5M11 20c.8-3 2.8-4.5 5-4.5s4.2 1.5 5 4.5" />
    </svg>
  );
}

export function IntergenerationalMeetups({
  pairs,
  projects,
}: {
  pairs: number | null;
  projects: IntergenerationalProject[];
}) {
  return (
    <section className={styles.bloque} aria-labelledby="ei-titulo">
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Dos generaciones, un mismo proyecto</div>
          <h2 className={styles.seccion} id="ei-titulo">
            Encuentros <span className={styles.enfasis}>intergeneracionales</span>
          </h2>
          <p>Tú enseñas lo que sabes y aprendes de estudiantes y jóvenes voluntarios. Todos ganan.</p>
        </div>
      </div>

      <div className={styles.puente}>
        <div className={`${styles.puenteLado} ${styles.puenteLadoIzq}`}>
          <ImagePlaceholder label="persona mayor enseñando" />
          <div className={styles.puenteVelo} />
        </div>
        <div className={`${styles.puenteLado} ${styles.puenteLadoDer}`}>
          <ImagePlaceholder label="joven aprendiendo" />
          <div className={styles.puenteVelo} />
        </div>
        <span className={`${styles.puenteRotulo} ${styles.puenteRotuloIzq}`}>Tu experiencia</span>
        <span className={`${styles.puenteRotulo} ${styles.puenteRotuloDer}`}>Su energía</span>
        <div className={styles.puenteCentro}>
          <b>{pairs ?? "—"}</b>
          <span>{pairs === null ? "Aún sin registrar parejas activas" : "parejas intergeneracionales aprendiendo juntas este mes"}</span>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className={styles.vacio}>Todavía no hay proyectos intergeneracionales publicados.</div>
      ) : (
        <div className={styles.proyectos} aria-label="Proyectos intergeneracionales">
          {projects.map((p) => (
            <article key={p.id} className={styles.proyecto}>
              <div className={styles.proyectoImg}>
                <ImagePlaceholder label={p.title} />
              </div>
              <div>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <span className={styles.pareja}>
                  <PairsIcon />
                  Con {p.partnerName}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
