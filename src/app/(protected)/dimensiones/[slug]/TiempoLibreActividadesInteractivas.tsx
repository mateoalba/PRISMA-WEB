import styles from "@/styles/tiempo-libre-actividades.module.css";
import { QuizCartasActividad } from "./QuizCartasActividad";
import { ArmaTuTardeActividad } from "./ArmaTuTardeActividad";

type Estado = {
  actId: string | null;
  dia: number | null;
  hora: number | null;
  dur: number | null;
  mats: number[];
  comp: "solo" | "con" | null;
  quien: string;
  sentir: number | null;
  pendiente: boolean;
};

const ESTADO_VACIO: Estado = { actId: null, dia: null, hora: null, dur: null, mats: [], comp: null, quien: "", sentir: null, pendiente: false };

export function TiempoLibreActividadesInteractivas({ initialEstado, initialResp }: { initialEstado: Estado | null; initialResp: (number | null)[] | null }) {
  return (
    <section className={styles.practica} aria-labelledby="tituloPractica">
      <header className={styles.cab}>
        <span className={styles.eyebrow}>Práctica</span>
        <h2 id="tituloPractica">
          Actividades <span className={styles.enfasis}>interactivas</span>
        </h2>
        <p>Ejercicios cortos que puedes hacer aquí mismo, a tu ritmo. Hoy toca disfrutar: tu tiempo también es importante.</p>
      </header>

      <QuizCartasActividad initialResp={initialResp ?? [null, null, null, null, null]} />
      <ArmaTuTardeActividad initialEstado={initialEstado ?? ESTADO_VACIO} />
    </section>
  );
}
