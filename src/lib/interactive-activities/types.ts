// Tipos compartidos de actividades interactivas, en un archivo aparte (sin
// "use server") porque ese tipo de archivo solo puede exportar funciones
// async — esto son tipos normales.
export type ActivityType = "quiz" | "checklist" | "reflexion";

export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};
export type QuizConfig = { questions: QuizQuestion[] };
export type ChecklistConfig = { items: string[] };
export type ReflexionConfig = { prompt: string };
export type ActivityConfig = QuizConfig | ChecklistConfig | ReflexionConfig;

export type ActivityRow = {
  id: string;
  slug: string;
  type: ActivityType;
  title: string;
  description: string;
  config: ActivityConfig;
  position: number;
};

export type QuizResponseData = { answers: (number | null)[] };
export type ChecklistResponseData = { checked: boolean[] };
export type ReflexionResponseData = { text: string };
export type ResponseData = QuizResponseData | ChecklistResponseData | ReflexionResponseData;

export type ActivityWithProgress = ActivityRow & {
  response: ResponseData | null;
  completedAt: string | null;
};

export function isResponseComplete(activity: ActivityRow, response: ResponseData | null): boolean {
  if (!response) return false;
  if (activity.type === "quiz") {
    const r = response as QuizResponseData;
    return r.answers.length > 0 && r.answers.every((a) => a !== null);
  }
  if (activity.type === "checklist") {
    const r = response as ChecklistResponseData;
    return r.checked.length > 0 && r.checked.every(Boolean);
  }
  const r = response as ReflexionResponseData;
  return r.text.trim().length > 0;
}
