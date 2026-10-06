"use client";

import { useState } from "react";
import styles from "@/styles/educacion-continua.module.css";
import type { CertificadoEstado } from "@/lib/learning/courses-actions";

const ICONOS: Record<string, string> = {
  Tecnología: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  Cultura: '<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19l7-7"/>',
  Arte: '<path d="M18 3l3 3-9 9-3-3z"/><path d="M9 12c-3 0-5 2-5 5 0 2-1 3-2 4 4 0 8-1 8-5"/>',
  "Vida práctica": '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2s1 1.7 3 2 3 1 3 2.2-1.3 2-3 2c-1.5 0-2.6-.6-3-1.6M12 6v2M12 16v2"/>',
};
const CANDADO = '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>';

function Icono({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: path }} />
  );
}

function CerrarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function MyCertificates({ certificados, userName }: { certificados: CertificadoEstado[]; userName: string }) {
  const [abierto, setAbierto] = useState<CertificadoEstado | null>(null);
  const obtenidos = certificados.filter((c) => c.obtenido);
  const horasTotal = obtenidos.reduce((s, c) => s + Math.round(c.totalMinutes / 60), 0);

  if (certificados.length === 0) {
    return (
      <section className={styles.bloque} aria-labelledby="cert-titulo">
        <div className={styles.eyebrow}>Tus logros</div>
        <h2 className={styles.seccion} id="cert-titulo">
          Mis <span className={styles.enfasis}>certificaciones</span>
        </h2>
        <div className={styles.vacio}>Todavía no hay cursos disponibles para certificar.</div>
      </section>
    );
  }

  return (
    <section className={styles.bloque} aria-labelledby="cert-titulo">
      <div className={styles.certGrid}>
        <div className={styles.certIntro}>
          <div className={styles.eyebrow}>Tus logros</div>
          <h2 className={styles.seccion} id="cert-titulo">
            Mis <span className={styles.enfasis}>certificaciones</span>
          </h2>
          <p>Cada curso que terminas queda registrado aquí. Toca un sello para ver tu certificado.</p>
          <div className={styles.logros}>
            <div>
              <b>{obtenidos.length}</b>
              <span>Certificados</span>
            </div>
            <div>
              <b>{horasTotal}</b>
              <span>Horas de estudio</span>
            </div>
            <div>
              <b>{certificados.length - obtenidos.length}</b>
              <span>En camino</span>
            </div>
          </div>
        </div>
        <div className={styles.sellos}>
          {certificados.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${styles.sello} ${c.obtenido ? "" : styles.selloBloq}`}
              disabled={!c.obtenido}
              aria-label={c.obtenido ? `Ver certificado de ${c.title}` : undefined}
              onClick={() => c.obtenido && setAbierto(c)}
            >
              <span className={styles.selloDisco}>
                <svg className={styles.selloTexto} viewBox="0 0 150 150" aria-hidden="true">
                  <defs>
                    <path id={`edu-circ-${c.id}`} d="M75,75 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0" />
                  </defs>
                  <text>
                    <textPath href={`#edu-circ-${c.id}`} textLength={385} lengthAdjust="spacing">
                      PRISMA · CERTIFICADO · PENSER ·
                    </textPath>
                  </text>
                </svg>
                <span className={styles.selloCentro}>
                  <Icono path={c.obtenido ? ICONOS[c.topic] ?? ICONOS["Tecnología"] : CANDADO} />
                </span>
              </span>
              <b>{c.title}</b>
              <small>{c.obtenido ? c.fecha : `${100 - c.progressPct}% por completar`}</small>
            </button>
          ))}
        </div>
      </div>

      {abierto && (
        <div className={styles.overlay} onClick={() => setAbierto(null)}>
          <div className={styles.hoja} role="dialog" aria-labelledby="cert-nombre" onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.cerrar} aria-label="Cerrar" onClick={() => setAbierto(null)}>
              <CerrarIcon />
            </button>
            <div className={styles.eyebrow}>Certificado de finalización</div>
            <h3>Se otorga a</h3>
            <p className={styles.hojaNombre} id="cert-nombre">
              {userName}
            </p>
            <p className={styles.hojaCurso}>
              por completar el curso <b>{abierto.title}</b> con una duración de {Math.round(abierto.totalMinutes / 60)} horas.
            </p>
            <div className={styles.hojaPie}>
              <div>
                <b>{abierto.fecha ? new Date(abierto.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "—"}</b>
                Fecha de emisión
              </div>
              <div>
                <b>Corporación PENSER</b>
                Emitido por
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
