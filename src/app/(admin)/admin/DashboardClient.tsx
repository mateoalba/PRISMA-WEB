"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "@/styles/admin.module.css";
import { IcoDash, IcoContenido, IcoApoyo, IcoEventos, IcoTienda } from "./AdminNavIcons";
import type { DashboardData } from "@/lib/admin/dashboard-actions";

const KPI_ICONS = [IcoDash, IcoContenido, IcoApoyo, IcoEventos, IcoTienda];

function useCountUp(target: number, animar: boolean) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    if (!animar) return;
    const t0 = performance.now();
    let raf = 0;
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / 900);
      setValor(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [target, animar]);
  return animar ? valor : 0;
}

function KpiCard({ kpi, Icon, animar }: { kpi: DashboardData["kpis"][number]; Icon: () => React.JSX.Element; animar: boolean }) {
  const valor = useCountUp(kpi.value, animar);
  return (
    <Link href={kpi.href} className={styles.kpi} style={{ ["--c" as string]: kpi.color }}>
      <Icon />
      <span className={styles.kpiN}>{valor}</span>
      <span className={styles.kpiL}>{kpi.label}</span>
      <span className={styles.kpiD}>{kpi.delta}</span>
    </Link>
  );
}

function PrismaIlustracion() {
  return (
    <svg viewBox="0 0 100 100" fill="none">
      <polygon points="50,8 90,75 10,75" fill="#aebd52" opacity="0.9" />
      <polygon points="50,8 90,75 50,55" fill="#c7d873" opacity="0.7" />
    </svg>
  );
}

export function DashboardClient({ data, adminName }: { data: DashboardData; adminName: string }) {
  const [animado, setAnimado] = useState(false);
  const yaAnimo = useRef(false);

  useEffect(() => {
    if (yaAnimo.current) return;
    yaAnimo.current = true;
    const id = requestAnimationFrame(() => setAnimado(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const h = new Date().getHours();
  const saludo = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  const nombre = data.adminFirstName || adminName.split(" ")[0] || "";
  const fecha = new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" });

  const maxBar = Math.max(1, ...data.weekBars.map((b) => b.value));
  const maxEsp = Math.max(1, ...data.spectrum.map((s) => s.count));

  return (
    <div>
      <section className={styles.hola}>
        <div>
          <div className={styles.eyebrow}>{fecha}</div>
          <h1>
            {saludo}
            {nombre ? `, ${nombre}` : ""} <span className={styles.enfasis}>👋</span>
          </h1>
          <p>
            Así está PRISMA hoy.{" "}
            {data.pendingCount > 0 ? (
              <>
                Tienes <b>{data.pendingCount} pendiente{data.pendingCount === 1 ? "" : "s"}</b> por revisar
              </>
            ) : (
              "Todo al día"
            )}
            , y {data.upcomingEventsCount} evento{data.upcomingEventsCount === 1 ? "" : "s"} próximo{data.upcomingEventsCount === 1 ? "" : "s"}.
          </p>
          <div className={styles.holaAcc}>
            <Link href="/admin/eventos?crear=1" className={`${styles.btn} ${styles.btnP}`}>
              Nuevo evento
            </Link>
            <Link href="/admin/tienda?crear=1" className={`${styles.btn} ${styles.btnG}`}>
              Producto
            </Link>
            <Link href="/admin/novedades?tab=novedades&crear=1" className={`${styles.btn} ${styles.btnG}`}>
              Novedad
            </Link>
            <Link href="/admin/circulos?crear=1" className={`${styles.btn} ${styles.btnG}`}>
              Círculo
            </Link>
          </div>
        </div>
        <div className={styles.holaPrisma}>
          <PrismaIlustracion />
        </div>
      </section>

      <div className={styles.kpis}>
        {data.kpis.map((kpi, i) => {
          const Icon = KPI_ICONS[i] ?? IcoDash;
          return <KpiCard key={kpi.label} kpi={kpi} Icon={Icon} animar={animado} />;
        })}
      </div>

      <div className={styles.dash}>
        <div className={styles.panel}>
          <div className={styles.panelT}>
            <h2>Nuevos registros</h2>
            <small>Últimas 8 semanas</small>
          </div>
          <div className={`${styles.barras} ${animado ? styles.barraAnimada : ""}`}>
            {data.weekBars.map((b, i) => (
              <div key={i} className={styles.barra}>
                <i data-v={b.value} style={{ height: `${Math.max(6, (b.value / maxBar) * 100)}%` }} className={b.hoy ? styles.barraHoy : ""} />
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelT}>
            <h2>Por revisar</h2>
            <small>
              {data.pending.length} tarea{data.pending.length === 1 ? "" : "s"}
            </small>
          </div>
          {data.pending.length === 0 ? (
            <div className={styles.pend}>
              <button type="button" className={styles.pendBtn} disabled>
                <span className={`${styles.pendP} ${styles.pendPOk}`} />
                <div>
                  <b>¡Todo al día!</b>
                  <small>No hay nada pendiente</small>
                </div>
              </button>
            </div>
          ) : (
            <div className={styles.pend}>
              {data.pending.map((p, i) => (
                <Link key={i} href={p.href} className={styles.pendBtn}>
                  <span className={`${styles.pendP} ${p.tono === "ok" ? styles.pendPOk : p.tono === "aviso" ? styles.pendPAviso : ""}`} />
                  <div>
                    <b>{p.text}</b>
                    <small>{p.subtitle}</small>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelT}>
            <h2>Programa por dimensión</h2>
            <small>Elementos publicados</small>
          </div>
          <div className={styles.espectro}>
            {data.spectrum.map((s) => (
              <Link key={s.slug} href={s.href} className={styles.esp} style={{ ["--c" as string]: s.color }}>
                <span>{s.name}</span>
                <span className={styles.espB}>
                  <i style={{ width: animado ? `${(s.count / maxEsp) * 100}%` : 0 }} />
                </span>
                <em>{s.count}</em>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelT}>
            <h2>Agenda</h2>
            <Link href="/admin/eventos" className={`${styles.btn} ${styles.btnG} ${styles.btnMini}`}>
              Ver todos
            </Link>
          </div>
          {data.agenda.length === 0 ? (
            <p style={{ color: "var(--ink-muted)", margin: 0 }}>No hay eventos próximos.</p>
          ) : (
            <div className={styles.agenda}>
              {data.agenda.map((a, i) => (
                <div key={i} className={styles.ag}>
                  <div className={styles.fecha}>
                    <b>{a.day}</b>
                    <small>{a.month}</small>
                  </div>
                  <div>
                    <strong>{a.title}</strong>
                    <span>{a.when}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`${styles.panel} ${styles.anchoCol}`}>
          <div className={styles.panelT}>
            <h2>Próximamente en este panel</h2>
            <small>Se amplía según lo que defina el cliente</small>
          </div>
          <div className={styles.proximo}>
            <div>
              <b>Inscripciones</b>
              Quién se anotó a cada círculo, curso o evento.
            </div>
            <div>
              <b>Certificados</b>
              Emitir y descargar certificados de cursos.
            </div>
            <div>
              <b>Pedidos de la tienda</b>
              Estado de cada compra y envíos.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
