// Contenido curado por dimensión — listas específicas que le dan a cada
// una de las 10 dimensiones su propia pantalla, en vez de la plantilla
// genérica. Basado en PRISMA CONTENIDO INICIAL.docx (sección 5.x) y en
// los prototipos de referencia que compartió el cliente.

export type ListItem = {
  title: string;
  meta: string; // ej. "28 miembros", "Nivel inicial", "2 horas semanales"
  description: string;
};

export const DIMENSION_LISTS: Record<string, { heading: string; items: ListItem[] }> = {
  digital: {
    heading: "Rutas de aprendizaje",
    items: [
      { title: "Nivel inicial", meta: "Empezar", description: "Cómo usar WhatsApp para mantener contacto con tu familia." },
      { title: "Nivel intermedio", meta: "Continuar", description: "Navegación segura, banca en línea y prevención de fraudes." },
      { title: "Nivel avanzado", meta: "Bloqueado", description: "Creación de contenido, redes sociales y más." },
    ],
  },
};

// "Lo que aprenderás" — lista corta junto al video de la dimensión.
export const DIMENSION_LEARN: Record<string, string[]> = {
  digital: [
    "Usar tu celular con calma y confianza",
    "Comunicarte con tu familia por WhatsApp y videollamada",
    "Reconocer mensajes falsos y proteger tus datos",
    "Encontrar información útil en internet",
  ],
};

// Rutas de aprendizaje (stepper de 3 niveles) — de momento solo está
// diseñada para "digital"; se agregan más dimensiones a medida que se
// define su contenido real.
export type LearningRoute = {
  nivel: string;
  descripcion: string;
  estado: "completa" | "actual" | "bloqueada";
  avance: number;
};

export const DIMENSION_ROUTES: Record<string, LearningRoute[]> = {
  digital: [
    {
      nivel: "Nivel inicial",
      descripcion: "Cómo usar WhatsApp para mantener contacto con tu familia.",
      estado: "completa",
      avance: 100,
    },
    {
      nivel: "Nivel intermedio",
      descripcion: "Navegación segura, banca en línea y prevención de fraudes.",
      estado: "actual",
      avance: 40,
    },
    {
      nivel: "Nivel avanzado",
      descripcion: "Creación de contenido, redes sociales y más.",
      estado: "bloqueada",
      avance: 0,
    },
  ],
};

// Compañero digital — acompañamiento humano por videollamada o chat.
export type DimensionCompanion = {
  titulo: string;
  descripcion: string;
  disponible: boolean;
};

export const DIMENSION_COMPANION: Record<string, DimensionCompanion> = {
  digital: {
    titulo: "Tu compañero digital",
    descripcion:
      "Un voluntario te acompaña por videollamada o chat para resolver dudas de tecnología a tu ritmo.",
    disponible: true,
  },
};
