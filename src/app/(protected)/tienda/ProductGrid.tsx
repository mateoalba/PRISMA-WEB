"use client";

import Link from "next/link";
import { useMemo } from "react";
import styles from "@/styles/tienda.module.css";
import { ImagePlaceholder } from "@/app/(protected)/dimensiones/[slug]/ImagePlaceholder";
import { useFiltro } from "./FiltroContext";
import { useCart } from "./CartContext";
import { dinero, sinAcentos } from "@/lib/tienda/format";
import type { Product, ProductCategory } from "@/lib/tienda/products-actions";

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

function AgregarBoton({ producto }: { producto: Product }) {
  const { quantityOf, changeQuantity } = useCart();
  const n = quantityOf(producto.id);

  if (n > 0) {
    return (
      <div className={styles.cantidad} role="group" aria-label={`Cantidad de ${producto.title}`}>
        <button type="button" aria-label="Quitar uno" onClick={(e) => changeQuantity(producto, -1, e.currentTarget)}>
          <MenosIcon />
        </button>
        <span>{n} en carrito</span>
        <button type="button" aria-label="Agregar uno más" onClick={(e) => changeQuantity(producto, 1, e.currentTarget)}>
          <MasIcon />
        </button>
      </div>
    );
  }

  return (
    <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnAncho}`} onClick={(e) => changeQuantity(producto, 1, e.currentTarget)}>
      <CarritoIcon />
      Agregar al carrito
    </button>
  );
}

// Los libros se leen, compran y descargan desde su propia ficha.
function VerLibro({ libroId }: { libroId: string }) {
  return (
    <Link href={`/libros/${libroId}`} className={`${styles.btn} ${styles.btnP} ${styles.btnAncho}`}>
      Ver libro
    </Link>
  );
}

export function ProductGrid({ productos, categorias }: { productos: Product[]; categorias: ProductCategory[] }) {
  const { categoria, texto, orden, setOrden, openModal } = useFiltro();

  const lista = useMemo(() => {
    let l = productos.filter(
      (p) =>
        (categoria === "todo" || p.categorySlug === categoria) &&
        sinAcentos(`${p.title} ${p.description}`).includes(sinAcentos(texto.trim()))
    );
    if (orden === "menor") l = [...l].sort((a, b) => a.price - b.price);
    if (orden === "mayor") l = [...l].sort((a, b) => b.price - a.price);
    if (orden === "oferta") l = [...l].sort((a, b) => Number(!!b.priceBefore) - Number(!!a.priceBefore));
    return l;
  }, [productos, categoria, texto, orden]);

  const catNombre = categoria === "todo" ? "" : categorias.find((c) => c.slug === categoria)?.name ?? "";

  return (
    <>
      <div className={styles.barraLista}>
        <b aria-live="polite">
          {lista.length} {lista.length === 1 ? "producto" : "productos"}
          {catNombre ? ` en ${catNombre}` : ""}
          {texto ? ` para «${texto}»` : ""}
        </b>
        <label className={styles.orden}>
          Ordenar por
          <select value={orden} onChange={(e) => setOrden(e.target.value as typeof orden)}>
            <option value="rec">Recomendados</option>
            <option value="menor">Precio: menor a mayor</option>
            <option value="mayor">Precio: mayor a menor</option>
            <option value="oferta">Ofertas primero</option>
          </select>
        </label>
      </div>

      {lista.length === 0 ? (
        <div className={styles.sinResultados}>
          <b>No encontramos productos</b>
          Prueba con otra palabra o elige «Todo».
        </div>
      ) : (
        <div className={styles.grilla}>
          {lista.map((p) => {
            const pct = p.priceBefore ? Math.round((1 - p.price / p.priceBefore) * 100) : null;
            return (
              <article key={p.id} className={styles.prod}>
                <button type="button" className={styles.prodImg} onClick={() => openModal(p.id)} aria-label={`Ver detalles de ${p.title}`}>
                  <ImagePlaceholder label={p.title} src={p.imageUrl} />
                  {pct != null ? (
                    <span className={`${styles.insignia} ${styles.insigniaOferta}`}>-{pct}%</span>
                  ) : p.badge ? (
                    <span className={styles.insignia}>{p.badge}</span>
                  ) : null}
                  <span className={styles.prodVer}>Ver detalles</span>
                </button>
                <div className={styles.prodCuerpo}>
                  <h3>{p.title}</h3>
                  <p className={styles.prodDesc}>{p.description}</p>
                  <div className={styles.precio}>
                    <b>{dinero(p.price)}</b>
                    {p.priceBefore && <s aria-label={`Antes ${dinero(p.priceBefore)}`}>{dinero(p.priceBefore)}</s>}
                  </div>
                  <div className={styles.agregar}>
                    {p.libroId ? <VerLibro libroId={p.libroId} /> : <AgregarBoton producto={p} />}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
