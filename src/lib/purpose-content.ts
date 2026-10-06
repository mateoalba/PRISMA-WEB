// Contenido curado para la dimensión "Uso del tiempo libre y propósito" —
// texto tomado verbatim del prototipo que compartió el cliente
// (componentes-tiempo-libre.html). Los números de "impacto" que traía el
// prototipo (ej. "+120 reseñas escritas") eran de ejemplo, así que no se
// portan: en su lugar la pantalla muestra cuántas personas de la
// comunidad ya se apuntaron a cada idea, un dato real.

export type PurposeIdea = {
  slug: string;
  title: string;
  description: string;
  frequency: string;
  role: string;
};

export const PURPOSE_IDEAS: PurposeIdea[] = [
  {
    slug: "club-lectura-resenas",
    title: "Club de lectura con reseñas",
    description: "Lee, comparte y escribe una breve reseña que otros puedan consultar.",
    frequency: "Semanal",
    role: "Rol: autor/a de reseñas",
  },
  {
    slug: "proyecto-memoria-oral",
    title: "Proyecto de memoria oral",
    description: "Graba y transmite historias familiares para dejar un legado.",
    frequency: "A tu ritmo",
    role: "Rol: guardián/a de historias",
  },
  {
    slug: "mentoria-jovenes",
    title: "Mentoría a jóvenes",
    description: "Comparte un oficio o pasión con alguien que quiere aprenderlo.",
    frequency: "2 horas/semana",
    role: "Rol: mentor/a",
  },
];

export type FreeTimeMood = "tranquilo" | "activo" | "social" | "creativo";
export type FreeTimeLength = "corto" | "medio" | "largo";

export const MOOD_OPTIONS: { value: FreeTimeMood; label: string }[] = [
  { value: "tranquilo", label: "Tranquilo" },
  { value: "activo", label: "Activo" },
  { value: "social", label: "Con gente" },
  { value: "creativo", label: "Creativo" },
];

export const TIME_OPTIONS: { value: FreeTimeLength; label: string }[] = [
  { value: "corto", label: "15–30 min" },
  { value: "medio", label: "1 hora" },
  { value: "largo", label: "Medio día" },
];

export type FreeTimeSuggestion = {
  title: string;
  description: string;
  mood: FreeTimeMood;
  time: FreeTimeLength;
  place: string;
};

export const FREE_TIME_SUGGESTIONS: FreeTimeSuggestion[] = [
  { title: "Escribe una carta a un nieto", description: "Cuéntale una anécdota de tu juventud. Puedes enviarla por WhatsApp.", mood: "creativo", time: "corto", place: "En casa" },
  { title: "Caminata por el parque", description: "Una vuelta suave de 20 minutos observando la naturaleza.", mood: "activo", time: "corto", place: "Al aire libre" },
  { title: "Escucha un audiolibro", description: "Elige un clásico de la biblioteca de PRISMA y relájate.", mood: "tranquilo", time: "medio", place: "En casa" },
  { title: "Llama a un viejo amigo", description: "Retoma el contacto con alguien a quien extrañas.", mood: "social", time: "corto", place: "En casa" },
  { title: "Taller de pintura en acuarela", description: "Únete al taller virtual y pinta tu primer paisaje.", mood: "creativo", time: "medio", place: "Virtual" },
  { title: "Visita un museo de tu ciudad", description: "Muchos tienen entrada gratuita o con descuento para mayores.", mood: "social", time: "largo", place: "Salida" },
  { title: "Huerto en macetas", description: "Siembra hierbas aromáticas en tu balcón o ventana.", mood: "tranquilo", time: "largo", place: "En casa" },
  { title: "Baile en casa", description: "Pon tu música favorita y muévete 15 minutos.", mood: "activo", time: "corto", place: "En casa" },
  { title: "Voluntariado en la comunidad", description: "Ayuda una mañana en un proyecto local de PRISMA.", mood: "social", time: "largo", place: "Salida" },
];
