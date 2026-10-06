// Contenido curado para la dimensión "Estimulación cognitiva" — texto y
// datos tomados verbatim del prototipo que compartió el cliente
// (componentes-estimulacion-cognitiva.html). Los niveles/porcentajes que
// traía el prototipo (72%, 55%, 84%, 63%, "23 personas jugando ahora")
// eran de ejemplo, así que no se portan: la pantalla calcula el nivel de
// Memoria a partir de tu mejor puntaje real y muestra 0% en las demás
// categorías hasta que existan ejercicios reales ahí.

export type Gema = {
  id: "n" | "e" | "s" | "o";
  nombre: string;
  color: string;
  claro: string;
  nota: number;
  forma: "circulo" | "triangulo" | "cuadrado" | "estrella";
};

export const GEMAS: Gema[] = [
  { id: "n", nombre: "Esmeralda", color: "#3fae6f", claro: "#9ff0bf", nota: 329.6, forma: "circulo" },
  { id: "e", nombre: "Coral", color: "#e0664f", claro: "#ffc2b3", nota: 392.0, forma: "triangulo" },
  { id: "s", nombre: "Zafiro", color: "#4a7fd6", claro: "#b7d0ff", nota: 440.0, forma: "cuadrado" },
  { id: "o", nombre: "Ámbar", color: "#e3a82b", claro: "#ffe3a1", nota: 523.3, forma: "estrella" },
];

export type CognitiveCategory = {
  id: "memoria" | "logica" | "lenguaje" | "percepcion";
  nombre: string;
  desc: string;
  ejemplos: string[];
};

export const CATEGORIAS: CognitiveCategory[] = [
  {
    id: "memoria",
    nombre: "Memoria",
    desc: "Recuerda secuencias, rostros, listas y lugares.",
    ejemplos: ["Secuencia de gemas", "Parejas de cartas", "Lista del mercado"],
  },
  {
    id: "logica",
    nombre: "Lógica",
    desc: "Resuelve patrones, series numéricas y acertijos.",
    ejemplos: ["Series de números", "Sudoku fácil", "¿Qué sigue?"],
  },
  {
    id: "lenguaje",
    nombre: "Lenguaje",
    desc: "Juega con palabras, refranes y definiciones.",
    ejemplos: ["Palabras encadenadas", "Completa el refrán", "Sinónimos"],
  },
  {
    id: "percepcion",
    nombre: "Percepción",
    desc: "Entrena la atención visual y la rapidez.",
    ejemplos: ["Encuentra las diferencias", "Figura escondida", "Atención rápida"],
  },
];

export type DailyChallenge = {
  title: string;
  description: string;
};

// Rotan por día del año (ver getDailyChallenge en daily-challenge-actions.ts).
export const DAILY_CHALLENGES: DailyChallenge[] = [
  { title: "Palabras encadenadas", description: "Un ejercicio breve, guiado paso a paso, para mantener tu mente activa." },
  { title: "Series de números", description: "Encuentra el patrón y descubre qué número sigue." },
  { title: "Completa el refrán", description: "Termina dichos populares que seguro ya conoces." },
  { title: "Encuentra las diferencias", description: "Compara dos imágenes parecidas y ubica lo que cambió." },
  { title: "¿Qué sigue?", description: "Observa la secuencia de figuras y elige la siguiente." },
];
