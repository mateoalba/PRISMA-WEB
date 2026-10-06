"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/tienda.module.css";
import { ImagePlaceholder } from "@/app/(protected)/dimensiones/[slug]/ImagePlaceholder";
import type { Product } from "@/lib/tienda/products-actions";
import { dinero } from "@/lib/tienda/format";

export function Vitrina({ productos }: { productos: Product[] }) {
  const [actual, setActual] = useState(0);
  const [saliendo, setSaliendo] = useState<number | null>(null);

  useEffect(() => {
    if (productos.length < 2) return;
    const reducir = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducir) return;

    const id = setInterval(() => {
      setActual((prev) => {
        setSaliendo(prev);
        setTimeout(() => setSaliendo(null), 900);
        return (prev + 1) % productos.length;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [productos.length]);

  if (productos.length === 0) return null;

  return (
    <div className={styles.escaparate} aria-hidden="true">
      <div className={styles.escaparateHalo} />
      <div className={styles.escaparatePedestal} />
      <div className={styles.escaparateAnillo} />
      <div className={styles.vitrina}>
        {productos.map((p, i) => (
          <div
            key={p.id}
            className={`${styles.vitrinaItem} ${i === actual ? styles.vitrinaItemOn : ""} ${i === saliendo ? styles.vitrinaItemSale : ""}`}
          >
            <ImagePlaceholder label={p.title} src={p.imageUrl} />
          </div>
        ))}
        <div className={styles.vitrinaEtq}>
          <b>{productos[actual].title}</b>
          <span>{dinero(productos[actual].price)}</span>
        </div>
      </div>
    </div>
  );
}
