"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/admin.module.css";
import { Drawer } from "../Drawer";
import { EditButton, DeleteButton, EmptyState, PlusIcon } from "../SharedUi";
import { useAdminUi } from "../AdminUiContext";
import { createCircle, updateCircle, deleteCircle, setCircleLive, type AdminCircle } from "@/lib/admin/circles-actions";

type FormState = { id?: string; name: string; description: string; schedule_text: string; capacity: string; moderator_name: string; is_live: boolean };

function IcoApoyo() {
  return (
    <svg className={styles.ico} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 8.5c0-2-1.6-3.5-3.5-3.5S2 6.5 2 8.5c0 3 4 6 7 7.5 3-1.5 7-4.5 7-7.5" />
      <path d="M15 8.5c0-2 1.6-3.5 3.5-3.5S22 6.5 22 8.5c0 3-4 6-7 7.5" />
    </svg>
  );
}

const VACIO: FormState = { name: "", description: "", schedule_text: "", capacity: "8", moderator_name: "", is_live: false };

export function CirculosClient({ initialCircles }: { initialCircles: AdminCircle[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmDelete, runDeferred, notify } = useAdminUi();
  const [circles, setCircles] = useState(initialCircles);
  const [drawer, setDrawer] = useState<FormState | null>(() => (searchParams.get("crear") === "1" ? VACIO : null));

  useEffect(() => {
    // Vuelve a sincronizar con los datos frescos del servidor después de un
    // router.refresh() (p. ej. tras crear un elemento) — no es un derivado
    // de estado local, es sincronizar con la fuente real tras revalidar.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setCircles(initialCircles);
  }, [initialCircles]);

  function abrirNuevo() {
    setDrawer(VACIO);
  }
  function abrirEditar(c: AdminCircle) {
    setDrawer({ id: c.id, name: c.name, description: c.description, schedule_text: c.schedule_text, capacity: String(c.capacity), moderator_name: c.moderator_name, is_live: c.is_live });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!drawer) return;
    const fd = new FormData();
    if (drawer.id) fd.set("id", drawer.id);
    fd.set("name", drawer.name);
    fd.set("description", drawer.description);
    fd.set("schedule_text", drawer.schedule_text);
    fd.set("capacity", drawer.capacity);
    fd.set("moderator_name", drawer.moderator_name);
    if (drawer.is_live) fd.set("is_live", "on");

    if (drawer.id) {
      const updated: AdminCircle = { id: drawer.id, name: drawer.name, description: drawer.description, schedule_text: drawer.schedule_text, capacity: Number(drawer.capacity), moderator_name: drawer.moderator_name, is_live: drawer.is_live, position: 0, created_at: new Date().toISOString() };
      setCircles((prev) => prev.map((c) => (c.id === drawer.id ? { ...c, ...updated, position: c.position, created_at: c.created_at } : c)));
      await updateCircle(fd);
      notify("Cambios guardados");
    } else {
      await createCircle(fd);
      notify("Círculo creado");
      router.refresh();
    }
    setDrawer(null);
  }

  async function eliminar(c: AdminCircle) {
    const ok = await confirmDelete({ title: "¿Eliminar este círculo?", message: `Vas a eliminar "${c.name}". Podrás deshacerlo durante unos segundos.` });
    if (!ok) return;
    setCircles((prev) => prev.filter((x) => x.id !== c.id));
    const fd = new FormData();
    fd.set("id", c.id);
    runDeferred(() => deleteCircle(fd), { message: `Eliminado: ${c.name}`, undo: () => setCircles((prev) => [...prev, c]) });
  }

  function toggleLive(c: AdminCircle) {
    const next = !c.is_live;
    setCircles((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_live: next } : x)));
    setCircleLive(c.id, next);
  }

  return (
    <div>
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Comunidad</div>
          <h1>Círculos de apoyo</h1>
          <p>Grupos moderados que aparecen en la dimensión Salud mental. Quién se une a cada uno lo maneja la propia persona desde la app.</p>
        </div>
        <div className={styles.cabAcc}>
          <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={abrirNuevo}>
            <PlusIcon />
            Nuevo círculo
          </button>
        </div>
      </div>

      {circles.length === 0 ? (
        <EmptyState title="Todavía no hay círculos" text="Crea el primer círculo de apoyo." actionLabel="Crear círculo" onAction={abrirNuevo} />
      ) : (
        <div className={styles.filas}>
          {circles.map((c) => (
            <div key={c.id} className={styles.fila}>
              <span className={styles.filaV} style={c.is_live ? { background: "rgba(255,138,116,.16)", color: "var(--coral)" } : undefined}>
                <IcoApoyo />
              </span>
              <div className={styles.filaCuerpo}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {c.is_live && (
                    <span className={`${styles.badge} ${styles.badgeVivo}`}>
                      <i />
                      En vivo
                    </span>
                  )}
                  <h3 style={{ margin: 0 }}>{c.name}</h3>
                </div>
                <p>{c.description}</p>
                <div className={styles.filaMeta}>
                  <span>⏱ {c.schedule_text}</span>
                  <span>👥 {c.capacity} cupos</span>
                  <span>👤 Modera: {c.moderator_name}</span>
                </div>
              </div>
              <div className={styles.filaAcc}>
                <label className={styles.sw} title="En vivo">
                  <input type="checkbox" checked={c.is_live} onChange={() => toggleLive(c)} />
                  <span className={styles.swT} />
                </label>
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
        title={drawer?.id ? "Editar círculo" : "Nuevo círculo de apoyo"}
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button type="submit" form="circulo-form" className={`${styles.btn} ${styles.btnP}`}>
              Guardar
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={() => setDrawer(null)}>
              Cancelar
            </button>
          </>
        }
      >
        {drawer && (
          <form id="circulo-form" onSubmit={guardar} className={styles.form}>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="c-nombre">Nombre</label>
              <input id="c-nombre" required value={drawer.name} onChange={(e) => setDrawer({ ...drawer, name: e.target.value })} placeholder="Ej: Duelo y acompañamiento" />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="c-desc">Descripción</label>
              <textarea id="c-desc" required value={drawer.description} onChange={(e) => setDrawer({ ...drawer, description: e.target.value })} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="c-horario">Horario</label>
              <input id="c-horario" required value={drawer.schedule_text} onChange={(e) => setDrawer({ ...drawer, schedule_text: e.target.value })} placeholder="Ej: Lunes 17:00" />
            </div>
            <div className={styles.campo}>
              <label htmlFor="c-cupos">Cupos</label>
              <input id="c-cupos" type="number" min={1} required value={drawer.capacity} onChange={(e) => setDrawer({ ...drawer, capacity: e.target.value })} />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="c-modera">Modera</label>
              <input id="c-modera" required value={drawer.moderator_name} onChange={(e) => setDrawer({ ...drawer, moderator_name: e.target.value })} placeholder="Nombre de quien guía el círculo" />
            </div>
            <div className={`${styles.campoFull}`}>
              <label className={styles.sw}>
                <input type="checkbox" checked={drawer.is_live} onChange={(e) => setDrawer({ ...drawer, is_live: e.target.checked })} />
                <span className={styles.swT} />
              </label>
              <span style={{ marginLeft: 10, fontWeight: 700, fontSize: "0.9rem" }}>Marcar como &quot;en vivo&quot; ahora</span>
              <br />
              <small style={{ color: "var(--ink-muted)" }}>Aparece destacado con un punto rojo en la app.</small>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
