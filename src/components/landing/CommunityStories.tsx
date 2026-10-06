import { PlaceholderImage } from "./PlaceholderImage";

const STORIES = [
  {
    image: "/landing/club-de-lectura.jpg",
    alt: "grupo de personas mayores conversando en un club de lectura",
    kicker: "Círculos de interés",
    title: "Club de lectura",
  },
  {
    image: "/landing/aprender-juntos.jpg",
    alt: "abuela y joven estudiante frente a una laptop",
    kicker: "Intergeneracional",
    title: "Aprender juntos",
  },
  {
    image: "/landing/movimiento-suave.jpg",
    alt: "rutina de estiramiento al aire libre",
    kicker: "Bienestar",
    title: "Movimiento suave",
  },
  {
    image: "/landing/idiomas-del-mundo.jpg",
    alt: "videollamada con personas de otro país",
    kicker: "Interculturalidad",
    title: "Idiomas del mundo",
  },
  {
    image: "/landing/memoria-oral.jpg",
    alt: "persona mayor grabando una historia familiar",
    kicker: "Propósito",
    title: "Memoria oral",
  },
];

export function CommunityStories() {
  return (
    <section id="comunidad" className="mx-auto max-w-6xl px-6 py-16">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-light">
        Comunidad PRISMA
      </span>
      <h2 className="font-display mt-3 text-2xl font-semibold text-foreground md:text-3xl">
        Historias que <em className="text-brand-light italic">inspiran</em>
      </h2>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <StoryCard story={STORIES[0]} imageClassName="aspect-[3/4] w-full lg:h-full lg:aspect-auto" />

        <div className="grid grid-cols-2 gap-4">
          {STORIES.slice(1, 5).map((s) => (
            <StoryCard key={s.title} story={s} imageClassName="aspect-[4/5] w-full" />
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryCard({
  story,
  imageClassName,
}: {
  story: (typeof STORIES)[number];
  imageClassName: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line">
      <PlaceholderImage src={story.image} alt={story.alt} className={imageClassName} />
      <div className="absolute bottom-3 left-3 right-3 rounded-lg bg-graphite/80 px-3 py-2 backdrop-blur-sm">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-light">
          {story.kicker}
        </span>
        <p className="text-sm font-semibold text-foreground">{story.title}</p>
      </div>
    </div>
  );
}
