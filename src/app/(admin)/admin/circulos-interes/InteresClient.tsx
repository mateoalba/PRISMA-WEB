"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/admin.module.css";
import { Drawer } from "../Drawer";
import { Chip, EditButton, DeleteButton, EmptyState, PlusIcon } from "../SharedUi";
import { useAdminUi } from "../AdminUiContext";
import { createInterestCircle, updateInterestCircle, deleteInterestCircle, type AdminInterestCircle } from "@/lib/admin/interest-circles-actions";

type FormState = { id?: string; name: string; description: string; topic: string; schedule_text: string };
const VACIO: FormState = { name: "", description: "", topic: "", schedule_text: "" };

function IcoInteres() {
  return (
    <svg className={styles.ico} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function InteresClient({ initialCircles }: { initialCircles: AdminInterestCircle[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmDelete, runDeferred, notify } = useAdminUi();
  const [circles, setCircles] = useState(initialCircles);
  const [tema, setTema] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<FormState | null>(() => (searchParams.get("crear") === "1" ? VACIO : null));

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setCircles(initialCircles);
  }, [initialCircles]);

  const temas = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of circles) m.set(c.topic, (m.get(c.topic) ?? 0) + 1);
    return [...m.entries()];
  }, [circles]);

  const visibles = tema ? circles.filter((c) => c.topic === tema) : circles;

  function abrirNuevo() {
    setDrawer(VACIO);
  }
  function abrirEditar(c: AdminInterestCircle) {
    setDrawer({ id: c.id, name: c.name, description: c.description, topic: c.topic, schedule_text: c.schedule_text });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!drawer) return;
    const fd = new FormData();
    if (drawer.id) fd.set("id", drawer.id);
    fd.set("name", drawer.name);
    fd.set("description", drawer.description);
    fd.set("topic", drawer.topic);
    fd.set("schedule_text", drawer.schedule_text);

    if (drawer.id) {
      setCircles((prev) => prev.map((c) => (c.id === drawer.id ? { ...c, name: drawer.name, description: drawer.description, topic: drawer.topic, schedule_text: drawer.schedule_text } : c)));
      await updateInterestCircle(fd);
      notify("Cambios guardados");
    } else {
      await createInterestCircle(fd);
      notify("Círculo creado");
      router.refresh();
    }
    setDrawer(null);
  }

  async function eliminar(c: AdminInterestCircle) {
    const ok = await confirmDelete({ title: "¿Eliminar este círculo?", message: `Vas a eliminar "${c.name}". Podrás deshacerlo durante unos segundos.` });
    if (!ok) return;
    setCircles((prev) => prev.filter((x) => x.id !== c.id));
    const fd = new FormData();
    fd.set("id", c.id);
    runDeferred(() => deleteInterestCircle(fd), { message: `Eliminado: ${c.name}`, undo: () => setCircles((prev) => [...prev, c]) });
  }

  return (
    <div>
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Comunidad</div>
          <h1>Círculos de interés</h1>
          <p>Grupos por tema (arte, naturaleza…) que aparecen en Conexión social y comunidad.</p>
        </div>
        <div className={styles.cabAcc}>
          <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={abrirNuevo}>
            <PlusIcon />
            Nuevo círculo
          </button>
        </div>
      </div>

      {temas.length > 0 && (
        <div className={styles.chips} style={{ marginBottom: 18 }}>
          <Chip active={tema === null} onClick={() => setTema(null)}>
            Todos
          </Chip>
          {temas.map(([t, n]) => (
            <Chip key={t} active={tema === t} onClick={() => setTema(t)} count={n}>
              {t}
            </Chip>
          ))}
        </div>
      )}

      {visibles.length === 0 ? (
        <EmptyState title="Todavía no hay círculos" text="Crea el primer círculo de interés." actionLabel="Crear círculo" onAction={abrirNuevo} />
      ) : (
        <div className={styles.filas}>
          {visibles.map((c) => (
            <div key={c.id} className={styles.fila}>
              <span className={styles.filaV} style={{ background: "rgba(159,211,201,.16)", color: "var(--agua)" }}>
                <IcoInteres />
              </span>
              <div className={styles.filaCuerpo}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className={styles.badge}>{c.topic}</span>
                  <h3 style={{ margin: 0 }}>{c.name}</h3>
                </div>
                <p>{c.description}</p>
                <div className={styles.filaMeta}>
                  <span>⏱ {c.schedule_text}</span>
                </div>
              </div>
              <div className={styles.filaAcc}>
                <EditButton onClick={() => abrirEditar(c)} />
                <DeleteButton onClick={() => eliminar(c)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={!!drawer}
        eyebrow={drawer?.id ? "Editar" : "Nuevo"}
        title={drawer?.id ? "Editar círculo" : "Nuevo círculo de interés"}
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button type="submit" form="interes-form" className={`${styles.btn} ${styles.btnP}`}>
              Guardar
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={() => setDrawer(null)}>
              Cancelar
            </button>
          </>
        }
      >
        {drawer && (
          <form id="interes-form" onSubmit={guardar} className={styles.form}>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="i-nombre">Nombre</label>
              <input id="i-nombre" required value={drawer.name} onChange={(e) => setDrawer({ ...drawer, name: e.target.value })} />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="i-desc">Descripción</label>
              <textarea id="i-desc" required value={drawer.description} onChange={(e) => setDrawer({ ...drawer, description: e.target.value })} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="i-tema">Tema</label>
              <input id="i-tema" required value={drawer.topic} onChange={(e) => setDrawer({ ...drawer, topic: e.target.value })} placeholder="Ej: Arte, Naturaleza" />
            </div>
            <div className={styles.campo}>
              <label htmlFor="i-horario">Horario</label>
              <input id="i-horario" required value={drawer.schedule_text} onChange={(e) => setDrawer({ ...drawer, schedule_text: e.target.value })} placeholder="Ej: Sábados 10:00" />
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
