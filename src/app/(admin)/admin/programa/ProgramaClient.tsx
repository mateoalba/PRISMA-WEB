"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin.module.css";
import { Drawer } from "../Drawer";
import { Chip, Tabs, EditButton, DeleteButton, EmptyState, PlusIcon } from "../SharedUi";
import { useAdminUi } from "../AdminUiContext";
import { createProgramItem, updateProgramItem, deleteProgramItem, type ProgramCategory, type ProgramItemRow, type ProgramItemType } from "@/lib/admin/dimension-program-actions";
import { PROGRAM_ITEM_TYPES } from "@/lib/admin/dimension-program-types";
import { TipoSelector } from "../TipoSelector";
import { dimensionAdminColor } from "@/lib/admin/dimension-admin-colors";
import type { Dimension } from "@/lib/dimensions";

const SECCIONES: { key: ProgramCategory; label: string }[] = [
  { key: "entrenamiento", label: "Entrenamiento" },
  { key: "materiales", label: "Materiales" },
  { key: "formacion", label: "Formación" },
  { key: "actividades", label: "Actividades" },
];

type FormState = { id?: string; title: string; meta: string; description: string; type: ProgramItemType; link: string; category: ProgramCategory };

function IcoRecurso() {
  return (
    <svg className={styles.ico} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h16v16H4z" />
      <path d="M4 9h16M9 9v11" />
    </svg>
  );
}

export function ProgramaClient({
  dimension,
  allDimensions,
  initialProgram,
  initialTab,
  mapa,
}: {
  dimension: Dimension;
  allDimensions: Dimension[];
  initialProgram: Record<ProgramCategory, ProgramItemRow[]>;
  initialTab: ProgramCategory;
  mapa: Record<string, Record<ProgramCategory, number>>;
}) {
  const router = useRouter();
  const { confirmDelete, runDeferred, notify } = useAdminUi();
  const [program, setProgram] = useState(initialProgram);
  const [tab, setTab] = useState<ProgramCategory>(initialTab);
  const [drawer, setDrawer] = useState<FormState | null>(null);

  function irACelda(slug: string, categoria: ProgramCategory) {
    if (slug === dimension.slug) {
      setTab(categoria);
    } else {
      router.push(`/admin/programa?slug=${slug}&tab=${categoria}`);
    }
  }

  const color = dimensionAdminColor(dimension.slug);
  const items = program[tab];

  function abrirNuevo() {
    setDrawer({ title: "", meta: "", description: "", type: "guia", link: "", category: tab });
  }
  function abrirEditar(item: ProgramItemRow) {
    setDrawer({ id: item.id, title: item.title, meta: item.meta ?? "", description: item.description, type: item.type, link: item.link ?? "", category: item.category });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!drawer) return;
    const fd = new FormData();
    if (drawer.id) fd.set("id", drawer.id);
    fd.set("slug", dimension.slug);
    fd.set("category", drawer.category);
    fd.set("title", drawer.title);
    fd.set("meta", drawer.meta);
    fd.set("description", drawer.description);
    fd.set("type", drawer.type);
    fd.set("link", drawer.link);

    if (drawer.id) {
      const updated: ProgramItemRow = { id: drawer.id, slug: dimension.slug, category: drawer.category, title: drawer.title, meta: drawer.meta || null, description: drawer.description, type: drawer.type, link: drawer.link || null, position: 0, created_at: new Date().toISOString() };
      setProgram((prev) => ({ ...prev, [drawer.category]: prev[drawer.category].map((i) => (i.id === drawer.id ? updated : i)) }));
      await updateProgramItem(fd);
      notify("Cambios guardados");
    } else {
      await createProgramItem(fd);
      router.refresh();
      notify("Elemento agregado");
    }
    setDrawer(null);
  }

  async function eliminar(item: ProgramItemRow) {
    const ok = await confirmDelete({ title: "¿Eliminar este elemento del programa?", message: `Vas a eliminar "${item.title}". Podrás deshacerlo durante unos segundos.` });
    if (!ok) return;
    setProgram((prev) => ({ ...prev, [item.category]: prev[item.category].filter((i) => i.id !== item.id) }));
    const fd = new FormData();
    fd.set("id", item.id);
    runDeferred(() => deleteProgramItem(fd), {
      message: `Eliminado: ${item.title}`,
      undo: () => setProgram((prev) => ({ ...prev, [item.category]: [...prev[item.category], item] })),
    });
  }

  return (
    <div>
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Programa</div>
          <h1>{dimension.title}</h1>
          <p>Entrenamiento, materiales, formación y actividades que ve cada persona dentro de esta dimensión.</p>
        </div>
        <div className={styles.cabAcc}>
          <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={abrirNuevo}>
            <PlusIcon />
            Agregar a {SECCIONES.find((s) => s.key === tab)?.label}
          </button>
        </div>
      </div>

      <div className={styles.panel} style={{ marginBottom: 22 }}>
        <div className={styles.panelT}>
          <h2>Mapa del programa</h2>
          <small>Toca un cuadro para ir directo · rojo = vacío</small>
        </div>
        <div className={styles.mapaWrap}>
          <table className={styles.mapaTabla}>
            <thead>
              <tr>
                <th />
                {SECCIONES.map((s) => (
                  <th key={s.key}>{s.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allDimensions.map((d) => {
                const dColor = dimensionAdminColor(d.slug);
                return (
                  <tr key={d.slug}>
                    <td>
                      <span className={styles.mapaNombre}>
                        <span className={styles.mapaPunto} style={{ ["--c" as string]: dColor }} />
                        {d.title}
                      </span>
                    </td>
                    {SECCIONES.map((s) => {
                      const n = mapa[d.slug]?.[s.key] ?? 0;
                      const activa = d.slug === dimension.slug && s.key === tab;
                      return (
                        <td key={s.key}>
                          <button
                            type="button"
                            className={`${styles.mapaCelda} ${n === 0 ? styles.mapaCeldaVacia : ""} ${activa ? styles.mapaCeldaActiva : ""}`}
                            style={{ ["--c" as string]: dColor }}
                            onClick={() => irACelda(d.slug, s.key)}
                          >
                            {n}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.chips} style={{ marginBottom: 20 }}>
        {allDimensions.map((d) => (
          <Chip
            key={d.slug}
            active={d.slug === dimension.slug}
            onClick={() => router.push(`/admin/programa?slug=${d.slug}`)}
            color={dimensionAdminColor(d.slug)}
          >
            {d.title}
          </Chip>
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <Tabs tabs={SECCIONES.map((s) => ({ value: s.key, label: s.label, count: program[s.key].length }))} active={tab} onChange={setTab} />
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={`${dimension.title} no tiene ${SECCIONES.find((s) => s.key === tab)?.label.toLowerCase()} todavía`}
          text="Agrega el primero y aparecerá en la página de la dimensión."
          actionLabel="Agregar el primero"
          onAction={abrirNuevo}
        />
      ) : (
        <div className={styles.filas}>
          {items.map((item) => (
            <div key={item.id} className={styles.fila}>
              <span className={styles.filaV} style={{ ["--c" as string]: color, background: `${color}22`, color }}>
                <IcoRecurso />
              </span>
              <div className={styles.filaCuerpo}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className={styles.filaMeta}>
                  {item.meta && <span>⏱ {item.meta}</span>}
                  <span>{PROGRAM_ITEM_TYPES.find((t) => t.value === item.type)?.label}</span>
                  {item.link && <span>🔗 Con enlace</span>}
                </div>
              </div>
              <div className={styles.filaAcc}>
                <EditButton onClick={() => abrirEditar(item)} />
                <DeleteButton onClick={() => eliminar(item)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={!!drawer}
        eyebrow={drawer?.id ? "Editar" : "Nuevo"}
        title={drawer?.id ? "Editar elemento" : "Nuevo elemento del programa"}
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button type="submit" form="programa-form" className={`${styles.btn} ${styles.btnP}`}>
              Guardar
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={() => setDrawer(null)}>
              Cancelar
            </button>
          </>
        }
      >
        {drawer && (
          <form id="programa-form" onSubmit={guardar} className={styles.form}>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="pr-titulo">Título</label>
              <input id="pr-titulo" required value={drawer.title} onChange={(e) => setDrawer({ ...drawer, title: e.target.value })} placeholder="Ej: Videollamadas sin miedo" />
            </div>
            <div className={styles.campo}>
              <label htmlFor="pr-meta">Duración / meta</label>
              <input id="pr-meta" value={drawer.meta} onChange={(e) => setDrawer({ ...drawer, meta: e.target.value })} placeholder="Ej: 15 min, 4 semanas" />
            </div>
            <div className={styles.campo}>
              <label htmlFor="pr-seccion">Sección</label>
              <select id="pr-seccion" value={drawer.category} onChange={(e) => setDrawer({ ...drawer, category: e.target.value as ProgramCategory })}>
                {SECCIONES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="pr-desc">Descripción</label>
              <textarea id="pr-desc" required value={drawer.description} onChange={(e) => setDrawer({ ...drawer, description: e.target.value })} placeholder="Qué va a aprender o hacer la persona." />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label>Tipo</label>
              <TipoSelector name="pr-tipo" value={drawer.type} onChange={(type) => setDrawer({ ...drawer, type })} />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="pr-link">Enlace (opcional)</label>
              <input id="pr-link" type="url" value={drawer.link} onChange={(e) => setDrawer({ ...drawer, link: e.target.value })} placeholder="https://…" />
              <small>PDF, audio, video o formulario de inscripción.</small>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
