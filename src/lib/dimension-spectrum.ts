// Datos curados para la pantalla "Las 10 dimensiones" (espectro +
// mapa de conexiones): color propio, temas destacados y con qué otras
// dimensiones se relaciona cada una. En el mismo orden que DIMENSIONS.
export type SpectrumEntry = {
  slug: string;
  color: string;
  temas: string[];
  relaciona: string[]; // slugs de otras dimensiones
};

export const DIMENSION_SPECTRUM: SpectrumEntry[] = [
  {
    slug: "digital",
    color: "#c7d873",
    temas: ["Celular paso a paso", "WhatsApp y videollamadas", "Internet útil"],
    relaciona: ["conexion-social", "educacion-continua", "seguridad-digital", "participacion-activa"],
  },
  {
    slug: "salud-mental",
    color: "#b3c35a",
    temas: ["Acompañamiento", "Manejo de emociones", "Apoyo entre pares"],
    relaciona: ["conexion-social", "bienestar-fisico"],
  },
  {
    slug: "conexion-social",
    color: "#9fae47",
    temas: ["Círculos de interés", "Encuentros intergeneracionales", "Videollamadas grupales"],
    relaciona: ["digital", "salud-mental", "bienestar-fisico", "participacion-activa"],
  },
  {
    slug: "tiempo-libre",
    color: "#8a983a",
    temas: ["Clubes de lectura", "Memoria oral", "Proyectos comunitarios"],
    relaciona: ["participacion-activa", "conexion-social"],
  },
  {
    slug: "estimulacion-cognitiva",
    color: "#7e8c35",
    temas: ["Juegos de memoria", "Atención", "Razonamiento"],
    relaciona: ["educacion-continua", "interculturalidad"],
  },
  {
    slug: "educacion-continua",
    color: "#aebd52",
    temas: ["Microcursos", "Rutas temáticas", "Certificados"],
    relaciona: ["digital", "estimulacion-cognitiva"],
  },
  {
    slug: "interculturalidad",
    color: "#8c9a5e",
    temas: ["Intercambio de idiomas", "Arte y gastronomía", "Otras culturas"],
    relaciona: ["estimulacion-cognitiva", "conexion-social"],
  },
  {
    slug: "bienestar-fisico",
    color: "#85935a",
    temas: ["Rutinas suaves", "Recordatorios", "Hábitos saludables"],
    relaciona: ["salud-mental", "conexion-social"],
  },
  {
    slug: "seguridad-digital",
    color: "#a3b07a",
    temas: ["Evitar estafas", "Contraseñas seguras", "Noticias falsas"],
    relaciona: ["digital"],
  },
  {
    slug: "participacion-activa",
    color: "#bccb8a",
    temas: ["Mentoría", "Voluntariado", "Crear contenido"],
    relaciona: ["digital", "conexion-social", "tiempo-libre"],
  },
];

export function getSpectrumEntry(slug: string): SpectrumEntry | undefined {
  return DIMENSION_SPECTRUM.find((d) => d.slug === slug);
}
