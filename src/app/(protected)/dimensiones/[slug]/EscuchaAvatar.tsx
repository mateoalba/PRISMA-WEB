import styles from "@/styles/salud-mental.module.css";

// Avatar ilustrado (no una foto de una persona real) para "Escucha activa":
// une el acompañamiento cálido con la aclaración de que no es un
// profesional real — por eso es un rostro abstracto, no fotorrealista.
export function EscuchaAvatar({ size = 52, hablando = false }: { size?: number; hablando?: boolean }) {
  const id = "escucha-avatar-grad";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={styles.avatarSvg} aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#eaf6b4" />
          <stop offset="55%" stopColor="#aebd52" />
          <stop offset="100%" stopColor="#4f5c16" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id})`} />
      <ellipse className={styles.avatarOjo} cx="36" cy="46" rx="5" ry="7" fill="#181712" />
      <ellipse className={styles.avatarOjo} cx="64" cy="46" rx="5" ry="7" fill="#181712" />
      {hablando ? (
        <ellipse cx="50" cy="65" rx="6" ry="5" fill="#181712" />
      ) : (
        <path d="M39 62 Q50 71 61 62" stroke="#181712" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}
