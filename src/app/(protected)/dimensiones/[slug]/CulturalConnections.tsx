"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import styles from "@/styles/interculturalidad.module.css";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { joinConnection, leaveConnection, type CulturalConnection } from "@/lib/intercultural/connections-actions";
import { MI_CIUDAD } from "@/lib/intercultural-content";

const RAD = Math.PI / 180;

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c.8-3.5 3-5 6-5s5.2 1.5 6 5" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function CulturalGlobe({ conexiones, activa }: { conexiones: CulturalConnection[]; activa: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotLonRef = useRef(MI_CIUDAD.lon * -1 + 30);
  const rotLatRef = useRef(-12);
  const objetivoRef = useRef<number | null>(null);
  const arrastrandoRef = useRef(false);
  const x0Ref = useRef(0);
  const rot0Ref = useRef(0);
  const activaRef = useRef(activa);
  const conexionesRef = useRef(conexiones);
  const [arrastrando, setArrastrando] = useState(false);

  useEffect(() => {
    activaRef.current = activa;
    const c = conexiones[activa];
    if (c) objetivoRef.current = -((MI_CIUDAD.lon + c.lon) / 2);
  }, [activa, conexiones]);

  useEffect(() => {
    conexionesRef.current = conexiones;
  }, [conexiones]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducir = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const PUNTOS = Array.from({ length: 1400 }, (_, i) => {
      const y = 1 - (i / 1399) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = i * 2.399963;
      return [Math.asin(y) / RAD, Math.atan2(Math.sin(th) * r, Math.cos(th) * r) / RAD];
    });

    function proyectar(lat: number, lon: number, R: number, cx: number, cy: number): [number, number, number] {
      const la = lat * RAD;
      const lo = (lon + rotLonRef.current) * RAD;
      const t = rotLatRef.current * RAD;
      const x = Math.cos(la) * Math.sin(lo);
      const y0 = Math.sin(la);
      const z0 = Math.cos(la) * Math.cos(lo);
      const y = y0 * Math.cos(t) - z0 * Math.sin(t);
      const z = y0 * Math.sin(t) + z0 * Math.cos(t);
      return [cx + x * R, cy - y * R, z];
    }

    function intermedio(a: { lat: number; lon: number }, b: { lat: number; lon: number }, f: number) {
      const la1 = a.lat * RAD;
      const lo1 = a.lon * RAD;
      const la2 = b.lat * RAD;
      const lo2 = b.lon * RAD;
      const d = Math.acos(Math.sin(la1) * Math.sin(la2) + Math.cos(la1) * Math.cos(la2) * Math.cos(lo2 - lo1));
      const A = Math.sin((1 - f) * d) / Math.sin(d);
      const B = Math.sin(f * d) / Math.sin(d);
      const x = A * Math.cos(la1) * Math.cos(lo1) + B * Math.cos(la2) * Math.cos(lo2);
      const y = A * Math.cos(la1) * Math.sin(lo1) + B * Math.cos(la2) * Math.sin(lo2);
      const z = A * Math.sin(la1) + B * Math.sin(la2);
      return { lat: Math.atan2(z, Math.hypot(x, y)) / RAD, lon: Math.atan2(y, x) / RAD };
    }

    const t0 = performance.now();
    let raf = 0;

    function dibujar(t: number) {
      const dpr = window.devicePixelRatio || 1;
      const W = canvas!.clientWidth;
      const H = canvas!.clientHeight;
      if (canvas!.width !== W * dpr) {
        canvas!.width = W * dpr;
        canvas!.height = H * dpr;
      }
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);
      const R = W * 0.4;
      const cx = W / 2;
      const cy = H * 0.47;

      if (!arrastrandoRef.current && !reducir) {
        if (objetivoRef.current != null) {
          const d = ((objetivoRef.current - rotLonRef.current + 540) % 360) - 180;
          rotLonRef.current += d * 0.06;
          if (Math.abs(d) < 0.3) objetivoRef.current = null;
        } else {
          rotLonRef.current += 0.05;
        }
      }

      const g = ctx!.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
      g.addColorStop(0, "rgba(174,189,82,.16)");
      g.addColorStop(1, "rgba(19,19,16,.2)");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.strokeStyle = "rgba(199,216,115,.35)";
      ctx!.lineWidth = 1.2;
      ctx!.stroke();

      for (const [la, lo] of PUNTOS) {
        const [x, y, z] = proyectar(la, lo, R, cx, cy);
        if (z < -0.05) continue;
        ctx!.fillStyle = `rgba(199,216,115,${0.08 + z * 0.45})`;
        ctx!.beginPath();
        ctx!.arc(x, y, 0.6 + z * 1.2, 0, Math.PI * 2);
        ctx!.fill();
      }

      conexionesRef.current.forEach((c, i) => {
        const on = i === activaRef.current;
        const pasos = 60;
        ctx!.beginPath();
        let empezado = false;
        for (let k = 0; k <= pasos; k++) {
          const f = k / pasos;
          const p = intermedio(MI_CIUDAD, c, f);
          const alto = 1 + Math.sin(f * Math.PI) * (on ? 0.22 : 0.12);
          const [x, y, z] = proyectar(p.lat, p.lon, R * alto, cx, cy);
          if (z < 0) {
            empezado = false;
            continue;
          }
          if (empezado) ctx!.lineTo(x, y);
          else ctx!.moveTo(x, y);
          empezado = true;
        }
        ctx!.strokeStyle = on ? "rgba(214,232,130,.95)" : "rgba(199,216,115,.25)";
        ctx!.lineWidth = on ? 2.4 : 1.2;
        ctx!.shadowColor = "rgba(199,216,115,.9)";
        ctx!.shadowBlur = on ? 12 : 0;
        ctx!.stroke();
        ctx!.shadowBlur = 0;

        if (on) {
          const f = ((t - t0) / 2600) % 1;
          const p = intermedio(MI_CIUDAD, c, f);
          const [x, y, z] = proyectar(p.lat, p.lon, R * (1 + Math.sin(f * Math.PI) * 0.22), cx, cy);
          if (z > 0) {
            ctx!.fillStyle = "#f4ffd0";
            ctx!.shadowColor = "#f4ffd0";
            ctx!.shadowBlur = 14;
            ctx!.beginPath();
            ctx!.arc(x, y, 3.5, 0, Math.PI * 2);
            ctx!.fill();
            ctx!.shadowBlur = 0;
          }
        }
      });

      function pin(lat: number, lon: number, txt: string, on: boolean, casa?: boolean) {
        const [x, y, z] = proyectar(lat, lon, R, cx, cy);
        if (z < 0) return;
        const pulso = on ? 6 + ((t / 90) % 14) : 0;
        if (on) {
          ctx!.strokeStyle = `rgba(199,216,115,${1 - pulso / 20})`;
          ctx!.lineWidth = 2;
          ctx!.beginPath();
          ctx!.arc(x, y, pulso, 0, Math.PI * 2);
          ctx!.stroke();
        }
        ctx!.fillStyle = casa ? "#f5f1e6" : on ? "#c7d873" : "#8a983a";
        ctx!.beginPath();
        ctx!.arc(x, y, on || casa ? 6 : 4.5, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.font = `800 ${on || casa ? 15 : 13}px Manrope, system-ui, sans-serif`;
        ctx!.fillStyle = on || casa ? "#f5f1e6" : "rgba(245,241,230,.6)";
        ctx!.fillText(txt, x + 11, y + 5);
      }
      pin(MI_CIUDAD.lat, MI_CIUDAD.lon, MI_CIUDAD.nombre + " (tú)", false, true);
      conexionesRef.current.forEach((c, i) => pin(c.lat, c.lon, c.country, i === activaRef.current));

      raf = requestAnimationFrame(dibujar);
    }
    raf = requestAnimationFrame(dibujar);

    function onDown(e: PointerEvent) {
      arrastrandoRef.current = true;
      setArrastrando(true);
      x0Ref.current = e.clientX;
      rot0Ref.current = rotLonRef.current;
      objetivoRef.current = null;
      canvas!.setPointerCapture(e.pointerId);
    }
    function onMove(e: PointerEvent) {
      if (arrastrandoRef.current) rotLonRef.current = rot0Ref.current + (e.clientX - x0Ref.current) * 0.4;
    }
    function onUp() {
      arrastrandoRef.current = false;
      setArrastrando(false);
    }
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const c = conexiones[activa];

  return (
    <div className={`${styles.globo} ${arrastrando ? styles.globoArrastrando : ""}`}>
      <canvas ref={canvasRef} aria-label="Globo con los países de las conexiones" role="img" />
      {c && (
        <div className={styles.globoEtq}>
          {MI_CIUDAD.nombre} <span aria-hidden="true">⟶</span> <b>{c.country}</b>
        </div>
      )}
    </div>
  );
}

export function CulturalConnections({ conexiones }: { conexiones: CulturalConnection[] }) {
  const [activa, setActiva] = useState(0);
  const [joined, setJoined] = useState<Set<string>>(() => new Set(conexiones.filter((c) => c.joined).map((c) => c.id)));
  const [isPending, startTransition] = useTransition();

  if (conexiones.length === 0) {
    return (
      <section className={styles.bloque} aria-labelledby="cx-titulo">
        <div className={styles.eyebrow}>El mundo en tu sala</div>
        <h2 className={styles.seccion} id="cx-titulo">
          Conexiones <span className={styles.enfasis}>destacadas</span>
        </h2>
        <div className={styles.vacio}>Todavía no hay conexiones culturales publicadas.</div>
      </section>
    );
  }

  function toggle(id: string) {
    setJoined((prev) => {
      const next = new Set(prev);
      const isJoined = next.has(id);
      if (isJoined) next.delete(id);
      else next.add(id);
      startTransition(() => {
        if (isJoined) leaveConnection(id);
        else joinConnection(id);
      });
      return next;
    });
  }

  return (
    <section className={styles.bloque} aria-labelledby="cx-titulo">
      <div className={styles.conexiones}>
        <CulturalGlobe conexiones={conexiones} activa={activa} />
        <div>
          <div className={styles.conexionesCab}>
            <div className={styles.eyebrow}>El mundo en tu sala</div>
            <h2 className={styles.seccion} id="cx-titulo">
              Conexiones <span className={styles.enfasis}>destacadas</span>
            </h2>
            <p>Practica idiomas y conoce tradiciones con personas de otros países. Elige una conexión para verla en el globo.</p>
          </div>
          <ul className={styles.lista}>
            {conexiones.map((c, i) => {
              const on = i === activa;
              const estaUnido = joined.has(c.id);
              const count = c.memberCount + (estaUnido && !c.joined ? 1 : !estaUnido && c.joined ? -1 : 0);
              return (
                <li key={c.id} className={`${styles.cx} ${on ? styles.cxOn : ""}`}>
                  <button
                    type="button"
                    className={styles.cxBoton}
                    aria-expanded={on}
                    onClick={() => setActiva(i)}
                  >
                    <span className={styles.cxPais} aria-hidden="true">
                      {c.countryCode}
                    </span>
                    <span>
                      <span className={styles.cxTitulo}>{c.title}</span>
                      <span className={styles.cxSub}>{c.sub}</span>
                    </span>
                    <span className={styles.cxTag}>{c.tag}</span>
                  </button>
                  <div className={styles.cxMas}>
                    <div>
                      <div className={styles.cxDetalle}>
                        <div className={styles.cxImg}>
                          <ImagePlaceholder label={c.title} />
                        </div>
                        <div>
                          <p>{c.detail}</p>
                          <div className={styles.cxInfo}>
                            <span>
                              <PinIcon />
                              {c.country}
                            </span>
                            <span>
                              <ClockIcon />
                              {c.scheduleText}
                            </span>
                            <span>
                              <PeopleIcon />
                              {count} participantes
                            </span>
                          </div>
                          <button
                            type="button"
                            className={`${styles.btn} ${estaUnido ? styles.btnJoined : styles.btnP} ${styles.btnSm}`}
                            aria-pressed={estaUnido}
                            disabled={isPending}
                            tabIndex={on ? 0 : -1}
                            onClick={() => toggle(c.id)}
                          >
                            {estaUnido ? "✓ Solicitud enviada" : "Conectar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
