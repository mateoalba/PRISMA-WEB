"use client";

import { createContext, useContext, useRef, useState } from "react";
import styles from "@/styles/perfil.module.css";

type ToastContextValue = { notify: (message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState("");
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function notify(text: string) {
    setMessage(text);
    setOn(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), 2600);
  }

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className={`${styles.aviso} ${on ? styles.avisoOn : ""}`} role="status">
        <CheckIcon />
        {message}
      </div>
    </ToastContext.Provider>
  );
}
