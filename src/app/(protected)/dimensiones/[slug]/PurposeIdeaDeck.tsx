"use client";

import { useState, useTransition } from "react";
import styles from "@/styles/tiempo-libre.module.css";
import { togglePurposeSignup } from "@/lib/community/purpose-actions";
import type { PurposeIdea } from "@/lib/purpose-content";
import type { PurposeIdeaState } from "@/lib/community/purpose-actions";

type MergedIdea = PurposeIdea & PurposeIdeaState;

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function RoleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" />
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

export function PurposeIdeaDeck({ ideas }: { ideas: MergedIdea[] }) {
  const [arriba, setArriba] = useState(0);
  const [saliendo, setSaliendo] = useState(false);
  const [signed, setSigned] = useState<Set<string>>(() => new Set(ideas.filter((i) => i.signedUp).map((i) => i.slug)));
  const [isPending, startTransition] = useTransition();

  if (ideas.length === 0) return null;

  function avanzar(dir: -1 | 1) {
    if (dir > 0) {
      setSaliendo(true);
      setTimeout(() => {
        setSaliendo(false);
        setArriba((a) => (a + 1) % ideas.length);
      }, 380);
    } else {
      setArriba((a) => (a - 1 + ideas.length) % ideas.length);
    }
  }

  function toggleQuiero(slug: string) {
    setSigned((prev) => {
      const next = new Set(prev);
      const isSigned = next.has(slug);
      if (isSigned) next.delete(slug);
      else next.add(slug);
      startTransition(() => {
        togglePurposeSignup(slug, !isSigned);
      });
      return next;
    });
  }

  const idea = ideas[arriba];
  const signedUp = signed.has(idea.slug);
  const count = idea.signupCount + (signedUp && !idea.signedUp ? 1 : !signedUp && idea.signedUp ? -1 : 0);

  return (
    <section className={styles.bloque} aria-labelledby="ip-titulo">
      <div className={styles.proposito}>
        <div className={styles.propositoTxt}>
          <div className={styles.eyebrow}>Tu tiempo cuenta</div>
          <h2 className={styles.seccion} id="ip-titulo">
            Ideas con <span className={styles.enfasis}>propósito</span>
          </h2>
          <p>Actividades que dejan huella: en ti y en las personas que te rodean.</p>
          <div className={styles.impacto} aria-live="polite">
            <span>
              {count > 0 ? (
                <>
                  <b>{count}</b> {count === 1 ? "persona ya se apuntó" : "personas ya se apuntaron"} a esta idea
                </>
              ) : (
                "Sé la primera persona en apuntarte a esta idea"
              )}
            </span>
          </div>
          <div className={styles.mazoNav}>
            <button type="button" className={styles.flecha} onClick={() => avanzar(-1)} aria-label="Idea anterior">
              <ArrowIcon dir={-1} />
            </button>
            <span className={styles.mazoNavCuenta}>
              <b>{arriba + 1}</b> / {ideas.length}
            </span>
            <button type="button" className={styles.flecha} onClick={() => avanzar(1)} aria-label="Siguiente idea">
              <ArrowIcon dir={1} />
            </button>
          </div>
        </div>

        <div
          className={styles.mazo}
          role="region"
          aria-roledescription="mazo de ideas"
          aria-label="Ideas con propósito"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") avanzar(1);
            if (e.key === "ArrowLeft") avanzar(-1);
          }}
        >
          {ideas.map((d, k) => {
            const pos = (k - arriba + ideas.length) % ideas.length;
            const posClass =
              pos === 0 ? styles.cartaPos0 : pos === 1 ? styles.cartaPos1 : pos === 2 ? styles.cartaPos2 : styles.cartaOculta;
            const esTop = pos === 0;
            const dJoined = signed.has(d.slug);
            return (
              <article
                key={d.slug}
                className={`${styles.carta} ${posClass} ${esTop && saliendo ? styles.cartaSale : ""}`}
                aria-hidden={!esTop}
              >
                <div className={styles.cartaImg}>
                  <div className={`${styles.ph} ${styles.phArriba}`}>
                    <span>Imagen: {d.title}</span>
                  </div>
                </div>
                <div className={styles.cartaVelo} />
                <span className={styles.cartaNum} aria-hidden="true">
                  {String(k + 1).padStart(2, "0")}
                </span>
                <span className={styles.cartaFrec}>
                  <ClockIcon />
                  {d.frequency}
                </span>
                <div className={styles.cartaCuerpo}>
                  <span className={styles.cartaRol}>
                    <RoleIcon />
                    {d.role}
                  </span>
                  <h3>{d.title}</h3>
                  <p>{d.description}</p>
                  <div style={{ marginTop: 6 }}>
                    <button
                      type="button"
                      className={`${styles.btn} ${dJoined ? styles.btnJoined : styles.btnP} ${styles.btnSm}`}
                      aria-pressed={dJoined}
                      tabIndex={esTop ? 0 : -1}
                      disabled={isPending}
                      onClick={() => toggleQuiero(d.slug)}
                    >
                      {dJoined ? "✓ Te apuntaste" : "Quiero hacerlo"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          <span className={styles.mazoPista} aria-hidden="true">
            Usa las flechas para ver las demás ideas
          </span>
        </div>
      </div>
    </section>
  );
}
