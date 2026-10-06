"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import styles from "@/styles/admin.module.css";

type ConfirmState = { title: string; message: string; resolve: (ok: boolean) => void } | null;
type ToastItem = { id: number; message: string; undo?: () => void };

type AdminUiContextValue = {
  syncing: boolean;
  notify: (message: string) => void;
  confirmDelete: (opts: { title: string; message: string }) => Promise<boolean>;
  runDeferred: (commit: () => Promise<void> | void, opts: { message: string; undo: () => void }) => void;
};

const AdminUiContext = createContext<AdminUiContextValue | null>(null);

export function useAdminUi() {
  const ctx = useContext(AdminUiContext);
  if (!ctx) throw new Error("useAdminUi debe usarse dentro de AdminUiProvider");
  return ctx;
}

function CheckIcon() {
  return (
    <svg className={styles.ico} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}
function WarningIcon() {
  return (
    <svg className={styles.ico} width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 9v4M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  );
}

let toastId = 0;

export function AdminUiProvider({ children }: { children: React.ReactNode }) {
  const [syncing, setSyncing] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const notify = useCallback(
    (message: string) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message }]);
      const timer = setTimeout(() => dismiss(id), 3200);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  const confirmDelete = useCallback((opts: { title: string; message: string }) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ ...opts, resolve });
    });
  }, []);

  const runDeferred = useCallback(
    (commit: () => Promise<void> | void, opts: { message: string; undo: () => void }) => {
      const id = ++toastId;
      let undone = false;
      const timer = setTimeout(async () => {
        if (undone) return;
        dismiss(id);
        setSyncing(true);
        try {
          await commit();
        } finally {
          setSyncing(false);
        }
      }, 5000);
      timers.current.set(id, timer);
      setToasts((prev) => [
        ...prev,
        {
          id,
          message: opts.message,
          undo: () => {
            undone = true;
            clearTimeout(timer);
            opts.undo();
            dismiss(id);
          },
        },
      ]);
    },
    [dismiss]
  );

  function handleConfirm(ok: boolean) {
    confirmState?.resolve(ok);
    setConfirmState(null);
  }

  return (
    <AdminUiContext.Provider value={{ syncing, notify, confirmDelete, runDeferred }}>
      {children}

      <div className={styles.toasts}>
        {toasts.map((t) => (
          <div key={t.id} className={styles.toast} role="status">
            <span className={styles.toastOk}>
              <CheckIcon />
            </span>
            {t.message}
            {t.undo && (
              <button type="button" className={styles.toastDeshacer} onClick={t.undo}>
                Deshacer
              </button>
            )}
          </div>
        ))}
      </div>

      {confirmState && (
        <div className={styles.modalVelo} role="presentation" onClick={() => handleConfirm(false)}>
          <div
            className={styles.modalCaja}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.modalIco}>
              <WarningIcon />
            </span>
            <h2 id="admin-confirm-title">{confirmState.title}</h2>
            <p>{confirmState.message}</p>
            <div className={styles.modalAcc}>
              <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={() => handleConfirm(false)}>
                Cancelar
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnPeligroSolido}`} onClick={() => handleConfirm(true)}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminUiContext.Provider>
  );
}
