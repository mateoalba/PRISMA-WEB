"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "@/styles/confirmando-pago.module.css";
import { PrismaLogo } from "@/components/layout/PrismaLogo";
import { confirmarPago, type ConfirmProvider, type ConfirmResult } from "@/lib/membership/confirm-actions";

type Visual = "proceso" | "ok" | "pendiente" | "fallo";

const NOMBRES: Record<ConfirmProvider, string> = { wompi: "Wompi", paypal: "PayPal" };
const MIN_MS = 1300;

function visualDe(r: ConfirmResult | null): Visual {
  if (!r) return "proceso";
  if (r.estado === "ok") return "ok";
  if (r.estado === "pendiente") return "pendiente";
  return "fallo";
}

function fechaLarga(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function dinero(monto: number, moneda: string) {
  return new Intl.NumberFormat(moneda === "COP" ? "es-CO" : "es-EC", {
    style: "currency",
    currency: moneda,
    maximumFractionDigits: moneda === "COP" ? 0 : 2,
  }).format(monto);
}

function Chispas() {
  return (
    <div className={styles.chispas} aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => (
        <span key={i} className={styles.chispa} style={{ ["--ang" as string]: `${i * 22.5 + (i % 2) * 7}deg`, ["--dist" as string]: `${96 + (i % 3) * 20}px` } as CSSProperties} />
      ))}
    </div>
  );
}

function Emblema({ visual, error }: { visual: Visual; error: boolean }) {
  return (
    <div className={styles.emblema} aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs>
          <radialGradient id="cpHalo">
            <stop offset="0" className={styles.haloStop} stopOpacity="0.42" />
            <stop offset="1" className={styles.haloStop} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className={styles.halo} cx="100" cy="100" r="84" />
        <circle className={styles.pista} cx="100" cy="100" r="86" />
        <g className={styles.giro}>
          <circle className={styles.arco} cx="100" cy="100" r="86" transform="rotate(-90 100 100)" />
        </g>

        {visual === "proceso" && (
          <g className={styles.prisma}>
            <line className={styles.rayoIn} x1="34" y1="112" x2="82" y2="104" />
            <polygon className={styles.cristal} points="100,56 144,134 56,134" />
            <polygon className={styles.cara} points="100,56 144,134 100,134" />
            <line className={styles.rayo} x1="124" y1="100" x2="172" y2="70" stroke="#a8b96e" />
            <line className={styles.rayo} x1="128" y1="108" x2="176" y2="102" stroke="#8fd18a" />
            <line className={styles.rayo} x1="132" y1="116" x2="172" y2="136" stroke="#e8c95a" />
          </g>
        )}
        {visual === "ok" && <path className={styles.trazo} d="M68 104 L91 127 L134 78" />}
        {visual === "pendiente" && (
          <g>
            <circle className={styles.reloj} cx="100" cy="100" r="34" />
            <g className={styles.manecilla}>
              <path className={styles.reloj} d="M100 100 V76" />
            </g>
            <path className={styles.reloj} d="M100 100 L116 108" />
          </g>
        )}
        {visual === "fallo" &&
          (error ? (
            <g>
              <path className={styles.trazo} d="M100 72 V108" />
              <circle cx="100" cy="130" r="5.5" fill="var(--tono)" />
            </g>
          ) : (
            <path className={styles.trazo} d="M78 78 L122 122 M122 78 L78 122" />
          ))}
      </svg>
      {visual === "ok" && <Chispas />}
    </div>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
function Equis() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

type Paso = { texto: string; estado: "hecho" | "activo" | "espera" | "fallo" };

function pasosDe(r: ConfirmResult | null, nombre: string): Paso[] {
  const volviste: Paso = { texto: `Volviste de ${nombre}`, estado: "hecho" };
  const activar = (estado: Paso["estado"]): Paso => ({
    texto: r?.estado === "ok" ? (r.tipo === "libro" ? "Desbloqueando tu libro" : "Activando tu membresía") : "Activando tu compra",
    estado,
  });
  if (!r) return [volviste, { texto: `Verificando el pago con ${nombre}`, estado: "activo" }, activar("espera")];
  if (r.estado === "ok") return [volviste, { texto: `${nombre} confirmó el pago`, estado: "hecho" }, activar("hecho")];
  if (r.estado === "pendiente") return [volviste, { texto: `Esperando la confirmación de ${nombre}`, estado: "activo" }, activar("espera")];
  if (r.estado === "rechazado") return [volviste, { texto: `${nombre} no aprobó el pago`, estado: "fallo" }, activar("espera")];
  return [volviste, { texto: "No pudimos verificar el pago", estado: "fallo" }, activar("espera")];
}

const CLASE_PASO = { hecho: styles.hecho, activo: styles.activo, espera: "", fallo: styles.fallo };
const CLASE_VISUAL: Record<Visual, string> = { proceso: styles.enProceso, ok: styles.enOk, pendiente: styles.enPendiente, fallo: styles.enFallo };

export function ConfirmandoPago({ proveedor, referencia }: { proveedor: ConfirmProvider; referencia: string }) {
  const [resultado, setResultado] = useState<ConfirmResult | null>(null);
  const iniciado = useRef(false);

  async function verificar() {
    const [r] = await Promise.all([confirmarPago(proveedor, referencia), new Promise<void>((ok) => setTimeout(ok, MIN_MS))]);
    setResultado(r);
  }
  function reintentar() {
    setResultado(null);
    void verificar();
  }

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;
    void verificar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <VistaPago proveedor={proveedor} referencia={referencia} resultado={resultado} onReintentar={reintentar} />;
}

export function VistaPago({
  proveedor,
  referencia,
  resultado,
  onReintentar,
}: {
  proveedor: ConfirmProvider;
  referencia: string;
  resultado: ConfirmResult | null;
  onReintentar: () => void;
}) {
  const nombre = NOMBRES[proveedor];
  const visual = visualDe(resultado);
  const estado = resultado?.estado ?? "proceso";
  const verFecha = resultado?.estado === "ok" && resultado.tipo === "membresia" ? fechaLarga(resultado.venceEl) : null;

  let etiqueta: string;
  let titulo: ReactNode;
  let texto: string;
  switch (estado) {
    case "ok":
      etiqueta = "Pago recibido";
      if (resultado?.estado === "ok" && resultado.tipo === "libro") {
        titulo = (
          <>
            ¡Tu libro está <em>desbloqueado</em>!
          </>
        );
        texto = `${resultado.libroTitulo ? `«${resultado.libroTitulo}»` : "Tu libro"} ya es tuyo. Puedes descargarlo ahora y las veces que quieras.`;
      } else {
        titulo = (
          <>
            ¡Tu membresía está <em>activa</em>!
          </>
        );
        texto = "Gracias por ser parte de PRISMA. Tu membresía incluye todos los libros de la biblioteca, sin costo.";
      }
      break;
    case "pendiente":
      etiqueta = "En proceso";
      titulo = (
        <>
          Tu pago aún se está <em>confirmando</em>
        </>
      );
      texto = `${nombre} todavía no confirma el pago. Puede tardar unos minutos y tu membresía se activa sola cuando lo apruebe. No vuelvas a pagar.`;
      break;
    case "rechazado":
      etiqueta = "Sin cobro";
      titulo = (
        <>
          El pago <em>no se completó</em>
        </>
      );
      texto = "No se te cobró nada. Puedes intentarlo de nuevo con el mismo método u otro.";
      break;
    case "sin-sesion":
      etiqueta = "Un paso más";
      titulo = (
        <>
          Inicia sesión para <em>terminar</em>
        </>
      );
      texto = `Tu pago con ${nombre} está listo para confirmarse. Entra a tu cuenta y activamos tu membresía.`;
      break;
    case "error":
      etiqueta = "Algo salió mal";
      titulo = (
        <>
          No pudimos <em>confirmar</em> el pago
        </>
      );
      texto = "Si te llegó el cobro, tranquilo: escríbenos y lo resolvemos enseguida. También puedes verificar de nuevo.";
      break;
    default:
      etiqueta = "Un momento";
      titulo = (
        <>
          Confirmando tu <em>pago</em>
        </>
      );
      texto = `Estamos verificando todo con ${nombre}. Solo toma unos segundos.`;
  }

  const pasos = estado === "sin-sesion" ? [] : pasosDe(resultado, nombre);

  return (
    <main className={styles.escena}>
      <div className={styles.fondo} aria-hidden="true">
        <span className={`${styles.orbe} ${styles.orbeA}`} />
        <span className={`${styles.orbe} ${styles.orbeB}`} />
      </div>
      <div className={styles.cabecera}>
        <Link href="/" aria-label="Volver al inicio de PRISMA">
          <PrismaLogo height={30} />
        </Link>
      </div>

      <section className={`${styles.tarjeta} ${CLASE_VISUAL[visual]}`} aria-busy={visual === "proceso"}>
        <Emblema visual={visual} error={estado === "error"} />

        <div key={estado} className={styles.contenido} role="status" aria-live="polite">
          <span className={styles.etiqueta}>{etiqueta}</span>
          <h1 className={styles.titulo}>{titulo}</h1>
          <p className={styles.texto}>{texto}</p>

          {estado === "proceso" && (
            <span className={styles.aviso}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              No cierres ni recargues esta página
            </span>
          )}

          {pasos.length > 0 && (
            <ol className={styles.pasos}>
              {pasos.map((p) => (
                <li key={p.texto} className={`${styles.paso} ${CLASE_PASO[p.estado]}`}>
                  <span className={styles.marca}>{p.estado === "hecho" ? <Check /> : p.estado === "fallo" ? <Equis /> : null}</span>
                  {p.texto}
                </li>
              ))}
            </ol>
          )}

          {resultado?.estado === "ok" && (
            <dl className={styles.resumen}>
              {resultado.tipo === "libro" ? (
                <div className={styles.resumenFecha}>
                  <dt>Libro desbloqueado</dt>
                  <dd>{resultado.libroTitulo ?? "Tu libro"}</dd>
                </div>
              ) : (
                verFecha && (
                  <div className={styles.resumenFecha}>
                    <dt>Activa hasta</dt>
                    <dd>{verFecha}</dd>
                  </div>
                )
              )}
              <div className={styles.filas}>
                <div className={styles.fila}>
                  <dt>{resultado.tipo === "libro" ? "Libro" : "Membresía"}</dt>
                  <dd>{dinero(resultado.montoUsd, "USD")}</dd>
                  <small>{resultado.tipo === "libro" ? "Acceso permanente" : "30 días"}</small>
                </div>
                <div className={styles.fila}>
                  <dt>Pagado con {nombre}</dt>
                  <dd>{dinero(resultado.montoCobrado, resultado.moneda)}</dd>
                  <small>{resultado.moneda}</small>
                </div>
                <div className={`${styles.fila} ${styles.filaAncha}`}>
                  <dt>Referencia</dt>
                  <dd className={styles.ref}>{resultado.referencia}</dd>
                </div>
              </div>
            </dl>
          )}

          <div className={styles.acciones}>
            {resultado?.estado === "ok" && resultado.tipo === "libro" && resultado.libroId && (
              <>
                <a href={`/api/libros/${resultado.libroId}/descargar`} className={`${styles.btn} ${styles.btnP}`}>
                  Descargar ahora
                </a>
                <Link href={`/libros/${resultado.libroId}`} className={`${styles.btn} ${styles.btnG}`}>
                  Ver el libro
                </Link>
              </>
            )}
            {resultado?.estado === "ok" && resultado.tipo === "membresia" && (
              <>
                <Link href="/perfil?tab=membresia" className={`${styles.btn} ${styles.btnP}`}>
                  Ir a mi membresía
                </Link>
                <Link href="/novedades" className={`${styles.btn} ${styles.btnG}`}>
                  Ver los libros
                </Link>
              </>
            )}
            {(estado === "pendiente" || estado === "error") && (
              <>
                <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={onReintentar}>
                  {estado === "pendiente" ? "Revisar de nuevo" : "Verificar otra vez"}
                </button>
                <Link href="/perfil?tab=membresia" className={`${styles.btn} ${styles.btnG}`}>
                  Ir a mi perfil
                </Link>
              </>
            )}
            {estado === "rechazado" && (
              <Link href="/perfil?tab=membresia" className={`${styles.btn} ${styles.btnP}`}>
                Intentar de nuevo
              </Link>
            )}
            {estado === "sin-sesion" && (
              <Link href={`/login?next=${encodeURIComponent(`/membresia/confirmando/${proveedor}?token=${referencia}`)}`} className={`${styles.btn} ${styles.btnP}`}>
                Iniciar sesión
              </Link>
            )}
          </div>

          {estado === "error" && (
            <p className={styles.contacto}>
              Escríbenos a <a href="mailto:contacto@penser.org">contacto@penser.org</a>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
