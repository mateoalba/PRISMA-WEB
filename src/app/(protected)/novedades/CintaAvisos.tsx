import styles from "@/styles/novedades.module.css";
import type { AvisoCinta } from "@/lib/novedades/feed-actions";

export function CintaAvisos({ avisos }: { avisos: AvisoCinta[] }) {
  if (avisos.length === 0) return null;

  const vuelta = avisos.map((a, i) => (
    <span key={i} className={styles.aviso}>
      <b>{a.destacado}</b>
      {a.texto}
    </span>
  ));

  return (
    <div className={styles.cinta} aria-label="Avisos rápidos">
      <div className={styles.cintaPista}>
        {vuelta}
        {avisos.map((a, i) => (
          <span key={`dup-${i}`} className={styles.aviso} aria-hidden="true">
            <b>{a.destacado}</b>
            {a.texto}
          </span>
        ))}
      </div>
    </div>
  );
}
