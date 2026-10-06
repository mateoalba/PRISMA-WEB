"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import styles from "@/styles/admin.module.css";
import { setDimensionVideo } from "@/lib/admin/dimension-settings-actions";
import { useAdminUi } from "../AdminUiContext";
import { dimensionAdminColor } from "@/lib/admin/dimension-admin-colors";
import type { Dimension } from "@/lib/dimensions";

function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  const patterns = [/youtu\.be\/([\w-]{6,})/, /[?&]v=([\w-]{6,})/, /youtube\.com\/embed\/([\w-]{6,})/, /youtube\.com\/shorts\/([\w-]{6,})/];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  return null;
}

function IcoYoutube() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IcoPlay() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function DimensionesClient({ dimensiones, videos }: { dimensiones: Dimension[]; videos: Record<string, string | null> }) {
  const original = useMemo(() => Object.fromEntries(dimensiones.map((d) => [d.slug, videos[d.slug] ?? ""])), [dimensiones, videos]);
  const [borrador, setBorrador] = useState<Record<string, string>>(original);
  const [, startTransition] = useTransition();
  const { notify } = useAdminUi();

  const cambios = dimensiones.filter((d) => borrador[d.slug] !== original[d.slug]);
  const hayDirty = cambios.length > 0;

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (hayDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hayDirty]);

  const conVideo = dimensiones.filter((d) => extractYouTubeId(borrador[d.slug] ?? "")).length;
  const R = 40;
  const C = 2 * Math.PI * R;

  function descartar() {
    setBorrador(original);
  }

  function guardar() {
    startTransition(async () => {
      await Promise.all(cambios.map((d) => setDimensionVideo(d.slug, borrador[d.slug])));
      notify(`${cambios.length === 1 ? "Video actualizado" : `${cambios.length} videos actualizados`}`);
    });
  }

  return (
    <div>
      <div className={`${styles.panel} ${styles.anchoCol}`} style={{ marginBottom: 20 }}>
        <div className={styles.anilloWrap}>
          <div className={styles.anillo}>
            <svg viewBox="0 0 96 96">
              <circle className={styles.anilloFondo} cx="48" cy="48" r={R} />
              <circle
                className={styles.anilloSeg}
                cx="48"
                cy="48"
                r={R}
                strokeDasharray={C}
                strokeDashoffset={C - (conVideo / dimensiones.length) * C}
              />
            </svg>
            <span className={styles.anilloN}>
              {conVideo}/{dimensiones.length}
            </span>
          </div>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "1.2rem" }}>
              {conVideo === dimensiones.length ? "¡Todas las dimensiones tienen video!" : `Faltan ${dimensiones.length - conVideo} video(s)`}
            </h2>
            <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "0.9rem" }}>
              Pega el link de YouTube que quieres mostrar en cada dimensión — acepta youtube.com/watch?v=, youtu.be/ y youtube.com/embed/.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.dimRows}>
        {dimensiones.map((d, i) => {
          const valor = borrador[d.slug] ?? "";
          const id = extractYouTubeId(valor);
          const esInvalido = valor.trim().length > 0 && !id;
          const color = id ? dimensionAdminColor(d.slug) : "var(--coral)";
          return (
            <div key={d.slug} className={styles.dimRow} style={{ ["--c" as string]: color }}>
              <div className={styles.dimRowNum}>{String(i + 1).padStart(2, "0")}</div>
              <div className={styles.dimRowInfo}>
                <b style={{ display: "block" }}>{d.title}</b>
                <code>{d.slug}</code>
                <div style={{ marginTop: 6 }}>
                  {id ? (
                    <span className={styles.badge} style={{ background: "var(--accent-soft)", color: "var(--accent-text)" }}>
                      Con video
                    </span>
                  ) : (
                    <span className={`${styles.badge} ${styles.badgeVivo}`}>
                      <i />
                      Sin video
                    </span>
                  )}
                  {borrador[d.slug] !== original[d.slug] && (
                    <span className={styles.badge} style={{ marginLeft: 6, background: "rgba(255,180,138,.16)", color: "var(--naranja)" }}>
                      Sin guardar
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.dimRowVideo}>
                <div className={styles.dimRowInputRow}>
                  <span className={styles.dimRowInputIco}>
                    <IcoYoutube />
                  </span>
                  <input
                    type="url"
                    value={valor}
                    placeholder="https://www.youtube.com/watch?v=..."
                    onChange={(e) => setBorrador((prev) => ({ ...prev, [d.slug]: e.target.value }))}
                  />
                  {valor.trim() && (
                    <span className={`${styles.dimRowValido} ${esInvalido ? styles.dimRowValidoError : styles.dimRowValidoOk}`}>{esInvalido ? "!" : "✓"}</span>
                  )}
                </div>
                {esInvalido && <small style={{ color: "var(--coral)" }}>No reconocemos ese link como un video de YouTube.</small>}
                <div className={styles.dimThumb}>
                  {id ? (
                    <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer" style={{ position: "relative", display: "block", width: "100%", height: "100%" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- miniatura externa de YouTube */}
                      <img src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff", background: "rgba(0,0,0,.25)" }}>
                        <IcoPlay />
                      </span>
                    </a>
                  ) : (
                    <div style={{ display: "grid", placeItems: "center", width: "100%", height: "100%", color: "var(--ink-muted)", fontSize: "0.82rem" }}>Sin video</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hayDirty && (
        <div className={styles.guardarBar}>
          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
            {cambios.length} cambio{cambios.length === 1 ? "" : "s"} sin guardar
          </span>
          <button type="button" className={`${styles.btn} ${styles.btnG}`} onClick={descartar}>
            Descartar
          </button>
          <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={guardar}>
            Guardar cambios
          </button>
        </div>
      )}
    </div>
  );
}
