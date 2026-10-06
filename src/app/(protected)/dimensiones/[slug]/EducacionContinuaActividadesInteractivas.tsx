import styles from "@/styles/educacion-continua-actividades.module.css";
import { PizarraEscaleraActividad } from "./PizarraEscaleraActividad";
import { EscritorioAsistenteActividad } from "./EscritorioAsistenteActividad";

export function EducacionContinuaActividadesInteractivas() {
  return (
    <section className={styles.practica} aria-labelledby="tituloPractica">
      <header className={styles.cab}>
        <span className={styles.eyebrow}>Práctica</span>
        <h2 id="tituloPractica">
          Actividades <span className={styles.enfasis}>interactivas</span>
        </h2>
        <p>Ejercicios cortos que puedes hacer aquí mismo, a tu ritmo. Porque aprender no tiene edad.</p>
      </header>

      <PizarraEscaleraActividad />
      <EscritorioAsistenteActividad />
    </section>
  );
}
