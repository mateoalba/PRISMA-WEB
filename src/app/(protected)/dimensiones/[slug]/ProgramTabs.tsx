"use client";

import { useMemo, useState } from "react";
import type {
  ProgramCategory,
  ProgramItemRow,
  ProgramItemType,
} from "@/lib/admin/dimension-program-actions";
import { Icon, ETIQUETA } from "./icons";
import styles from "@/styles/dimension-page.module.css";

const TABS: { key: ProgramCategory; label: string; intro: string }[] = [
  {
    key: "entrenamiento",
    label: "Entrenamiento",
    intro: "Prácticas cortas para ganar confianza paso a paso.",
  },
  {
    key: "materiales",
    label: "Materiales",
    intro: "Guías, audios y videos para leer, escuchar o ver cuando quieras.",
  },
  {
    key: "formacion",
    label: "Formación",
    intro: "Cursos y talleres con acompañamiento.",
  },
  {
    key: "actividades",
    label: "Actividades",
    intro: "Retos y encuentros para practicar con otras personas.",
  },
];

const NUEVO_DIAS = 14;

export function ProgramTabs({ program }: { program: Record<ProgramCategory, ProgramItemRow[]> }) {
  const [tab, setTab] = useState<ProgramCategory>("entrenamiento");
  const [filtro, setFiltro] = useState<ProgramItemType | "todo">("todo");
  const active = TABS.find((t) => t.key === tab)!;
  const items = program[tab];

  const tiposPresentes = useMemo(
    () => [...new Set(items.map((i) => i.type))],
    [items]
  );
  const visibles = filtro === "todo" ? items : items.filter((i) => i.type === filtro);

  const hasAnyContent = TABS.some((t) => program[t.key].length > 0);
  if (!hasAnyContent) return null;

  return (
    <section className={styles.bloque} id="programa">
      <div className={styles.seccionCab}>
        <div>
          <div className={styles.eyebrow}>Programa</div>
          <h2 className={styles.seccionTitulo}>
            Programa de la <span className={styles.enfasis}>dimensión</span>
          </h2>
        </div>
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Secciones del programa">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => {
              setTab(t.key);
              setFiltro("todo");
            }}
            className={`${styles.tab} ${tab === t.key ? styles.tabActivo : ""}`}
          >
            {t.label}
            <span className={styles.tabN}>{program[t.key].length}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <p className={styles.panelIntro}>{active.intro}</p>

        {tiposPresentes.length > 1 && (
          <div className={styles.filtros} role="group" aria-label="Filtrar contenido">
            <button
              type="button"
              className={`${styles.filtro} ${filtro === "todo" ? styles.filtroActivo : ""}`}
              onClick={() => setFiltro("todo")}
            >
              Todo
            </button>
            {tiposPresentes.map((t) => (
              <button
                key={t}
                type="button"
                className={`${styles.filtro} ${filtro === t ? styles.filtroActivo : ""}`}
                onClick={() => setFiltro(t)}
              >
                {ETIQUETA[t]}
              </button>
            ))}
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-sm text-foreground/50">Todavía no hay contenido en esta sección.</p>
        ) : (
          <div className={styles.gridCont}>
            {visibles.map((item) => (
              <ProgramCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ProgramCard({ item }: { item: ProgramItemRow }) {
  const [now] = useState(() => Date.now());
  const esNuevo = (now - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24) <= NUEVO_DIAS;

  return (
    <article className={styles.item}>
      <div className={styles.itemMedia}>
        <div className={styles.ph} style={{ height: "100%" }}>
          <Icon name="imagen" size={30} color="#e5ecb8" />
          <span>Imagen: {item.title}</span>
        </div>
        <span className={styles.itemTipo}>
          <Icon name={item.type} size={15} />
          {ETIQUETA[item.type]}
        </span>
        {esNuevo && <span className={styles.itemEstado}>Nuevo</span>}
      </div>
      <div className={styles.itemCuerpo}>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        {item.meta && (
          <div className={styles.meta}>
            <span>
              <Icon name="reloj" size={15} />
              {item.meta}
            </span>
          </div>
        )}
        <CardActions item={item} />
      </div>
    </article>
  );
}

function CardActions({ item }: { item: ProgramItemRow }) {
  const [inscrito, setInscrito] = useState(false);
  const [aceptado, setAceptado] = useState(false);

  switch (item.type) {
    case "pdf":
      if (!item.link) return null;
      return (
        <div className={styles.itemAcciones}>
          <a
            className={`${styles.btn} ${styles.btnP} ${styles.btnSm}`}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="ojo" size={16} />
            Ver
          </a>
          <a className={`${styles.btn} ${styles.btnS} ${styles.btnSm}`} href={item.link} download>
            <Icon name="bajar" size={16} />
            Descargar
          </a>
        </div>
      );
    case "audio":
      if (!item.link) return null;
      return (
        <audio className={styles.itemAudio} controls preload="none" src={item.link} aria-label={`Reproducir ${item.title}`} />
      );
    case "video":
      if (!item.link) return null;
      return (
        <div className={styles.itemAcciones}>
          <a
            className={`${styles.btn} ${styles.btnP} ${styles.btnSm}`}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="play" size={16} />
            Ver video
          </a>
        </div>
      );
    case "curso":
      return (
        <div className={styles.itemAcciones}>
          <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnSm}`}>
            Empezar
          </button>
        </div>
      );
    case "taller":
    case "encuentro":
      return (
        <div className={styles.itemAcciones}>
          <button
            type="button"
            disabled={inscrito}
            onClick={() => setInscrito(true)}
            className={`${styles.btn} ${styles.btnP} ${styles.btnSm}`}
          >
            {inscrito ? "¡Inscrito!" : "Inscribirme"}
          </button>
        </div>
      );
    case "reto":
      return (
        <div className={styles.itemAcciones}>
          <button
            type="button"
            disabled={aceptado}
            onClick={() => setAceptado(true)}
            className={`${styles.btn} ${styles.btnP} ${styles.btnSm}`}
          >
            {aceptado ? "Reto aceptado" : "Aceptar reto"}
          </button>
        </div>
      );
    default:
      return (
        <div className={styles.itemAcciones}>
          <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnSm}`}>
            Empezar
          </button>
        </div>
      );
  }
}
