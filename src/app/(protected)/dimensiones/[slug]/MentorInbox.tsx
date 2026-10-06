"use client";

import { useState, useTransition } from "react";
import styles from "@/styles/participacion-activa.module.css";
import {
  addMentorTopic,
  removeMentorTopic,
  respondToMentorRequest,
  type MentorState,
} from "@/lib/participation/mentorship-actions";

export function MentorInbox({ state }: { state: MentorState }) {
  const [topics, setTopics] = useState(state.topics);
  const [nuevoTema, setNuevoTema] = useState("");
  const [pila, setPila] = useState(state.pending);
  const [saliendo, setSaliendo] = useState<{ id: string; accion: "acepta" | "pasa" } | null>(null);
  const [aceptadas, setAceptadas] = useState(state.acceptedNames);
  const [isPending, startTransition] = useTransition();

  function agregarTema() {
    const tema = nuevoTema.trim();
    if (!tema || topics.some((t) => t.topic === tema)) return;
    setTopics((prev) => [...prev, { topic: tema, pendingCount: 0 }]);
    setNuevoTema("");
    startTransition(() => {
      addMentorTopic(tema);
    });
  }

  function quitarTema(tema: string) {
    setTopics((prev) => prev.filter((t) => t.topic !== tema));
    startTransition(() => {
      removeMentorTopic(tema);
    });
  }

  function responder(accion: "acepta" | "pasa") {
    const solicitud = pila[0];
    if (!solicitud || saliendo) return;
    setSaliendo({ id: solicitud.id, accion });
    if (accion === "acepta") {
      setAceptadas((prev) => [...prev, solicitud.requesterName.split(" ")[0].replace(",", "")]);
    }
    startTransition(() => {
      respondToMentorRequest(solicitud.id, accion === "acepta");
    });
    setTimeout(() => {
      setPila((prev) => prev.slice(1));
      setSaliendo(null);
    }, 420);
  }

  return (
    <section className={styles.bloque} aria-labelledby="men-titulo">
      <div className={styles.mentoria}>
        <div className={styles.mentoriaTxt}>
          <div className={styles.eyebrow}>Roles de mentoría</div>
          <h2 className={styles.seccion} id="men-titulo">
            Alguien quiere <span className={styles.enfasis}>aprender de ti</span>
          </h2>
          <p>Comparte tu experiencia con personas que buscan justo lo que tú sabes. Tú decides a quién acompañar.</p>
          <div className={styles.saberes}>
            {topics.length === 0 ? (
              <span className={styles.saber}>Todavía no elegiste temas para enseñar</span>
            ) : (
              topics.map((t) => (
                <span key={t.topic} className={styles.saber}>
                  {t.topic}
                  {t.pendingCount > 0 && (
                    <>
                      {" "}
                      · <b>{t.pendingCount} {t.pendingCount === 1 ? "solicitud" : "solicitudes"}</b>
                    </>
                  )}
                  <button type="button" className={styles.saberQuitar} onClick={() => quitarTema(t.topic)} aria-label={`Quitar ${t.topic}`}>
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
          <div className={styles.agregarSaber}>
            <input
              type="text"
              placeholder="Un tema que puedas enseñar, ej. Cocina tradicional"
              value={nuevoTema}
              onChange={(e) => setNuevoTema(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  agregarTema();
                }
              }}
            />
            <button type="button" className={`${styles.btn} ${styles.btnS} ${styles.btnSm}`} disabled={isPending} onClick={agregarTema}>
              Agregar tema
            </button>
          </div>
        </div>
        <div>
          <div className={styles.bandeja}>
            {pila.length === 0 ? (
              <div className={styles.bandejaVacia}>
                <div>
                  <b>¡Estás al día!</b>
                  Te avisaremos cuando alguien más quiera aprender de ti.
                </div>
              </div>
            ) : (
              <>
                {pila.map((s, k) => {
                  const claseSalida = saliendo?.id === s.id ? (saliendo.accion === "acepta" ? styles.solAcepta : styles.solPasa) : "";
                  return (
                    <article key={s.id} className={`${styles.solicitud} ${claseSalida}`} data-pos={k} aria-hidden={k !== 0}>
                      <div className={styles.solCab}>
                        <span className={styles.solFoto}>{s.initial}</span>
                        <div>
                          <b>{s.requesterName}</b>
                          <small>Quiere aprender de ti</small>
                        </div>
                        <span className={styles.solTema}>{s.topic}</span>
                      </div>
                      <p className={styles.solMsj}>{s.message}</p>
                      {k === 0 && (
                        <div className={styles.solAcciones}>
                          <button type="button" className={`${styles.btn} ${styles.btnP} ${styles.btnSm}`} disabled={!!saliendo} onClick={() => responder("acepta")}>
                            Aceptar y conversar
                          </button>
                          <button type="button" className={`${styles.btn} ${styles.btnS} ${styles.btnSm}`} disabled={!!saliendo} onClick={() => responder("pasa")}>
                            Ahora no
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
                <span className={styles.bandejaContador}>
                  {pila.length} {pila.length === 1 ? "solicitud" : "solicitudes"} pendientes
                </span>
              </>
            )}
          </div>
          <div className={styles.aceptadas}>{aceptadas.length > 0 && <>Mentorías aceptadas: <b>{aceptadas.join(", ")}</b></>}</div>
        </div>
      </div>
    </section>
  );
}
