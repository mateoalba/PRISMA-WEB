"use client";

import { useState } from "react";
import styles from "@/styles/estimulacion-cognitiva.module.css";
import { findDuoPartner, leaveDuoQueue, type DuoPartner } from "@/lib/cognitive/duo-actions";

export function DuoMode({ waitingCount, myRecord }: { waitingCount: number; myRecord: number }) {
  const [buscando, setBuscando] = useState(false);
  const [partner, setPartner] = useState<DuoPartner | null>(null);
  const [sinSuerte, setSinSuerte] = useState(false);

  async function buscar() {
    setBuscando(true);
    setSinSuerte(false);
    const r = await findDuoPartner();
    setBuscando(false);
    if (r) {
      setPartner(r);
    } else {
      setSinSuerte(true);
    }
  }

  function otraVez() {
    setPartner(null);
    setSinSuerte(false);
  }

  async function cancelar() {
    setBuscando(false);
    setSinSuerte(false);
    await leaveDuoQueue();
  }

  return (
    <div className={styles.duo} aria-labelledby="duo-titulo">
      <div>
        <div className={styles.eyebrow}>Modo dúo</div>
        <h3 id="duo-titulo">
          Juega en <span className={styles.enfasis}>pareja</span>
        </h3>
      </div>
      <p>Compite amistosamente con otra persona de la comunidad.</p>
      <div className={`${styles.versus} ${buscando ? styles.buscando : ""}`}>
        <div className={styles.jugador}>
          <div className={styles.avatar}>P</div>
          <b>Tú</b>
          <span>{myRecord > 0 ? `Récord ${myRecord}` : "Aún sin récord"}</span>
        </div>
        <div className={styles.vs}>
          <b>vs</b>
        </div>
        <div className={styles.jugador}>
          <div style={{ position: "relative" }}>
            {buscando && (
              <>
                <span className={styles.radarBusca} />
                <span className={styles.radarBusca} />
              </>
            )}
            <div className={`${styles.avatar} ${!partner ? styles.avatarVacio : ""}`}>
              {partner ? partner.initial : "?"}
            </div>
          </div>
          <b>{partner ? partner.name : "Tu compañero"}</b>
          <span>{buscando ? "Buscando a alguien de tu nivel…" : partner ? "¡Listos para jugar!" : "Aún sin elegir"}</span>
        </div>
      </div>
      <div className={styles.duoAcciones}>
        {partner ? (
          <>
            <button type="button" className={`${styles.btn} ${styles.btnP}`}>
              ¡Jugar con {partner.name.split(" ")[0]}!
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnS} ${styles.btnSm}`} onClick={otraVez}>
              Buscar otra persona
            </button>
          </>
        ) : buscando ? (
          <button type="button" className={`${styles.btn} ${styles.btnS}`} onClick={cancelar}>
            Cancelar búsqueda
          </button>
        ) : (
          <>
            <button type="button" className={`${styles.btn} ${styles.btnP}`} onClick={buscar}>
              Buscar compañero
            </button>
            {waitingCount > 0 && (
              <span className={styles.enLinea}>
                {waitingCount} {waitingCount === 1 ? "persona buscando" : "personas buscando"} ahora
              </span>
            )}
          </>
        )}
      </div>
      {sinSuerte && (
        <p style={{ margin: 0, fontSize: 14, color: "var(--ink-muted)" }}>
          Todavía no hay nadie más buscando compañero ahora mismo. Te dejamos en la fila — intenta de nuevo en un
          momento.
        </p>
      )}
    </div>
  );
}
