// Tarjetas representativas por dimensión — muestran el TIPO de función que
// va en cada una (inspiradas en el prototipo de Stitch que compartió el
// cliente), todavía sin funcionalidad real detrás. Sirven para que se vea
// la estructura completa antes de construir cada función a fondo.
export type DimensionFeature = {
  title: string;
  description: string;
  cta: string;
};

export const DIMENSION_FEATURES: Record<string, DimensionFeature[]> = {
  digital: [
    {
      title: "Rutas de aprendizaje",
      description:
        "Nivel inicial: cómo usar WhatsApp. Nivel intermedio: navegación segura y banca en línea. Nivel avanzado: redes sociales.",
      cta: "Empezar",
    },
    {
      title: "Tu compañero digital",
      description:
        "Un voluntario te acompaña por videollamada o chat para resolver dudas de tecnología a tu ritmo.",
      cta: "Contactar",
    },
  ],
};
