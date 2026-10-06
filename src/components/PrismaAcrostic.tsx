const LETTERS = [
  { letter: "P", label: "Pensamiento sistémico" },
  { letter: "R", label: "Redes de conexión social" },
  { letter: "I", label: "Inclusión digital" },
  { letter: "S", label: "Salud integral" },
  { letter: "M", label: "Mente y estimulación cognitiva" },
  { letter: "A", label: "Aprendizaje continuo" },
];

export function PrismaAcrostic() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-4 pb-10">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-light">
          El nombre lo dice todo
        </span>
        <h2 className="font-display mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
          Seis letras.
          <br />
          Un modelo completo.
        </h2>
        <p className="mt-3 max-w-2xl text-foreground/70">
          Como la luz que atraviesa un prisma y se transforma en un espectro
          de colores, cada persona mayor que entra a esta comunidad se abre
          en múltiples dimensiones de bienestar.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {LETTERS.map((item) => (
          <div
            key={item.letter}
            className="flex min-h-[160px] flex-col justify-between gap-6 rounded-lg border border-line bg-surface p-6"
          >
            <span className="font-display text-6xl font-bold text-brand-light">
              {item.letter}
            </span>
            <span className="font-display text-base italic text-foreground/80">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
