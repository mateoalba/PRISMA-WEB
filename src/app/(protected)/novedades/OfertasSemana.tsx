"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/novedades.module.css";
import { ImagePlaceholder } from "@/app/(protected)/dimensiones/[slug]/ImagePlaceholder";
import type { Oferta } from "@/lib/novedades/ofertas-actions";

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2M9 2h6" />
    </svg>
  );
}

export function OfertasSemana({ ofertas }: { ofertas: Oferta[] }) {
  const [ahora, setAhora] = useState(() => Date.now());
  const [enCarrito, setEnCarrito] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  function toggleCarrito(id: string) {
    setEnCarrito((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (ofertas.length === 0) return null;

  return (
    <section className={styles.bloque} aria-labelledby="of-titulo">
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow} style={{ color: "var(--oferta)" }}>
            Por tiempo limitado
          </div>
          <h2 className={styles.seccion} id="of-titulo">
            Ofertas de la <span className={styles.enfasis}>semana</span>
          </h2>
          <p>Descuentos especiales para la comunidad PRISMA.</p>
        </div>
      </div>
      <div className={styles.ofertas}>
        {ofertas.map((o) => {
          const ms = Math.max(0, new Date(o.endsAt).getTime() - ahora);
          const d = Math.floor(ms / 864e5);
          const h = Math.floor(ms / 36e5) % 24;
          const m = Math.floor(ms / 6e4) % 60;
          const pct = Math.round((1 - o.price / o.priceBefore) * 100);
          const vendidos = o.totalStock - o.stock;
          const agregado = enCarrito.has(o.id);
          return (
            <article key={o.id} className={styles.oferta}>
              <div className={styles.ofertaImg}>
                <ImagePlaceholder label={o.title} />
                <span className={styles.sello} aria-label={`${pct}% de descuento`}>
                  <span>
                    <b>-{pct}%</b>
                    <small>OFERTA</small>
                  </span>
                </span>
              </div>
              <div className={styles.ofertaCuerpo}>
                <h3>{o.title}</h3>
                <div className={styles.precio}>
                  <b>${o.price}</b>
                  <s>${o.priceBefore}</s>
                </div>
                <span className={styles.relojOferta}>
                  <ClockIcon />
                  Termina en {d} d {h} h {m} min
                </span>
                <div className={styles.barraStock} aria-hidden="true">
                  <i style={{ width: `${(vendidos / o.totalStock) * 100}%` }} />
                </div>
                <span className={styles.stock}>{o.stock <= 5 ? `¡Solo quedan ${o.stock}!` : `Quedan ${o.stock} disponibles`}</span>
                <div>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnP} ${styles.btnSm}`}
                    aria-pressed={agregado}
                    onClick={() => toggleCarrito(o.id)}
                  >
                    {agregado ? "✓ En tu carrito" : "Agregar al carrito"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
