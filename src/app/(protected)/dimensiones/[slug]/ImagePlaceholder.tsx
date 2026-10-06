import styles from "@/styles/conexion-social.module.css";

// Si no hay foto real (círculos, proyectos, eventos…) se muestra este
// espacio reservado en vez de inventar una imagen. Cuando el registro sí
// trae una URL (p. ej. la portada de un libro en la tienda) se muestra
// completa, sin recortar.
export function ImagePlaceholder({ label, src }: { label: string; src?: string | null }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- URL externa de Supabase Storage, tamaño variable
      <img
        src={src}
        alt={label}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", background: "#1b1e0f" }}
      />
    );
  }
  return (
    <div className={styles.ph} role="img" aria-label={`Espacio para imagen: ${label}`}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <circle cx="9" cy="10" r="2" />
        <path d="M21 16l-5-5-9 9" />
      </svg>
      <span>Imagen: {label}</span>
    </div>
  );
}
