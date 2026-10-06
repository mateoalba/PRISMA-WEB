"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/auth-screen.module.css";

const FACET_COUNT = 10;
const FACETS = Array.from({ length: FACET_COUNT }, (_, i) => i);
// Duplicada para que la animación (translateX 0 → -50%) haga un loop sin cortes.
const FACETS_LOOP = [...FACETS, ...FACETS];

function Faceta({ index }: { index: number }) {
  const [broken, setBroken] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const src = `/images/login/foto-${(index % FACET_COUNT) + 1}.jpg`;

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, []);

  return (
    <figure
      className={styles.faceta}
      style={
        broken
          ? {
              filter: `hue-rotate(${((index * 11) % 40) - 20}deg) saturate(${1 + (((index % 3) - 1) * 0.12)})`,
            }
          : undefined
      }
    >
      {!broken && (
        // eslint-disable-next-line @next/next/no-img-element -- recorte con clip-path, sin next/image
        <img ref={imgRef} src={src} alt="" onError={() => setBroken(true)} />
      )}
    </figure>
  );
}

export function AuthGallery() {
  return (
    <div className={styles.galeria} aria-hidden="true">
      <div className={styles.galeriaPista}>
        <div className={styles.galeriaMover}>
          {FACETS_LOOP.map((i, idx) => (
            <Faceta key={idx} index={i} />
          ))}
        </div>
      </div>
      <div className={`${styles.fusion} ${styles.fusionTono}`} />
      <div className={`${styles.fusion} ${styles.fusionLuz}`} />
      <div className={`${styles.fusion} ${styles.fusionArriba}`} />
      <div className={`${styles.fusion} ${styles.fusionAbajo}`} />
      <div className={`${styles.fusion} ${styles.fusionIzq}`} />
      <div className={`${styles.fusion} ${styles.fusionDer}`} />
      <svg className={styles.esquirlas} viewBox="0 0 820 960" preserveAspectRatio="none">
        <polygon points="470,192 560,134 520,326" fill="#c7d873" opacity=".28" />
        <polygon points="120,595 210,672 140,730" fill="#aebd52" opacity=".22" />
        <polygon points="600,557 650,480 660,634" fill="#f5f1e6" opacity=".12" />
        <line x1="0" y1="288" x2="820" y2="442" stroke="#c7d873" strokeWidth="1" opacity=".35" />
        <line x1="0" y1="691" x2="820" y2="518" stroke="#f5f1e6" strokeWidth="1" opacity=".14" />
      </svg>
    </div>
  );
}
