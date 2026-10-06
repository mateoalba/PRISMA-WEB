import Link from "next/link";
import styles from "@/styles/novedades.module.css";
import type { Libro } from "@/lib/novedades/libros-actions";

const PALETA = ["#5e6926", "#6b4a2a", "#3f5a52", "#8a983a", "#5a3f5a"];

function colorFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PALETA[hash % PALETA.length];
}

export function EstanteriaLibros({ libros, hasMembership }: { libros: Libro[]; hasMembership: boolean }) {
  return (
    <section className={styles.bloque} aria-labelledby="lib-titulo">
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Recién llegados a la biblioteca</div>
          <h2 className={styles.seccion} id="lib-titulo">
            Nuevos <span className={styles.enfasis}>libros</span>
          </h2>
          <p>En letra grande, audiolibro o digital. Toca un libro para ver su ficha, leer una muestra o descargarlo.</p>
        </div>
      </div>
      {libros.length === 0 ? (
        <p>Todavía no hay libros nuevos en el catálogo. Vuelve pronto.</p>
      ) : (
        <>
          <div className={styles.estante}>
            {libros.map((l) => {
              const color = colorFromId(l.id);
              const tapaStyle = l.imageUrl
                ? { backgroundImage: `url(${l.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { background: `linear-gradient(160deg, ${color}, #15170c)` };
              return (
                <Link key={l.id} href={`/libros/${l.id}`} className={styles.libro} style={{ textDecoration: "none", color: "inherit" }} aria-label={`Ver el libro ${l.title}`}>
                  <div className={styles.libro3d}>
                    <span className={styles.libroTapa} style={tapaStyle}>
                      {!l.imageUrl && (
                        <>
                          {l.title}
                          <small className={styles.libroTapaAutor}>{l.author}</small>
                        </>
                      )}
                    </span>
                    <span className={styles.libroLomo} style={{ background: color }}>
                      {l.title.slice(0, 24)}
                    </span>
                    <span className={styles.libroSombra} />
                  </div>
                  <span className={styles.libroInfo}>
                    <b>{l.title}</b>
                    <small>{l.author}</small>
                    <span className={styles.libroFormato}>{l.format}</span>
                    {hasMembership ? (
                      <span className={styles.libroPrecio} data-incluido="true">
                        Incluido con tu membresía
                      </span>
                    ) : (
                      <>
                        <span className={styles.libroPrecio}>${l.price.toFixed(2)}</span>
                        <small className={styles.libroAviso}>Con membresía es gratis — solo inicia sesión, sin costo.</small>
                      </>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className={styles.repisa} aria-hidden="true" />
        </>
      )}
    </section>
  );
}
