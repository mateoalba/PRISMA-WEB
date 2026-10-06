"use client";

import { useEffect, useState, useTransition } from "react";
import styles from "@/styles/interculturalidad.module.css";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { setReminder, type GlobalEvent } from "@/lib/intercultural/events-actions";
import { MI_CIUDAD } from "@/lib/intercultural-content";

const RAD = Math.PI / 180;

function horaEn(zona: string, ahora: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: zona, hour12: false, hour: "2-digit", minute: "2-digit" }).formatToParts(ahora);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return [hour, minute] as const;
}

function fmt(date: Date, zona: string, opciones: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("es-EC", { timeZone: zona, ...opciones }).format(date);
}

function Reloj({ zona, ahora }: { zona: string; ahora: Date }) {
  const [h, m] = horaEn(zona, ahora);
  const noche = h < 6 || h >= 19;
  const ah = ((h % 12) + m / 60) * 30;
  const am = m * 6;
  const marcas = Array.from({ length: 12 }, (_, i) => {
    const a = i * 30 * RAD;
    return (
      <line key={i} className={styles.marca} x1={42 + Math.sin(a) * 34} y1={42 - Math.cos(a) * 34} x2={42 + Math.sin(a) * 38} y2={42 - Math.cos(a) * 38} />
    );
  });
  return (
    <svg className={`${styles.reloj} ${noche ? styles.relojNoche : ""}`} viewBox="0 0 84 84" aria-hidden="true">
      <circle className={styles.esfera} cx={42} cy={42} r={40} />
      {marcas}
      <line className={styles.h} x1={42} y1={42} x2={42 + Math.sin(ah * RAD) * 20} y2={42 - Math.cos(ah * RAD) * 20} />
      <line className={styles.m} x1={42} y1={42} x2={42 + Math.sin(am * RAD) * 30} y2={42 - Math.cos(am * RAD) * 30} />
      <circle className={styles.c} cx={42} cy={42} r={3.5} />
    </svg>
  );
}

function BotonRecordar({ evento, esDestacado }: { evento: GlobalEvent; esDestacado: boolean }) {
  const [on, setOn] = useState(evento.reminded);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    startTransition(() => {
      setReminder(evento.id, next);
    });
  }

  const textoBase = esDestacado ? "Reservar mi lugar" : "Recordármelo";
  return (
    <button
      type="button"
      className={`${styles.btn} ${esDestacado ? styles.btnP : `${styles.btnS} ${styles.btnSm}`}`}
      aria-pressed={on}
      disabled={isPending}
      onClick={toggle}
    >
      {on ? "✓ Te avisaremos" : textoBase}
    </button>
  );
}

export function GlobalEvents({ eventos }: { eventos: GlobalEvent[] }) {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  if (eventos.length === 0) {
    return (
      <section className={styles.bloque} aria-labelledby="ev-titulo">
        <div className={styles.eyebrow}>En vivo desde el mundo</div>
        <h2 className={styles.seccion} id="ev-titulo">
          Eventos <span className={styles.enfasis}>globales</span>
        </h2>
        <div className={styles.vacio}>Todavía no hay eventos globales programados.</div>
      </section>
    );
  }

  const destacado = eventos.find((e) => e.isFeatured) ?? eventos[0];
  const agenda = eventos.filter((e) => e.id !== destacado.id);
  const destacadoFecha = new Date(destacado.eventAtIso);
  const ms = Math.max(0, destacadoFecha.getTime() - ahora.getTime());
  const dias = Math.floor(ms / 86400000);
  const horas = Math.floor(ms / 3600000) % 24;
  const minutos = Math.floor(ms / 60000) % 60;

  return (
    <section className={styles.bloque} aria-labelledby="ev-titulo">
      <div className={styles.evCab}>
        <div>
          <div className={styles.eyebrow}>En vivo desde el mundo</div>
          <h2 className={styles.seccion} id="ev-titulo">
            Eventos <span className={styles.enfasis}>globales</span>
          </h2>
          <p>Actividades culturales en vivo desde distintas partes del mundo. Te mostramos la hora en tu ciudad.</p>
        </div>
        <div className={styles.tuHora}>
          <Reloj zona={MI_CIUDAD.zona} ahora={ahora} />
          <span>
            En {MI_CIUDAD.nombre} son las
            <br />
            <b>{fmt(ahora, MI_CIUDAD.zona, { hour: "2-digit", minute: "2-digit" })}</b>
          </span>
        </div>
      </div>

      <div className={styles.eventos}>
        <article className={styles.destacado}>
          <ImagePlaceholder label={destacado.title} />
          <div className={styles.destacadoVelo} />
          <span className={styles.destacadoVivo}>Evento destacado · {destacado.city}</span>
          <div className={styles.destacadoCuerpo}>
            <h3>{destacado.title}</h3>
            <p>{destacado.description}</p>
            <div className={styles.cuenta} aria-label={`Faltan ${dias} días, ${horas} horas y ${minutos} minutos`}>
              <span>
                <b>{dias}</b>
                <small>DÍAS</small>
              </span>
              <span>
                <b>{horas}</b>
                <small>HORAS</small>
              </span>
              <span>
                <b>{minutos}</b>
                <small>MIN</small>
              </span>
            </div>
            <p style={{ fontSize: 16 }}>
              En {MI_CIUDAD.nombre}:{" "}
              <b style={{ color: "#c7d873" }}>
                {fmt(destacadoFecha, MI_CIUDAD.zona, { weekday: "long", day: "numeric", month: "long" })},{" "}
                {fmt(destacadoFecha, MI_CIUDAD.zona, { hour: "2-digit", minute: "2-digit" })}
              </b>
            </p>
            <div>
              <BotonRecordar evento={destacado} esDestacado />
            </div>
          </div>
        </article>

        <ol className={styles.agenda}>
          {agenda.map((e) => {
            const fecha = new Date(e.eventAtIso);
            return (
              <li key={e.id} className={styles.ev}>
                <Reloj zona={e.timezone} ahora={ahora} />
                <div>
                  <span className={styles.evCiudad}>
                    {e.city} <em>· allá son las {fmt(ahora, e.timezone, { hour: "2-digit", minute: "2-digit" })}</em>
                  </span>
                  <h3>{e.title}</h3>
                  <p>{e.description}</p>
                  <div className={styles.evPie}>
                    <span className={styles.evHora}>
                      Para ti:{" "}
                      <b>
                        {fmt(fecha, MI_CIUDAD.zona, { weekday: "long", day: "numeric", month: "short" })} ·{" "}
                        {fmt(fecha, MI_CIUDAD.zona, { hour: "2-digit", minute: "2-digit" })}
                      </b>
                    </span>
                    <BotonRecordar evento={e} esDestacado={false} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
