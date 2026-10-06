"use client";

import { useEffect } from "react";
import styles from "@/styles/tienda.module.css";
import { ImagePlaceholder } from "@/app/(protected)/dimensiones/[slug]/ImagePlaceholder";
import { useCart } from "./CartContext";
import { dinero } from "@/lib/tienda/format";
import { ENVIO_GRATIS_DESDE, COSTO_ENVIO } from "@/lib/tienda/shipping";

function CerrarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function MasIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function MenosIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}
function CarritoVacioIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4h2l2.5 11h11L21 7H7" />
      <circle cx="9.5" cy="19.5" r="1.5" />
      <circle cx="17.5" cy="19.5" r="1.5" />
    </svg>
  );
}

export function CartPanel() {
  const { lines, changeQuantity, remove, subtotal, savings, panelOpen, closePanel } = useCart();

  useEffect(() => {
    if (!panelOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closePanel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panelOpen, closePanel]);

  const envio = lines.length === 0 ? 0 : subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
  const falta = Math.max(0, ENVIO_GRATIS_DESDE - subtotal);

  return (
    <>
      <div className={`${styles.velo} ${panelOpen ? styles.veloOn : ""}`} onClick={closePanel} aria-hidden="true" />
      <aside
        className={`${styles.panel} ${panelOpen ? styles.panelOn : ""}`}
        id="panel-carrito"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-titulo"
      >
        <div className={styles.panelCab}>
          <h2 id="panel-titulo">Mi carrito</h2>
          <button type="button" className={styles.cerrar} style={{ position: "static" }} onClick={closePanel} aria-label="Cerrar carrito">
            <CerrarIcon />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className={styles.panelVacio}>
            <div>
              <CarritoVacioIcon />
              <b>Tu carrito está vacío</b>
              Agrega productos y aparecerán aquí.
            </div>
          </div>
        ) : (
          <>
            <div className={styles.panelItems}>
              {lines.map(({ product, quantity }) => (
                <div key={product.id} className={styles.item}>
                  <div className={styles.itemImg}>
                    <ImagePlaceholder label={product.title} src={product.imageUrl} />
                  </div>
                  <div>
                    <b>{product.title}</b>
                    <div className={styles.itemFila}>
                      <div className={styles.cantidad} role="group" aria-label="Cantidad">
                        <button type="button" aria-label="Quitar uno" onClick={() => changeQuantity(product, -1)}>
                          <MenosIcon />
                        </button>
                        <span>{quantity}</span>
                        <button type="button" aria-label="Agregar uno" onClick={() => changeQuantity(product, 1)}>
                          <MasIcon />
                        </button>
                      </div>
                      <span className={styles.itemPrecio}>{dinero(product.price * quantity)}</span>
                    </div>
                    <button type="button" className={styles.quitar} onClick={() => remove(product.id)}>
                      Quitar del carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.panelPie}>
              <span className={styles.envioGratis}>{falta > 0 ? `Te faltan ${dinero(falta)} para el envío gratis` : "¡Tienes envío gratis!"}</span>
              <div className={styles.envioBarra} aria-hidden="true">
                <i style={{ width: `${Math.min(100, (subtotal / ENVIO_GRATIS_DESDE) * 100)}%` }} />
              </div>
              <div className={styles.linea}>
                <span>Productos</span>
                <span>{dinero(subtotal)}</span>
              </div>
              {savings > 0 && (
                <div className={styles.linea} style={{ color: "var(--oferta)" }}>
                  <span>Ahorras</span>
                  <span>-{dinero(savings)}</span>
                </div>
              )}
              <div className={styles.linea}>
                <span>Envío</span>
                <span>{envio ? dinero(envio) : "Gratis"}</span>
              </div>
              <div className={`${styles.linea} ${styles.lineaTotal}`}>
                <span>Total a pagar</span>
                <b>{dinero(subtotal + envio)}</b>
              </div>
              <a className={`${styles.btn} ${styles.btnP} ${styles.btnAncho}`} href="/tienda/pagar">
                Continuar con el pago
              </a>
              <button type="button" className={`${styles.btn} ${styles.btnS} ${styles.btnAncho}`} onClick={closePanel}>
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
