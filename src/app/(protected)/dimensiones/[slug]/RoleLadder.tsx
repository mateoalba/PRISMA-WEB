import type { CSSProperties } from "react";
import styles from "@/styles/participacion-activa.module.css";
import type { RoleStep } from "@/lib/participation/roles-actions";

const ESTADO_CLASE: Record<RoleStep["estado"], string> = {
  hecho: styles.escalonHecho,
  actual: styles.escalonActual,
  bloq: styles.escalonBloq,
};

const ESTADO_TEXTO: Record<RoleStep["estado"], (progreso?: number) => string> = {
  hecho: () => "Logrado",
  actual: (p) => `En curso · ${p ?? 0}%`,
  bloq: () => "Próximo",
};

export function RoleLadder({ roles }: { roles: RoleStep[] }) {
  const actual = roles.find((r) => r.estado === "actual");
  const siguienteIndex = actual ? roles.indexOf(actual) + 1 : -1;
  const siguiente = siguienteIndex >= 0 ? roles[siguienteIndex] : undefined;

  return (
    <section className={styles.bloque} aria-labelledby="roles-titulo">
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>De recibir a generar valor</div>
          <h2 className={styles.seccion} id="roles-titulo">
            Tu camino en la <span className={styles.enfasis}>comunidad</span>
          </h2>
          <p>Cada vez que participas, subes un escalón y ganas nuevas formas de aportar.</p>
        </div>
      </div>
      <div className={styles.escalera} role="list">
        {roles.map((r, i) => {
          const style: CSSProperties & { "--h"?: string; "--a"?: string; "--p"?: string } = {
            "--h": `${42 + i * 19}%`,
            "--a": `${0.05 + i * 0.05}`,
            "--p": `${r.progreso ?? 0}%`,
          };
          return (
            <div key={r.rol} className={`${styles.escalon} ${ESTADO_CLASE[r.estado]}`} role="listitem" style={style}>
              {r.estado === "actual" && (
                <div className={styles.tuAqui} aria-hidden="true">
                  <span>●</span>
                  <small>TÚ</small>
                </div>
              )}
              <span className={styles.escalonNum} aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={styles.escalonRol}>{r.rol}</span>
              <span className={styles.escalonDesc}>{r.desc}</span>
              <span className={styles.escalonEstado}>{ESTADO_TEXTO[r.estado](r.progreso)}</span>
            </div>
          );
        })}
      </div>
      {actual && siguiente && (
        <div className={styles.siguiente}>
          <span>
            Para llegar a <b>{siguiente.rol}</b>: {actual.falta}.
          </span>
          {actual.ctaHref && (
            <a className={`${styles.btn} ${styles.btnS} ${styles.btnSm}`} href={actual.ctaHref}>
              {actual.ctaLabel}
            </a>
          )}
        </div>
      )}
    </section>
  );
}
