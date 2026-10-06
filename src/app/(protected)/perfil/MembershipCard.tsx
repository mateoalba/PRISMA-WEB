import styles from "@/styles/perfil.module.css";

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

const BENEFICIOS = ["Todos los libros de la biblioteca, sin costo"];

export function MembershipCard({ hasMembership, onVerMembresia }: { hasMembership: boolean; onVerMembresia?: () => void }) {
  if (hasMembership) {
    return (
      <div className={`${styles.tarjeta} ${styles.membresia}`}>
        <div>
          <div className={styles.eyebrow}>Membresía</div>
          <h2>
            Eres miembro <span className={styles.enfasis}>PRISMA+</span>
          </h2>
          <p>Todos los libros de la biblioteca están incluidos, sin costo.</p>
        </div>
        <button type="button" className={`${styles.btn} ${styles.btnS}`} onClick={onVerMembresia}>
          Ver mi membresía
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.tarjeta} ${styles.membresia}`}>
      <div>
        <div className={styles.eyebrow}>Membresía</div>
        <h2>
          Tienes una cuenta <span className={styles.enfasis}>gratuita</span>
        </h2>
        <p>Con PRISMA+ desbloqueas todos los libros de la biblioteca.</p>
        <div className={styles.beneficios}>
          {BENEFICIOS.map((b) => (
            <span key={b}>
              <CheckIcon />
              {b}
            </span>
          ))}
        </div>
      </div>
      <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={onVerMembresia}>
        Conocer PRISMA+
      </button>
    </div>
  );
}
