"use client";

import { createContext, useContext, useEffect, useState } from "react";

type AdminTheme = "dark" | "light";

const STORAGE_KEY = "prisma-admin-theme";

const AdminThemeContext = createContext<{ theme: AdminTheme; toggle: () => void } | null>(null);

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) throw new Error("useAdminTheme debe usarse dentro de AdminThemeProvider");
  return ctx;
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AdminTheme>("dark");

  useEffect(() => {
    // Lectura diferida y segura para hidratación: localStorage solo existe
    // en el cliente.
    /* eslint-disable react-hooks/set-state-in-effect */
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") setTheme(saved);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // no crítico
    }
  }, [theme]);

  return (
    <AdminThemeContext.Provider value={{ theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }}>
      {children}
    </AdminThemeContext.Provider>
  );
}
