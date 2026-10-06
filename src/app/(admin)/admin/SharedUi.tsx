"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "@/styles/admin.module.css";

// Escapa la pila de apilamiento (stacking context) que crea `.vista` para el
// contenido de cada página — sin esto, un velo/drawer con z-index alto queda
// igual atrapado debajo de la topbar (`.top`), porque su z-index solo compite
// dentro del contexto local de `.vista` en vez del de toda la página.
// Se monta dentro de #admin-portal-root (hermano de .app, ver
// AdminShellClient.tsx) en vez de document.body: así sigue dentro de .admin
// y hereda las variables de tema (--surface-1, --ink, etc.), que si no,
// quedan sin definir fuera de ese wrapper y el drawer se ve transparente.
export function Portal({ children }: { children: React.ReactNode }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  /* eslint-disable-next-line react-hooks/set-state-in-effect -- busca el nodo de montaje en cliente antes de usar createPortal */
  useEffect(() => setRoot(document.getElementById("admin-portal-root")), []);
  if (!root) return null;
  return createPortal(children, root);
}

export function EmptyState({ title, text, actionLabel, onAction }: { title: string; text: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className={styles.vacio}>
      <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M40 6l30 20-11 46H21L10 26z" strokeDasharray="4 4" />
        <path d="M40 6v66M10 26l30 16 30-16" opacity=".5" />
      </svg>
      <b>{title}</b>
      <span>{text}</span>
      {actionLabel && onAction && (
        <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={onAction}>
          <PlusIcon />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function EditIcon() {
  return (
    <svg className={styles.ico} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}
export function TrashIcon() {
  return (
    <svg className={styles.ico} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
export function PlusIcon() {
  return (
    <svg className={styles.ico} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={styles.btnIco} onClick={onClick} aria-label="Editar">
      <EditIcon />
    </button>
  );
}
export function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className={`${styles.btnIco} ${styles.btnIcoPeligro}`} onClick={onClick} aria-label="Eliminar">
      <TrashIcon />
    </button>
  );
}

export function Chip({
  active,
  onClick,
  children,
  count,
  color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
  color?: string;
}) {
  return (
    <button type="button" className={`${styles.chip} ${active ? styles.chipOn : ""}`} aria-pressed={active} onClick={onClick}>
      {color && <i className={styles.chipIco} style={{ ["--c" as string]: color }} />}
      {children}
      {count != null && <em className={styles.chipEm}>{count}</em>}
    </button>
  );
}

export function Tabs<T extends string>({ tabs, active, onChange }: { tabs: { value: T; label: string; count?: number }[]; active: T; onChange: (v: T) => void }) {
  const [ind, setInd] = useState({ left: 0, width: 0 });
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const el = refs.current[active];
    if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active, tabs]);

  return (
    <div className={styles.tabs} role="tablist">
      <span className={styles.tabsInd} style={{ transform: `translateX(${ind.left}px)`, width: ind.width }} aria-hidden="true" />
      {tabs.map((t) => (
        <button
          key={t.value}
          ref={(el) => {
            refs.current[t.value] = el;
          }}
          type="button"
          role="tab"
          aria-selected={active === t.value}
          className={`${styles.tabBtn} ${active === t.value ? styles.tabBtnOn : ""}`}
          onClick={() => onChange(t.value)}
        >
          {t.label}
          {t.count != null && <em>{t.count}</em>}
        </button>
      ))}
    </div>
  );
}
