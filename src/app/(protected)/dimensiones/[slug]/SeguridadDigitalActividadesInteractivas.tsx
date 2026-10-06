import styles from "@/styles/seguridad-digital-actividades.module.css";
import { LaboratorioCandadoActividad } from "./LaboratorioCandadoActividad";
import { ChatSospechosoActividad } from "./ChatSospechosoActividad";

export function SeguridadDigitalActividadesInteractivas({
  initialChatI,
  initialChatResp,
}: {
  initialChatI: number;
  initialChatResp: (number | undefined)[];
}) {
  return (
    <section className={styles.practica} aria-labelledby="tituloPractica">
      <header className={styles.cab}>
        <span className={styles.eyebrow}>Práctica</span>
        <h2 id="tituloPractica">
          Actividades <span className={styles.enfasis}>interactivas</span>
        </h2>
        <p>Ejercicios cortos que puedes hacer aquí mismo, a tu ritmo. Hoy entrenamos para cuidar tus cuentas y no caer en trampas.</p>
      </header>

      <LaboratorioCandadoActividad />
      <ChatSospechosoActividad initialI={initialChatI} initialResp={initialChatResp} />
    </section>
  );
}
