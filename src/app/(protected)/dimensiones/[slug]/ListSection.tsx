import type { ListItem } from "@/lib/dimension-content";

export function ListSection({ heading, items }: { heading: string; items: ListItem[] }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-foreground">{heading}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <span className="shrink-0 rounded-full bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand-light">
                {item.meta}
              </span>
            </div>
            <p className="text-sm text-foreground/70">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
