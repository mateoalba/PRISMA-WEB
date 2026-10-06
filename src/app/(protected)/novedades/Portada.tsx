"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/novedades.module.css";
import { ImagePlaceholder } from "@/app/(protected)/dimensiones/[slug]/ImagePlaceholder";
import type { Destacado } from "@/lib/novedades/feed-actions";

const DUR = 7000;

export function Portada({ destacados }: { destacados: Destacado[] }) {
  const [actual, setActual] = useState(0);
  const actualRef = useRef(0);
  const pausaRef = useRef(false);
  const t0Ref = useRef(0);
  const reducirRef = useRef(false);
  const barRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    actualRef.current = actual;
  });

  useEffect(() => {
    reducirRef.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    barRefs.current.forEach((el) => el?.style.setProperty("--p", "0%"));
    t0Ref.current = performance.now();
  }, [actual]);

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      if (!pausaRef.current && !reducirRef.current && destacados.length > 0) {
        const p = Math.min(1, (t - t0Ref.current) / DUR);
        barRefs.current[actualRef.current]?.style.setProperty("--p", `${p * 100}%`);
        if (p >= 1) ir(actualRef.current + 1);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destacados.length]);

  function ir(i: number) {
    const next = ((i % destacados.length) + destacados.length) % destacados.length;
    setActual(next);
  }

  if (destacados.length === 0) {
    return (
      <section className={styles.portada}>
        <div className={styles.portadaTitulo}>
          <div>
            <div className={styles.eyebrow}>Lo nuevo en PRISMA</div>
            <h1>
              Nove<span className={styles.enfasis}>dades</span>
            </h1>
          </div>
          <p>Cursos, libros, productos, ofertas y eventos recién llegados. Vuelve seguido: siempre hay algo nuevo.</p>
        </div>
        <p>Todavía no hay novedades publicadas. Vuelve pronto.</p>
      </section>
    );
  }

  return (
    <section className={styles.portada} aria-labelledby="nov-titulo">
      <div className={styles.portadaTitulo}>
        <div>
          <div className={styles.eyebrow}>Lo nuevo en PRISMA</div>
          <h1 id="nov-titulo">
            Nove<span className={styles.enfasis}>dades</span>
          </h1>
        </div>
        <p>Cursos, libros, productos, ofertas y eventos recién llegados. Vuelve seguido: siempre hay algo nuevo.</p>
      </div>

      <div
        className={styles.escena}
        aria-roledescription="carrusel"
        aria-label="Novedades destacadas"
        onMouseEnter={() => (pausaRef.current = true)}
        onMouseLeave={() => (pausaRef.current = false)}
        onFocus={() => (pausaRef.current = true)}
        onBlur={() => (pausaRef.current = false)}
      >
        {destacados.map((d, i) => (
          <article key={d.id} className={`${styles.slide} ${i === actual ? styles.slideOn : ""}`} aria-hidden={i !== actual}>
            <div className={styles.slideImg}>
              <ImagePlaceholder label={d.titulo} />
            </div>
            <div className={styles.slideVelo} />
            <span className={styles.slideGrande} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className={styles.slideCuerpo}>
              <span className={`${styles.etiqueta} ${/oferta/i.test(d.tipo) ? styles.etiquetaOferta : ""}`} style={{ width: "fit-content" }}>
                {d.tipo}
              </span>
              <h2>{d.titulo}</h2>
              <p>{d.texto}</p>
              {d.meta.length > 0 && (
                <div className={styles.slideMeta}>
                  {d.meta.map((m, k) => (
                    <span key={k}>{m}</span>
                  ))}
                </div>
              )}
              {d.boton && d.url && (
                <div>
                  <a className={`${styles.btn} ${styles.btnP}`} href={d.url} tabIndex={i === actual ? 0 : -1}>
                    {d.boton}
                  </a>
                </div>
              )}
            </div>
          </article>
        ))}
        <div className={styles.historias}>
          {destacados.map((_, i) => (
            <button
              key={i}
              type="button"
              ref={(el) => {
                barRefs.current[i] = el;
              }}
              className={`${styles.historia} ${i < actual ? styles.historiaVista : ""}`}
              aria-label={`Ver destacado ${i + 1}`}
              onClick={() => ir(i)}
            />
          ))}
        </div>
      </div>

      <div className={styles.miniaturas} role="group" aria-label="Elegir destacado">
        {destacados.map((d, i) => (
          <button
            key={d.id}
            type="button"
            className={`${styles.mini} ${i === actual ? styles.miniOn : ""}`}
            aria-current={i === actual}
            onClick={() => ir(i)}
          >
            <span className={styles.miniAvatar} aria-hidden="true">
              {d.titulo.charAt(0).toUpperCase()}
            </span>
            {d.tipo}
          </button>
        ))}
      </div>
    </section>
  );
}
