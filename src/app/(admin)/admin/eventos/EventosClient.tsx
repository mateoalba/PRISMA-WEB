"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/admin.module.css";
import { Drawer } from "../Drawer";
import { Tabs, EditButton, DeleteButton, EmptyState, PlusIcon } from "../SharedUi";
import { useAdminUi } from "../AdminUiContext";
import { createCommunityEvent, updateCommunityEvent, deleteCommunityEvent, type AdminCommunityEvent } from "@/lib/admin/community-events-actions";

type FormState = { id?: string; title: string; description: string; event_at: string; mode: "presencial" | "virtual"; location: string };
const VACIO: FormState = { title: "", description: "", event_at: "", mode: "presencial", location: "" };

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function diasHasta(iso: string) {
  const ahora = new Date();
  const fecha = new Date(iso);
  return Math.round((fecha.setHours(0, 0, 0, 0) - ahora.setHours(0, 0, 0, 0)) / 86400000);
}

function etiquetaCuenta(dias: number) {
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Mañana";
  if (dias > 1 && dias <= 7) return `En ${dias} días`;
  return null;
}

export function EventosClient({ initialEvents }: { initialEvents: AdminCommunityEvent[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmDelete, runDeferred, notify } = useAdminUi();
  const [events, setEvents] = useState(initialEvents);
  const [tab, setTab] = useState<"proximos" | "pasados">("proximos");
  const [drawer, setDrawer] = useState<FormState | null>(() => (searchParams.get("crear") === "1" ? VACIO : null));
  const [ahora] = useState(() => Date.now());

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setEvents(initialEvents);
  }, [initialEvents]);

  const proximos = events.filter((e) => new Date(e.event_at).getTime() >= ahora);
  const pasados = [...events.filter((e) => new Date(e.event_at).getTime() < ahora)].reverse();
  const visibles = tab === "proximos" ? proximos : pasados;

  function abrirNuevo() {
    setDrawer(VACIO);
  }
  function abrirEditar(ev: AdminCommunityEvent) {
    setDrawer({ id: ev.id, title: ev.title, description: ev.description, event_at: toDatetimeLocal(ev.event_at), mode: ev.mode, location: ev.location });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!drawer) return;
    const fd = new FormData();
    if (drawer.id) fd.set("id", drawer.id);
    fd.set("title", drawer.title);
    fd.set("description", drawer.description);
    fd.set("event_at", drawer.event_at);
    fd.set("mode", drawer.mode);
    fd.set("location", drawer.location);

    if (drawer.id) {
      const isoNuevo = new Date(drawer.event_at).toISOString();
      setEvents((prev) => prev.map((x) => (x.id === drawer.id ? { ...x, title: drawer.title, description: drawer.description, event_at: isoNuevo, mode: drawer.mode, location: drawer.location } : x)));
      await updateCommunityEvent(fd);
      notify("Cambios guardados");
    } else {
      await createCommunityEvent(fd);
      notify("Evento creado");
      router.refresh();
    }
    setDrawer(null);
  }

  async function eliminar(ev: AdminCommunityEvent) {
    const ok = await confirmDelete({ title: "¿Eliminar este evento?", message: `Vas a eliminar "${ev.title}". Podrás deshacerlo durante unos segundos.` });
    if (!ok) return;
    setEvents((prev) => prev.filter((x) => x.id !== ev.id));
    const fd = new FormData();
    fd.set("id", ev.id);
    runDeferred(() => deleteCommunityEvent(fd), { message: `Eliminado: ${ev.title}`, undo: () => setEvents((prev) => [...prev, ev]) });
  }

  return (
    <div>
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Comunidad</div>
          <h1>Eventos</h1>
          <p>Actividades presenciales y virtuales para la comunidad PRISMA.</p>
        </div>
        <div className={styles.cabAcc}>
          <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={abrirNuevo}>
            <PlusIcon />
            Nuevo evento
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <Tabs
          tabs={[
            { value: "proximos", label: "Próximos", count: proximos.length },
            { value: "pasados", label: "Pasados", count: pasados.length },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {visibles.length === 0 ? (
        <EmptyState title={tab === "proximos" ? "No hay eventos próximos" : "No hay eventos pasados"} text="Crea un evento y aparecerá en la agenda de la app." actionLabel="Crear evento" onAction={abrirNuevo} />
      ) : (
        <div className={styles.lineaTiempo}>
          {visibles.map((ev) => {
            const fecha = new Date(ev.event_at);
            const dias = diasHasta(ev.event_at);
            const cuenta = tab === "proximos" ? etiquetaCuenta(dias) : null;
            return (
              <div key={ev.id} className={`${styles.lineaItem} ${tab === "pasados" ? styles.lineaPasado : ""}`}>
                <span className={styles.lineaPunto} aria-hidden="true" />
                <div className={styles.fecha}>
                  <b>{fecha.getDate()}</b>
                  <small>{fecha.toLocaleDateString("es-CO", { month: "short" }).replace(".", "")}</small>
                </div>
                <div className={styles.fila}>
                  <span
                    className={styles.badge}
                    style={ev.mode === "virtual" ? { background: "rgba(159,211,201,.16)", color: "var(--agua)" } : { background: "var(--accent-soft)", color: "var(--accent-text)" }}
                  >
                    {ev.mode === "virtual" ? "Virtual" : "Presencial"}
                  </span>
                  <div className={styles.filaCuerpo}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h3 style={{ margin: 0 }}>{ev.title}</h3>
                      {cuenta && <span className={`${styles.badge} ${styles.badgeAviso}`}>{cuenta}</span>}
                    </div>
                    <p>{ev.description}</p>
                    <div className={styles.filaMeta}>
                      <span>⏱ {fecha.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" })}</span>
                      <span>📍 {ev.location}</span>
                    </div>
                  </div>
                  <div className={styles.filaAcc}>
                    <EditButton onClick={() => abrirEditar(ev)} />
                    <DeleteButton onClick={() => eliminar(ev)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Drawer
        open={!!drawer}
        eyebrow={drawer?.id ? "Editar" : "Nuevo"}
        title={drawer?.id ? "Editar evento" : "Nuevo evento"}
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button type="submit" form="evento-form" className={`${styles.btn} ${styles.btnP}`}>
              Guardar
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={() => setDrawer(null)}>
              Cancelar
            </button>
          </>
        }
      >
        {drawer && (
          <form id="evento-form" onSubmit={guardar} className={styles.form}>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="ev-titulo">Título</label>
              <input id="ev-titulo" required value={drawer.title} onChange={(e) => setDrawer({ ...drawer, title: e.target.value })} />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="ev-desc">Descripción</label>
              <textarea id="ev-desc" required value={drawer.description} onChange={(e) => setDrawer({ ...drawer, description: e.target.value })} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="ev-fecha">Fecha y hora</label>
              <input id="ev-fecha" type="datetime-local" required value={drawer.event_at} onChange={(e) => setDrawer({ ...drawer, event_at: e.target.value })} />
            </div>
            <div className={styles.campo}>
              <label>Modalidad</label>
              <div className={styles.seg}>
                <label>
                  <input type="radio" name="modalidad" checked={drawer.mode === "presencial"} onChange={() => setDrawer({ ...drawer, mode: "presencial" })} />
                  <span>Presencial</span>
                </label>
                <label>
                  <input type="radio" name="modalidad" checked={drawer.mode === "virtual"} onChange={() => setDrawer({ ...drawer, mode: "virtual" })} />
                  <span>Virtual</span>
                </label>
              </div>
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="ev-lugar">Lugar o enlace</label>
              <input id="ev-lugar" required value={drawer.location} onChange={(e) => setDrawer({ ...drawer, location: e.target.value })} placeholder="Dirección o link de la reunión" />
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
