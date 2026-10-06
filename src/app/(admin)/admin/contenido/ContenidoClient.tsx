"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/admin.module.css";
import { Drawer } from "../Drawer";
import { Chip, DeleteButton, EmptyState, PlusIcon } from "../SharedUi";
import { useAdminUi } from "../AdminUiContext";
import { createContentItem, togglePublished, deleteContentItem, type ContentFormState } from "@/lib/admin/content-actions";
import { DIMENSIONS } from "@/lib/dimensions";
import type { AggregatedItem, AggregatedTipo } from "@/lib/admin/aggregated-content";

const initialState: ContentFormState = { error: null };

function IcoContenido() {
  return (
    <svg className={styles.ico} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M4 8h16M9 13h6M9 17h6" />
    </svg>
  );
}

export function ContenidoClient({ initialItems }: { initialItems: AggregatedItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmDelete, runDeferred, notify } = useAdminUi();
  const [items, setItems] = useState(initialItems);
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState<AggregatedTipo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(searchParams.get("crear") === "1");
  const [state, formAction] = useActionState(createContentItem, initialState);
  const enviado = useRef(false);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    // Reacciona al resultado real de la Server Action (useActionState) tras
    // un envío genuino — no es estado derivado, es sincronizar con la
    // respuesta de un sistema externo.
    if (!enviado.current) return;
    enviado.current = false;
    if (state.error === null) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setDrawerOpen(false);
      notify("Contenido publicado");
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const tipos = useMemo(() => {
    const m = new Map<AggregatedTipo, number>();
    for (const i of items) m.set(i.tipo, (m.get(i.tipo) ?? 0) + 1);
    return [...m.entries()];
  }, [items]);

  const visibles = items.filter((i) => (tipo ? i.tipo === tipo : true) && (texto.trim() ? `${i.title} ${i.detail}`.toLowerCase().includes(texto.toLowerCase()) : true));

  async function eliminarContenido(item: AggregatedItem) {
    if (!item.contentItemId) return;
    const ok = await confirmDelete({ title: "¿Eliminar este contenido?", message: `Vas a eliminar "${item.title}". Podrás deshacerlo durante unos segundos.` });
    if (!ok) return;
    setItems((prev) => prev.filter((x) => x.id !== item.id));
    const fd = new FormData();
    fd.set("id", item.contentItemId);
    runDeferred(() => deleteContentItem(fd), { message: `Eliminado: ${item.title}`, undo: () => setItems((prev) => [item, ...prev]) });
  }

  function togglePublicado(item: AggregatedItem) {
    if (!item.contentItemId) return;
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, publicado: !x.publicado } : x)));
    const fd = new FormData();
    fd.set("id", item.contentItemId);
    fd.set("published", String(item.publicado));
    togglePublished(fd);
  }

  return (
    <div>
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>General</div>
          <h1>Contenido</h1>
          <p>Todo lo publicado en la app en un solo lugar: programa, círculos, eventos, novedades, ofertas, libros y productos.</p>
        </div>
        <div className={styles.cabAcc}>
          <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={() => setDrawerOpen(true)}>
            <PlusIcon />
            Nuevo contenido
          </button>
        </div>
      </div>

      <div className={styles.barraHerr}>
        <div className={styles.campoBuscar}>
          <svg className={styles.ico} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar en todo el contenido…" />
        </div>
        <div className={styles.chips}>
          <Chip active={tipo === null} onClick={() => setTipo(null)} count={items.length}>
            Todo
          </Chip>
          {tipos.map(([t, n]) => (
            <Chip key={t} active={tipo === t} onClick={() => setTipo(t)} count={n}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      {visibles.length === 0 ? (
        <EmptyState title="No encontramos contenido" text="Prueba con otra búsqueda o filtro." />
      ) : (
        <div className={styles.filas}>
          {visibles.map((item) => (
            <div key={item.id} className={styles.fila}>
              <span className={`${styles.filaV} ${styles.filaFaceta}`}>
                <IcoContenido />
              </span>
              <div className={styles.filaCuerpo}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span className={styles.badge}>{item.tipo}</span>
                  {item.publicado === false && <span className={`${styles.badge} ${styles.badgeOff}`}>Oculto</span>}
                  <h3 style={{ margin: 0 }}>{item.title}</h3>
                </div>
                <p>{item.detail}</p>
              </div>
              <div className={styles.filaAcc}>
                {item.contentItemId ? (
                  <>
                    <label className={styles.sw} title="Publicado">
                      <input type="checkbox" checked={item.publicado === true} onChange={() => togglePublicado(item)} />
                      <span className={styles.swT} />
                    </label>
                    <DeleteButton onClick={() => eliminarContenido(item)} />
                  </>
                ) : (
                  <a href={item.href} className={`${styles.btn} ${styles.btnG} ${styles.btnMini}`}>
                    Ir a la sección
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        eyebrow="Nuevo"
        title="Nuevo contenido"
        onClose={() => setDrawerOpen(false)}
        footer={
          <>
            <button type="submit" form="contenido-form" className={`${styles.btn} ${styles.btnP}`}>
              Publicar
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={() => setDrawerOpen(false)}>
              Cancelar
            </button>
          </>
        }
      >
        <form id="contenido-form" action={formAction} onSubmit={() => (enviado.current = true)} className={styles.form}>
          <div className={`${styles.campo} ${styles.campoFull}`}>
            <label htmlFor="ci-titulo">Título</label>
            <input id="ci-titulo" name="title" required />
          </div>
          <div className={`${styles.campo} ${styles.campoFull}`}>
            <label htmlFor="ci-dimension">Dimensión</label>
            <select id="ci-dimension" name="category" defaultValue={DIMENSIONS[0].slug}>
              {DIMENSIONS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
          <div className={`${styles.campo} ${styles.campoFull}`}>
            <label htmlFor="ci-desc">Descripción</label>
            <textarea id="ci-desc" name="description" />
          </div>
          {state.error && (
            <p style={{ color: "var(--coral)", fontSize: "0.86rem", gridColumn: "1 / -1" }}>{state.error}</p>
          )}
        </form>
      </Drawer>
    </div>
  );
}
