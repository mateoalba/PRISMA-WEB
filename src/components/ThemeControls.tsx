"use client";

import { useAccessibilityPrefs } from "@/lib/accessibility/AccessibilityContext";

export function ThemeControls() {
  const { theme, setTheme } = useAccessibilityPrefs();

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-foreground">
      <span className="font-semibold">Tema:</span>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setTheme("oscuro")}
          aria-pressed={theme === "oscuro"}
          className={`rounded-md px-3 py-1 font-bold transition-colors ${
            theme === "oscuro" ? "bg-white text-graphite" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          Oscuro
        </button>
        <button
          type="button"
          onClick={() => setTheme("claro")}
          aria-pressed={theme === "claro"}
          className={`rounded-md px-3 py-1 font-bold transition-colors ${
            theme === "claro" ? "bg-white text-graphite" : "bg-white/10 hover:bg-white/20"
          }`}
        >
          Claro
        </button>
      </div>
    </div>
  );
}
