import Link from "next/link";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { PrismaCarousel3D } from "@/components/PrismaCarousel3D";
import { PrismaAcrostic } from "@/components/PrismaAcrostic";
import { RolesSection } from "@/components/landing/RolesSection";
import { DimensionsLongList } from "@/components/landing/DimensionsLongList";
import { CommunityStories } from "@/components/landing/CommunityStories";
import { HeroScatterTexture } from "@/components/home/HeroScatterTexture";
import { EstanteriaLibros } from "@/app/(protected)/novedades/EstanteriaLibros";
import type { Libro } from "@/lib/novedades/libros-actions";

const PILLS = [
  "Más conocimientos",
  "Más experiencias",
  "Más aprendizajes",
  "Más tiempo para ti",
  "Más tiempo para enseñar",
  "Más tiempo para aprender",
];

// Pantalla de inicio — se muestra igual con o sin sesión iniciada (la
// barra de arriba es lo único que cambia). `loggedIn` solo ajusta a
// dónde llevan los clics (dimensiones reales vs. registro).
export function HomeContent({ loggedIn, libros, hasMembership }: { loggedIn: boolean; libros: Libro[]; hasMembership: boolean }) {
  return (
    <>
      <div className="bg-hero-gradient border-line relative z-0 mx-[calc(50%-50vw)] -mt-[180px] w-screen border-b pt-[180px]">
        <div className="hero-ambient absolute inset-0 overflow-hidden" aria-hidden="true">
          <span style={{ left: "-8%", top: "-6%", width: 420, height: 420, "--o": 0.2 } as CSSProperties} />
          <span style={{ right: "-6%", top: "4%", width: 440, height: 440, "--o": 0.22 } as CSSProperties} />
        </div>
        <HeroScatterTexture />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div className="flex flex-col items-start gap-6">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-light">
              Ecosistema digital multidimensional · +60
            </span>
            <h1 className="font-display max-w-xl text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Estás en la etapa en la que <em className="text-brand-light italic">más puedes aportar</em>
            </h1>
            <p className="max-w-xl text-lg text-foreground/70">
              PRISMA reúne en un solo lugar diez dimensiones de bienestar
              para que vivas esta etapa con plenitud: aprender, conectar,
              enseñar y cuidarte.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href={loggedIn ? "/dimensiones" : "/registro"}>
                <Button variant="primary" className="px-8 py-4 text-base">
                  {loggedIn ? "Explorar dimensiones" : "Únete a la comunidad"}
                </Button>
              </Link>
              {loggedIn ? (
                <Link href="/novedades">
                  <Button variant="secondary" className="px-8 py-4 text-base">
                    Ver novedades
                  </Button>
                </Link>
              ) : (
                <Link href="/dimensiones">
                  <Button variant="secondary" className="px-8 py-4 text-base">
                    Explorar dimensiones
                  </Button>
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {PILLS.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-line px-4 py-1.5 text-xs font-medium text-foreground/70"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <PrismaCarousel3D mode={loggedIn ? "app" : "public"} speed={0.004} />
        </div>
      </div>

      <section className="border-t border-line">
        <PrismaAcrostic />
      </section>

      <RolesSection />

      <DimensionsLongList />

      {libros.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <EstanteriaLibros libros={libros} hasMembership={hasMembership} />
        </section>
      )}

      <CommunityStories />

      <section id="app" className="mx-auto max-w-6xl px-6 pb-16 pt-4">
        <div className="flex flex-col items-center gap-4 rounded-xl bg-brand px-8 py-12 text-center text-graphite">
          <h2 className="font-display text-2xl font-semibold">
            {loggedIn ? (
              "¡Sigue explorando PRISMA!"
            ) : (
              <>
                ¡Únete a la comunidad <em className="italic">PRISMA</em>!
              </>
            )}
          </h2>
          <p className="max-w-xl text-graphite/80">
            Más tiempo para enseñar, más tiempo para aprender. La app
            móvil (iOS y Android) usa la misma cuenta que la web.
          </p>
          {!loggedIn && (
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/registro"
                className="inline-flex items-center justify-center rounded-full bg-graphite px-8 py-3 text-base font-bold tracking-wide text-foreground transition-colors hover:bg-graphite/80"
              >
                Crear mi cuenta
              </Link>
            </div>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-sm font-medium text-graphite/80">
            <span className="rounded-full border border-graphite/30 px-4 py-2">
              Próximamente en App Store
            </span>
            <span className="rounded-full border border-graphite/30 px-4 py-2">
              Próximamente en Google Play
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
