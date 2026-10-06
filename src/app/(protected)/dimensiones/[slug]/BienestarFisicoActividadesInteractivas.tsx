import styles from "@/styles/bienestar-fisico-actividades.module.css";
import { RutinaGuiadaActividad } from "./RutinaGuiadaActividad";
import { MitoVerdadActividad } from "./MitoVerdadActividad";

export function BienestarFisicoActividadesInteractivas({
  initialCompletados,
  initialMitosI,
  initialMitosResp,
}: {
  initialCompletados: string[];
  initialMitosI: number;
  initialMitosResp: (boolean | undefined)[];
}) {
  return (
    <section className={styles.practica} aria-labelledby="tituloPractica">
      <header className={styles.cab}>
        <span className={styles.eyebrow}>Práctica</span>
        <h2 id="tituloPractica">
          Actividades <span className={styles.enfasis}>interactivas</span>
        </h2>
        <p>Ejercicios cortos que puedes hacer aquí mismo, a tu ritmo. Hoy toca mover el cuerpo con calma y separar mitos de verdades.</p>
      </header>

      <RutinaGuiadaActividad initialCompletados={initialCompletados} />
      <MitoVerdadActividad initialI={initialMitosI} initialResp={initialMitosResp} />
    </section>
  );
}
