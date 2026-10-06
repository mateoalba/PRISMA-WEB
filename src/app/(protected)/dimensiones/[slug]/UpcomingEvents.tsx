"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import styles from "@/styles/conexion-social.module.css";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { attendEvent, unattendEvent, type CommunityEvent } from "@/lib/community/events-actions";

const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function PresencialIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function VirtualIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="6" width="13" height="12" rx="3" />
      <path d="M16 10l5-3v10l-5-3" />
    </svg>
  );
}
function ArrowIcon({ dir }: { dir: -1 | 1 }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d={dir === -1 ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

function Cuenta({ evento }: { evento: CommunityEvent }) {
  const [restante, setRestante] = useState(() => Math.max(0, new Date(evento.eventAt).getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setRestante(Math.max(0, new Date(evento.eventAt).getTime() - Date.now()));
    }, 30000);
    return () => clearInterval(id);
  }, [evento.eventAt]);

  const dias = Math.floor(restante / 86400000);
  const horas = Math.floor(restante / 3600000) % 24;
  const minutos = Math.floor(restante / 60000) % 60;

  return (
    <div className={styles.cuenta} aria-live="polite">
      <div className={styles.cuentaNum}>
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
      <div className={styles.cuentaTxt}>
        para el próximo evento:
        <br />
        <b>{evento.title}</b>
      </div>
    </div>
  );
}

function Boleto({ evento }: { evento: CommunityEvent }) {
  const [attending, setAttending] = useState(evento.attending);
  const [isPending, startTransition] = useTransition();
  const fecha = new Date(evento.eventAt);

  function toggle() {
    const next = !attending;
    setAttending(next);
    startTransition(() => {
      if (next) attendEvent(evento.id);
      else unattendEvent(evento.id);
    });
  }

  return (
    <article className={styles.evento}>
      <span className={styles.eventoNodo} aria-hidden="true" />
      <div className={styles.boleto}>
        <div className={styles.boletoImg}>
          <ImagePlaceholder label={evento.title} />
          <div className={styles.fecha}>
            <b>{fecha.getDate()}</b>
            <small>{MESES[fecha.getMonth()]}</small>
          </div>
          <span className={styles.modo}>
            {evento.mode === "presencial" ? <PresencialIcon /> : <VirtualIcon />}
            {evento.mode === "presencial" ? "Presencial" : "Virtual"}
          </span>
        </div>
        <div className={styles.boletoCorte} aria-hidden="true" />
        <div className={styles.boletoCuerpo}>
          <h3>{evento.title}</h3>
          <p>{evento.description}</p>
          <span className={styles.chip} style={{ width: "fit-content" }}>
            {DIAS[fecha.getDay()]} · {fecha.toTimeString().slice(0, 5)} · {evento.location}
          </span>
          <div className={styles.boletoPie}>
            <button
              type="button"
              className={`${styles.btn} ${attending ? styles.btnJoined : styles.btnP} ${styles.btnSm}`}
              aria-pressed={attending}
              disabled={isPending}
              onClick={toggle}
            >
              {attending ? "✓ Apuntado" : "Me apunto"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function UpcomingEvents({ eventos }: { eventos: CommunityEvent[] }) {
  const modos = useMemo(() => ["Todos", ...Array.from(new Set(eventos.map((e) => e.mode)))], [eventos]);
  const [modo, setModo] = useState("Todos");
  const lineaRef = useRef<HTMLDivElement>(null);

  const visibles = modo === "Todos" ? eventos : eventos.filter((e) => e.mode === modo);

  function mover(dir: -1 | 1) {
    lineaRef.current?.scrollBy({ left: dir * 322, behavior: "smooth" });
  }

  return (
    <section className={styles.bloque} aria-labelledby="ev-titulo">
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Agenda</div>
          <h2 className={styles.seccion} id="ev-titulo">
            Próximos <span className={styles.enfasis}>eventos</span>
          </h2>
          <p>Paseos, charlas y actividades presenciales y virtuales cerca de ti.</p>
        </div>
        {eventos.length > 0 && (
          <div className={styles.flechas}>
            <button type="button" className={styles.flecha} onClick={() => mover(-1)} aria-label="Eventos anteriores">
              <ArrowIcon dir={-1} />
            </button>
            <button type="button" className={styles.flecha} onClick={() => mover(1)} aria-label="Más eventos">
              <ArrowIcon dir={1} />
            </button>
          </div>
        )}
      </div>

      {eventos.length === 0 ? (
        <div className={styles.vacio}>Todavía no hay eventos programados. Vuelve pronto.</div>
      ) : (
        <>
          <Cuenta evento={eventos[0]} />
          <div className={styles.filtros} role="group" aria-label="Filtrar eventos" style={{ marginTop: 14 }}>
            {modos.map((m) => (
              <button
                key={m}
                type="button"
                className={`${styles.filtro} ${m === modo ? styles.filtroActivo : ""}`}
                aria-pressed={m === modo}
                onClick={() => setModo(m)}
              >
                {m === "Todos" ? "Todos" : m === "presencial" ? "Presencial" : "Virtual"}
              </button>
            ))}
          </div>
          <div className={styles.lineaTiempo} ref={lineaRef}>
            {visibles.map((e) => (
              <Boleto key={e.id} evento={e} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
