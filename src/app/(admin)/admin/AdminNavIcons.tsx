import styles from "@/styles/admin.module.css";

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg className={styles.ico} viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

export function IcoDash() {
  return (
    <Svg>
      <rect x="3" y="3" width="8" height="10" rx="2" />
      <rect x="13" y="3" width="8" height="6" rx="2" />
      <rect x="13" y="11" width="8" height="10" rx="2" />
      <rect x="3" y="15" width="8" height="6" rx="2" />
    </Svg>
  );
}
export function IcoContenido() {
  return (
    <Svg>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M4 8h16M9 13h6M9 17h6" />
    </Svg>
  );
}
export function IcoDims() {
  return (
    <Svg>
      <path d="M12 2l7 6-3 12H8L5 8z" />
      <path d="M5 8h14M9 8l3 12 3-12" />
    </Svg>
  );
}
export function IcoActividades() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4" />
      <path d="M12 17h.01" />
    </Svg>
  );
}
export function IcoPrograma() {
  return (
    <Svg>
      <circle cx="6" cy="6" r="2.4" />
      <path d="M11 6h9" />
      <circle cx="6" cy="12" r="2.4" />
      <path d="M11 12h9" />
      <circle cx="6" cy="18" r="2.4" />
      <path d="M11 18h9" />
    </Svg>
  );
}
export function IcoApoyo() {
  return (
    <Svg>
      <path d="M9 8.5c0-2-1.6-3.5-3.5-3.5S2 6.5 2 8.5c0 3 4 6 7 7.5 3-1.5 7-4.5 7-7.5" />
      <path d="M15 8.5c0-2 1.6-3.5 3.5-3.5S22 6.5 22 8.5c0 3-4 6-7 7.5" />
    </Svg>
  );
}
export function IcoInteres() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </Svg>
  );
}
export function IcoEncuentros() {
  return (
    <Svg>
      <circle cx="8" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
      <path d="M14.5 15c2.4.2 4.5 2.3 4.7 5" />
    </Svg>
  );
}
export function IcoEventos() {
  return (
    <Svg>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Svg>
  );
}
export function IcoNovedades() {
  return (
    <Svg>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </Svg>
  );
}
export function IcoTienda() {
  return (
    <Svg>
      <path d="M4 8l1.5-4h13L20 8" />
      <path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <path d="M9 12a3 3 0 0 0 6 0" />
    </Svg>
  );
}
export function IcoUsuarios() {
  return (
    <Svg>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5S15.5 16.4 15.5 20" />
      <path d="M16 4.5a3.2 3.2 0 0 1 0 6.4" />
      <path d="M18.5 13.8c2 .7 3.5 2.9 3.5 5.7" />
    </Svg>
  );
}
export function IcoVolver() {
  return (
    <Svg>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Svg>
  );
}
export function IcoSalir() {
  return (
    <Svg>
      <path d="M15 17l5-5-5-5" />
      <path d="M20 12H9" />
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
    </Svg>
  );
}
export function IcoBuscar() {
  return (
    <Svg>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </Svg>
  );
}
export function IcoSol() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </Svg>
  );
}
export function IcoLuna() {
  return (
    <Svg>
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />
    </Svg>
  );
}
export function IcoMenu() {
  return (
    <Svg>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}
export function IcoFlecha() {
  return (
    <Svg>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  );
}
