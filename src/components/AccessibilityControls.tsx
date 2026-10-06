"use client";

import { useAccessibilityPrefs } from "@/lib/accessibility/AccessibilityContext";

const SIZE_OPTIONS = [
  { size: "normal" as const, label: "A" },
  { size: "grande" as const, label: "A+" },
  { size: "muy-grande" as const, label: "A++" },
];

export function AccessibilityControls() {
  const { textSize, highContrast, setTextSize, setHighContrast } = useAccessibilityPrefs();

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-foreground">
      <span className="font-semibold">Tamaño de texto:</span>
      <div className="flex gap-1">
        {SIZE_OPTIONS.map((opt) => (
          <button
            key={opt.size}
            type="button"
            onClick={() => setTextSize(opt.size)}
            aria-pressed={textSize === opt.size}
            className={`rounded-md px-3 py-1 font-bold transition-colors ${
              textSize === opt.size
                ? "bg-white text-graphite"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setHighContrast(!highContrast)}
        aria-pressed={highContrast}
        className={`rounded-md px-3 py-1 font-semibold transition-colors ${
          highContrast ? "bg-white text-graphite" : "bg-white/10 hover:bg-white/20"
        }`}
      >
        Alto contraste {highContrast ? "activado" : ""}
      </button>
    </div>
  );
}
