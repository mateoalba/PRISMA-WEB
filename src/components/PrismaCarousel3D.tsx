"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DIMENSIONS } from "@/lib/dimensions";

const FACE_COUNT = DIMENSIONS.length;
const FACE_WIDTH = 175;
const FACE_HEIGHT = 540;
const ANGLE_STEP = 360 / FACE_COUNT;
const RADIUS = FACE_WIDTH / 2 / Math.tan(Math.PI / FACE_COUNT);
// Radio hasta las ARISTAS (no hasta el centro de cada cara) — para la
// tapa superior, que debe llegar exactamente a esas esquinas.
const OUTER_RADIUS = RADIUS / Math.cos(Math.PI / FACE_COUNT);
const CAP_SIZE = OUTER_RADIUS * 2;

// Inclinación fija del prisma completo, para que se vea su tapa
// superior y las caras se perciban como un sólido en 3D (no planas).
const TILT_X = -20;
const TILT_Z = -4;

// Top del grupo 3D dentro de `rootRef` (coincide con el padding-top
// `py-10` del contenedor) — se usa para anclar el reflejo justo debajo.
const GROUP_TOP = 40;

// Polígono de 10 lados de la tapa superior, como recorte CSS.
const CAP_CLIP_PATH = `polygon(${Array.from({ length: FACE_COUNT }, (_, k) => {
  const angle = ((k * ANGLE_STEP - ANGLE_STEP / 2) * Math.PI) / 180;
  const x = 50 + 50 * Math.sin(angle);
  const y = 50 - 50 * Math.cos(angle);
  return `${x}% ${y}%`;
}).join(", ")})`;

// Partículas flotantes alrededor del prisma — posiciones fijas (no
// Math.random) para que el render del servidor y el del cliente
// coincidan exactamente.
const PARTICLES = [
  { x: -42, y: 90, size: 6, duration: 6.2, delay: 0 },
  { x: 214, y: 50, size: 4, duration: 7.1, delay: 1.2 },
  { x: -24, y: 330, size: 5, duration: 5.6, delay: 0.6 },
  { x: 204, y: 410, size: 3, duration: 6.8, delay: 2 },
  { x: 92, y: -14, size: 4, duration: 5.2, delay: 0.3 },
  { x: 168, y: 486, size: 6, duration: 7.6, delay: 1.6 },
  { x: -52, y: 468, size: 3, duration: 6.1, delay: 0.9 },
  { x: 222, y: 226, size: 5, duration: 5.9, delay: 1.4 },
] as const;

export function PrismaCarousel3D({
  mode = "app",
  speed = 0.012,
}: {
  mode?: "app" | "public";
  speed?: number;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef(0);
  const wheelRef = useRef(0);
  const pausedRef = useRef(false);
  const [rotation, setRotation] = useState(0);

  // Arrastre manual (solo con el botón del mouse presionado).
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartWheelRef = useRef(0);
  const draggedFlagRef = useRef(false);

  // Bucle de animación: gira solo salvo que el mouse esté encima o se
  // esté arrastrando.
  useEffect(() => {
    let raf: number;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!pausedRef.current) {
        autoRef.current += dt * speed;
      }
      setRotation(autoRef.current + wheelRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  // Al pasar el mouse sobre el prisma, la rueda lo gira en vez de mover la
  // página. Se usa un listener nativo con { passive: false } porque React
  // hace pasivo el onWheel por defecto y no dejaría prevenir el scroll.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      wheelRef.current += e.deltaY * 0.3;
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Arrastrar con el botón del mouse presionado gira el prisma
  // manualmente — moverlo sin hacer clic no debe girarlo.
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!draggingRef.current) return;
      const delta = e.clientX - dragStartXRef.current;
      if (Math.abs(delta) > 4) draggedFlagRef.current = true;
      wheelRef.current = dragStartWheelRef.current + delta * 0.5;
    }
    function onMouseUp() {
      if (draggingRef.current) {
        draggingRef.current = false;
        pausedRef.current = false;
      }
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    draggingRef.current = true;
    draggedFlagRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartWheelRef.current = wheelRef.current;
    pausedRef.current = true;
  }

  // Brillo de cada cara según su ángulo actual respecto a la cámara —
  // así la luz "se mueve" con el giro, como en un sólido real, en vez
  // de colores fijos que no cambian con la rotación.
  const faceBrightness = useMemo(() => {
    return DIMENSIONS.map((_, i) => {
      const absoluteAngle = ((i * ANGLE_STEP + rotation) * Math.PI) / 180;
      const facing = Math.cos(absoluteAngle); // 1 = de frente, -1 = de espaldas
      return 0.55 + 0.45 * ((facing + 1) / 2);
    });
  }, [rotation]);

  const groupTransform = `rotateX(${TILT_X}deg) rotateZ(${TILT_Z}deg) rotateY(${rotation}deg)`;

  const cap = (
    <div
      className="absolute"
      style={{
        width: CAP_SIZE,
        height: CAP_SIZE,
        left: (FACE_WIDTH - CAP_SIZE) / 2,
        top: -CAP_SIZE / 2,
        background: "linear-gradient(135deg, var(--olive-deep) 0%, var(--graphite-soft) 100%)",
        clipPath: CAP_CLIP_PATH,
        transform: "rotateX(90deg)",
        transformStyle: "preserve-3d",
      }}
    />
  );

  function faceStyle(i: number): React.CSSProperties {
    return {
      width: FACE_WIDTH,
      height: FACE_HEIGHT,
      background:
        "linear-gradient(180deg, var(--olive-light) 0%, var(--olive) 100%), " +
        "linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 82%, rgba(0,0,0,0.35) 100%)",
      backgroundBlendMode: "normal, multiply",
      boxShadow: "inset 0 0 40px rgba(0,0,0,0.15)",
      filter: `brightness(${faceBrightness[i]}) hue-rotate(${((i * 9) % 20) - 10}deg) saturate(${1 + ((i % 3) - 1) * 0.08})`,
      transform: `rotateY(${i * ANGLE_STEP}deg) translateZ(${RADIUS}px)`,
    };
  }

  return (
    <div
      ref={rootRef}
      className="relative flex justify-center py-10"
      style={{ perspective: 1800, cursor: "grab" }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        if (!draggingRef.current) pausedRef.current = false;
      }}
    >
      {/* Glow ambiental detrás del prisma */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2"
        style={{
          top: GROUP_TOP + FACE_HEIGHT / 2,
          width: 680,
          height: 680,
          background:
            "radial-gradient(circle, rgba(190,220,100,0.55) 0%, rgba(150,180,65,0.28) 35%, transparent 70%)",
          filter: "blur(55px)",
          zIndex: 0,
          animation: "prism-glow-pulse 6s ease-in-out infinite",
        }}
      />

      {/* Órbitas de luz — arcos que giran lentamente alrededor del prisma */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2"
        viewBox="0 0 400 400"
        style={{
          top: GROUP_TOP + FACE_HEIGHT / 2,
          width: 400,
          height: 400,
          zIndex: 0,
          animation: "prism-orbit-spin 26s linear infinite",
        }}
      >
        <ellipse
          cx="200"
          cy="200"
          rx="185"
          ry="70"
          fill="none"
          stroke="var(--olive-light)"
          strokeWidth="2.4"
          strokeDasharray="48 260"
          strokeLinecap="round"
          opacity="0.85"
          style={{ filter: "drop-shadow(0 0 6px rgba(190,220,100,0.9))" }}
        />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2"
        viewBox="0 0 400 400"
        style={{
          top: GROUP_TOP + FACE_HEIGHT / 2,
          width: 400,
          height: 400,
          zIndex: 0,
          animation: "prism-orbit-spin-reverse 34s linear infinite",
        }}
      >
        <ellipse
          cx="200"
          cy="200"
          rx="150"
          ry="90"
          fill="none"
          stroke="var(--olive-light)"
          strokeWidth="1.8"
          strokeDasharray="30 300"
          strokeLinecap="round"
          opacity="0.65"
          style={{ filter: "drop-shadow(0 0 5px rgba(190,220,100,0.8))" }}
        />
      </svg>

      {/* Partículas geométricas flotantes */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2"
          style={{
            top: GROUP_TOP + p.y,
            width: p.size + 2,
            height: p.size + 2,
            marginLeft: p.x,
            borderRadius: "999px",
            background: "var(--olive-light)",
            boxShadow: "0 0 16px 4px rgba(190,220,100,0.85)",
            zIndex: 1,
            animation: `prism-particle-float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Halo de luz en la base — donde el prisma "toca el suelo" */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2"
        style={{
          top: GROUP_TOP + FACE_HEIGHT - 30,
          width: 560,
          height: 110,
          marginLeft: -280,
          background: "radial-gradient(ellipse, rgba(200,235,90,0.6) 0%, transparent 70%)",
          filter: "blur(22px)",
          zIndex: 1,
          animation: "prism-bloom-pulse 6s ease-in-out infinite",
        }}
      />

      {/* Prisma 3D */}
      <div
        className="relative"
        style={{
          width: FACE_WIDTH,
          height: FACE_HEIGHT,
          transformStyle: "preserve-3d",
          transform: groupTransform,
          zIndex: 2,
        }}
      >
        {cap}
        {DIMENSIONS.map((d, i) => (
          <button
            key={d.slug}
            type="button"
            onClick={() => {
              if (draggedFlagRef.current) return;
              router.push(mode === "public" ? "/registro" : `/dimensiones/${d.slug}`);
            }}
            className="absolute left-0 top-0 flex items-center justify-center p-6 text-center transition-[filter] hover:brightness-110"
            style={faceStyle(i)}
          >
            <span className="font-display text-lg font-bold leading-tight text-white">
              {d.title}
            </span>
          </button>
        ))}
      </div>

      {/* Reflejo en el "suelo" — eco tenue del prisma proyectado hacia abajo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2"
        style={{
          top: GROUP_TOP + FACE_HEIGHT - 40,
          width: 420,
          height: 190,
          marginLeft: -210,
          background: "linear-gradient(to bottom, rgba(190,220,100,0.45), transparent 75%)",
          filter: "blur(30px)",
          transform: "perspective(300px) rotateX(65deg)",
          opacity: 0.75,
          zIndex: 0,
        }}
      />
    </div>
  );
}
