"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type Microcurso = {
  id: string;
  title: string;
  description: string;
  topic: string;
  leccionesCount: number;
  totalMinutes: number;
  progressPct: number;
  isNuevo: boolean;
};

type CourseRow = { id: string; title: string; description: string; topic: string; created_at: string };
type LessonRow = { id: string; course_id: string; title: string; duration_minutes: number; position: number };

async function loadBase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: courses }, { data: lessons }] = await Promise.all([
    supabase.from("courses").select("id, title, description, topic, created_at").order("position", { ascending: true }),
    supabase.from("course_lessons").select("id, course_id, title, duration_minutes, position").order("position", { ascending: true }),
  ]);

  let doneLessonIds = new Set<string>();
  if (user) {
    const { data: progress } = await supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id);
    doneLessonIds = new Set((progress ?? []).map((p) => p.lesson_id));
  }

  return {
    supabase,
    user,
    courses: (courses ?? []) as CourseRow[],
    lessons: (lessons ?? []) as LessonRow[],
    doneLessonIds,
  };
}

function isNuevo(createdAt: string) {
  const dias = (Date.now() - new Date(createdAt).getTime()) / 86400000;
  return dias <= 21;
}

export async function getMicrocursos(): Promise<Microcurso[]> {
  const { courses, lessons, doneLessonIds } = await loadBase();

  return courses.map((c) => {
    const suyas = lessons.filter((l) => l.course_id === c.id);
    const hechas = suyas.filter((l) => doneLessonIds.has(l.id)).length;
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      topic: c.topic,
      leccionesCount: suyas.length,
      totalMinutes: suyas.reduce((s, l) => s + l.duration_minutes, 0),
      progressPct: suyas.length > 0 ? Math.round((hechas / suyas.length) * 100) : 0,
      isNuevo: isNuevo(c.created_at),
    };
  });
}

export type LessonState = {
  id: string;
  title: string;
  durationMinutes: number;
  status: "hecha" | "actual" | "bloq";
};

export type ClassroomState = {
  course: { id: string; title: string } | null;
  lessons: LessonState[];
  progressPct: number;
  completedCount: number;
  totalCount: number;
  minutesRemaining: number;
  otros: { id: string; title: string; progressPct: number }[];
};

export async function getClassroomState(): Promise<ClassroomState> {
  const { supabase, user, courses, lessons, doneLessonIds } = await loadBase();

  const vacio: ClassroomState = {
    course: null,
    lessons: [],
    progressPct: 0,
    completedCount: 0,
    totalCount: 0,
    minutesRemaining: 0,
    otros: [],
  };
  if (!user) return vacio;

  const porCurso = courses.map((c) => {
    const suyas = lessons.filter((l) => l.course_id === c.id);
    const hechas = suyas.filter((l) => doneLessonIds.has(l.id));
    return { course: c, lecciones: suyas, hechas: hechas.length, total: suyas.length };
  });

  const enProgreso = porCurso.filter((p) => p.hechas > 0 && p.hechas < p.total);
  if (enProgreso.length === 0) return vacio;

  const { data: ultimos } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed_at")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  const lessonToCourse = new Map(lessons.map((l) => [l.id, l.course_id]));
  let destacadoId: string | null = null;
  for (const row of ultimos ?? []) {
    const courseId = lessonToCourse.get(row.lesson_id);
    if (courseId && enProgreso.some((p) => p.course.id === courseId)) {
      destacadoId = courseId;
      break;
    }
  }
  const destacado = enProgreso.find((p) => p.course.id === destacadoId) ?? enProgreso[0];

  let vistoActual = false;
  const lessonStates: LessonState[] = destacado.lecciones.map((l) => {
    if (doneLessonIds.has(l.id)) return { id: l.id, title: l.title, durationMinutes: l.duration_minutes, status: "hecha" };
    if (!vistoActual) {
      vistoActual = true;
      return { id: l.id, title: l.title, durationMinutes: l.duration_minutes, status: "actual" };
    }
    return { id: l.id, title: l.title, durationMinutes: l.duration_minutes, status: "bloq" };
  });

  return {
    course: { id: destacado.course.id, title: destacado.course.title },
    lessons: lessonStates,
    progressPct: Math.round((destacado.hechas / destacado.total) * 100),
    completedCount: destacado.hechas,
    totalCount: destacado.total,
    minutesRemaining: lessonStates.filter((l) => l.status !== "hecha").reduce((s, l) => s + l.durationMinutes, 0),
    otros: enProgreso
      .filter((p) => p.course.id !== destacado.course.id)
      .map((p) => ({ id: p.course.id, title: p.course.title, progressPct: Math.round((p.hechas / p.total) * 100) })),
  };
}

export async function completeLesson(lessonId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("lesson_progress").insert({ user_id: user.id, lesson_id: lessonId });
  revalidatePath("/dimensiones/educacion-continua");
}

export type CertificadoEstado = {
  id: string;
  title: string;
  topic: string;
  totalMinutes: number;
  obtenido: boolean;
  progressPct: number;
  fecha: string | null;
};

export async function getMyCertificates(): Promise<CertificadoEstado[]> {
  const { supabase, user, courses, lessons, doneLessonIds } = await loadBase();
  if (!user) {
    return courses.map((c) => {
      const suyas = lessons.filter((l) => l.course_id === c.id);
      return {
        id: c.id,
        title: c.title,
        topic: c.topic,
        totalMinutes: suyas.reduce((s, l) => s + l.duration_minutes, 0),
        obtenido: false,
        progressPct: 0,
        fecha: null,
      };
    });
  }

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed_at")
    .eq("user_id", user.id);
  const fechaPorLeccion = new Map((progress ?? []).map((p) => [p.lesson_id, p.completed_at]));

  return courses.map((c) => {
    const suyas = lessons.filter((l) => l.course_id === c.id);
    const hechas = suyas.filter((l) => doneLessonIds.has(l.id));
    const obtenido = suyas.length > 0 && hechas.length === suyas.length;
    const fechas = hechas.map((l) => fechaPorLeccion.get(l.id)).filter((f): f is string => Boolean(f));
    return {
      id: c.id,
      title: c.title,
      topic: c.topic,
      totalMinutes: suyas.reduce((s, l) => s + l.duration_minutes, 0),
      obtenido,
      progressPct: suyas.length > 0 ? Math.round((hechas.length / suyas.length) * 100) : 0,
      fecha: obtenido && fechas.length > 0 ? fechas.sort().at(-1)! : null,
    };
  });
}
