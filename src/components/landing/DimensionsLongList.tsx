import Link from "next/link";
import { DIMENSIONS_LANDING } from "@/lib/dimensions-landing";

export function DimensionsLongList() {
  return (
    <section id="dimensiones" className="border-t border-line bg-surface/40">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-light">
          El modelo completo
        </span>
        <h2 className="font-display mt-3 text-2xl font-semibold text-foreground md:text-3xl">
          Dimensiones del Modelo PRISMA
        </h2>
        <p className="mt-2 max-w-2xl text-foreground/70">
          Diez dimensiones diseñadas desde la evidencia gerontológica para
          vivir una madurez activa, saludable y con propósito.
        </p>

        <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2">
          {DIMENSIONS_LANDING.map((d, i) => (
            <Link
              key={d.slug}
              href={`/dimensiones/${d.slug}`}
              className="group flex gap-4"
            >
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand text-sm font-bold text-graphite">
                {i + 1}
              </span>
              <div>
                <h3 className="font-display font-semibold text-foreground group-hover:text-brand-light">
                  {i + 1}. {d.title}
                </h3>
                <p className="mt-1 text-sm text-foreground/70">{d.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
