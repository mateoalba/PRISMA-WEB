"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/admin.module.css";
import { Drawer } from "../Drawer";
import { Tabs, EditButton, DeleteButton, EmptyState, PlusIcon } from "../SharedUi";
import { useAdminUi } from "../AdminUiContext";
import {
  createNovedad,
  updateNovedad,
  toggleNovedadPublished,
  toggleNovedadFeatured,
  deleteNovedad,
  type Novedad,
  type NovedadType,
  type TileSize,
} from "@/lib/admin/novedades-actions";
import { createOferta, updateOferta, deleteOferta, type Oferta } from "@/lib/novedades/ofertas-actions";
import { createLibro, updateLibro, deleteLibro, type Libro } from "@/lib/novedades/libros-actions";

type Tab = "novedades" | "ofertas" | "libros";

const TYPE_OPTIONS: { value: NovedadType; label: string }[] = [
  { value: "curso", label: "Nuevo curso" },
  { value: "libro", label: "Nuevo libro" },
  { value: "producto", label: "Nuevo producto" },
  { value: "evento", label: "Próximo evento" },
  { value: "taller", label: "Nuevo taller" },
  { value: "actividad", label: "Nueva actividad" },
  { value: "general", label: "Novedad general" },
];
const TILE_OPTIONS: { value: TileSize; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "grande", label: "Grande (2x2)" },
  { value: "ancha", label: "Ancha (2x1)" },
  { value: "alta", label: "Alta (1x2)" },
];

type NovedadForm = { id?: string; title: string; type: NovedadType; description: string; image_url: string; meta_text: string; link_href: string; cta_label: string; tile_size: TileSize; featured: boolean };
type OfertaForm = { id?: string; title: string; price: string; price_before: string; stock: string; ends_at: string; image_url: string };
type LibroForm = { id?: string; title: string; author: string; format: string; image_url: string; price: string };

const NOVEDAD_VACIA: NovedadForm = { title: "", type: "general", description: "", image_url: "", meta_text: "", link_href: "", cta_label: "Ver más", tile_size: "normal", featured: false };
const OFERTA_VACIA: OfertaForm = { title: "", price: "", price_before: "", stock: "", ends_at: "", image_url: "" };
const LIBRO_VACIO: LibroForm = { title: "", author: "", format: "", image_url: "", price: "0" };

function IcoNovedad() {
  return (
    <svg className={styles.ico} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  );
}
function IcoLibro() {
  return (
    <svg className={styles.ico} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19V5M8 7h8" />
    </svg>
  );
}

function fechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}
function diasHasta(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export function NovedadesClient({
  initialNovedades,
  initialOfertas,
  initialLibros,
}: {
  initialNovedades: Novedad[];
  initialOfertas: Oferta[];
  initialLibros: Libro[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmDelete, runDeferred, notify } = useAdminUi();

  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<Tab>(tabParam === "ofertas" || tabParam === "libros" ? tabParam : "novedades");

  const [novedades, setNovedades] = useState(initialNovedades);
  const [ofertas, setOfertas] = useState(initialOfertas);
  const [libros, setLibros] = useState(initialLibros);

  const [drawerNov, setDrawerNov] = useState<NovedadForm | null>(() => (searchParams.get("crear") === "1" && tab === "novedades" ? NOVEDAD_VACIA : null));
  const [drawerOferta, setDrawerOferta] = useState<OfertaForm | null>(null);
  const [drawerLibro, setDrawerLibro] = useState<LibroForm | null>(null);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setNovedades(initialNovedades);
  }, [initialNovedades]);
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setOfertas(initialOfertas);
  }, [initialOfertas]);
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setLibros(initialLibros);
  }, [initialLibros]);

  function cambiarTab(t: Tab) {
    setTab(t);
    router.replace(`/admin/novedades?tab=${t}`, { scroll: false });
  }

  // ---------- Novedades ----------
  function abrirNovedad(n?: Novedad) {
    setDrawerNov(n ? { id: n.id, title: n.title, type: n.type, description: n.description, image_url: n.image_url ?? "", meta_text: n.meta_text ?? "", link_href: n.link_href ?? "", cta_label: n.cta_label, tile_size: n.tile_size, featured: n.featured } : NOVEDAD_VACIA);
  }
  async function guardarNovedad(e: React.FormEvent) {
    e.preventDefault();
    if (!drawerNov) return;
    const fd = new FormData();
    if (drawerNov.id) fd.set("id", drawerNov.id);
    fd.set("title", drawerNov.title);
    fd.set("type", drawerNov.type);
    fd.set("description", drawerNov.description);
    fd.set("image_url", drawerNov.image_url);
    fd.set("meta_text", drawerNov.meta_text);
    fd.set("link_href", drawerNov.link_href);
    fd.set("cta_label", drawerNov.cta_label);
    fd.set("tile_size", drawerNov.tile_size);
    if (drawerNov.featured) fd.set("featured", "on");

    if (drawerNov.id) {
      await updateNovedad(fd);
      notify("Cambios guardados");
    } else {
      await createNovedad(fd);
      notify("Novedad creada");
    }
    router.refresh();
    setDrawerNov(null);
  }
  async function eliminarNovedad(n: Novedad) {
    const ok = await confirmDelete({ title: "¿Eliminar esta novedad?", message: `Vas a eliminar "${n.title}". Podrás deshacerlo durante unos segundos.` });
    if (!ok) return;
    setNovedades((prev) => prev.filter((x) => x.id !== n.id));
    const fd = new FormData();
    fd.set("id", n.id);
    runDeferred(() => deleteNovedad(fd), { message: `Eliminada: ${n.title}`, undo: () => setNovedades((prev) => [n, ...prev]) });
  }
  function togglePublicada(n: Novedad) {
    setNovedades((prev) => prev.map((x) => (x.id === n.id ? { ...x, published: !x.published } : x)));
    const fd = new FormData();
    fd.set("id", n.id);
    fd.set("published", String(n.published));
    toggleNovedadPublished(fd);
  }
  function toggleDestacada(n: Novedad) {
    setNovedades((prev) => prev.map((x) => (x.id === n.id ? { ...x, featured: !x.featured } : x)));
    const fd = new FormData();
    fd.set("id", n.id);
    fd.set("featured", String(n.featured));
    toggleNovedadFeatured(fd);
  }

  // ---------- Ofertas ----------
  function abrirOferta(o?: Oferta) {
    setDrawerOferta(o ? { id: o.id, title: o.title, price: String(o.price), price_before: String(o.priceBefore), stock: String(o.stock), ends_at: o.endsAt.slice(0, 10), image_url: o.imageUrl ?? "" } : OFERTA_VACIA);
  }
  async function guardarOferta(e: React.FormEvent) {
    e.preventDefault();
    if (!drawerOferta) return;
    const fd = new FormData();
    if (drawerOferta.id) fd.set("id", drawerOferta.id);
    fd.set("title", drawerOferta.title);
    fd.set("price", drawerOferta.price);
    fd.set("price_before", drawerOferta.price_before);
    fd.set("stock", drawerOferta.stock);
    fd.set("ends_at", drawerOferta.ends_at);
    fd.set("image_url", drawerOferta.image_url);

    if (drawerOferta.id) {
      await updateOferta(fd);
      notify("Cambios guardados");
    } else {
      await createOferta(fd);
      notify("Oferta creada");
    }
    router.refresh();
    setDrawerOferta(null);
  }
  async function eliminarOferta(o: Oferta) {
    const ok = await confirmDelete({ title: "¿Eliminar esta oferta?", message: `Vas a eliminar "${o.title}". Podrás deshacerlo durante unos segundos.` });
    if (!ok) return;
    setOfertas((prev) => prev.filter((x) => x.id !== o.id));
    const fd = new FormData();
    fd.set("id", o.id);
    runDeferred(() => deleteOferta(fd), { message: `Eliminada: ${o.title}`, undo: () => setOfertas((prev) => [o, ...prev]) });
  }

  // ---------- Libros ----------
  function abrirLibro(l?: Libro) {
    setDrawerLibro(l ? { id: l.id, title: l.title, author: l.author, format: l.format, image_url: l.imageUrl ?? "", price: String(l.price) } : LIBRO_VACIO);
  }
  async function guardarLibro(e: React.FormEvent) {
    e.preventDefault();
    if (!drawerLibro) return;
    const fd = new FormData();
    if (drawerLibro.id) fd.set("id", drawerLibro.id);
    fd.set("title", drawerLibro.title);
    fd.set("author", drawerLibro.author);
    fd.set("format", drawerLibro.format);
    fd.set("image_url", drawerLibro.image_url);
    fd.set("price", drawerLibro.price);

    if (drawerLibro.id) {
      await updateLibro(fd);
      notify("Cambios guardados");
    } else {
      await createLibro(fd);
      notify("Libro agregado");
    }
    router.refresh();
    setDrawerLibro(null);
  }
  async function eliminarLibro(l: Libro) {
    const ok = await confirmDelete({ title: "¿Eliminar este libro?", message: `Vas a eliminar "${l.title}". Podrás deshacerlo durante unos segundos.` });
    if (!ok) return;
    setLibros((prev) => prev.filter((x) => x.id !== l.id));
    const fd = new FormData();
    fd.set("id", l.id);
    runDeferred(() => deleteLibro(fd), { message: `Eliminado: ${l.title}`, undo: () => setLibros((prev) => [l, ...prev]) });
  }

  return (
    <div>
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Publicaciones</div>
          <h1>Novedades</h1>
          <p>Lo que aparece en la portada, el mosaico, las ofertas y la estantería de libros de /novedades.</p>
        </div>
        <div className={styles.cabAcc}>
          {tab === "novedades" && (
            <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={() => abrirNovedad()}>
              <PlusIcon />
              Nueva novedad
            </button>
          )}
          {tab === "ofertas" && (
            <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={() => abrirOferta()}>
              <PlusIcon />
              Nueva oferta
            </button>
          )}
          {tab === "libros" && (
            <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={() => abrirLibro()}>
              <PlusIcon />
              Nuevo libro
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <Tabs
          tabs={[
            { value: "novedades", label: "Portada / mosaico", count: novedades.length },
            { value: "ofertas", label: "Ofertas", count: ofertas.length },
            { value: "libros", label: "Libros", count: libros.length },
          ]}
          active={tab}
          onChange={cambiarTab}
        />
      </div>

      {tab === "novedades" &&
        (novedades.length === 0 ? (
          <EmptyState title="Todavía no hay novedades" text="Crea la primera novedad." actionLabel="Crear novedad" onAction={() => abrirNovedad()} />
        ) : (
          <div className={styles.filas}>
            {novedades.map((n) => (
              <div key={n.id} className={styles.fila}>
                <span className={`${styles.filaV} ${styles.filaFaceta}`}>
                  <IcoNovedad />
                </span>
                <div className={styles.filaCuerpo}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span className={styles.badge}>{TYPE_OPTIONS.find((t) => t.value === n.type)?.label ?? n.type}</span>
                    {!n.published && <span className={`${styles.badge} ${styles.badgeOff}`}>Oculta</span>}
                    {n.featured && <span className={`${styles.badge} ${styles.badgeOk}`}>Destacada</span>}
                    <h3 style={{ margin: 0 }}>{n.title}</h3>
                  </div>
                  <p>{n.description}</p>
                  {n.meta_text && (
                    <div className={styles.filaMeta}>
                      <span>⏱ {n.meta_text}</span>
                    </div>
                  )}
                </div>
                <div className={styles.filaAcc}>
                  <label className={styles.sw} title="Publicada">
                    <input type="checkbox" checked={n.published} onChange={() => togglePublicada(n)} />
                    <span className={styles.swT} />
                  </label>
                  <label className={styles.sw} title="Destacada en portada">
                    <input type="checkbox" checked={n.featured} onChange={() => toggleDestacada(n)} />
                    <span className={styles.swT} />
                  </label>
                  <EditButton onClick={() => abrirNovedad(n)} />
                  <DeleteButton onClick={() => eliminarNovedad(n)} />
                </div>
              </div>
            ))}
          </div>
        ))}

      {tab === "ofertas" &&
        (ofertas.length === 0 ? (
          <EmptyState title="Todavía no hay ofertas" text="Crea la primera oferta." actionLabel="Crear oferta" onAction={() => abrirOferta()} />
        ) : (
          <div className={styles.filas}>
            {ofertas.map((o) => {
              const dias = diasHasta(o.endsAt);
              const vencida = dias < 0;
              const pct = Math.round((1 - o.price / o.priceBefore) * 100);
              return (
                <div key={o.id} className={styles.fila}>
                  <span className={styles.filaV}>
                    <span className={styles.descPill}>-{pct}%</span>
                  </span>
                  <div className={styles.filaCuerpo}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span className={`${styles.badge} ${vencida ? styles.badgeOff : dias <= 5 ? styles.badgeAviso : styles.badgeOk}`}>{vencida ? "Terminada" : `Quedan ${dias} días`}</span>
                      <h3 style={{ margin: 0 }}>{o.title}</h3>
                    </div>
                    <div className={styles.filaMeta}>
                      <span>
                        ${o.price} <s style={{ opacity: 0.6 }}>${o.priceBefore}</s>
                      </span>
                      <span>👥 {o.stock} cupos</span>
                      <span>📅 Termina {fechaCorta(o.endsAt)}</span>
                    </div>
                  </div>
                  <div className={styles.filaAcc}>
                    <EditButton onClick={() => abrirOferta(o)} />
                    <DeleteButton onClick={() => eliminarOferta(o)} />
                  </div>
                </div>
              );
            })}
          </div>
        ))}

      {tab === "libros" &&
        (libros.length === 0 ? (
          <EmptyState title="Todavía no hay libros" text="Agrega el primer libro." actionLabel="Agregar libro" onAction={() => abrirLibro()} />
        ) : (
          <div className={styles.filas}>
            {libros.map((l) => (
              <div key={l.id} className={styles.fila}>
                <span className={styles.filaV}>
                  <IcoLibro />
                </span>
                <div className={styles.filaCuerpo}>
                  <h3 style={{ margin: 0 }}>{l.title}</h3>
                  <p>{l.author}</p>
                  <div className={styles.filaMeta}>
                    <span className={styles.badge}>{l.format}</span>
                    <span>${l.price}</span>
                  </div>
                </div>
                <div className={styles.filaAcc}>
                  <EditButton onClick={() => abrirLibro(l)} />
                  <DeleteButton onClick={() => eliminarLibro(l)} />
                </div>
              </div>
            ))}
          </div>
        ))}

      {/* ---------- Drawer: novedad ---------- */}
      <Drawer
        open={!!drawerNov}
        eyebrow={drawerNov?.id ? "Editar" : "Nueva"}
        title={drawerNov?.id ? "Editar novedad" : "Nueva novedad"}
        onClose={() => setDrawerNov(null)}
        footer={
          <>
            <button type="submit" form="novedad-form" className={`${styles.btn} ${styles.btnP}`}>
              Guardar
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={() => setDrawerNov(null)}>
              Cancelar
            </button>
          </>
        }
      >
        {drawerNov && (
          <form id="novedad-form" onSubmit={guardarNovedad} className={styles.form}>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="n-titulo">Título</label>
              <input id="n-titulo" required value={drawerNov.title} onChange={(e) => setDrawerNov({ ...drawerNov, title: e.target.value })} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="n-tipo">Tipo</label>
              <select id="n-tipo" value={drawerNov.type} onChange={(e) => setDrawerNov({ ...drawerNov, type: e.target.value as NovedadType })}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.campo}>
              <label htmlFor="n-meta">Meta corta</label>
              <input id="n-meta" value={drawerNov.meta_text} onChange={(e) => setDrawerNov({ ...drawerNov, meta_text: e.target.value })} placeholder="Ej: Hace 2 días, 5 min de lectura" />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="n-desc">Descripción</label>
              <textarea id="n-desc" required value={drawerNov.description} onChange={(e) => setDrawerNov({ ...drawerNov, description: e.target.value })} />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="n-img">Imagen (URL, opcional)</label>
              <input id="n-img" value={drawerNov.image_url} onChange={(e) => setDrawerNov({ ...drawerNov, image_url: e.target.value })} placeholder="https://…" />
            </div>
            <div className={styles.campo}>
              <label htmlFor="n-link">Enlace (opcional)</label>
              <input id="n-link" value={drawerNov.link_href} onChange={(e) => setDrawerNov({ ...drawerNov, link_href: e.target.value })} placeholder="/dimensiones/…" />
            </div>
            <div className={styles.campo}>
              <label htmlFor="n-cta">Texto del botón</label>
              <input id="n-cta" value={drawerNov.cta_label} onChange={(e) => setDrawerNov({ ...drawerNov, cta_label: e.target.value })} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="n-tam">Tamaño en el mosaico</label>
              <select id="n-tam" value={drawerNov.tile_size} onChange={(e) => setDrawerNov({ ...drawerNov, tile_size: e.target.value as TileSize })}>
                {TILE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.campo} style={{ justifyContent: "center" }}>
              <label className={styles.sw}>
                <input type="checkbox" checked={drawerNov.featured} onChange={(e) => setDrawerNov({ ...drawerNov, featured: e.target.checked })} />
                <span className={styles.swT} />
              </label>
              <span style={{ fontSize: "0.86rem", fontWeight: 700 }}>Destacar en la portada</span>
            </div>
          </form>
        )}
      </Drawer>

      {/* ---------- Drawer: oferta ---------- */}
      <Drawer
        open={!!drawerOferta}
        eyebrow={drawerOferta?.id ? "Editar" : "Nueva"}
        title={drawerOferta?.id ? "Editar oferta" : "Nueva oferta"}
        onClose={() => setDrawerOferta(null)}
        footer={
          <>
            <button type="submit" form="oferta-form" className={`${styles.btn} ${styles.btnP}`}>
              Guardar
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={() => setDrawerOferta(null)}>
              Cancelar
            </button>
          </>
        }
      >
        {drawerOferta && (
          <form id="oferta-form" onSubmit={guardarOferta} className={styles.form}>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="o-titulo">Título</label>
              <input id="o-titulo" required value={drawerOferta.title} onChange={(e) => setDrawerOferta({ ...drawerOferta, title: e.target.value })} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="o-precio">Precio con descuento</label>
              <input id="o-precio" type="number" step="0.01" required value={drawerOferta.price} onChange={(e) => setDrawerOferta({ ...drawerOferta, price: e.target.value })} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="o-antes">Precio original</label>
              <input id="o-antes" type="number" step="0.01" required value={drawerOferta.price_before} onChange={(e) => setDrawerOferta({ ...drawerOferta, price_before: e.target.value })} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="o-cupos">Cupos</label>
              <input id="o-cupos" type="number" min={0} required value={drawerOferta.stock} onChange={(e) => setDrawerOferta({ ...drawerOferta, stock: e.target.value })} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="o-termina">Termina el</label>
              <input id="o-termina" type="date" required value={drawerOferta.ends_at} onChange={(e) => setDrawerOferta({ ...drawerOferta, ends_at: e.target.value })} />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="o-img">Imagen (URL, opcional)</label>
              <input id="o-img" value={drawerOferta.image_url} onChange={(e) => setDrawerOferta({ ...drawerOferta, image_url: e.target.value })} placeholder="https://…" />
            </div>
          </form>
        )}
      </Drawer>

      {/* ---------- Drawer: libro ---------- */}
      <Drawer
        open={!!drawerLibro}
        eyebrow={drawerLibro?.id ? "Editar" : "Nuevo"}
        title={drawerLibro?.id ? "Editar libro" : "Nuevo libro"}
        onClose={() => setDrawerLibro(null)}
        footer={
          <>
            <button type="submit" form="libro-form" className={`${styles.btn} ${styles.btnP}`}>
              Guardar
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={() => setDrawerLibro(null)}>
              Cancelar
            </button>
          </>
        }
      >
        {drawerLibro && (
          <form id="libro-form" onSubmit={guardarLibro} className={styles.form}>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="l-titulo">Título</label>
              <input id="l-titulo" required value={drawerLibro.title} onChange={(e) => setDrawerLibro({ ...drawerLibro, title: e.target.value })} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="l-autor">Autor</label>
              <input id="l-autor" required value={drawerLibro.author} onChange={(e) => setDrawerLibro({ ...drawerLibro, author: e.target.value })} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="l-formato">Formato</label>
              <input id="l-formato" required value={drawerLibro.format} onChange={(e) => setDrawerLibro({ ...drawerLibro, format: e.target.value })} placeholder="Letra grande, Audiolibro, Digital…" />
            </div>
            <div className={styles.campo}>
              <label htmlFor="l-precio">Precio sin membresía (USD)</label>
              <input id="l-precio" type="number" min="0" step="0.01" required value={drawerLibro.price} onChange={(e) => setDrawerLibro({ ...drawerLibro, price: e.target.value })} />
              <small>Con membresía activa, el libro se muestra gratis.</small>
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="l-img">Portada (URL, opcional)</label>
              <input id="l-img" value={drawerLibro.image_url} onChange={(e) => setDrawerLibro({ ...drawerLibro, image_url: e.target.value })} placeholder="https://…" />
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
