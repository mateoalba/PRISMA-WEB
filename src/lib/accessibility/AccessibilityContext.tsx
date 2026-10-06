"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type TextSize = "normal" | "grande" | "muy-grande";
export type Theme = "oscuro" | "claro" | "auto";
export type ResolvedTheme = "oscuro" | "claro";

export const TEXT_SIZES: TextSize[] = ["normal", "grande", "muy-grande"];

const STORAGE_KEY = "prisma-a11y";

type AccessibilityState = {
  textSize: TextSize;
  highContrast: boolean;
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  reducedMotion: boolean;
  voiceReadout: boolean;
  reminders: boolean;
  dismissed: boolean;
  loaded: boolean;
  setTextSize: (size: TextSize) => void;
  setHighContrast: (value: boolean) => void;
  setTheme: (theme: Theme) => void;
  setReducedMotion: (value: boolean) => void;
  setVoiceReadout: (value: boolean) => void;
  setReminders: (value: boolean) => void;
};

const AccessibilityCtx = createContext<AccessibilityState | null>(null);

function systemPrefersDark() {
  return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSize>("normal");
  const [highContrast, setHighContrastState] = useState(false);
  const [theme, setThemeState] = useState<Theme>("oscuro");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("oscuro");
  const [reducedMotion, setReducedMotionState] = useState(false);
  const [voiceReadout, setVoiceReadoutState] = useState(false);
  const [reminders, setRemindersState] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Lectura diferida y segura para hidratación: localStorage solo existe
    // en el cliente, así que el valor real se aplica recién al montar.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      if (TEXT_SIZES.includes(saved.textSize)) setTextSizeState(saved.textSize);
      if (typeof saved.highContrast === "boolean") setHighContrastState(saved.highContrast);
      if (saved.theme === "claro" || saved.theme === "oscuro" || saved.theme === "auto") setThemeState(saved.theme);
      if (typeof saved.reducedMotion === "boolean") setReducedMotionState(saved.reducedMotion);
      if (typeof saved.voiceReadout === "boolean") setVoiceReadoutState(saved.voiceReadout);
      if (typeof saved.reminders === "boolean") setRemindersState(saved.reminders);
      if (typeof saved.dismissed === "boolean") setDismissed(saved.dismissed);
    } catch {
      // sin preferencia guardada todavía
    }
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Resuelve "auto" contra el sistema, y se mantiene al día si el sistema
  // cambia. matchMedia no existe durante el render del servidor, así que
  // esta lectura también tiene que ser diferida a un efecto.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (theme !== "auto") {
      setResolvedTheme(theme);
      return;
    }
    setResolvedTheme(systemPrefersDark() ? "oscuro" : "claro");
    /* eslint-enable react-hooks/set-state-in-effect */
    if (typeof matchMedia !== "function") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(mq.matches ? "oscuro" : "claro");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    if (!loaded) return;
    document.documentElement.setAttribute("data-text-size", textSize);
    document.documentElement.setAttribute("data-contrast", highContrast ? "high" : "normal");
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.setAttribute("data-motion", reducedMotion ? "reducido" : "normal");
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ textSize, highContrast, theme, reducedMotion, voiceReadout, reminders, dismissed })
      );
    } catch {
      // localStorage no disponible — no es crítico
    }
  }, [textSize, highContrast, theme, resolvedTheme, reducedMotion, voiceReadout, reminders, dismissed, loaded]);

  function setTextSize(size: TextSize) {
    setTextSizeState(size);
    setDismissed(true);
  }

  function setHighContrast(value: boolean) {
    setHighContrastState(value);
    setDismissed(true);
  }

  function setTheme(value: Theme) {
    setThemeState(value);
  }

  function setReducedMotion(value: boolean) {
    setReducedMotionState(value);
  }

  function setVoiceReadout(value: boolean) {
    setVoiceReadoutState(value);
  }

  function setReminders(value: boolean) {
    setRemindersState(value);
  }

  return (
    <AccessibilityCtx.Provider
      value={{
        textSize,
        highContrast,
        theme,
        resolvedTheme,
        reducedMotion,
        voiceReadout,
        reminders,
        dismissed,
        loaded,
        setTextSize,
        setHighContrast,
        setTheme,
        setReducedMotion,
        setVoiceReadout,
        setReminders,
      }}
    >
      {children}
    </AccessibilityCtx.Provider>
  );
}

export function useAccessibilityPrefs() {
  const ctx = useContext(AccessibilityCtx);
  if (!ctx) {
    throw new Error("useAccessibilityPrefs debe usarse dentro de AccessibilityProvider");
  }
  return ctx;
}
