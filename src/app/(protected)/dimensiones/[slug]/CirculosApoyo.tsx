"use client";

import { useState, useTransition } from "react";
import styles from "@/styles/salud-mental.module.css";
import { joinSupportCircle, leaveSupportCircle, type SupportCircle } from "@/lib/wellbeing/circles-actions";

const TONOS = ["#c7d873", "#9fae47", "#b3c35a", "#8a983a", "#d4e57f"];

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c.8-3.5 3-5 6-5s5.2 1.5 6 5M16 11a3 3 0 1 0 0-6M21 20c-.5-2.5-2-4-4-4.6" />
    </svg>
  );
}

function CirculoCard({ circulo }: { circulo: SupportCircle }) {
  const [joined, setJoined] = useState(circulo.joined);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !joined;
    setJoined(next);
    startTransition(() => {
      if (next) joinSupportCircle(circulo.id);
      else leaveSupportCircle(circulo.id);
    });
  }

  const visibles = circulo.fellowInitials.slice(0, 5);
  const resto = Math.max(0, circulo.memberCount - visibles.length - (joined ? 1 : 0));
  const dots = joined ? ["Tú", ...visibles] : visibles;
  const total = dots.length + (resto > 0 ? 1 : 0);

  return (
    <article className={`${styles.circulo} ${circulo.isLive ? styles.circuloVivo : ""}`}>
      <div className={styles.anillo} aria-hidden="true">
        <span className={styles.anilloOrbita} />
        <span className={styles.anilloCentro}>
          <span className={styles.ph}>Imagen del círculo</span>
        </span>
        {dots.map((label, i) => {
          const angle = (i / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
          return (
            <span
              key={i}
              className={styles.persona}
              style={{
                left: `${50 + Math.cos(angle) * 50}%`,
                top: `${50 + Math.sin(angle) * 50}%`,
                background: TONOS[i % TONOS.length],
              }}
            >
              {label}
            </span>
          );
        })}
        {resto > 0 &&
          (() => {
            const angle = (dots.length / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
            return (
              <span
                className={`${styles.persona} ${styles.personaMas}`}
                style={{ left: `${50 + Math.cos(angle) * 50}%`, top: `${50 + Math.sin(angle) * 50}%` }}
              >
                +{resto}
              </span>
            );
          })()}
      </div>
      {circulo.isLive && <span className={styles.vivo}>En vivo ahora</span>}
      <h3>{circulo.name}</h3>
      <p>{circulo.description}</p>
      <div className={styles.circuloMeta}>
        <span>
          <ClockIcon />
          {circulo.scheduleText}
        </span>
        <span>
          <PeopleIcon />
          {circulo.memberCount} de {circulo.capacity} lugares
        </span>
      </div>
      <div className={styles.circuloPie}>
        <span className={styles.moderador}>
          Modera <b>{circulo.moderatorName}</b>
        </span>
        <button
          type="button"
          className={`${styles.btn} ${joined ? styles.btnJoined : circulo.isLive ? styles.btnP : styles.btnS} ${styles.btnSm}`}
          aria-pressed={joined}
          disabled={isPending}
          onClick={toggle}
        >
          {joined ? "✓ Te uniste" : circulo.isLive ? "Entrar ahora" : "Unirme"}
        </button>
      </div>
    </article>
  );
}

export function CirculosApoyo({ circulos }: { circulos: SupportCircle[] }) {
  return (
    <section className={styles.bloque} aria-labelledby="circulos-titulo">
      <div className={styles.circulosCab}>
        <div>
          <div className={styles.eyebrow}>Acompañamiento en grupo</div>
          <h2 className={styles.seccion} id="circulos-titulo">
            Círculos de <span className={styles.enfasis}>apoyo</span>
          </h2>
          <p>Grupos pequeños y moderados para compartir experiencias con personas que te entienden.</p>
        </div>
      </div>
      {circulos.length === 0 ? (
        <div className={styles.vacio}>
          <p>Todavía no hay círculos de apoyo programados. Vuelve pronto.</p>
        </div>
      ) : (
        <div className={styles.circulos}>
          {circulos.map((c) => (
            <CirculoCard key={c.id} circulo={c} />
          ))}
        </div>
      )}
    </section>
  );
}
