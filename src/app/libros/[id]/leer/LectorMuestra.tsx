"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "@/styles/libros.module.css";
import { ComprarLibro } from "../ComprarLibro";
import { PRECIO_BASE } from "@/lib/membership/pricing";

export function LectorMuestra({
  libroId,
  titulo,
  totalPaginas,
  precio,
  precioCop,
  paginas,
  tieneAcceso,
  diasPrueba,
}: {
  libroId: string;
  titulo: string;
  totalPaginas: number | null;
  precio: number;
  precioCop: number | null;
  paginas: string[];
  tieneAcceso: boolean;
  diasPrueba: number;
}) {
  const [actual, setActual] = useState(1);
  const hojas = useRef<(HTMLDivElement | null)[]>([]);

  // La página "actual" es la que más ocupa la pantalla. Se calcula en cada
  // scroll para que también acierte tras un salto.
  useEffect(() => {
    function calcular() {
      const alto = window.innerHeight;
      let mejor = 1;
      let mayor = -1;
      hojas.current.forEach((h, i) => {
        if (!h) return;
        const r = h.getBoundingClientRect();
        const visible = Math.min(r.bottom, alto) - Math.max(r.top, 0);
        if (visible > mayor) {
          mayor = visible;
          mejor = i + 1;
        }
      });
      setActual(mejor);
    }
    window.addEventListener("scroll", calcular, { passive: true });
    window.addEventListener("resize", calcular);
    return () => {
      window.removeEventListener("scroll", calcular);
      window.removeEventListener("resize", calcular);
    };
  }, []);

  return (
    <div className={styles.lector}>
      <header className={styles.barra}>
        <Link href={`/libros/${libroId}`} className={styles.barraBtn}>
          ← Volver
        </Link>
        <div className={styles.barraTitulo}>
          <b>{titulo}</b>
          <small>
            Muestra · página {actual} de {paginas.length}
            {diasPrueba > 0 ? ` · prueba: ${diasPrueba} ${diasPrueba === 1 ? "día" : "días"}` : ""}
          </small>
        </div>
        {tieneAcceso ? (
          <a href={`/api/libros/${libroId}/descargar`} className={`${styles.barraBtn} ${styles.soloEscritorio}`}>
            Descargar PDF
          </a>
        ) : (
          <Link href={`/libros/${libroId}`} className={`${styles.barraBtn} ${styles.soloEscritorio}`}>
            Comprar
          </Link>
        )}
        <span className={styles.progreso} style={{ width: `${(actual / paginas.length) * 100}%` }} aria-hidden="true" />
      </header>

      <div className={styles.hojas} onContextMenu={(e) => e.preventDefault()}>
        {paginas.map((url, i) => (
          <div
            key={url}
            className={styles.hoja}
            data-n={i + 1}
            ref={(el) => {
              hojas.current[i] = el;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- URL firmada temporal de Supabase Storage */}
            <img src={url} alt={`Página ${i + 1} de ${titulo}`} loading={i < 2 ? "eager" : "lazy"} draggable={false} />
            <span className={styles.numHoja}>{i + 1}</span>
          </div>
        ))}
      </div>

      <section className={styles.fin}>
        <span className={styles.eyebrow}>Fin de la muestra</span>
        <h2>
          {tieneAcceso ? (
            <>
              ¡Esto es solo el <em>comienzo</em>!
            </>
          ) : (
            <>
              ¿Quieres seguir <em>leyendo</em>?
            </>
          )}
        </h2>
        <p>
          {tieneAcceso
            ? `Descarga el libro completo${totalPaginas ? ` (${totalPaginas} páginas)` : ""} y léelo a tu ritmo.`
            : `Esta era una muestra de ${paginas.length} páginas${totalPaginas ? ` de las ${totalPaginas} que tiene el libro` : ""}. Para descargarlo completo, cómpralo o hazte miembro.`}
        </p>
        <div className={styles.panel}>
          <div className={styles.acciones}>
            {tieneAcceso ? (
              <a href={`/api/libros/${libroId}/descargar`} className={`${styles.btn} ${styles.btnP}`}>
                Descargar el libro (PDF)
              </a>
            ) : (
              <>
                <ComprarLibro libroId={libroId} precio={precio} precioCop={precioCop} />
                <Link href="/perfil?tab=membresia" className={styles.enlaceMiembro}>
                  <b>Hazte miembro</b> desde ${PRECIO_BASE}/mes y descarga <b>todos</b> los libros de la biblioteca.
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
