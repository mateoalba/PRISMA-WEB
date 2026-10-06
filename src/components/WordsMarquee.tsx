const WORDS = [
  "MADUREZ SALUDABLE",
  "PLENITUD",
  "COMUNIDAD",
  "APRENDIZAJE",
  "TRASCENDENCIA",
  "COGNICIÓN",
  "VITALIDAD",
  "BIENESTAR",
  "ESTIMULACIÓN",
];

function WordList({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {WORDS.map((word, i) => (
        <span key={i} className="flex items-center">
          <span className="font-display px-8 text-lg font-semibold uppercase tracking-wide text-white sm:text-xl">
            {word}
          </span>
          <span className="mx-3 h-2.5 w-2.5 rotate-45 bg-white/50" />
        </span>
      ))}
    </div>
  );
}

export function WordsMarquee() {
  return (
    <div className="border-line mx-[calc(50%-50vw)] w-screen overflow-hidden border-y bg-brand py-3">
      <div className="flex w-max animate-marquee">
        <WordList />
        <WordList ariaHidden />
      </div>
    </div>
  );
}
