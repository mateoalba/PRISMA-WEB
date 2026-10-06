import type { Metadata } from "next";
import { getCategories, getProducts } from "@/lib/tienda/products-actions";
import { getCart } from "@/lib/tienda/cart-actions";
import { CartProvider } from "./CartContext";
import { FiltroProvider } from "./FiltroContext";
import { CarritoTrigger } from "./CarritoTrigger";
import { SearchBar } from "./SearchBar";
import { Vitrina } from "./Vitrina";
import { TrustStrip } from "./TrustStrip";
import { CategoryChips } from "./CategoryChips";
import { ProductGrid } from "./ProductGrid";
import { ComoComprar } from "./ComoComprar";
import { QuickViewModal } from "./QuickViewModal";
import { CartPanel } from "./CartPanel";
import styles from "@/styles/tienda.module.css";

export const metadata: Metadata = { title: "Tienda | Prisma" };

export default async function TiendaPage() {
  const [categorias, productos, carrito] = await Promise.all([getCategories(), getProducts(), getCart()]);

  const destacados = productos.filter((p) => p.featured);
  const vitrinaProductos = destacados.length > 0 ? destacados : productos.slice(0, 3);

  return (
    <div className={styles.pagina}>
      <div className={styles.ambiente} aria-hidden="true" />
      <div className={styles.puntos} aria-hidden="true" />
      <div className={styles.contenido}>
        <CartProvider initialLines={carrito}>
          <FiltroProvider>
            <div className={styles.accionesTop}>
              <CarritoTrigger />
            </div>

            <section className={styles.portada} aria-labelledby="tienda-titulo">
              <div>
                <div className={styles.eyebrow}>Tienda PRISMA</div>
                <h1 id="tienda-titulo">
                  Todo lo que te <span className={styles.enfasis}>hace bien</span>
                </h1>
                <p>Productos elegidos para tu bienestar, fáciles de usar y con entrega a tu puerta.</p>
                <SearchBar productos={productos} />
              </div>
              <Vitrina productos={vitrinaProductos} />
            </section>

            <TrustStrip />

            <section className={styles.bloque} aria-labelledby="cat-titulo">
              <div className={styles.eyebrow}>Elige una categoría</div>
              <h2 className={styles.seccion} id="cat-titulo">
                ¿Qué necesitas <span className={styles.enfasis}>hoy?</span>
              </h2>
              <CategoryChips categorias={categorias} productos={productos} />
              <ProductGrid productos={productos} categorias={categorias} />
            </section>

            <ComoComprar />

            <QuickViewModal productos={productos} categorias={categorias} />
            <CartPanel />
          </FiltroProvider>
        </CartProvider>
      </div>
    </div>
  );
}
