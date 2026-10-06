"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/admin.module.css";
import { Drawer } from "../Drawer";
import { EditButton, DeleteButton, EmptyState, PlusIcon } from "../SharedUi";
import { useAdminUi } from "../AdminUiContext";
import {
  createIntergenerationalProject,
  updateIntergenerationalProject,
  deleteIntergenerationalProject,
  setIntergenerationalPairs,
  type AdminIntergenerationalProject,
} from "@/lib/admin/intergenerational-admin-actions";

type FormState = { id?: string; title: string; description: string; partner_name: string };
const VACIO: FormState = { title: "", description: "", partner_name: "" };

function IcoEncuentro() {
  return (
    <svg className={styles.ico} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
      <path d="M14.5 15c2.4.2 4.5 2.3 4.7 5" />
    </svg>
  );
}
function IcoEstrella() {
  return (
    <svg className={styles.ico} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" />
    </svg>
  );
}

export function EncuentrosClient({
  initialProjects,
  initialPairs,
}: {
  initialProjects: AdminIntergenerationalProject[];
  initialPairs: number | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirmDelete, runDeferred, notify } = useAdminUi();
  const [projects, setProjects] = useState(initialProjects);
  const [pairs, setPairs] = useState(initialPairs ?? 0);
  const [isPending, startTransition] = useTransition();
  const [drawer, setDrawer] = useState<FormState | null>(() => (searchParams.get("crear") === "1" ? VACIO : null));

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setProjects(initialProjects);
  }, [initialProjects]);

  const dirty = pairs !== (initialPairs ?? 0);

  function guardarParejas() {
    const fd = new FormData();
    fd.set("pairs", String(pairs));
    startTransition(async () => {
      await setIntergenerationalPairs(fd);
      notify("Número de parejas actualizado");
      router.refresh();
    });
  }

  function abrirNuevo() {
    setDrawer(VACIO);
  }
  function abrirEditar(p: AdminIntergenerationalProject) {
    setDrawer({ id: p.id, title: p.title, description: p.description, partner_name: p.partner_name });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!drawer) return;
    const fd = new FormData();
    if (drawer.id) fd.set("id", drawer.id);
    fd.set("title", drawer.title);
    fd.set("description", drawer.description);
    fd.set("partner_name", drawer.partner_name);

    if (drawer.id) {
      setProjects((prev) => prev.map((p) => (p.id === drawer.id ? { ...p, title: drawer.title, description: drawer.description, partner_name: drawer.partner_name } : p)));
      await updateIntergenerationalProject(fd);
      notify("Cambios guardados");
    } else {
      await createIntergenerationalProject(fd);
      notify("Proyecto creado");
      router.refresh();
    }
    setDrawer(null);
  }

  async function eliminar(p: AdminIntergenerationalProject) {
    const ok = await confirmDelete({ title: "¿Eliminar este proyecto?", message: `Vas a eliminar "${p.title}". Podrás deshacerlo durante unos segundos.` });
    if (!ok) return;
    setProjects((prev) => prev.filter((x) => x.id !== p.id));
    const fd = new FormData();
    fd.set("id", p.id);
    runDeferred(() => deleteIntergenerationalProject(fd), { message: `Eliminado: ${p.title}`, undo: () => setProjects((prev) => [...prev, p]) });
  }

  const puntos = Array.from({ length: Math.min(60, pairs) });

  return (
    <div>
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Comunidad</div>
          <h1>Intergeneracional</h1>
          <p>Proyectos con colegios, universidades o empresas, y el número de parejas activas.</p>
        </div>
        <div className={styles.cabAcc}>
          <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={abrirNuevo}>
            <PlusIcon />
            Nuevo proyecto
          </button>
        </div>
      </div>

      <div className={styles.panel} style={{ marginBottom: 22 }}>
        <div className={styles.panelT}>
          <h2>Parejas activas</h2>
          <small>Se muestra en la dimensión Conexión social</small>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <button type="button" className={styles.btnIco} onClick={() => setPairs((p) => Math.max(0, p - 1))} aria-label="Restar una pareja">
            −
          </button>
          <output style={{ fontFamily: "var(--font-fraunces, serif)", fontSize: "2.4rem", minWidth: 56, textAlign: "center" }}>{pairs}</output>
          <button type="button" className={styles.btnIco} onClick={() => setPairs((p) => p + 1)} aria-label="Sumar una pareja">
            +
          </button>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, maxWidth: 240 }} aria-hidden="true">
            {puntos.map((_, i) => (
              <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
            ))}
          </div>
          <button type="button" className={`${styles.btn} ${styles.btnP}`} disabled={!dirty || isPending} onClick={guardarParejas} style={{ marginLeft: "auto" }}>
            Guardar número
          </button>
        </div>
        <small style={{ color: "var(--ink-muted)", marginTop: 8, display: "block" }}>
          {dirty ? `Cambió de ${initialPairs ?? 0} a ${pairs}` : "Guardado"}
        </small>
      </div>

      {projects.length === 0 ? (
        <EmptyState title="Todavía no hay proyectos" text="Agrega el primer proyecto intergeneracional." actionLabel="Crear proyecto" onAction={abrirNuevo} />
      ) : (
        <div className={styles.filas}>
          {projects.map((p) => (
            <div key={p.id} className={styles.fila}>
              <span className={styles.filaV}>
                <IcoEncuentro />
              </span>
              <div className={styles.filaCuerpo}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {p.partner_name && (
                    <span className={`${styles.badge} ${styles.badgeOk}`}>
                      <IcoEstrella />
                      {p.partner_name}
                    </span>
                  )}
                  <h3 style={{ margin: 0 }}>{p.title}</h3>
                </div>
                <p>{p.description}</p>
              </div>
              <div className={styles.filaAcc}>
                <EditButton onClick={() => abrirEditar(p)} />
                <DeleteButton onClick={() => eliminar(p)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={!!drawer}
        eyebrow={drawer?.id ? "Editar" : "Nuevo"}
        title={drawer?.id ? "Editar proyecto" : "Nuevo proyecto intergeneracional"}
        onClose={() => setDrawer(null)}
        footer={
          <>
            <button type="submit" form="encuentro-form" className={`${styles.btn} ${styles.btnP}`}>
              Guardar
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={() => setDrawer(null)}>
              Cancelar
            </button>
          </>
        }
      >
        {drawer && (
          <form id="encuentro-form" onSubmit={guardar} className={styles.form}>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="e-titulo">Título</label>
              <input id="e-titulo" required value={drawer.title} onChange={(e) => setDrawer({ ...drawer, title: e.target.value })} />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="e-desc">Descripción</label>
              <textarea id="e-desc" required value={drawer.description} onChange={(e) => setDrawer({ ...drawer, description: e.target.value })} />
            </div>
            <div className={`${styles.campo} ${styles.campoFull}`}>
              <label htmlFor="e-aliado">Aliado</label>
              <input id="e-aliado" required value={drawer.partner_name} onChange={(e) => setDrawer({ ...drawer, partner_name: e.target.value })} placeholder="Colegio, universidad, empresa…" />
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
