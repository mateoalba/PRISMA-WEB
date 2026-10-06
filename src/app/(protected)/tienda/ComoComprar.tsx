import styles from "@/styles/tienda.module.css";

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

const PASOS = [
  { n: 1, titulo: "Elige tu producto", texto: "Toca «Agregar al carrito» en lo que te guste." },
  { n: 2, titulo: "Revisa tu carrito", texto: "Arriba a la derecha verás todo lo que elegiste y el total." },
  { n: 3, titulo: "Paga con seguridad", texto: "Con tarjeta, transferencia o al recibir tu pedido." },
];

export function ComoComprar() {
  return (
    <section className={styles.bloque} aria-labelledby="como-titulo">
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div className={styles.eyebrow}>Muy fácil</div>
        <h2 className={styles.seccion} id="como-titulo">
          Comprar en <span className={styles.enfasis}>3 pasos</span>
        </h2>
      </div>
      <ol className={styles.pasos}>
        {PASOS.map((p) => (
          <li key={p.n} className={styles.paso}>
            <span className={styles.pasoNum}>{p.n}</span>
            <div>
              <b>{p.titulo}</b>
              <span>{p.texto}</span>
            </div>
          </li>
        ))}
      </ol>
      <div className={styles.ayuda}>
        <span>¿Prefieres comprar por teléfono? Te ayudamos:</span>
        <b>Número por confirmar</b>
        {/* TODO: reemplazar por la línea de apoyo real de Penser cuando la definan (mismo número que el botón SOS del encabezado) */}
        <a className={`${styles.btn} ${styles.btnS}`} href="tel:+10000000000">
          <PhoneIcon />
          Llamar
        </a>
      </div>
    </section>
  );
}
