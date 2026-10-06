"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/styles/perfil.module.css";
import { AvatarRing } from "./AvatarRing";
import { MembershipCard } from "./MembershipCard";
import { ResumenStats } from "./ResumenStats";
import { EspectroYActividad } from "./EspectroYActividad";
import { DatosForm } from "./DatosForm";
import { AccesibilidadPanel } from "./AccesibilidadPanel";
import { MembresiaPanel } from "./MembresiaPanel";
import { ToastProvider } from "./ToastContext";
import type { ProfileStats } from "@/lib/profile/stats";
import type { MembershipState } from "@/lib/membership/actions";

const TABS = ["Resumen", "Membresía", "Datos personales", "Accesibilidad"] as const;
type Tab = (typeof TABS)[number];

function CiudadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
function EstrellaIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" />
    </svg>
  );
}

function saludoHora() {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}

export function PerfilTabs({
  email,
  fullName,
  lastName,
  phone,
  city,
  emergencyContactName,
  emergencyContactPhone,
  avatarUrl,
  hasMembership,
  rol,
  stats,
  membership,
}: {
  email: string;
  fullName: string;
  lastName: string;
  phone: string;
  city: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  avatarUrl: string | null;
  hasMembership: boolean;
  rol: string;
  stats: ProfileStats;
  membership: MembershipState | null;
}) {
  const initialTab = useSearchParams().get("tab") === "membresia" ? "Membresía" : "Resumen";
  const [tab, setTab] = useState<Tab>(initialTab);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const indRef = useRef<HTMLSpanElement>(null);

  function moverInd(t: Tab) {
    const el = tabRefs.current[t];
    const ind = indRef.current;
    if (!el || !ind) return;
    ind.style.width = `${el.offsetWidth}px`;
    ind.style.transform = `translateX(${el.offsetLeft}px)`;
  }

  useEffect(() => {
    moverInd(tab);
  });

  useEffect(() => {
    const onResize = () => moverInd(tab);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [tab]);

  const primerNombre = (fullName || "").split(" ")[0] || "";
  const dias = stats.daysAsMember;

  return (
    <ToastProvider>
      <div className={styles.pagina}>
        <header className={styles.cabecera}>
          <AvatarRing activity={stats.dimensionActivity} initial={(fullName || email || "?").charAt(0).toUpperCase()} avatarUrl={avatarUrl} />
          <div>
            <div className={styles.eyebrow}>Mi perfil</div>
            <h1 className={styles.cabeceraH1}>
              {fullName} <span className={styles.enfasis}>{lastName}</span>
            </h1>
            <p className={styles.cabeceraSub}>
              {saludoHora()}
              {primerNombre ? `, ${primerNombre}` : ""}. Qué gusto verte por aquí.
            </p>
            <div className={styles.chips}>
              <span className={`${styles.chip} ${styles.chipRol}`}>
                <EstrellaIcon />
                {rol}
              </span>
              <span className={styles.chip}>
                <CiudadIcon />
                {city || "Ciudad no registrada"}
              </span>
              <span className={styles.chip}>
                <CalendarIcon />
                {dias} días en PRISMA
              </span>
            </div>
          </div>
          <div className={styles.cabeceraDer}>
            <span className={styles.sync}>
              <i />
              Sincronizado con la app móvil
            </span>
            <div className={styles.tabs} role="tablist" aria-label="Secciones del perfil">
              <span ref={indRef} className={styles.tabsInd} aria-hidden="true" />
              {TABS.map((t) => (
                <button
                  key={t}
                  ref={(el) => {
                    tabRefs.current[t] = el;
                  }}
                  type="button"
                  role="tab"
                  className={`${styles.tab} ${tab === t ? styles.tabOn : ""}`}
                  aria-selected={tab === t}
                  tabIndex={tab === t ? 0 : -1}
                  onClick={() => setTab(t)}
                  onKeyDown={(e) => {
                    const i = TABS.indexOf(t);
                    if (e.key === "ArrowRight") setTab(TABS[(i + 1) % TABS.length]);
                    if (e.key === "ArrowLeft") setTab(TABS[(i + TABS.length - 1) % TABS.length]);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </header>

        {tab === "Resumen" && (
          <section className={styles.panel} role="tabpanel">
            <MembershipCard hasMembership={hasMembership} onVerMembresia={() => setTab("Membresía")} />
            <ResumenStats stats={stats} />
            <EspectroYActividad stats={stats} />
          </section>
        )}

        {tab === "Membresía" && (
          <section className={styles.panel} role="tabpanel">
            <MembresiaPanel membership={membership} />
          </section>
        )}

        {tab === "Datos personales" && (
          <section className={styles.panel} role="tabpanel">
            <DatosForm
              email={email}
              fullName={fullName}
              lastName={lastName}
              phone={phone}
              city={city}
              emergencyContactName={emergencyContactName}
              emergencyContactPhone={emergencyContactPhone}
            />
          </section>
        )}

        {tab === "Accesibilidad" && (
          <section className={styles.panel} role="tabpanel">
            <AccesibilidadPanel />
          </section>
        )}
      </div>
    </ToastProvider>
  );
}
