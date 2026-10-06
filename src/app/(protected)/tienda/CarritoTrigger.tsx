"use client";

import { useEffect } from "react";
import styles from "@/styles/tienda.module.css";
import { useCart } from "./CartContext";

function CarritoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4h2l2.5 11h11L21 7H7" />
      <circle cx="9.5" cy="19.5" r="1.5" />
      <circle cx="17.5" cy="19.5" r="1.5" />
    </svg>
  );
}

export function CarritoTrigger() {
  const { totalCount, openPanel, cartButtonRef, bumpKey } = useCart();

  // Reinicia la animación "salta" manipulando el DOM directamente (no es
  // estado de React: es sincronizar con la animación CSS externa).
  useEffect(() => {
    if (bumpKey === 0) return;
    const el = cartButtonRef.current;
    if (!el) return;
    el.classList.remove(styles.abrirCarritoSalta);
    void el.offsetWidth;
    el.classList.add(styles.abrirCarritoSalta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bumpKey]);

  return (
    <button
      ref={cartButtonRef}
      type="button"
      className={styles.abrirCarrito}
      aria-controls="panel-carrito"
      aria-expanded={false}
      aria-label={`Mi carrito, ${totalCount} productos`}
      onClick={openPanel}
    >
      <CarritoIcon />
      <span>Mi carrito</span>
      <span className={styles.contador} aria-hidden="true">
        {totalCount}
      </span>
    </button>
  );
}
