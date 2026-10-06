import { PlaceholderImage } from "./PlaceholderImage";

const ROLES = [
  { title: "Usuario", description: "Aprende y participa a tu ritmo" },
  { title: "Colaborador", description: "Comparte recetas, relatos y tutoriales" },
  { title: "Mentor", description: "Acompaña a otros en su camino digital" },
  { title: "Líder comunitario", description: "Guía un círculo de interés" },
];

export function RolesSection() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
      <div className="relative overflow-hidden rounded-2xl border border-line">
        <PlaceholderImage
          src="/landing/ensenar-tambien-es-aprender.jpg"
          alt="persona mayor sonriendo mientras enseña a otra a usar el celular"
          className="aspect-[4/3] w-full"
        />
        <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-graphite/80 p-4 backdrop-blur-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-light">
            Tu experiencia cuenta
          </span>
          <p className="mt-1 font-semibold text-foreground">Enseñar también es aprender</p>
        </div>
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-light">
          Tu momento
        </span>
        <h2 className="font-display mt-3 text-2xl font-semibold text-foreground md:text-3xl">
          De recibir a generar valor
        </h2>
        <p className="mt-3 text-foreground/70">
          En PRISMA no solo consumes contenido: creas, enseñas y lideras.
          Avanza por roles que reconocen tu experiencia.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {ROLES.map((role) => (
            <div key={role.title} className="rounded-lg border border-line bg-surface p-4">
              <h3 className="font-display font-semibold italic text-brand-light">{role.title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{role.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
