import styles from "@/styles/interculturalidad-actividades.module.css";
import { PasaporteActividad } from "./PasaporteActividad";
import { BrujulaEtiquetaActividad } from "./BrujulaEtiquetaActividad";

type EstadoBrujula = { region: string | null; lugar: string; interes: string | null; porque: string };
const ESTADO_VACIO: EstadoBrujula = { region: null, lugar: "", interes: null, porque: "" };

export function InterculturalidadActividadesInteractivas({
  initialResp,
  initialEstado,
}: {
  initialResp: (number | null)[] | null;
  initialEstado: EstadoBrujula | null;
}) {
  return (
    <section className={styles.practica} aria-labelledby="tituloPractica">
      <header className={styles.cab}>
        <span className={styles.eyebrow}>Práctica</span>
        <h2 id="tituloPractica">
          Actividades <span className={styles.enfasis}>interactivas</span>
        </h2>
        <p>Ejercicios cortos para acercarte a otras culturas con curiosidad y respeto, aquí mismo y a tu ritmo.</p>
      </header>

      <PasaporteActividad initialResp={initialResp ?? [null, null, null, null, null]} />
      <BrujulaEtiquetaActividad initialEstado={initialEstado ?? ESTADO_VACIO} />
    </section>
  );
}
