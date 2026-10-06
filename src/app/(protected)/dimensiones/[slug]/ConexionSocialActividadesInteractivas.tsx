import styles from "@/styles/conexion-social-actividades.module.css";
import { PostalActividad } from "./PostalActividad";
import { CaminoEncuentroActividad } from "./CaminoEncuentroActividad";

export function ConexionSocialActividadesInteractivas({ initialHechas, initialEventoIndex }: { initialHechas: boolean[]; initialEventoIndex: number | null }) {
  return (
    <section className={styles.practica} aria-labelledby="tituloPractica">
      <header className={styles.cab}>
        <span className={styles.eyebrow}>Práctica</span>
        <h2 id="tituloPractica">
          Actividades <span className={styles.enfasis}>interactivas</span>
        </h2>
        <p>Ejercicios cortos que puedes hacer aquí mismo, a tu ritmo. Esta vez, pensando en la gente que te importa.</p>
      </header>

      <PostalActividad />
      <CaminoEncuentroActividad initialHechas={initialHechas} initialEventoIndex={initialEventoIndex} />
    </section>
  );
}
