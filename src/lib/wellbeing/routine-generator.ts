import type { ExerciseRoutine, ExerciseStep } from "./exercise-content";

export type Condition = "hipertension" | "diabetes" | "articular" | "cardiaco";

export const CONDICIONES: { value: Condition; label: string }[] = [
  { value: "hipertension", label: "Hipertensión" },
  { value: "diabetes", label: "Diabetes" },
  { value: "articular", label: "Problemas articulares" },
  { value: "cardiaco", label: "Problemas del corazón" },
];

export type WellnessProfile = {
  age: number | null;
  weightKg: number | null;
  conditions: Condition[];
};

type CatalogItem = {
  id: string;
  name: string;
  category: "calentamiento" | "cardio" | "fuerza" | "equilibrio" | "estiramiento" | "enfriamiento";
  baseSeconds: number;
  instruction: string;
  avoidIf: Condition[];
};

// Catálogo real de ejercicios de bajo impacto, apropiados para 60+. Las
// duraciones son la base para intensidad "moderada"; se reducen para
// "suave". avoidIf excluye el ejercicio si la persona marcó esa condición.
const CATALOGO: CatalogItem[] = [
  { id: "marcha", name: "Marcha en el sitio", category: "calentamiento", baseSeconds: 40, instruction: "Levanta las rodillas suavemente, como si marcharas, sin salir del sitio. Respira con calma.", avoidIf: [] },
  { id: "movilidad", name: "Movilidad de tobillos y muñecas", category: "calentamiento", baseSeconds: 30, instruction: "Sentado o de pie, gira los tobillos y las muñecas suavemente hacia cada lado.", avoidIf: [] },
  { id: "caminata-sitio", name: "Caminata en el sitio", category: "cardio", baseSeconds: 60, instruction: "Camina en el mismo lugar a tu propio ritmo, moviendo los brazos con naturalidad.", avoidIf: [] },
  { id: "paso-lateral", name: "Paso lateral", category: "cardio", baseSeconds: 50, instruction: "Da pasos hacia un lado y luego hacia el otro, como bailando despacio.", avoidIf: ["articular", "cardiaco"] },
  { id: "sentadilla-silla", name: "Sentadillas apoyado en una silla", category: "fuerza", baseSeconds: 45, instruction: "Con una silla firme detrás, baja despacio como si fueras a sentarte y vuelve a subir. Repite a tu ritmo.", avoidIf: ["articular"] },
  { id: "brazos-botella", name: "Brazos con peso ligero", category: "fuerza", baseSeconds: 40, instruction: "Con una botella de agua en cada mano, sube y baja los brazos despacio.", avoidIf: [] },
  { id: "flexion-pared", name: "Flexiones de pared", category: "fuerza", baseSeconds: 40, instruction: "De pie frente a una pared, apoya las manos y flexiona los codos acercando el pecho, sin forzar.", avoidIf: ["cardiaco"] },
  { id: "equilibrio-pie", name: "Equilibrio en un pie", category: "equilibrio", baseSeconds: 30, instruction: "Sujeto del respaldo de una silla, levanta un pie unos segundos. Cambia de pie.", avoidIf: [] },
  { id: "talon-punta", name: "Camina talón-punta", category: "equilibrio", baseSeconds: 40, instruction: "Camina en línea recta colocando el talón justo delante de la punta del otro pie.", avoidIf: ["articular"] },
  { id: "estiramiento-piernas", name: "Estiramiento de piernas sentado", category: "estiramiento", baseSeconds: 40, instruction: "Sentado, estira una pierna al frente y lleva la punta del pie hacia ti, sin forzar.", avoidIf: [] },
  { id: "estiramiento-brazos", name: "Estiramiento de brazos y hombros", category: "estiramiento", baseSeconds: 30, instruction: "Estira los brazos hacia arriba y luego cruza uno frente al pecho, sosteniendo unos segundos.", avoidIf: [] },
  { id: "respiracion-cierre", name: "Respiración de cierre", category: "enfriamiento", baseSeconds: 40, instruction: "Siéntate, cierra los ojos y respira profundo varias veces para terminar con calma.", avoidIf: [] },
];

const ORDEN: CatalogItem["category"][] = ["calentamiento", "cardio", "fuerza", "equilibrio", "estiramiento", "enfriamiento"];

function esIntensidadSuave(profile: WellnessProfile): boolean {
  return profile.age === null || profile.age >= 75 || profile.conditions.includes("cardiaco");
}

// Genera la rutina del día: filtra ejercicios según condiciones de base,
// elige uno real por categoría (rotando con el día del año para variar) y
// escala la duración según la intensidad recomendable por edad.
export function generatePersonalizedRoutine(profile: WellnessProfile): ExerciseRoutine | null {
  const suave = esIntensidadSuave(profile);
  const factor = suave ? 0.75 : 1;
  const diaDelAnio = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  const steps: ExerciseStep[] = [];
  for (const categoria of ORDEN) {
    const opciones = CATALOGO.filter((ej) => ej.category === categoria && !ej.avoidIf.some((c) => profile.conditions.includes(c)));
    if (opciones.length === 0) continue;
    const elegido = opciones[diaDelAnio % opciones.length];
    steps.push({ name: elegido.name, seconds: Math.round((elegido.baseSeconds * factor) / 5) * 5, instruction: elegido.instruction });
  }

  if (steps.length === 0) return null;

  return {
    slug: "rutina-personalizada",
    title: "Tu rutina de hoy",
    description: "Generada según tu edad y tus condiciones de base. Cambia cada día.",
    level: suave ? "Muy suave" : "Suave-moderada",
    steps,
  };
}

const ML_POR_KG = 30;
const ML_POR_VASO = 250;
const META_MIN = 6;
export const META_MAX = 12;
export const META_VASOS_DEFECTO = 8;

// Meta de vasos de agua según el peso (≈30ml por kg), acotada a un rango
// razonable. Sin peso registrado, se usa la meta genérica de 8 vasos.
export function computeHydrationGoal(weightKg: number | null): number {
  if (!weightKg || weightKg <= 0) return META_VASOS_DEFECTO;
  const vasos = Math.round((weightKg * ML_POR_KG) / ML_POR_VASO);
  return Math.min(META_MAX, Math.max(META_MIN, vasos));
}
