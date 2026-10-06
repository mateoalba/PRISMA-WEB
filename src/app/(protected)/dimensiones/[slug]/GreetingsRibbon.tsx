import styles from "@/styles/interculturalidad.module.css";
import { SALUDOS } from "@/lib/intercultural-content";

function Vuelta({ oculta }: { oculta: boolean }) {
  return (
    <>
      {SALUDOS.map(([saludo, idioma], i) => (
        <span key={i} className={`${styles.saludo} ${i % 2 === 1 ? styles.saludoItalica : ""}`} aria-hidden={oculta}>
          <b>{saludo}</b>
          <span>{idioma}</span>
        </span>
      ))}
    </>
  );
}

export function GreetingsRibbon() {
  return (
    <div className={styles.cinta} aria-label="Saludos en distintos idiomas">
      <div className={styles.cintaPista}>
        <Vuelta oculta={false} />
        <Vuelta oculta={true} />
      </div>
    </div>
  );
}
