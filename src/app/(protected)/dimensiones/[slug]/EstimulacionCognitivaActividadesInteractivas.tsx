import styles from "@/styles/estimulacion-cognitiva-actividades.module.css";
import { RetoMemoriaActividad } from "./RetoMemoriaActividad";
import { PausaSentidosActividad } from "./PausaSentidosActividad";

export function EstimulacionCognitivaActividadesInteractivas() {
  return (
    <section className={styles.practica} aria-labelledby="tituloPractica">
      <header className={styles.cab}>
        <span className={styles.eyebrow}>Práctica</span>
        <h2 id="tituloPractica">
          Actividades <span className={styles.enfasis}>interactivas</span>
        </h2>
        <p>Ejercicios cortos que puedes hacer aquí mismo, a tu ritmo. Hoy entrenamos la memoria y la atención, jugando.</p>
      </header>

      <RetoMemoriaActividad />
      <PausaSentidosActividad />
    </section>
  );
}
