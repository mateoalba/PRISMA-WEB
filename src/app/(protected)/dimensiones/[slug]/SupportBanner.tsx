import styles from "@/styles/seguridad-digital.module.css";

function TelefonoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

export function SupportBanner() {
  return (
    <section className={styles.bloque} aria-labelledby="sop-titulo">
      <div className={styles.soporte}>
        <div>
          <div className={styles.eyebrow}>Ayuda directa</div>
          <h2 id="sop-titulo">
            ¿Algo no se ve bien? <span className={styles.enfasis}>Llámanos</span>
          </h2>
          <p>Si recibiste algo sospechoso o crees que fuiste víctima de fraude, te acompañamos paso a paso. Llamar no tiene costo.</p>
          <ol className={styles.pasosAyuda}>
            <li>
              <span className={styles.pasosAyudaNum}>1</span>No respondas ni pagues
            </li>
            <li>
              <span className={styles.pasosAyudaNum}>2</span>Guarda el mensaje o anota el número
            </li>
            <li>
              <span className={styles.pasosAyudaNum}>3</span>Llámanos o llama a tu banco
            </li>
          </ol>
        </div>
        <div className={styles.llamar}>
          {/* TODO: reemplazar por la línea de apoyo real de Penser cuando la definan (mismo número que el botón SOS del encabezado) */}
          <a className={styles.llamarBoton} href="tel:+10000000000" aria-label="Llamar a la línea de apoyo">
            <span>
              <TelefonoIcon />
              Llamar ahora
            </span>
          </a>
          <b>Línea de apoyo PENSER</b>
          <small>Número por confirmar</small>
        </div>
      </div>
    </section>
  );
}
