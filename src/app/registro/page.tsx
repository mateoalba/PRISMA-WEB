import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import { RegisterForm } from "./RegisterForm";
import styles from "@/styles/auth-screen.module.css";

export const metadata: Metadata = { title: "Crear cuenta | Prisma" };

export default function RegisterPage() {
  return (
    <main className={styles.acceso}>
      <div className={`${styles.orbe} ${styles.orbeUno}`} />
      <div className={`${styles.orbe} ${styles.orbeDos}`} />

      <AuthVisualPanel
        heading={
          <>
            Estás en la etapa en la que{" "}
            <span className={styles.enfasis}>más puedes aportar</span>
          </>
        }
        paragraph="Más conocimientos, más experiencias, más tiempo para enseñar y para aprender."
      />

      <section className={styles.panelForm}>
        <div className={`${styles.tarjeta} ${styles.vidrio}`}>
          <div className={styles.encabezado}>
            <div className={styles.eyebrow}>Crear cuenta · Gratis</div>
            <h1>
              Únete a la <span className={styles.enfasis}>comunidad PRISMA</span>
            </h1>
            <p>Solo toma un par de minutos. Podrás cambiar tus datos después.</p>
          </div>

          <Suspense fallback={null}>
            <RegisterForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
