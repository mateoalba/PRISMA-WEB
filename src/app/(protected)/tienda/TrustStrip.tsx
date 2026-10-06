import styles from "@/styles/tienda.module.css";
import { ENVIO_GRATIS_DESDE } from "@/lib/tienda/shipping";

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  );
}
function ReturnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 3-6.3L4 8" />
      <path d="M4 3v5h5" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  );
}

const CONFIANZA = [
  { titulo: "Pago 100% seguro", sub: "Tarjeta, transferencia o al recibir", Icono: ShieldIcon },
  { titulo: "Envío a tu puerta", sub: `Gratis desde $${ENVIO_GRATIS_DESDE}`, Icono: TruckIcon },
  { titulo: "Devolución fácil", sub: "Tienes 30 días para cambiarlo", Icono: ReturnIcon },
  { titulo: "Ayuda por teléfono", sub: "Te acompañamos en tu compra", Icono: PhoneIcon },
];

export function TrustStrip() {
  return (
    <div className={styles.confianza}>
      {CONFIANZA.map(({ titulo, sub, Icono }) => (
        <div key={titulo} className={styles.conf}>
          <span className={styles.confIco}>
            <Icono />
          </span>
          <div>
            <b>{titulo}</b>
            <span>{sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
