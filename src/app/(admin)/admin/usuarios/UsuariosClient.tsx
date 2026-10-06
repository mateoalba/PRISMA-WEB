"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/styles/admin.module.css";
import { Chip, EmptyState, Portal } from "../SharedUi";
import { useAdminUi } from "../AdminUiContext";
import { setUserBanned, setUserMembership, type AdminUser } from "@/lib/admin/users-actions";
import { DIMENSIONS } from "@/lib/dimensions";
import { dimensionAdminColor } from "@/lib/admin/dimension-admin-colors";

type Estado = "activo" | "pendiente" | "suspendido";
type Orden = "name" | "email" | "createdAt" | "estado";

function estadoDe(u: AdminUser): Estado {
  if (u.banned) return "suspendido";
  if (u.onboardingPending) return "pendiente";
  return "activo";
}

const ESTADO_LABEL: Record<Estado, string> = { activo: "Activo", pendiente: "Pendiente", suspendido: "Suspendido" };

function IcoOrden({ dir }: { dir: "asc" | "desc" | null }) {
  if (!dir) return null;
  return <span style={{ fontSize: "0.7rem" }}>{dir === "asc" ? "↑" : "↓"}</span>;
}

function csvEscape(v: string) {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function UsuariosClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const searchParams = useSearchParams();
  const { notify } = useAdminUi();
  const [users, setUsers] = useState(initialUsers);
  const [texto, setTexto] = useState(searchParams.get("buscar") ?? "");
  const [filtro, setFiltro] = useState<Estado | null>(null);
  const [orden, setOrden] = useState<{ campo: Orden; dir: "asc" | "desc" }>({ campo: "createdAt", dir: "desc" });
  const [detalle, setDetalle] = useState<AdminUser | null>(null);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setUsers(initialUsers);
  }, [initialUsers]);

  const conteos = useMemo(() => {
    const c = { activo: 0, pendiente: 0, suspendido: 0 };
    for (const u of users) c[estadoDe(u)]++;
    return c;
  }, [users]);

  const visibles = useMemo(() => {
    let l = users.filter((u) => {
      const okTexto = texto.trim() ? `${u.name} ${u.email}`.toLowerCase().includes(texto.toLowerCase()) : true;
      const okEstado = filtro ? estadoDe(u) === filtro : true;
      return okTexto && okEstado;
    });
    l = [...l].sort((a, b) => {
      let cmp = 0;
      if (orden.campo === "name") cmp = a.name.localeCompare(b.name);
      else if (orden.campo === "email") cmp = a.email.localeCompare(b.email);
      else if (orden.campo === "createdAt") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (orden.campo === "estado") cmp = estadoDe(a).localeCompare(estadoDe(b));
      return orden.dir === "asc" ? cmp : -cmp;
    });
    return l;
  }, [users, texto, filtro, orden]);

  function ordenarPor(campo: Orden) {
    setOrden((prev) => (prev.campo === campo ? { campo, dir: prev.dir === "asc" ? "desc" : "asc" } : { campo, dir: "asc" }));
  }

  function exportarCsv() {
    const filas = [["Nombre", "Correo", "Registrado", "Estado"], ...visibles.map((u) => [u.name || "—", u.email, new Date(u.createdAt).toLocaleDateString("es-CO"), ESTADO_LABEL[estadoDe(u)]])];
    const csv = filas.map((f) => f.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "usuarios-prisma.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function cambiarEstado(u: AdminUser, nuevo: "activo" | "suspendido") {
    const banned = nuevo === "suspendido";
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, banned } : x)));
    setDetalle((prev) => (prev && prev.id === u.id ? { ...prev, banned } : prev));
    await setUserBanned(u.id, banned);
    notify(nuevo === "suspendido" ? "Usuario suspendido" : "Usuario activado");
  }

  async function cambiarMembresia(u: AdminUser, activa: boolean) {
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, hasMembership: activa } : x)));
    setDetalle((prev) => (prev && prev.id === u.id ? { ...prev, hasMembership: activa } : prev));
    await setUserMembership(u.id, activa);
    notify(activa ? "Membresía activada" : "Membresía desactivada");
  }

  return (
    <div>
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Personas</div>
          <h1>Usuarios</h1>
          <p>
            {users.length} cuenta{users.length === 1 ? "" : "s"} registrada{users.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className={styles.cabAcc}>
          <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={exportarCsv}>
            Exportar CSV
          </button>
        </div>
      </div>

      <div className={styles.barraHerr}>
        <div className={styles.campoBuscar}>
          <svg className={styles.ico} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar por nombre o correo…" />
        </div>
        <div className={styles.chips}>
          <Chip active={filtro === null} onClick={() => setFiltro(null)} count={users.length}>
            Todos
          </Chip>
          <Chip active={filtro === "activo"} onClick={() => setFiltro("activo")} count={conteos.activo}>
            Activo
          </Chip>
          <Chip active={filtro === "pendiente"} onClick={() => setFiltro("pendiente")} count={conteos.pendiente}>
            Pendiente
          </Chip>
          <Chip active={filtro === "suspendido"} onClick={() => setFiltro("suspendido")} count={conteos.suspendido}>
            Suspendido
          </Chip>
        </div>
      </div>

      {visibles.length === 0 ? (
        <EmptyState title="No encontramos usuarios" text="Prueba con otra búsqueda o filtro." />
      ) : (
        <div className={styles.tablaWrap}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>
                  <button type="button" className={styles.tablaOrdenable} onClick={() => ordenarPor("name")}>
                    Nombre <IcoOrden dir={orden.campo === "name" ? orden.dir : null} />
                  </button>
                </th>
                <th>
                  <button type="button" className={styles.tablaOrdenable} onClick={() => ordenarPor("email")}>
                    Correo <IcoOrden dir={orden.campo === "email" ? orden.dir : null} />
                  </button>
                </th>
                <th>
                  <button type="button" className={styles.tablaOrdenable} onClick={() => ordenarPor("createdAt")}>
                    Registrado <IcoOrden dir={orden.campo === "createdAt" ? orden.dir : null} />
                  </button>
                </th>
                <th>Dimensiones</th>
                <th>
                  <button type="button" className={styles.tablaOrdenable} onClick={() => ordenarPor("estado")}>
                    Estado <IcoOrden dir={orden.campo === "estado" ? orden.dir : null} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((u) => {
                const estado = estadoDe(u);
                return (
                  <tr key={u.id} className={styles.tablaFila} tabIndex={0} onClick={() => setDetalle(u)} onKeyDown={(e) => e.key === "Enter" && setDetalle(u)}>
                    <td>
                      <div className={styles.tablaPersona}>
                        <span className={styles.avatar}>{(u.name || u.email || "?").charAt(0).toUpperCase()}</span>
                        {u.name || "—"}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString("es-CO")}</td>
                    <td>
                      <div className={styles.tablaDims}>
                        {u.interests.length === 0 ? (
                          <span style={{ color: "var(--ink-muted)" }}>—</span>
                        ) : (
                          u.interests.map((slug) => {
                            const color = dimensionAdminColor(slug);
                            const nombre = DIMENSIONS.find((d) => d.slug === slug)?.title ?? slug;
                            return <span key={slug} className={styles.tablaDim} style={{ background: color }} title={nombre} />;
                          })
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span
                          className={`${styles.badge} ${estado === "activo" ? styles.badgeOk : estado === "pendiente" ? styles.badgeAviso : ""}`}
                          style={estado === "suspendido" ? { background: "rgba(255,138,116,.16)", color: "var(--coral)" } : undefined}
                        >
                          {ESTADO_LABEL[estado]}
                        </span>
                        {u.hasMembership && (
                          <span className={styles.badge} style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}>
                            Miembro ${u.membershipPrice}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detalle && (
        <Portal>
        <div className={styles.drawerVelo} role="presentation" onClick={() => setDetalle(null)}>
          <div className={styles.drawerCaja} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerCab}>
              <div>
                <div className={styles.eyebrow}>Usuario</div>
                <h2>{detalle.name || detalle.email}</h2>
              </div>
              <button type="button" className={styles.btnIco} onClick={() => setDetalle(null)} aria-label="Cerrar">
                ×
              </button>
            </div>
            <div className={styles.drawerCuerpo}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className={styles.avatar} style={{ width: 52, height: 52, fontSize: "1.2rem" }}>
                  {(detalle.name || detalle.email || "?").charAt(0).toUpperCase()}
                </span>
                <div>
                  <b style={{ display: "block" }}>{detalle.name || "Sin nombre"}</b>
                  <span style={{ color: "var(--ink-muted)", fontSize: "0.86rem" }}>{detalle.email}</span>
                  <br />
                  <span style={{ color: "var(--ink-muted)", fontSize: "0.82rem" }}>
                    Desde {new Date(detalle.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>

              {detalle.onboardingPending && (
                <span className={`${styles.badge} ${styles.badgeAviso}`} style={{ width: "fit-content" }}>
                  Onboarding pendiente — todavía no eligió sus intereses
                </span>
              )}

              <div>
                <label style={{ fontSize: "0.86rem", fontWeight: 800, color: "var(--ink-soft)", display: "block", marginBottom: 8 }}>Estado de la cuenta</label>
                <div className={styles.seg}>
                  <label>
                    <input type="radio" checked={!detalle.banned} onChange={() => cambiarEstado(detalle, "activo")} />
                    <span>Activo</span>
                  </label>
                  <label>
                    <input type="radio" checked={detalle.banned} onChange={() => cambiarEstado(detalle, "suspendido")} />
                    <span>Suspendido</span>
                  </label>
                </div>
                <small style={{ color: "var(--ink-muted)", display: "block", marginTop: 8 }}>&quot;Suspendido&quot; impide iniciar sesión; no borra sus datos.</small>
              </div>

              <div>
                <label style={{ fontSize: "0.86rem", fontWeight: 800, color: "var(--ink-soft)", display: "block", marginBottom: 8 }}>Membresía</label>
                <div className={styles.seg}>
                  <label>
                    <input type="radio" checked={!detalle.hasMembership} onChange={() => cambiarMembresia(detalle, false)} />
                    <span>Sin membresía</span>
                  </label>
                  <label>
                    <input type="radio" checked={detalle.hasMembership} onChange={() => cambiarMembresia(detalle, true)} />
                    <span>Activa</span>
                  </label>
                </div>
                <small style={{ color: "var(--ink-muted)", display: "block", marginTop: 8 }}>
                  Precio actual: <b style={{ color: "var(--ink)" }}>${detalle.membershipPrice}/mes</b>
                  {detalle.referredByName && <> · Referido por {detalle.referredByName}</>}. Sin pasarela de pago conectada todavía, se activa aquí a mano.
                </small>
              </div>

              <div>
                <label style={{ fontSize: "0.86rem", fontWeight: 800, color: "var(--ink-soft)", display: "block", marginBottom: 8 }}>Dimensiones de interés</label>
                {detalle.interests.length === 0 ? (
                  <p style={{ color: "var(--ink-muted)", margin: 0 }}>Todavía no eligió intereses.</p>
                ) : (
                  <div className={styles.chips}>
                    {detalle.interests.map((slug) => {
                      const color = dimensionAdminColor(slug);
                      const nombre = DIMENSIONS.find((d) => d.slug === slug)?.title ?? slug;
                      return (
                        <span key={slug} className={styles.chip} style={{ cursor: "default" }}>
                          <i className={styles.chipIco} style={{ ["--c" as string]: color }} />
                          {nombre}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
}
