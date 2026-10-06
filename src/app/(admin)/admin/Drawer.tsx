"use client";

import { useEffect } from "react";
import styles from "@/styles/admin.module.css";
import { Portal } from "./SharedUi";

function CerrarIcon() {
  return (
    <svg className={styles.ico} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function Drawer({
  open,
  eyebrow,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  eyebrow: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Portal>
      <div className={styles.drawerVelo} role="presentation" onClick={() => onClose()}>
        <div className={styles.drawerCaja} role="dialog" aria-modal="true" aria-labelledby="drawer-titulo" onClick={(e) => e.stopPropagation()}>
          <div className={styles.drawerCab}>
            <div>
              <div className={styles.eyebrow}>{eyebrow}</div>
              <h2 id="drawer-titulo">{title}</h2>
            </div>
            <button type="button" className={styles.btnIco} onClick={onClose} aria-label="Cerrar">
              <CerrarIcon />
            </button>
          </div>
          <div className={styles.drawerCuerpo}>{children}</div>
          {footer && <div className={styles.drawerPie}>{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}
