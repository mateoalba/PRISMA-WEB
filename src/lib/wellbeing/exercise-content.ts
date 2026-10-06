export type ExerciseStep = {
  name: string;
  seconds: number;
  instruction: string;
};

export type ExerciseRoutine = {
  slug: string;
  title: string;
  description: string;
  level: string;
  steps: ExerciseStep[];
};

export const EXERCISE_ROUTINES: ExerciseRoutine[] = [
  {
    slug: "yoga-silla",
    title: "Yoga en silla",
    description: "Movilidad suave para hombros, cuello y espalda, sentado en una silla firme.",
    level: "Muy suave",
    steps: [
      { name: "Postura inicial", seconds: 30, instruction: "Siéntate con la espalda recta y los pies apoyados en el suelo. Respira profundo." },
      { name: "Giro de cuello", seconds: 40, instruction: "Lleva la oreja derecha hacia el hombro, despacio. Luego al otro lado." },
      { name: "Círculos de hombros", seconds: 40, instruction: "Haz círculos lentos con los hombros hacia atrás, sin apurarte." },
      { name: "Torsión suave", seconds: 50, instruction: "Gira el tronco hacia la derecha tomando el respaldo. Respira y cambia de lado." },
      { name: "Relajación", seconds: 30, instruction: "Cierra los ojos, suelta los brazos y respira con calma." },
    ],
  },
  {
    slug: "caminata-consciente",
    title: "Caminata consciente",
    description: "Una caminata guiada, con atención en la respiración y el entorno.",
    level: "Suave",
    steps: [
      { name: "Prepárate", seconds: 30, instruction: "Ponte zapatos cómodos y busca un lugar seguro y plano." },
      { name: "Pasos lentos", seconds: 90, instruction: "Camina despacio. Siente cómo tus pies tocan el suelo." },
      { name: "Respira con el paso", seconds: 90, instruction: "Inhala en 3 pasos y exhala en 3 pasos." },
      { name: "Observa", seconds: 60, instruction: "Nota tres cosas que ves, dos que oyes y una que hueles." },
    ],
  },
  {
    slug: "estiramientos-guiados",
    title: "Estiramientos guiados",
    description: "Estiramientos suaves de pie o sentado para soltar tensión muscular.",
    level: "Suave",
    steps: [
      { name: "Brazos al cielo", seconds: 30, instruction: "Estira los brazos hacia arriba como si quisieras tocar el techo." },
      { name: "Muñecas y manos", seconds: 30, instruction: "Abre y cierra las manos. Luego gira las muñecas." },
      { name: "Piernas", seconds: 45, instruction: "Sentado, estira una pierna al frente y lleva la punta del pie hacia ti." },
      { name: "Espalda", seconds: 40, instruction: "Abraza tus rodillas o inclínate suavemente hacia adelante." },
    ],
  },
];

export function getExerciseRoutine(slug: string) {
  return EXERCISE_ROUTINES.find((r) => r.slug === slug);
}
