// Parches de puntos (tipo trama/halftone) y triángulos sueltos, dispersos
// por toda la sección hero — posiciones fijas (no aleatorias) para que no
// cambien entre el render del servidor y el del cliente. Opacidad muy
// baja: es una textura de fondo, no debe competir con el texto ni el
// prisma.
const DOT_PATCHES = [
  { top: "4%", left: "55%", size: 110 },
  { top: "24%", left: "2%", size: 90 },
  { top: "50%", left: "76%", size: 130 },
  { top: "72%", left: "30%", size: 100 },
  { top: "90%", left: "60%", size: 80 },
] as const;

const TRIANGLES = [
  { top: "10%", left: "40%", size: 64, rotate: 12 },
  { top: "26%", left: "86%", size: 96, rotate: -18 },
  { top: "44%", left: "10%", size: 52, rotate: 40 },
  { top: "66%", left: "58%", size: 84, rotate: -6 },
  { top: "80%", left: "28%", size: 44, rotate: 20 },
  { top: "58%", left: "92%", size: 70, rotate: 55 },
] as const;

function Triangle({ size, rotate }: { size: number; rotate: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <polygon points="20,4 36,34 4,34" fill="var(--olive-light)" />
    </svg>
  );
}

export function HeroScatterTexture() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {DOT_PATCHES.map((d, i) => (
        <span
          key={`dot-${i}`}
          className="absolute"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            backgroundImage:
              "radial-gradient(circle, rgba(168,189,82,0.9) 1.4px, transparent 1.9px)",
            backgroundSize: "14px 14px",
            opacity: 0.16,
          }}
        />
      ))}
      {TRIANGLES.map((t, i) => (
        <span
          key={`tri-${i}`}
          className="absolute"
          style={{ top: t.top, left: t.left, opacity: 0.12 }}
        >
          <Triangle size={t.size} rotate={t.rotate} />
        </span>
      ))}
    </div>
  );
}
