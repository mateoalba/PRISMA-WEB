"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DIMENSIONS } from "@/lib/dimensions";
import { DIMENSION_SPECTRUM } from "@/lib/dimension-spectrum";
import styles from "@/styles/dimensiones-spectrum.module.css";

const ENTRIES = DIMENSIONS.map((d, i) => ({
  ...d,
  numero: i + 1,
  ...DIMENSION_SPECTRUM[i],
}));

const dosDigitos = (n: number) => String(n).padStart(2, "0");
// "Salud mental y apoyo psicosocial" -> "Salud mental" (para la etiqueta vertical)
const primeraParte = (title: string) => title.split(" y ")[0];

export function DimensionesExplorer() {
  const [activa, setActiva] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const espectroRef = useRef<HTMLDivElement>(null);
  const esperaRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Mientras el scroll hacia el espectro está en marcha, el mouse queda
  // "quieto en pantalla" pero el contenido se mueve debajo — eso dispara
  // un mouseenter en otra franja distinta a la elegida. Se ignora el
  // hover durante ese lapso.
  const ignorarHoverRef = useRef(false);

  useEffect(() => {
    rootRef.current?.style.setProperty("--tono", ENTRIES[activa].color);
  }, [activa]);

  function activar(i: number) {
    setActiva(((i % ENTRIES.length) + ENTRIES.length) % ENTRIES.length);
  }

  function onHoverFranja(i: number) {
    if (ignorarHoverRef.current) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 861px)").matches) return;
    if (esperaRef.current) clearTimeout(esperaRef.current);
    esperaRef.current = setTimeout(() => activar(i), 140);
  }

  function cancelarHover() {
    if (esperaRef.current) clearTimeout(esperaRef.current);
  }

  function irYActivar(i: number) {
    activar(i);
    if (esperaRef.current) clearTimeout(esperaRef.current);
    ignorarHoverRef.current = true;
    espectroRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      ignorarHoverRef.current = false;
    }, 900);
  }

  return (
    <div ref={rootRef} className={styles.pagina}>
      <div className={styles.ambiente} aria-hidden="true" />
      <div className={styles.puntos} aria-hidden="true" />

      <div className={styles.contenido}>
        {/* ESPECTRO */}
        <section aria-label="Dimensiones de PRISMA">
          <div className={styles.espectro} id="espectro" ref={espectroRef}>
            {ENTRIES.map((d, i) => (
              <Franja
                key={d.slug}
                entry={d}
                activa={i === activa}
                onHover={() => onHoverFranja(i)}
                onHoverEnd={cancelarHover}
                onActivar={() => activar(i)}
                onFlecha={(dir) => {
                  activar(i + dir);
                  espectroRef.current
                    ?.querySelectorAll("button")
                    [activa + dir]?.focus?.();
                }}
              />
            ))}
          </div>
          <div className={styles.controles}>
            <div className={styles.indicadores} role="group" aria-label="Elegir dimensión">
              {ENTRIES.map((d, i) => (
                <button
                  key={d.slug}
                  type="button"
                  className={`${styles.indicador} ${i === activa ? styles.indicadorActivo : ""}`}
                  aria-label={d.title}
                  aria-current={i === activa}
                  onClick={() => activar(i)}
                />
              ))}
            </div>
            <div className={styles.flechas}>
              <button
                type="button"
                className={styles.flecha}
                aria-label="Dimensión anterior"
                onClick={() => activar(activa - 1)}
              >
                <ArrowIcon dir="left" />
              </button>
              <button
                type="button"
                className={styles.flecha}
                aria-label="Dimensión siguiente"
                onClick={() => activar(activa + 1)}
              >
                <ArrowIcon dir="right" />
              </button>
            </div>
          </div>
        </section>

        {/* MAPA DE CONEXIONES */}
        <MapaConexiones entries={ENTRIES} onSelect={irYActivar} />
      </div>
    </div>
  );
}

type Entry = (typeof ENTRIES)[number];

function Franja({
  entry: d,
  activa,
  onHover,
  onHoverEnd,
  onActivar,
  onFlecha,
}: {
  entry: Entry;
  activa: boolean;
  onHover: () => void;
  onHoverEnd: () => void;
  onActivar: () => void;
  onFlecha: (dir: 1 | -1) => void;
}) {
  return (
    <article
      className={`${styles.franja} ${activa ? styles.franjaActiva : ""}`}
      style={{ ["--c" as string]: d.color, ["--tono-f" as string]: d.color }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
    >
      <div className={styles.franjaFondo}>
        <FranjaImagen slug={d.slug} title={d.title} />
      </div>
      <div className={styles.franjaSombra} />
      <span className={styles.franjaNumFondo} aria-hidden="true">
        {dosDigitos(d.numero)}
      </span>
      <button
        type="button"
        className={styles.franjaBoton}
        aria-expanded={activa}
        aria-label={`Dimensión ${d.numero}: ${d.title}`}
        onClick={onActivar}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            onFlecha(1);
          }
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            onFlecha(-1);
          }
        }}
      >
        <span className={styles.franjaVertical}>
          <b>{dosDigitos(d.numero)}</b>
          <span>{primeraParte(d.title)}</span>
        </span>
      </button>
      <div className={styles.franjaContenido}>
        <div className={styles.eyebrow}>Dimensión {dosDigitos(d.numero)}</div>
        <h2>{d.title}</h2>
        <div className={styles.franjaLema}>{d.short}</div>
        <p>{d.description}</p>
        <div className={styles.temas}>
          {d.temas.map((t) => (
            <span key={t} className={styles.tema}>
              {t}
            </span>
          ))}
        </div>
        <div className={styles.acciones}>
          <Link className={styles.btn} href={`/dimensiones/${d.slug}`} tabIndex={activa ? 0 : -1}>
            Explorar dimensión
            <ArrowIcon dir="right" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function MapaConexiones({
  entries,
  onSelect,
}: {
  entries: Entry[];
  onSelect: (i: number) => void;
}) {
  const [foco, setFoco] = useState(0);

  const pos = useMemo(
    () =>
      entries.map((_, i) => {
        const a = (i / entries.length) * Math.PI * 2 - Math.PI / 2;
        return [50 + Math.cos(a) * 40, 50 + Math.sin(a) * 40] as const;
      }),
    [entries]
  );

  const pares = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((d) => {
      d.relaciona.forEach((slugRel) => {
        const a = d.numero;
        const b = entries.find((e) => e.slug === slugRel)?.numero;
        if (!b) return;
        set.add([Math.min(a, b), Math.max(a, b)].join("-"));
      });
    });
    return [...set].map((p) => p.split("-").map(Number) as [number, number]);
  }, [entries]);

  const relacionadas = useMemo(() => {
    const d = entries[foco];
    const s = new Set<number>();
    d.relaciona.forEach((slugRel) => {
      const rel = entries.find((e) => e.slug === slugRel);
      if (rel) s.add(rel.numero);
    });
    entries.forEach((other) => {
      if (other.relaciona.includes(d.slug)) s.add(other.numero);
    });
    return [...s].sort((a, b) => a - b);
  }, [entries, foco]);

  const activo = entries[foco];

  return (
    <section className={styles.mapaSec} aria-labelledby="titulo-mapa">
      <div className={styles.mapaGrid}>
        <div>
          <div className={styles.eyebrow}>Todo está conectado</div>
          <h2 id="titulo-mapa">
            Cada dimensión <span className={styles.enfasis}>potencia</span> a las demás
          </h2>
          <p className={styles.intro}>
            El bienestar no es la suma de partes aisladas. Elige una dimensión y mira con
            cuáles se conecta.
          </p>
          <div className={styles.detalle} aria-live="polite">
            <div className={styles.eyebrow}>Dimensión {dosDigitos(activo.numero)}</div>
            <h3>{activo.title}</h3>
            <p>Se potencia con:</p>
            <ul>
              {relacionadas.map((n) => (
                <li key={n}>{entries[n - 1].title}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.mapa}>
          <svg viewBox="0 0 100 100" aria-hidden="true">
            {pos.map(([x, y], i) => (
              <line
                key={`radio-${i}`}
                x1="50"
                y1="50"
                x2={x}
                y2={y}
                style={{ stroke: "rgba(174,189,82,.06)" }}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {pares.map(([a, b]) => {
              const on = a === activo.numero || b === activo.numero;
              return (
                <line
                  key={`${a}-${b}`}
                  x1={pos[a - 1][0]}
                  y1={pos[a - 1][1]}
                  x2={pos[b - 1][0]}
                  y2={pos[b - 1][1]}
                  className={`${styles.mapaLinea} ${on ? styles.mapaLineaOn : ""}`}
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
          </svg>
          <div className={styles.centro} />
          {entries.map((d, i) => {
            const on = d.numero === activo.numero;
            const rel = relacionadas.includes(d.numero) && !on;
            return (
              <button
                key={d.slug}
                type="button"
                className={`${styles.nodo} ${on ? styles.nodoOn : ""} ${rel ? styles.nodoRel : ""}`}
                style={{ left: `${pos[i][0]}%`, top: `${pos[i][1]}%`, ["--c" as string]: d.color }}
                aria-label={d.title}
                onMouseEnter={() => setFoco(i)}
                onFocus={() => setFoco(i)}
                onClick={() => {
                  setFoco(i);
                  onSelect(i);
                }}
              >
                <span className={styles.nodoPunto}>{dosDigitos(d.numero)}</span>
                <span className={styles.nodoNombre}>{primeraParte(d.title)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Misma foto que la ficha de la dimensión (web/public/dimensiones/<slug>.jpg).
// Si todavía no existe, se ve el degradado de respaldo con el color propio.
function FranjaImagen({ slug, title }: { slug: string; title: string }) {
  const [missing, setMissing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setMissing(true);
  }, []);

  if (missing) return <div className={styles.ph} />;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- foto dentro de una franja recortada con clip-path
    <img ref={imgRef} src={`/dimensiones/${slug}.jpg`} alt={title} onError={() => setMissing(true)} />
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  const d = dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6";
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
