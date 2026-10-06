"use client";

import { useState, useTransition } from "react";
import styles from "@/styles/novedades.module.css";
import { saveSubscription, type NovedadesSubscription } from "@/lib/novedades/subscription-actions";
import { TEMAS_AVISO } from "@/lib/novedades/subscription-content";

export function AvisameForm({ subscripcion, userEmail }: { subscripcion: NovedadesSubscription; userEmail: string }) {
  const [temas, setTemas] = useState<string[]>(subscripcion?.topics ?? TEMAS_AVISO.slice(0, 2));
  const [email, setEmail] = useState(subscripcion?.email ?? userEmail);
  const [gracias, setGracias] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggleTema(t: string) {
    setTemas((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("email", email);
    temas.forEach((t) => fd.append("topics", t));
    startTransition(() => {
      saveSubscription(fd);
    });
    setGracias(`¡Listo! Te avisaremos sobre ${temas.length > 0 ? temas.join(", ").toLowerCase() : "todas las novedades"}.`);
  }

  return (
    <section className={styles.bloque} aria-labelledby="av-titulo">
      <div className={styles.avisame}>
        <div>
          <div className={styles.eyebrow}>No te pierdas nada</div>
          <h2 id="av-titulo">
            Te avisamos cuando haya <span className={styles.enfasis}>algo nuevo</span>
          </h2>
          <p>Elige qué te interesa y recibe un resumen semanal por correo.</p>
        </div>
        <form onSubmit={onSubmit}>
          <div className={styles.temasAviso} role="group" aria-label="Qué te interesa">
            {TEMAS_AVISO.map((t) => (
              <label key={t} className={styles.chk}>
                <input type="checkbox" checked={temas.includes(t)} onChange={() => toggleTema(t)} />
                <span>{t}</span>
              </label>
            ))}
          </div>
          <div className={styles.formAviso}>
            <label htmlFor="correo-aviso">Tu correo electrónico</label>
            <input
              type="email"
              id="correo-aviso"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
              required
            />
            <button type="submit" className={`${styles.btn} ${styles.btnP}`} disabled={isPending}>
              Avísame
            </button>
          </div>
          <div className={styles.gracias} role="status">
            {gracias}
          </div>
        </form>
      </div>
    </section>
  );
}
