import type { Metadata } from "next";
import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import { LoginForm } from "./LoginForm";
import styles from "@/styles/auth-screen.module.css";

export const metadata: Metadata = { title: "Iniciar sesión | Prisma" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : "/dashboard";

  return (
    <main className={styles.acceso}>
      <div className={`${styles.orbe} ${styles.orbeUno}`} />
      <div className={`${styles.orbe} ${styles.orbeDos}`} />

      <AuthVisualPanel
        heading={
          <>
            Tu espectro <span className={styles.enfasis}>completo</span> te espera
          </>
        }
        paragraph="Diez dimensiones de bienestar, en un solo lugar."
      />

      <section className={styles.panelForm}>
        <div className={`${styles.tarjeta} ${styles.vidrio}`}>
          <div className={styles.encabezado}>
            <div className={styles.eyebrow}>Iniciar sesión</div>
            <h1>
              Qué bueno <span className={styles.enfasis}>verte de nuevo</span>
            </h1>
            <p>Ingresa con el correo que usaste al registrarte.</p>
          </div>

          <LoginForm next={nextPath} />
        </div>
      </section>
    </main>
  );
}
