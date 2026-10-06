"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/admin.module.css";
import { Drawer } from "../Drawer";
import { Chip, DeleteButton, EmptyState, PlusIcon } from "../SharedUi";
import { useAdminUi } from "../AdminUiContext";
import {
  createProduct,
  updateProduct,
  toggleProductPublished,
  toggleProductFeatured,
  deleteProduct,
  type Product,
  type ProductCategory,
} from "@/lib/tienda/products-actions";

type FormState = {
  id?: string;
  category_id: string;
  title: string;
  description: string;
  details: string;
  price: string;
  price_before: string;
  badge: string;
  image_url: string;
};

function vacio(categoriaId: string): FormState {
  return { category_id: categoriaId, title: "", description: "", details: "", price: "", price_before: "", badge: "", image_url: "" };
}

export function TiendaClient({ initialProducts, categorias }: { initialProducts: Product[]; categorias: ProductCategory[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmDelete, runDeferred, notify } = useAdminUi();
  const [productos, setProductos] = useState(initialProducts);
  const [categoria, setCategoria] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [drawer, setDrawer] = useState<FormState | null>(() => (searchParams.get("crear") === "1" ? vacio(categorias[0]?.id ?? "") : null));

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setProductos(initialProducts);
  }, [initialProducts]);

  const visibles = useMemo(() => {
    return productos.filter((p) => (categoria ? p.categoryId === categoria : true) && (texto.trim() ? p.title.toLowerCase().includes(texto.toLowerCase()) : true));
  }, [productos, categoria, texto]);

  function abrirNuevo() {
    setDrawer(vacio(categorias[0]?.id ?? ""));
  }
  function abrirEditar(p: Product) {
    setDrawer({ id: p.id, category_id: p.categoryId, title: p.title, description: p.description, details: p.details.join("\n"), price: String(p.price), price_before: p.priceBefore != null ? String(p.priceBefore) : "", badge: p.badge ?? "", image_url: p.imageUrl ?? "" });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!drawer) return;
    const fd = new FormData();
    if (drawer.id) fd.set("id", drawer.id);
    fd.set("category_id", drawer.category_id);
    fd.set("title", drawer.title);
    fd.set("description", drawer.description);
    fd.set("details", drawer.details);
    fd.set("price", drawer.price);
    fd.set("price_before", drawer.price_before);
    fd.set("badge", drawer.badge);
    fd.set("image_url", drawer.image_url);

    if (drawer.id) {
      await updateProduct(fd);
      notify("Cambios guardados");
    } else {
      fd.set("featured", "off");
      await createProduct(fd);
      notify("Producto creado");
    }
    router.refresh();
    setDrawer(null);
  }

  async function eliminar(p: Product) {
    const ok = await confirmDelete({ title: "¿Eliminar este producto?", message: `Vas a eliminar "${p.title}". Podrás deshacerlo durante unos segundos.` });
    if (!ok) return;
    setProductos((prev) => prev.filter((x) => x.id !== p.id));
    const fd = new FormData();
    fd.set("id", p.id);
    runDeferred(() => deleteProduct(fd), { message: `Eliminado: ${p.title}`, undo: () => setProductos((prev) => [p, ...prev]) });
  }

  function togglePublicado(p: Product) {
    const next = !p.published;
    setProductos((prev) => prev.map((x) => (x.id === p.id ? { ...x, published: next, featured: next ? x.featured : false } : x)));
    const fd = new FormData();
    fd.set("id", p.id);
    fd.set("published", String(p.published));
    toggleProductPublished(fd);
    if (!next && p.featured) {
      const fd2 = new FormData();
      fd2.set("id", p.id);
      fd2.set("featured", "true");
      toggleProductFeatured(fd2);
    }
  }

  function toggleVitrina(p: Product) {
    const next = !p.featured;
    setProductos((prev) => prev.map((x) => (x.id === p.id ? { ...x, featured: next, published: next ? true : x.published } : x)));
    const fd = new FormData();
    fd.set("id", p.id);
    fd.set("featured", String(p.featured));
    toggleProductFeatured(fd);
    if (next && !p.published) {
      const fd2 = new FormData();
      fd2.set("id", p.id);
      fd2.set("published", "false");
      toggleProductPublished(fd2);
    }
  }

  return (
    <div>
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Publicaciones</div>
          <h1>Tienda</h1>
          <p>Productos que aparecen en la tienda de la app.</p>
        </div>
        <div className={styles.cabAcc}>
          <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={abrirNuevo}>
            <PlusIcon />
            Nuevo producto
          </button>
        </div>
      </div>

      <div className={styles.barraHerr}>
        <div className={styles.campoBuscar}>
          <svg className={styles.ico} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar productos…" />
        </div>
        <div className={styles.chips}>
          <Chip active={categoria === null} onClick={() => setCategoria(null)}>
            Todas
          </Chip>
          {categorias.map((c) => (
            <Chip key={c.id} active={categoria === c.id} onClick={() => setCategoria(c.id)}>
              {c.name}
            </Chip>
          ))}
        </div>
      </div>

      {visibles.length === 0 ? (
        <EmptyState title="No encontramos productos" text="Prueba con otra categoría o crea uno nuevo." actionLabel="Crear producto" onAction={abrirNuevo} />
      ) : (
        <div className={styles.prodGrid}>
          {visibles.map((p) => {
            const categoriaNombre = categorias.find((c) => c.id === p.categoryId)?.name ?? "";
            return (
              <div key={p.id} className={`${styles.prodCard} ${!p.published ? styles.prodCardOculto : ""}`}>
                <div className={styles.prodImgWrap}>
                  <div style={{ width: "100%", height: "100%", background: "var(--surface-3)", display: "grid", placeItems: "center", color: "var(--ink-muted)", fontSize: "0.8rem" }}>
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- vista previa desde una URL externa
                      <img src={p.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      "Sin imagen"
                    )}
                  </div>
                  <div className={styles.prodBadges}>
                    <span className={`${styles.badge} ${p.published ? styles.badgeOk : styles.badgeOff}`}>{p.published ? "Publicado" : "Oculto"}</span>
                    {p.featured && <span className={`${styles.badge} ${styles.badgeAviso}`}>★ Vitrina</span>}
                    {p.badge && <span className={styles.badge}>{p.badge}</span>}
                  </div>
                </div>
                <div className={styles.prodBody}>
                  <div className={styles.eyebrow}>{categoriaNombre}</div>
                  <h3 style={{ margin: 0, fontSize: "0.98rem", fontWeight: 800 }}>{p.title}</h3>
                  <div className={styles.prodPrecio}>
                    ${p.price}
                    {p.priceBefore && <s>${p.priceBefore}</s>}
                  </div>
                </div>
                <div className={styles.prodControles}>
                  <div className={styles.prodControlLinea}>
                    Publicado
                    <label className={styles.sw}>
                      <input type="checkbox" checked={p.published} onChange={() => togglePublicado(p)} />
                      <span className={styles.swT} />
                    </label>
                  </div>
                  <div className={styles.prodControlLinea}>
                    Vitrina
                    <label className={styles.sw}>
                      <input type="checkbox" checked={p.featured} onChange={() => toggleVitrina(p)} />
                      <span className={styles.swT} />
                    </label>
                  </div>
                </div>
                <div className={styles.prodPie}>
                  <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnMini}`} style={{ flex: 1 }} onClick={() => abrirEditar(p)}>
                    Editar
                  </button>
                  <DeleteButton onClick={() => eliminar(p)} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Drawer
        open={!!drawer}
        eyebrow={drawer?.id ? "Editar" : "Nuevo"}
        title={drawer?.id ? "Editar producto" : "Nuevo producto"}
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button type="submit" form="producto-form" className={`${styles.btn} ${styles.btnP}`}>
              Guardar
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={() => setDrawer(null)}>
              Cancelar
            </button>
          </>
        }
      >
        {drawer && (
          <form id="producto-form" onSubmit={guardar} className={styles.form}>
            <div className={styles.campo}>
              <label htmlFor="p-categoria">Categoría</label>
              <select id="p-categoria" value={drawer.category_id} onChange={(e) => setDrawer({ ...drawer, category_id: e.target.value })}>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.campo}>
              <label htmlFor="p-insignia">Insignia</label>
              <input id="p-insignia" value={drawer.badge} onChange={(e) => setDrawer({ ...drawer, badge: e.target.value })} placeholder="Ej: Nuevo, Más vendido" />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="p-titulo">Título</label>
              <input id="p-titulo" required value={drawer.title} onChange={(e) => setDrawer({ ...drawer, title: e.target.value })} />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="p-desc">Descripción</label>
              <input id="p-desc" required value={drawer.description} onChange={(e) => setDrawer({ ...drawer, description: e.target.value })} />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="p-detalles">Detalles</label>
              <textarea id="p-detalles" value={drawer.details} onChange={(e) => setDrawer({ ...drawer, details: e.target.value })} placeholder={"Uno por línea"} />
              <small>Uno por línea. Se muestran como lista.</small>
            </div>
            <div className={styles.campo}>
              <label htmlFor="p-precio">Precio</label>
              <input id="p-precio" type="number" step="0.01" required value={drawer.price} onChange={(e) => setDrawer({ ...drawer, price: e.target.value })} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="p-antes">Precio antes</label>
              <input id="p-antes" type="number" step="0.01" value={drawer.price_before} onChange={(e) => setDrawer({ ...drawer, price_before: e.target.value })} placeholder="Déjalo vacío si no hay descuento" />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="p-img">Imagen (URL, opcional)</label>
              <input id="p-img" value={drawer.image_url} onChange={(e) => setDrawer({ ...drawer, image_url: e.target.value })} placeholder="https://…" />
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
