// Tipos y constantes compartidas del programa de cada dimensión.
// En un archivo aparte (sin "use server") porque ese tipo de archivo solo
// puede exportar funciones async — esto son valores/tipos normales.
export type ProgramCategory = "entrenamiento" | "materiales" | "formacion" | "actividades";

export type ProgramItemType =
  | "pdf"
  | "audio"
  | "video"
  | "curso"
  | "guia"
  | "taller"
  | "reto"
  | "encuentro";

export const PROGRAM_ITEM_TYPES: { value: ProgramItemType; label: string }[] = [
  { value: "guia", label: "Práctica / guía" },
  { value: "pdf", label: "PDF" },
  { value: "audio", label: "Audio" },
  { value: "video", label: "Video" },
  { value: "curso", label: "Curso" },
  { value: "taller", label: "Taller" },
  { value: "reto", label: "Reto" },
  { value: "encuentro", label: "Encuentro" },
];

export type ProgramItemRow = {
  id: string;
  slug: string;
  category: ProgramCategory;
  title: string;
  meta: string | null;
  description: string;
  type: ProgramItemType;
  link: string | null;
  position: number;
  created_at: string;
};
