"use client";

import styles from "@/styles/tienda.module.css";
import { useFiltro } from "./FiltroContext";
import type { Product } from "@/lib/tienda/products-actions";

function SearchIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

export function SearchBar({ productos }: { productos: Product[] }) {
  const { texto, setTexto } = useFiltro();
  const sugerencias = productos.slice(0, 4).map((p) => p.title.split(" ")[0]);

  return (
    <>
      <div className={styles.buscador} role="search">
        <label htmlFor="buscar" className={styles.sr}>
          Buscar productos
        </label>
        <SearchIcon />
        <input
          id="buscar"
          type="search"
          placeholder="¿Qué estás buscando?"
          autoComplete="off"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>
      {sugerencias.length > 0 && (
        <div className={styles.sugerenciasBusca}>
          <span>Lo más buscado:</span>
          {sugerencias.map((s, i) => (
            <button key={i} type="button" onClick={() => setTexto(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
