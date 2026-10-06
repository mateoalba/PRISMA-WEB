"use client";

import { useState } from "react";
import styles from "@/styles/seguridad-digital.module.css";
import { SENALES } from "@/lib/security-content";

const ICONOS = [
  <><circle key="a" cx={12} cy={13} r={8} /><path d="M12 9v4l2 2M9 2h6" /></>,
  <><rect key="b" x={5} y={11} width={14} height={10} rx={2} /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  <><rect key="c" x={3} y={8} width={18} height={13} rx={2} /><path d="M12 8v13M3 12h18" /></>,
  <><path key="d" d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  <><rect key="e" x={7} y={2} width={10} height={20} rx={2} /><path d="M11 18h2" /></>,
];

function Icono({ i }: { i: number }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONOS[i]}
    </svg>
  );
}
function MasIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ScamWarningSigns() {
  const [abierta, setAbierta] = useState(0);

  return (
    <section className={styles.bloque} aria-labelledby="est-titulo">
      <div className={styles.senalesCab}>
        <div>
          <div className={styles.eyebrow}>Señales de alerta</div>
          <h2 className={styles.seccion} id="est-titulo">
            ¿Es esto una <span className={styles.enfasis}>estafa?</span>
          </h2>
          <p>Si un mensaje, llamada o correo tiene alguna de estas señales, detente y verifica antes de hacer nada.</p>
        </div>
      </div>
      <ul className={styles.senales}>
        {SENALES.map((s, i) => {
          const on = i === abierta;
          return (
            <li key={s.titulo} className={`${styles.senal} ${on ? styles.senalOn : ""}`}>
              <button type="button" className={styles.senalBoton} aria-expanded={on} onClick={() => setAbierta(on ? -1 : i)}>
                <span className={styles.senalIco}>
                  <Icono i={i} />
                </span>
                <span>
                  <span className={styles.senalTitulo}>{s.titulo}</span>
                  <span className={styles.senalSub}>{s.sub}</span>
                </span>
                <span className={styles.senalMas} aria-hidden="true">
                  <MasIcon />
                </span>
              </button>
              <div className={styles.senalCuerpo}>
                <div>
                  <div className={styles.senalEj}>
                    <div className={styles.ejMsj}>
                      <small>ASÍ SUELE VERSE</small>
                      {s.ejemplo}
                    </div>
                    <div className={styles.ejQue}>
                      <b>Qué hacer</b>
                      {s.que}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
