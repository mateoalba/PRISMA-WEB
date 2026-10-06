// Íconos compartidos entre las dos actividades de Tiempo libre (cartas del
// quiz y actividades de "Arma tu tarde"), para no repetir los paths.
export type ClaveIcono = "corazon" | "pincel" | "nota" | "guitarra" | "lupa" | "libro" | "olla" | "zapato" | "planta" | "flecha" | "sig";

const PATHS: Record<ClaveIcono, React.ReactNode> = {
  corazon: <path d="M12 20s-7-4.4-8.7-9C2 7.5 4.4 4 7.7 4c1.8 0 3.2 1 4.3 2.5C13.1 5 14.5 4 16.3 4 19.6 4 22 7.5 20.7 11 19 15.6 12 20 12 20z" />,
  pincel: (
    <>
      <path d="M18 3l3 3-9 9-3-3z" />
      <path d="M9 12c-3 0-5 2-5 5 0 1.5-1 2.5-2 3 4 1 9 0 9-5z" />
    </>
  ),
  nota: (
    <>
      <path d="M9 18V5l11-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  guitarra: (
    <>
      <path d="M14 10l6-6M18 2l4 4" />
      <path d="M11.5 9.5c-2-2-5.5-1.5-7 .5s-1.5 5.5 1 8 6 2.5 8 1 2.5-5 .5-7z" />
      <circle cx="9" cy="15" r="1.5" />
    </>
  ),
  lupa: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  libro: <path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z" />,
  olla: (
    <>
      <path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
      <path d="M2 10h20M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2" />
    </>
  ),
  zapato: (
    <>
      <path d="M3 17h18v-2c0-1.5-1-2.5-3-3l-5-1-2-4H6L4 11z" />
      <path d="M3 17v2h18v-2M9 11l1 2M12 11l1 2" />
    </>
  ),
  planta: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 3-7 8-7 0 5-3 7-8 7zM12 14c0-3-2.5-5-6.5-5 0 4 2.5 5 6.5 5z" />
      <path d="M7 21h10" />
    </>
  ),
  flecha: <path d="M6 9l6 6 6-6" />,
  sig: <path d="M5 12h14M13 6l6 6-6 6" />,
};

export function Icono({ clave, className }: { clave: ClaveIcono; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[clave]}
    </svg>
  );
}

export function IconoPaths({ clave }: { clave: ClaveIcono }) {
  return <>{PATHS[clave]}</>;
}
