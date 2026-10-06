import Image from "next/image";

// Dos versiones del logo (texto claro para fondo oscuro, texto oscuro
// para fondo claro) apiladas y alternadas por CSS según data-theme (ver
// globals.css), para no depender de JS ni causar parpadeos de hidratación.
export function PrismaLogo({ height = 28 }: { height?: number }) {
  // Proporción real del archivo (844x256).
  const width = Math.round(height * (844 / 256));
  return (
    <span className="relative inline-block" style={{ height, width }}>
      <Image
        src="/prisma-logo.png"
        alt="Prisma by Penser"
        width={width}
        height={height}
        priority
        className="logo-oscuro"
        style={{ height, width: "auto" }}
      />
      <Image
        src="/prisma-logo-light.png"
        alt="Prisma by Penser"
        width={width}
        height={height}
        priority
        className="logo-claro absolute inset-0"
        style={{ height, width: "auto" }}
      />
    </span>
  );
}
