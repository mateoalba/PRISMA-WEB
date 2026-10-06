"use client";

import { AccessibilityControls } from "./AccessibilityControls";
import { useAccessibilityPrefs } from "@/lib/accessibility/AccessibilityContext";

export function AccessibilityBar() {
  const { dismissed, loaded } = useAccessibilityPrefs();

  // Antes de leer localStorage, no mostramos ni ocultamos nada para evitar
  // un parpadeo (se decide una sola vez, al montar).
  const expanded = !loaded || !dismissed;

  return (
    <div className="border-b border-line bg-brand-dark text-white">
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-2">
            <AccessibilityControls />
          </div>
        </div>
      </div>
    </div>
  );
}
