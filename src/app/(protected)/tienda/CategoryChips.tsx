"use client";

import styles from "@/styles/tienda.module.css";
import { CategoryIcon } from "./CategoryIcon";
import { useFiltro } from "./FiltroContext";
import type { ProductCategory, Product } from "@/lib/tienda/products-actions";

export function CategoryChips({ categorias, productos }: { categorias: ProductCategory[]; productos: Product[] }) {
  const { categoria, setCategoria } = useFiltro();

  const items = [{ id: "todo", slug: "todo", name: "Todo", iconKey: "todo" }, ...categorias];

  return (
    <div className={styles.cats} role="group" aria-label="Categorías">
      {items.map((c) => {
        const count = c.slug === "todo" ? productos.length : productos.filter((p) => p.categorySlug === c.slug).length;
        const on = categoria === c.slug;
        return (
          <button
            key={c.slug}
            type="button"
            className={`${styles.cat} ${on ? styles.catOn : ""}`}
            aria-pressed={on}
            onClick={() => setCategoria(c.slug)}
          >
            <span className={styles.catIco}>
              <CategoryIcon iconKey={c.iconKey} size={30} />
            </span>
            <b>{c.name}</b>
            <small>
              {count} {c.slug !== "todo" && count === 1 ? "producto" : "productos"}
            </small>
          </button>
        );
      })}
    </div>
  );
}
