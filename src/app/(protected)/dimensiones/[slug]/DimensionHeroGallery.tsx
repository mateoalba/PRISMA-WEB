"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/dimension-page.module.css";

// 4 fotos que se turnan con una transición de desaparición (fade). Cada
// una sale de web/public/dimensiones/<slug>-1.jpg ... <slug>-4.jpg — si
// falta alguna, se ve el mismo espacio reservado de siempre.
const FOTOS = [1, 2, 3, 4];
const EXTENSIONES_FOTO = ["jpg", "jpeg"];

export function DimensionHeroGallery({
  slug,
  title,
  numero,
}: {
  slug: string;
  title: string;
  numero: number;
}) {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (pausado) return;
    const id = setInterval(() => setActual((a) => (a + 1) % FOTOS.length), 5000);
    return () => clearInterval(id);
  }, [pausado]);

  return (
    <div
      className={styles.heroGaleria}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div className={styles.hgPuntos} aria-hidden="true" />
      <div className={styles.hgHalo} aria-hidden="true" />
      <div className={styles.hgMarco} role="group" aria-roledescription="carrusel" aria-label={`Fotos de ${title}`}>
        {FOTOS.map((n, i) => (
          <HeroFoto key={n} slug={slug} indice={n} title={title} activo={i === actual} />
        ))}
        <span className={styles.hgSombra} aria-hidden="true" />
      </div>
      <span className={styles.hgNumero} aria-hidden="true">
        {String(numero).padStart(2, "0")}
      </span>
      {FOTOS.length > 1 && (
        <div className={styles.hgPuntitos}>
          {FOTOS.map((n, i) => (
            <button
              key={n}
              type="button"
              className={`${styles.hgPunto} ${i === actual ? styles.hgPuntoActivo : ""}`}
              aria-label={`Ver foto ${i + 1} de ${title}`}
              aria-current={i === actual}
              onClick={() => setActual(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HeroFoto({
  slug,
  indice,
  title,
  activo,
}: {
  slug: string;
  indice: number;
  title: string;
  activo: boolean;
}) {
  // Prueba .jpg y luego .jpeg (algunas fotos se subieron con esa extensión).
  const [intento, setIntento] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const missing = intento >= EXTENSIONES_FOTO.length;

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setIntento((n) => n + 1);
  }, []);

  return (
    <div className={`${styles.hgFoto} ${activo ? styles.hgFotoOn : ""}`} aria-hidden={!activo}>
      {missing ? (
        <div className={styles.ph}>
          <span>Imagen: {title}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- foto dentro de un marco recortado con clip-path
        <img
          key={intento}
          ref={imgRef}
          src={`/dimensiones/${slug}-${indice}.${EXTENSIONES_FOTO[intento]}`}
          alt=""
          onError={() => setIntento((n) => n + 1)}
        />
      )}
    </div>
  );
}
