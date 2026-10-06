"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/styles/seguridad-digital-actividades.module.css";
import { saveActivityProgress } from "@/lib/interactive-activities/progress-actions";

type Mensaje = {
  chequeo: string;
  de: string;
  num: string;
  oficial: boolean;
  c: string;
  msg: string;
  extra?: string;
  ops: string[];
  ok: number;
  bien: string;
  mal: string;
};

const MENSAJES: Mensaje[] = [
  {
    chequeo: "Claves del banco",
    de: "Banco Nacionall",
    num: "+593 98 000 1122",
    oficial: false,
    c: "#7fb7e6",
    msg: "Estimado cliente: su cuenta será <b>BLOQUEADA</b> hoy. Para evitarlo, responda con su clave de la tarjeta.",
    ops: ["Le envío mi clave para que no me bloqueen", "No respondo y llamo al número oficial de mi banco", "Le pido que me explique mejor"],
    ok: 1,
    bien: "Los bancos nunca piden claves por mensaje. Además, fíjate: “Nacionall” está mal escrito, otra pista de estafa.",
    mal: "Ese mensaje es falso. Con tu clave podrían vaciar tu cuenta. Lo correcto: no responder y llamar al número que está detrás de tu tarjeta.",
  },
  {
    chequeo: "Códigos por mensaje",
    de: "Número desconocido",
    num: "+593 99 431 7780",
    oficial: false,
    c: "#b8a4e3",
    msg: "Hola, perdón, te llegó un código de 6 números por error 🙏 ¿me lo pasas porfa?",
    extra: `<span class="${styles.codigo}">482 915</span><small>Mensaje de WhatsApp · Código de verificación</small>`,
    ops: ["Se lo paso, no pasa nada", "No lo comparto con nadie y borro el mensaje"],
    ok: 1,
    bien: "¡Exacto! Ese código sirve para entrar a TU cuenta. Si lo compartes, pueden robarte el WhatsApp.",
    mal: "Con ese código se pueden quedar con tu WhatsApp y pedir dinero a tus contactos en tu nombre. Nunca lo compartas.",
  },
  {
    chequeo: "Links sospechosos",
    de: "PREMIOS 🎁",
    num: "+1 202 555 0147",
    oficial: false,
    c: "#e8c95a",
    msg: `🎉 ¡FELICIDADES! Ganaste un celular nuevo. Reclámalo en las próximas 2 horas aquí: <span class="${styles.link}">premios-gratis-ya.xyz/reclamar</span>`,
    ops: ["Abro el link rápido antes de que se acabe", "No abro el link, borro y bloqueo el número"],
    ok: 1,
    bien: "¡Bien! La prisa (“solo 2 horas”) y los premios que no pediste son trucos típicos.",
    mal: "Ese link puede robar tus datos o instalar algo dañino. Si no lo esperabas, no lo abras.",
  },
  {
    chequeo: "Contraseña del correo",
    de: "“Soporte técnico”",
    num: "+593 96 202 3030",
    oficial: false,
    c: "#ff8a74",
    msg: "Buenas tardes, somos del soporte de su correo. Detectamos un problema. Díganos su contraseña para arreglarlo.",
    ops: ["Se la doy, así me ayudan", "No, mi contraseña es solo mía"],
    ok: 1,
    bien: "¡Correcto! Nadie, ni el soporte técnico, necesita tu contraseña. Ni siquiera tu familia debería saberla.",
    mal: "Ningún soporte real pide tu contraseña. Si ya la diste, cámbiala ahora mismo desde la app oficial.",
  },
  {
    chequeo: "Verificación en dos pasos",
    de: "App de tu banco",
    num: "Notificación oficial",
    oficial: true,
    c: "#8fd18a",
    msg: "🔐 Protege tu cuenta: activa la <b>verificación en dos pasos</b> desde Configuración → Seguridad dentro de esta app.",
    ops: ["La activo desde la misma app del banco", "La ignoro, me da pereza"],
    ok: 0,
    bien: "¡Muy bien! Esta sí es real: llega dentro de la app oficial y no te pide datos. La verificación en dos pasos es una segunda cerradura.",
    mal: "Esta notificación sí era segura: viene de la app oficial y no pide claves. Activarla hace mucho más difícil que entren a tu cuenta.",
  },
  {
    chequeo: "Actualizaciones",
    de: "Tienda de aplicaciones",
    num: "Notificación oficial",
    oficial: true,
    c: "#aebd52",
    msg: "⬆️ Hay 3 actualizaciones disponibles, incluida WhatsApp. Actualiza para tener las últimas mejoras de seguridad.",
    ops: ["Actualizo desde la tienda oficial", "Nunca actualizo, así está bien"],
    ok: 0,
    bien: "¡Perfecto! Las actualizaciones tapan “huecos” de seguridad. Hazlas siempre desde la tienda oficial.",
    mal: "Las actualizaciones corrigen fallas que los estafadores aprovechan. Vale la pena hacerlas.",
  },
];

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

type Entrada =
  | { tipo: "separador"; id: number; texto: string }
  | { tipo: "escribiendo"; id: number }
  | { tipo: "extra"; id: number; html: string }
  | { tipo: "ellos"; id: number; html: string; hora: string }
  | { tipo: "yo"; id: number; texto: string; malo: boolean; hora: string }
  | { tipo: "nota"; id: number; ok: boolean; titulo: string; texto: string };

function hora(k: number) {
  return `10:${String(12 + k * 3).padStart(2, "0")}`;
}
function espera(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
function primeraLetra(de: string) {
  return de.replace(/[^A-Za-zÁ-ú]/g, "")[0] || "?";
}
function construirHistorial(hastaIndice: number, resp: (number | undefined)[]) {
  const historial: Entrada[] = [];
  let idc = 0;
  for (let k = 0; k < hastaIndice && k < MENSAJES.length; k++) {
    const m = MENSAJES[k];
    const r = resp[k];
    historial.push({ tipo: "separador", id: idc++, texto: `Mensaje ${k + 1} de ${MENSAJES.length} · ${m.de}` });
    if (m.extra) historial.push({ tipo: "extra", id: idc++, html: m.extra });
    historial.push({ tipo: "ellos", id: idc++, html: m.msg, hora: hora(k) });
    if (r !== undefined) {
      historial.push({ tipo: "yo", id: idc++, texto: m.ops[r], malo: r !== m.ok, hora: hora(k) });
      historial.push({
        tipo: "nota",
        id: idc++,
        ok: r === m.ok,
        titulo: r === m.ok ? "¡Bien hecho! Placa ganada" : "Cuidado: esto era una trampa",
        texto: r === m.ok ? m.bien : m.mal,
      });
    }
  }
  if (hastaIndice >= MENSAJES.length) historial.push({ tipo: "separador", id: idc++, texto: "Fin de la revisión" });
  return { historial, idc };
}

export function ChatSospechosoActividad({ initialI, initialResp }: { initialI: number; initialResp: (number | undefined)[] }) {
  const construido = construirHistorial(initialI, initialResp);
  const [i, setI] = useState(initialI);
  const [resp, setResp] = useState<(number | undefined)[]>(initialResp);
  const [log, setLog] = useState<Entrada[]>(construido.historial);
  const [fase, setFase] = useState<"idle" | "escribiendo" | "esperando" | "ocupado" | "listo-siguiente" | "terminado">(
    initialI >= MENSAJES.length ? "terminado" : "idle"
  );
  const idRef = useRef(construido.idc);
  const iniciadoRef = useRef(false);
  const cuerpoRef = useRef<HTMLDivElement>(null);
  const chatWrapRef = useRef<HTMLDivElement>(null);

  function push(e: DistributiveOmit<Entrada, "id">) {
    const id = idRef.current++;
    setLog((prev) => [...prev, { ...e, id } as Entrada]);
  }

  async function mostrarMensaje(k: number) {
    const m = MENSAJES[k];
    push({ tipo: "separador", texto: `Mensaje ${k + 1} de ${MENSAJES.length} · ${m.de}` });
    push({ tipo: "escribiendo" });
    setFase("escribiendo");
    await espera(900);
    setLog((prev) => prev.filter((e) => e.tipo !== "escribiendo"));
    if (m.extra) push({ tipo: "extra", html: m.extra });
    push({ tipo: "ellos", html: m.msg, hora: hora(k) });
    setFase("esperando");
  }

  async function elegir(o: number) {
    if (fase !== "esperando") return;
    const m = MENSAJES[i];
    const ok = o === m.ok;
    const next = resp.map((r, idx) => (idx === i ? o : r));
    setResp(next);
    setFase("ocupado");
    push({ tipo: "yo", texto: m.ops[o], malo: !ok, hora: hora(i) });
    await espera(600);
    push({ tipo: "nota", ok, titulo: ok ? "¡Bien hecho! Placa ganada" : "Cuidado: esto era una trampa", texto: ok ? m.bien : m.mal });
    saveActivityProgress("seguridad-digital", "chat-sospechoso", { i, resp: next });
    setFase("listo-siguiente");
  }
  function siguiente() {
    if (i === MENSAJES.length - 1) {
      terminar();
      return;
    }
    const nextI = i + 1;
    setI(nextI);
    saveActivityProgress("seguridad-digital", "chat-sospechoso", { i: nextI, resp });
    void mostrarMensaje(nextI);
  }
  function terminar() {
    const nextI = MENSAJES.length;
    setI(nextI);
    push({ tipo: "separador", texto: "Fin de la revisión" });
    setFase("terminado");
    saveActivityProgress("seguridad-digital", "chat-sospechoso", { i: nextI, resp });
  }
  function reiniciar() {
    const vacio = MENSAJES.map(() => undefined);
    setI(0);
    setResp(vacio);
    setLog([]);
    setFase("idle");
    saveActivityProgress("seguridad-digital", "chat-sospechoso", { i: 0, resp: vacio });
    void mostrarMensaje(0);
  }

  useEffect(() => {
    const el = cuerpoRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  useEffect(() => {
    if (fase === "terminado") return;
    const el = chatWrapRef.current;
    if (!el || iniciadoRef.current) return;
    const obs = new IntersectionObserver(
      (ents) => {
        if (!ents[0].isIntersecting) return;
        obs.disconnect();
        iniciadoRef.current = true;
        void mostrarMensaje(i);
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iCabecera = Math.min(i, MENSAJES.length - 1);
  const mCabecera = fase === "idle" ? null : MENSAJES[iCabecera];
  const bien = resp.filter((r, k) => r === MENSAJES[k].ok).length;
  const hechas = resp.filter((r) => r !== undefined).length;
  const T = MENSAJES.length;
  let escudoTitulo: string;
  let escudoSub: string;
  if (hechas < T) {
    escudoTitulo = "Tu escudo";
    escudoSub = `${bien} ${bien === 1 ? "placa" : "placas"} de ${T}. Sigue respondiendo.`;
  } else if (bien === T) {
    escudoTitulo = "¡Escudo completo! 🛡️";
    escudoSub = "Reconociste todas las trampas. ¡Eres difícil de engañar!";
  } else {
    escudoTitulo = "¡Buen escudo!";
    escudoSub = `Protegiste ${bien} de ${T}. Revisa las placas en rojo para reforzarlas.`;
  }

  return (
    <div className={styles.act} ref={chatWrapRef}>
      <div className={styles.chatActCab}>
        <div className={styles.actTag}>
          <span className={styles.actNum}>02</span>
          <span className={styles.actTipo}>
            <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
            </svg>
            Simulación
          </span>
        </div>
        <h3>Revisión de seguridad rápida</h3>
        <p className={styles.actDesc}>Seis chequeos para proteger tus cuentas, con mensajes como los que llegan de verdad. Elige qué responderías: cada buena decisión suma una placa a tu escudo.</p>
      </div>

      <div className={styles.chatGrid}>
        <div className={styles.chat} aria-label="Simulación de chat">
          <div className={styles.chatTop}>
            <span className={styles.chatAv} style={{ ["--c" as string]: mCabecera?.c ?? "#555" }}>
              {mCabecera ? primeraLetra(mCabecera.de) : "?"}
            </span>
            <div>
              <b>{mCabecera?.de ?? "—"}</b>
              <small>{mCabecera?.num ?? "—"}</small>
            </div>
            {mCabecera && <span className={`${styles.chatTag} ${mCabecera.oficial ? styles.ofi : styles.desc}`}>{mCabecera.oficial ? "✓ Oficial" : "Número desconocido"}</span>}
          </div>
          <div className={styles.chatCuerpo} ref={cuerpoRef} aria-live="polite">
            {log.map((e) => {
              if (e.tipo === "separador") return <span key={e.id} className={styles.separador}>{e.texto}</span>;
              if (e.tipo === "escribiendo")
                return (
                  <div key={e.id} className={styles.escribiendo}>
                    <i />
                    <i />
                    <i />
                  </div>
                );
              if (e.tipo === "extra") return <div key={e.id} className={`${styles.burb} ${styles.ellos}`} dangerouslySetInnerHTML={{ __html: e.html }} />;
              if (e.tipo === "ellos")
                return <div key={e.id} className={`${styles.burb} ${styles.ellos}`} dangerouslySetInnerHTML={{ __html: `${e.html}<small>${e.hora}</small>` }} />;
              if (e.tipo === "yo")
                return (
                  <div key={e.id} className={`${styles.burb} ${styles.yo} ${e.malo ? styles.malo : ""}`}>
                    {e.texto}
                    <small>{e.hora} ✓✓</small>
                  </div>
                );
              return (
                <div key={e.id} className={`${styles.nota} ${e.ok ? styles.bien : styles.mal}`}>
                  <em>{e.ok ? "🛡️" : "⚠️"}</em>
                  <div>
                    <b>{e.titulo}</b>
                    {e.texto}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.chatResp}>
            {fase === "escribiendo" && <small>Esperando mensaje…</small>}
            {fase === "esperando" && (
              <>
                <small>¿Qué harías?</small>
                {MENSAJES[i].ops.map((o, k) => (
                  <button key={k} type="button" className={styles.opc} onClick={() => elegir(k)}>
                    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 11l18-8-8 18-2-8z" />
                    </svg>
                    {o}
                  </button>
                ))}
              </>
            )}
            {fase === "listo-siguiente" && (
              <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnS}`} onClick={siguiente}>
                {i === MENSAJES.length - 1 ? "Ver mi escudo" : "Siguiente mensaje →"}
              </button>
            )}
            {fase === "terminado" && (
              <button type="button" className={`${styles.btn} ${styles.btnG} ${styles.btnS}`} onClick={reiniciar}>
                Hacer la revisión otra vez
              </button>
            )}
          </div>
        </div>

        <div className={styles.escudoWrap}>
          <div className={styles.escudo} aria-hidden="true">
            <svg viewBox="0 0 200 230">
              <defs>
                <clipPath id="escudoClipSeguridadDigital">
                  <path d="M100 8 L180 36 V110 C180 162 146 200 100 222 C54 200 20 162 20 110 V36 Z" />
                </clipPath>
              </defs>
              <g clipPath="url(#escudoClipSeguridadDigital)">
                <rect width={200} height={230} fill="#23241c" />
                {MENSAJES.map((m, k) => {
                  const top = 30;
                  const alto = 170;
                  const n = MENSAJES.length;
                  const r = resp[k];
                  const fill = r === undefined ? "#2d2e24" : r === m.ok ? "#8fd18a" : "rgba(255,138,116,.55)";
                  return <rect key={k} className={styles.placa} x={0} y={top + (k * alto) / n} width={200} height={alto / n - 3} fill={fill} />;
                })}
              </g>
              <path d="M100 8 L180 36 V110 C180 162 146 200 100 222 C54 200 20 162 20 110 V36 Z" fill="none" stroke="#f5f1e6" strokeOpacity={0.5} strokeWidth={4} />
              <circle cx={100} cy={112} r={30} fill="#131310" opacity={0.8} />
              <text className={styles.n} x={100} y={123} textAnchor="middle">
                {bien}
              </text>
            </svg>
          </div>
          <div className={styles.escudoMsg} aria-live="polite">
            <b>{escudoTitulo}</b>
            <span>{escudoSub}</span>
          </div>
          <ul className={styles.placas}>
            {MENSAJES.map((m, k) => {
              const r = resp[k];
              const clase = r === undefined ? (k === i && fase !== "terminado" ? styles.placaActiva : "") : r === m.ok ? styles.bien : styles.mal;
              return (
                <li key={k} className={clase}>
                  <i>{r === undefined ? k + 1 : r === m.ok ? "✓" : "✕"}</i>
                  {m.chequeo}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <p className={styles.regla}>
        <b>La regla de oro:</b> tu banco, tu compañía de teléfono o cualquier institución seria <b>nunca</b> te pedirá claves ni códigos por mensaje o llamada.
      </p>
    </div>
  );
}
