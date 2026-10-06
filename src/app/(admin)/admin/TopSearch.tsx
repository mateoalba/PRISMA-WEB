"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin.module.css";
import { NAV_FLAT } from "./AdminNavConfig";
import { IcoBuscar } from "./AdminNavIcons";
import { searchAdminContent, searchAdminUsers, type SearchResult } from "@/lib/admin/search-actions";

export function TopSearch() {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [contenido, setContenido] = useState<SearchResult[]>([]);
  const [usuarios, setUsuarios] = useState<SearchResult[]>([]);
  const [activo, setActivo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const hayTexto = texto.trim().length > 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  useEffect(() => {
    if (!hayTexto) return;
    const id = setTimeout(() => {
      searchAdminContent(texto).then(setContenido);
      searchAdminUsers(texto).then(setUsuarios);
    }, 220);
    return () => clearTimeout(id);
  }, [texto, hayTexto]);

  const secciones = hayTexto ? NAV_FLAT.filter((i) => i.label.toLowerCase().includes(texto.toLowerCase())) : [];
  const contenidoVisible = hayTexto ? contenido : [];
  const usuariosVisible = hayTexto ? usuarios : [];
  const todos = [
    ...secciones.map((s) => ({ label: s.label, href: s.href })),
    ...contenidoVisible.map((c) => ({ label: c.label, href: c.href })),
    ...usuariosVisible.map((u) => ({ label: u.label, href: u.href })),
  ];

  function ir(href: string) {
    router.push(href);
    setAbierto(false);
    setTexto("");
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setAbierto(false);
      setTexto("");
      inputRef.current?.blur();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActivo((a) => Math.min(a + 1, todos.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((a) => Math.max(a - 1, 0));
    }
    if (e.key === "Enter") {
      const item = todos[activo];
      if (item) ir(item.href);
    }
  }

  let idx = -1;

  return (
    <div className={styles.topSearchWrap} ref={wrapRef}>
      <IcoBuscar />
      <input
        ref={inputRef}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          setAbierto(true);
          setActivo(0);
        }}
        onFocus={() => setAbierto(true)}
        onKeyDown={onKeyDown}
        placeholder="Buscar secciones o contenido…"
        className={styles.topSearchInput}
      />

      {abierto && hayTexto && (
        <div className={styles.topSearchDropdown}>
          {secciones.length > 0 && (
            <>
              <div className={styles.paletaG}>Secciones</div>
              {secciones.map((s) => {
                idx++;
                const i = idx;
                return (
                  <button key={s.href} type="button" className={`${styles.paletaItem} ${activo === i ? styles.paletaItemOn : ""}`} onClick={() => ir(s.href)}>
                    <s.Icon />
                    {s.label}
                  </button>
                );
              })}
            </>
          )}
          {contenidoVisible.length > 0 && (
            <>
              <div className={styles.paletaG}>Contenido</div>
              {contenidoVisible.map((c) => {
                idx++;
                const i = idx;
                return (
                  <button key={c.id} type="button" className={`${styles.paletaItem} ${activo === i ? styles.paletaItemOn : ""}`} onClick={() => ir(c.href)}>
                    {c.label} <span style={{ marginLeft: "auto", color: "var(--ink-muted)", fontWeight: 400 }}>{c.detail}</span>
                  </button>
                );
              })}
            </>
          )}
          {usuariosVisible.length > 0 && (
            <>
              <div className={styles.paletaG}>Usuarios</div>
              {usuariosVisible.map((u) => {
                idx++;
                const i = idx;
                return (
                  <button key={u.id} type="button" className={`${styles.paletaItem} ${activo === i ? styles.paletaItemOn : ""}`} onClick={() => ir(u.href)}>
                    {u.label} <span style={{ marginLeft: "auto", color: "var(--ink-muted)", fontWeight: 400 }}>{u.detail}</span>
                  </button>
                );
              })}
            </>
          )}
          {todos.length === 0 && <div className={styles.paletaG}>Sin resultados</div>}
        </div>
      )}
    </div>
  );
}
