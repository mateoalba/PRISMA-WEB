"use client";

import Link from "next/link";
import { useEffect } from "react";
import styles from "@/styles/tienda.module.css";
import { ImagePlaceholder } from "@/app/(protected)/dimensiones/[slug]/ImagePlaceholder";
import { useFiltro } from "./FiltroContext";
import { useCart } from "./CartContext";
import { dinero } from "@/lib/tienda/format";
import { ENVIO_GRATIS_DESDE } from "@/lib/tienda/shipping";
import type { Product, ProductCategory } from "@/lib/tienda/products-actions";

function CerrarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function MasIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function MenosIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}
function CarritoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4h2l2.5 11h11L21 7H7" />
      <circle cx="9.5" cy="19.5" r="1.5" />
      <circle cx="17.5" cy="19.5" r="1.5" />
    </svg>
  );
}

export function QuickViewModal({ productos, categorias }: { productos: Product[]; categorias: ProductCategory[] }) {
  const { modalProductId, closeModal } = useFiltro();
  const { quantityOf, changeQuantity, openPanel } = useCart();

  const producto = productos.find((p) => p.id === modalProductId) ?? null;

  useEffect(() => {
    if (!producto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [producto, closeModal]);

  if (!producto) return null;

  const n = quantityOf(producto.id);
  const categoria = categorias.find((c) => c.slug === producto.categorySlug);

  return (
    <div className={styles.modalVelo} onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <button type="button" className={styles.cerrar} onClick={closeModal} aria-label="Cerrar">
          <CerrarIcon />
        </button>
        <div className={styles.modalGrid}>
          <div className={styles.modalImg}>
            <ImagePlaceholder label={producto.title} src={producto.imageUrl} />
          </div>
          <div className={styles.modalCuerpo}>
            {categoria && <div className={styles.eyebrow}>{categoria.name}</div>}
            <h2 id="modal-titulo">{producto.title}</h2>
            <p>{producto.description}</p>
            {producto.details.length > 0 && (
              <ul className={styles.listaOk}>
                {producto.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
            <div className={styles.precio}>
              <b style={{ fontSize: 40 }}>{dinero(producto.price)}</b>
              {producto.priceBefore && <s>{dinero(producto.priceBefore)}</s>}
            </div>
            <span className={styles.modalEnvio}>
              {producto.price >= ENVIO_GRATIS_DESDE ? "Envío gratis" : `Envío gratis desde ${dinero(ENVIO_GRATIS_DESDE)}`} · Llega en 2 a 4 días
            </span>
            <div style={{ marginTop: 8 }}>
              {producto.libroId ? (
                <Link href={`/libros/${producto.libroId}`} className={`${styles.btn} ${styles.btnP} ${styles.btnAncho}`} onClick={closeModal}>
                  Ver libro
                </Link>
              ) : n > 0 ? (
                <div className={styles.cantidad} role="group" aria-label={`Cantidad de ${producto.title}`}>
                  <button type="button" aria-label="Quitar uno" onClick={(e) => changeQuantity(producto, -1, e.currentTarget)}>
                    <MenosIcon />
                  </button>
                  <span>{n} en carrito</span>
                  <button type="button" aria-label="Agregar uno más" onClick={(e) => changeQuantity(producto, 1, e.currentTarget)}>
                    <MasIcon />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnP} ${styles.btnAncho}`}
                  onClick={(e) => changeQuantity(producto, 1, e.currentTarget)}
                >
                  <CarritoIcon />
                  Agregar al carrito
                </button>
              )}
            </div>
            {n > 0 && !producto.libroId && (
              <button
                type="button"
                className={`${styles.btn} ${styles.btnS} ${styles.btnAncho}`}
                onClick={() => {
                  closeModal();
                  openPanel();
                }}
              >
                Ver mi carrito
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
