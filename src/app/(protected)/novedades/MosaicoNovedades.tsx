"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/novedades.module.css";
import { ImagePlaceholder } from "@/app/(protected)/dimensiones/[slug]/ImagePlaceholder";
import type { PiezaMosaico } from "@/lib/novedades/feed-actions";

const NOMBRE_TIPO: Record<string, string> = {
  curso: "Curso",
  libro: "Libro",
  producto: "Producto",
  evento: "Evento",
  taller: "Taller",
  actividad: "Actividad",
  general: "Novedad",
};

const TIPOS_FILTRO: [string, string][] = [
  ["todo", "Todo"],
  ["curso", "Cursos"],
  ["libro", "Libros"],
  ["producto", "Productos"],
  ["evento", "Eventos"],
  ["taller", "Talleres"],
  ["actividad", "Actividades"],
];

const PALETA = ["#5e6926", "#6b4a2a", "#3f5a52", "#8a983a", "#5a3f5a"];

function colorFromId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PALETA[hash % PALETA.length];
}

function tipoFiltro(p: PiezaMosaico) {
  return p.tipo === "dato" ? "curso" : p.tipo;
}

function tamClase(tam: PiezaMosaico["tam"]) {
  if (tam === "grande") return styles.piezaGrande;
  if (tam === "ancha") return styles.piezaAncha;
  if (tam === "alta") return styles.piezaAlta;
  return "";
}

export function MosaicoNovedades({ piezas }: { piezas: PiezaMosaico[] }) {
  const [filtro, setFiltro] = useState("todo");

  const conteo = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of piezas) m.set(tipoFiltro(p), (m.get(tipoFiltro(p)) ?? 0) + 1);
    return m;
  }, [piezas]);

  const visibles = filtro === "todo" ? piezas : piezas.filter((p) => tipoFiltro(p) === filtro);

  return (
    <section className={styles.bloque} aria-labelledby="todo-titulo">
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Explora</div>
          <h2 className={styles.seccion} id="todo-titulo">
            Todo lo <span className={styles.enfasis}>nuevo</span>
          </h2>
        </div>
        <div className={styles.filtros} role="group" aria-label="Filtrar novedades">
          {TIPOS_FILTRO.map(([v, t]) => (
            <button
              key={v}
              type="button"
              className={`${styles.filtro} ${v === filtro ? styles.filtroOn : ""}`}
              aria-pressed={v === filtro}
              onClick={() => setFiltro(v)}
            >
              {t}
              <small>{v === "todo" ? piezas.length : conteo.get(v) ?? 0}</small>
            </button>
          ))}
        </div>
      </div>

      {piezas.length === 0 ? (
        <p className={styles.vacioFiltro} style={{ padding: 0 }}>
          Todavía no hay novedades publicadas. Vuelve pronto.
        </p>
      ) : (
        <div className={styles.mosaico} aria-live="polite">
          {visibles.map((p) => {
            if (p.tipo === "dato") {
              const contenido = (
                <>
                  <span className={styles.num}>{p.num}</span>
                  <div>
                    <h3>{p.titulo}</h3>
                    <p>{p.texto}</p>
                    <div className={styles.piezaPie}>
                      {p.pie} <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </>
              );
              return p.url ? (
                <a key={p.id} href={p.url} className={`${styles.pieza} ${styles.piezaTexto}`}>
                  {contenido}
                </a>
              ) : (
                <div key={p.id} className={`${styles.pieza} ${styles.piezaTexto}`}>
                  {contenido}
                </div>
              );
            }

            if (p.tipo === "libro") {
              const color = colorFromId(p.id);
              return (
                <a key={p.id} href={p.url ?? "#"} className={`${styles.pieza} ${styles.piezaLibro}`}>
                  <span className={styles.etiqueta} style={{ position: "absolute", left: 16, top: 16, zIndex: 2 }}>
                    Libro
                  </span>
                  <div className={styles.piezaLibroDentro}>
                    <div className={styles.libro3d} style={{ width: 110, height: 152 }}>
                      <div className={styles.libroTapa} style={{ background: `linear-gradient(160deg, ${color}, #15170c)`, fontSize: 14 }}>
                        {p.titulo}
                      </div>
                      <div className={styles.libroLomo} style={{ background: color }} />
                    </div>
                  </div>
                  <div className={styles.piezaCuerpo}>
                    <h3>{p.titulo}</h3>
                    <p>{p.texto}</p>
                    <div className={styles.piezaPie}>
                      {p.pie} <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </a>
              );
            }

            return (
              <a key={p.id} href={p.url ?? "#"} className={`${styles.pieza} ${tamClase(p.tam)} ${p.nuevo ? styles.piezaNueva : ""}`}>
                <ImagePlaceholder label={p.titulo} />
                <div className={styles.piezaVelo} />
                <span className={`${styles.etiqueta} ${styles.piezaTag}`}>{NOMBRE_TIPO[p.tipo] ?? p.tipo}</span>
                <div className={styles.piezaCuerpo}>
                  <h3>{p.titulo}</h3>
                  <p>{p.texto}</p>
                  {p.pie && (
                    <div className={styles.piezaPie}>
                      {p.pie} <span aria-hidden="true">→</span>
                    </div>
                  )}
                </div>
              </a>
            );
          })}
          {visibles.length === 0 && <p className={styles.vacioFiltro}>Pronto habrá novedades en esta categoría.</p>}
        </div>
      )}
    </section>
  );
}
