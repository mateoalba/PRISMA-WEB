export type Dimension = {
  slug: string;
  title: string;
  short: string;
  description: string;
};

// Las 10 dimensiones del modelo PRISMA (ver penser.org/prisma).
// El acrónimo PRISMA: Pensamiento sistémico, Redes de conexión social,
// Inclusión digital, Salud integral, Mente y estimulación cognitiva,
// Aprendizaje continuo.
export const DIMENSIONS: Dimension[] = [
  {
    slug: "digital",
    title: "Inclusión digital",
    short: "Aprende a tu ritmo",
    description:
      "Construye confianza con la tecnología: desde enviar mensajes a tus seres queridos hasta navegar de forma segura por internet.",
  },
  {
    slug: "salud-mental",
    title: "Salud mental y apoyo psicosocial",
    short: "Cuida tu mente y emociones",
    description:
      "Un espacio seguro para tu bienestar emocional: acompañamiento, escucha activa y círculos de apoyo.",
  },
  {
    slug: "conexion-social",
    title: "Conexión social y comunidad",
    short: "Conecta con tu gente",
    description:
      "Redes sociales significativas basadas en intereses compartidos: círculos, encuentros y eventos.",
  },
  {
    slug: "tiempo-libre",
    title: "Uso del tiempo libre y propósito",
    short: "Tiempo con sentido",
    description:
      "Actividades con propósito, aprendizaje y participación activa para disfrutar tu tiempo libre.",
  },
  {
    slug: "estimulacion-cognitiva",
    title: "Estimulación cognitiva",
    short: "Ejercita tu mente",
    description:
      "Juegos y ejercicios guiados para fortalecer memoria, atención, velocidad de procesamiento y razonamiento.",
  },
  {
    slug: "educacion-continua",
    title: "Educación continua",
    short: "Nunca dejes de aprender",
    description:
      "Formaciones de alto nivel y contenidos adaptados a tus intereses y tu ritmo, más allá de la etapa laboral.",
  },
  {
    slug: "interculturalidad",
    title: "Interculturalidad",
    short: "Explora el mundo",
    description:
      "Conecta con personas de otras culturas y países: idiomas, arte, gastronomía y más.",
  },
  {
    slug: "bienestar-fisico",
    title: "Bienestar físico y emocional",
    short: "Cuida tu cuerpo",
    description:
      "Rutinas, recomendaciones y seguimiento básico de hábitos saludables, físicos y emocionales.",
  },
  {
    slug: "seguridad-digital",
    title: "Seguridad y confianza digital",
    short: "Navega con confianza",
    description:
      "Aprende a identificar fraudes, estafas y mensajes engañosos, y a usar la tecnología con seguridad.",
  },
  {
    slug: "participacion-activa",
    title: "Participación activa y generación de valor",
    short: "Comparte tu experiencia",
    description:
      "Sé mentor, comparte tu conocimiento y participa activamente en la comunidad PRISMA.",
  },
];

export function getDimension(slug: string): Dimension | undefined {
  return DIMENSIONS.find((d) => d.slug === slug);
}
