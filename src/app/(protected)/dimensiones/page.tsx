import type { Metadata } from "next";
import { DimensionesExplorer } from "./DimensionesExplorer";
import styles from "@/styles/dimensiones-spectrum.module.css";

export const metadata: Metadata = { title: "Las 10 dimensiones | Prisma" };

export default function DimensionesPage() {
  return (
    <div className={styles.contenido}>
      <div className={styles.cabecera}>
        <div>
          <div className={styles.eyebrow}>El modelo completo</div>
          <h1>
            Las 10 dimensiones
            <br />
            de <span className={styles.enfasis}>PRISMA</span>
          </h1>
        </div>
        <div>
          <p>
            Como la luz que atraviesa un prisma, tu bienestar se abre en diez colores.
            Elige uno y empieza.
          </p>
          <div className={styles.pista}>
            <HandIcon />
            Toca o pasa el cursor sobre cada franja
          </div>
        </div>
      </div>

      <DimensionesExplorer />
    </div>
  );
}

function HandIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M9 11V5a2 2 0 0 1 4 0v6" />
      <path d="M13 10a2 2 0 0 1 4 0v3a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.7L3 15a2 2 0 0 1 3.3-2.2L9 15" />
    </svg>
  );
}
