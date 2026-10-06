import styles from "@/styles/salud-mental-actividades.module.css";
import { SaludMentalReflexionActividad } from "./SaludMentalReflexionActividad";
import { SaludMentalChequeoActividad } from "./SaludMentalChequeoActividad";

type Momento = { fecha: string; animo: "tormenta" | "nublado" | "parcial" | "sol" | "arcoiris"; pregunta: string; texto: string };

function CandadoIcon() {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function SaludMentalActividadesInteractivas({ initialMoments, initialWeek }: { initialMoments: Momento[]; initialWeek: Record<string, number> }) {
  return (
    <section className={styles.practica} aria-labelledby="tituloPractica">
      <header className={styles.cab}>
        <div>
          <span className={styles.eyebrow}>Práctica</span>
          <h2 id="tituloPractica">
            Actividades <span className={styles.enfasis}>interactivas</span>
          </h2>
          <p>Ejercicios cortos que puedes hacer aquí mismo, a tu ritmo. Sin prisa y sin respuestas correctas.</p>
        </div>
        <span className={styles.cabPriv}>
          <CandadoIcon />
          Lo que escribas aquí es privado
        </span>
      </header>

      <SaludMentalReflexionActividad initialMoments={initialMoments} />
      <SaludMentalChequeoActividad initialWeek={initialWeek} />
    </section>
  );
}
