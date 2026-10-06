import Link from "next/link";
import { PrismaLogo } from "@/components/layout/PrismaLogo";
import { AuthGallery } from "./AuthGallery";
import styles from "@/styles/auth-screen.module.css";

// Panel izquierdo (galería + logo + texto) compartido por /login y
// /registro: exactamente el mismo estilo y animación en ambas pantallas,
// solo cambia el texto que se le pasa por props.
export function AuthVisualPanel({
  heading,
  paragraph,
}: {
  heading: React.ReactNode;
  paragraph: string;
}) {
  return (
    <section className={styles.visual} aria-label="PRISMA by PENSER">
      <AuthGallery />

      <Link
        href="/"
        className={styles.logo}
        aria-label="PRISMA by PENSER, volver al inicio"
      >
        <PrismaLogo height={52} />
      </Link>

      <div className={styles.visualTexto}>
        <div className={styles.eyebrow}>
          Ecosistema digital multidimensional · +60
        </div>
        <h2>{heading}</h2>
        <p>{paragraph}</p>
      </div>
    </section>
  );
}
