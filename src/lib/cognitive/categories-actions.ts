"use server";

import { CATEGORIAS, type CognitiveCategory } from "@/lib/cognitive-content";
import { getBestScore } from "./game-actions";

export type CategoryLevel = CognitiveCategory & {
  levelPct: number;
  statLabel: string;
};

// Solo "Memoria" tiene un ejercicio real hoy (el juego de gemas), así que
// es la única categoría con un nivel calculado; las demás muestran 0%
// hasta que exista un ejercicio real detrás.
export async function getCategoryLevels(): Promise<CategoryLevel[]> {
  const bestScore = await getBestScore("gemas");
  const memoriaPct = Math.min(100, Math.round((bestScore / 60) * 100));

  return CATEGORIAS.map((c) => {
    if (c.id === "memoria") {
      return {
        ...c,
        levelPct: memoriaPct,
        statLabel: bestScore > 0 ? `Mejor puntaje: ${bestScore}` : "Aún sin jugar",
      };
    }
    return { ...c, levelPct: 0, statLabel: "Aún sin ejercicios aquí" };
  });
}
