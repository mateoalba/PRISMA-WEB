"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin.module.css";
import { Drawer } from "../Drawer";
import { Chip, EmptyState, EditButton, DeleteButton, PlusIcon, TrashIcon } from "../SharedUi";
import { useAdminUi } from "../AdminUiContext";
import { createActivity, updateActivity, deleteActivity } from "@/lib/admin/interactive-activities-actions";
import { dimensionAdminColor } from "@/lib/admin/dimension-admin-colors";
import type { Dimension } from "@/lib/dimensions";
import type { ActivityRow, ActivityType, QuizConfig, ChecklistConfig, ReflexionConfig } from "@/lib/interactive-activities/types";

const TIPOS: { value: ActivityType; label: string }[] = [
  { value: "quiz", label: "Quiz" },
  { value: "checklist", label: "Lista de pasos" },
  { value: "reflexion", label: "Reflexión" },
];

type QuizQForm = { question: string; options: string[]; correctIndex: number; explanation: string };

type FormState = {
  id?: string;
  slug: string;
  type: ActivityType;
  title: string;
  description: string;
  checklistText: string;
  reflexionPrompt: string;
  quizQuestions: QuizQForm[];
};

function vacioQuizPregunta(): QuizQForm {
  return { question: "", options: ["", ""], correctIndex: 0, explanation: "" };
}

function formDesdeActividad(a: ActivityRow): FormState {
  const base: FormState = {
    id: a.id,
    slug: a.slug,
    type: a.type,
    title: a.title,
    description: a.description,
    checklistText: "",
    reflexionPrompt: "",
    quizQuestions: [vacioQuizPregunta()],
  };
  if (a.type === "checklist") base.checklistText = (a.config as ChecklistConfig).items.join("\n");
  if (a.type === "reflexion") base.reflexionPrompt = (a.config as ReflexionConfig).prompt;
  if (a.type === "quiz") {
    const qs = (a.config as QuizConfig).questions.map((q) => ({ question: q.question, options: [...q.options], correctIndex: q.correctIndex, explanation: q.explanation ?? "" }));
    base.quizQuestions = qs.length > 0 ? qs : [vacioQuizPregunta()];
  }
  return base;
}

function formVacio(slug: string): FormState {
  return { slug, type: "checklist", title: "", description: "", checklistText: "", reflexionPrompt: "", quizQuestions: [vacioQuizPregunta()] };
}

function construirConfig(f: FormState): QuizConfig | ChecklistConfig | ReflexionConfig {
  if (f.type === "checklist") {
    return { items: f.checklistText.split("\n").map((s) => s.trim()).filter(Boolean) };
  }
  if (f.type === "reflexion") {
    return { prompt: f.reflexionPrompt.trim() };
  }
  return {
    questions: f.quizQuestions
      .filter((q) => q.question.trim() && q.options.filter((o) => o.trim()).length >= 2)
      .map((q) => {
        const opciones = q.options.map((o) => o.trim()).filter(Boolean);
        const correcta = Math.min(q.correctIndex, opciones.length - 1);
        return { question: q.question.trim(), options: opciones, correctIndex: correcta, ...(q.explanation.trim() ? { explanation: q.explanation.trim() } : {}) };
      }),
  };
}

export function ActividadesClient({
  dimension,
  allDimensions,
  allActivities,
}: {
  dimension: Dimension;
  allDimensions: Dimension[];
  allActivities: ActivityRow[];
}) {
  const router = useRouter();
  const { confirmDelete, runDeferred, notify } = useAdminUi();
  const [activities, setActivities] = useState(allActivities);
  const [drawer, setDrawer] = useState<FormState | null>(null);

  const items = activities.filter((a) => a.slug === dimension.slug);
  const color = dimensionAdminColor(dimension.slug);

  function abrirNuevo() {
    setDrawer(formVacio(dimension.slug));
  }
  function abrirEditar(a: ActivityRow) {
    setDrawer(formDesdeActividad(a));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!drawer) return;
    const config = construirConfig(drawer);
    const fd = new FormData();
    if (drawer.id) fd.set("id", drawer.id);
    fd.set("slug", drawer.slug);
    fd.set("type", drawer.type);
    fd.set("title", drawer.title);
    fd.set("description", drawer.description);
    fd.set("config", JSON.stringify(config));

    if (drawer.id) {
      const updated: ActivityRow = { id: drawer.id, slug: drawer.slug, type: drawer.type, title: drawer.title, description: drawer.description, config, position: 0 };
      setActivities((prev) => prev.map((a) => (a.id === drawer.id ? { ...a, ...updated, position: a.position } : a)));
      await updateActivity(fd);
      notify("Cambios guardados");
    } else {
      await createActivity(fd);
      router.refresh();
      notify("Actividad agregada");
    }
    setDrawer(null);
  }

  async function eliminar(a: ActivityRow) {
    const ok = await confirmDelete({ title: "¿Eliminar esta actividad?", message: `Vas a eliminar "${a.title}". Podrás deshacerlo durante unos segundos.` });
    if (!ok) return;
    setActivities((prev) => prev.filter((x) => x.id !== a.id));
    const fd = new FormData();
    fd.set("id", a.id);
    fd.set("slug", a.slug);
    runDeferred(() => deleteActivity(fd), { message: `Eliminada: ${a.title}`, undo: () => setActivities((prev) => [...prev, a]) });
  }

  function actualizarPregunta(i: number, patch: Partial<QuizQForm>) {
    if (!drawer) return;
    setDrawer({ ...drawer, quizQuestions: drawer.quizQuestions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) });
  }
  function actualizarOpcion(qi: number, oi: number, valor: string) {
    if (!drawer) return;
    setDrawer({
      ...drawer,
      quizQuestions: drawer.quizQuestions.map((q, idx) => (idx === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? valor : o)) } : q)),
    });
  }

  return (
    <div>
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Actividades interactivas</div>
          <h1>{dimension.title}</h1>
          <p>Quizzes, listas de pasos y reflexiones que la persona completa dentro de esta dimensión.</p>
        </div>
        <div className={styles.cabAcc}>
          <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={abrirNuevo}>
            <PlusIcon />
            Agregar a {dimension.title}
          </button>
        </div>
      </div>

      <div className={styles.chips} style={{ marginBottom: 20 }}>
        {allDimensions.map((d) => (
          <Chip key={d.slug} active={d.slug === dimension.slug} onClick={() => router.push(`/admin/actividades?slug=${d.slug}`)} color={dimensionAdminColor(d.slug)}>
            {d.title}
          </Chip>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState title={`${dimension.title} no tiene actividades interactivas todavía`} text="Agrega la primera y aparecerá en la página de la dimensión." actionLabel="Agregar la primera" onAction={abrirNuevo} />
      ) : (
        <div className={styles.filas}>
          {items.map((a) => (
            <div key={a.id} className={styles.fila}>
              <span className={styles.filaV} style={{ ["--c" as string]: color, background: `${color}22`, color }}>
                {TIPOS.find((t) => t.value === a.type)?.label.charAt(0)}
              </span>
              <div className={styles.filaCuerpo}>
                <h3>{a.title}</h3>
                <p>{a.description}</p>
                <div className={styles.filaMeta}>
                  <span>{TIPOS.find((t) => t.value === a.type)?.label}</span>
                </div>
              </div>
              <div className={styles.filaAcc}>
                <EditButton onClick={() => abrirEditar(a)} />
                <DeleteButton onClick={() => eliminar(a)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={!!drawer}
        eyebrow={drawer?.id ? "Editar" : "Nueva"}
        title={drawer?.id ? "Editar actividad" : "Nueva actividad interactiva"}
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button type="submit" form="actividad-form" className={`${styles.btn} ${styles.btnP}`}>
              Guardar
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={() => setDrawer(null)}>
              Cancelar
            </button>
          </>
        }
      >
        {drawer && (
          <form id="actividad-form" onSubmit={guardar} className={styles.form}>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="ac-titulo">Título</label>
              <input id="ac-titulo" required value={drawer.title} onChange={(e) => setDrawer({ ...drawer, title: e.target.value })} placeholder="Ej: Contraseñas seguras" />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="ac-desc">Descripción corta</label>
              <input id="ac-desc" required value={drawer.description} onChange={(e) => setDrawer({ ...drawer, description: e.target.value })} placeholder="Se muestra debajo del título en la tarjeta" />
            </div>
            <div className={styles.campo}>
              <label htmlFor="ac-tipo">Tipo</label>
              <select id="ac-tipo" value={drawer.type} onChange={(e) => setDrawer({ ...drawer, type: e.target.value as ActivityType })}>
                {TIPOS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.campo}>
              <label htmlFor="ac-dim">Dimensión</label>
              <select id="ac-dim" value={drawer.slug} onChange={(e) => setDrawer({ ...drawer, slug: e.target.value })}>
                {allDimensions.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            {drawer.type === "checklist" && (
              <div className={`${styles.campo} ${styles.campoFull}`}>
                <label htmlFor="ac-checklist">Pasos (uno por línea)</label>
                <textarea
                  id="ac-checklist"
                  rows={6}
                  required
                  value={drawer.checklistText}
                  onChange={(e) => setDrawer({ ...drawer, checklistText: e.target.value })}
                  placeholder={"Cargar la batería\nRevisar el wifi\n…"}
                />
              </div>
            )}

            {drawer.type === "reflexion" && (
              <div className={`${styles.campo} ${styles.campoFull}`}>
                <label htmlFor="ac-reflexion">Pregunta o indicación para escribir</label>
                <textarea id="ac-reflexion" rows={4} required value={drawer.reflexionPrompt} onChange={(e) => setDrawer({ ...drawer, reflexionPrompt: e.target.value })} />
              </div>
            )}

            {drawer.type === "quiz" && (
              <div className={`${styles.campo} ${styles.campoFull}`}>
                <label>Preguntas</label>
                <div style={{ display: "grid", gap: 16 }}>
                  {drawer.quizQuestions.map((q, qi) => (
                    <div key={qi} style={{ border: "1px solid var(--hair-2)", borderRadius: 14, padding: 14, display: "grid", gap: 10 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          required
                          value={q.question}
                          onChange={(e) => actualizarPregunta(qi, { question: e.target.value })}
                          placeholder={`Pregunta ${qi + 1}`}
                          style={{ flex: 1, minHeight: 44, padding: "0 12px", borderRadius: 10, border: "1px solid var(--hair-2)", background: "var(--surface-1)", color: "var(--ink)" }}
                        />
                        {drawer.quizQuestions.length > 1 && (
                          <button type="button" className={styles.btnIco} onClick={() => setDrawer({ ...drawer, quizQuestions: drawer.quizQuestions.filter((_, i) => i !== qi) })} aria-label="Quitar pregunta">
                            <TrashIcon />
                          </button>
                        )}
                      </div>
                      {q.options.map((op, oi) => (
                        <div key={oi} style={{ display: "flex", gap: 8, alignItems: "center", paddingLeft: 8 }}>
                          <input
                            type="radio"
                            name={`correcta-${qi}`}
                            checked={q.correctIndex === oi}
                            onChange={() => actualizarPregunta(qi, { correctIndex: oi })}
                            title="Marcar como correcta"
                          />
                          <input
                            required
                            value={op}
                            onChange={(e) => actualizarOpcion(qi, oi, e.target.value)}
                            placeholder={`Opción ${oi + 1}`}
                            style={{ flex: 1, minHeight: 40, padding: "0 12px", borderRadius: 10, border: "1px solid var(--hair-2)", background: "var(--surface-1)", color: "var(--ink)" }}
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              className={styles.btnIco}
                              onClick={() => actualizarPregunta(qi, { options: q.options.filter((_, i) => i !== oi), correctIndex: q.correctIndex >= oi && q.correctIndex > 0 ? q.correctIndex - 1 : q.correctIndex })}
                              aria-label="Quitar opción"
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" className={`${styles.btn} ${styles.btnG}`} style={{ justifySelf: "start" }} onClick={() => actualizarPregunta(qi, { options: [...q.options, ""] })}>
                        <PlusIcon />
                        Agregar opción
                      </button>
                      <textarea
                        rows={2}
                        value={q.explanation}
                        onChange={(e) => actualizarPregunta(qi, { explanation: e.target.value })}
                        placeholder="Explicación al responder (opcional)"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnG}`}
                  style={{ marginTop: 12 }}
                  onClick={() => setDrawer({ ...drawer, quizQuestions: [...drawer.quizQuestions, vacioQuizPregunta()] })}
                >
                  <PlusIcon />
                  Agregar pregunta
                </button>
              </div>
            )}
          </form>
        )}
      </Drawer>
    </div>
  );
}
