export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-foreground/70 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Prisma — Corporación Penser.</p>
        <div className="flex gap-6">
          <a href="https://penser.org" target="_blank" rel="noreferrer" className="hover:text-brand-light">
            penser.org
          </a>
          <a href="mailto:contacto@penser.org" className="hover:text-brand-light">
            contacto@penser.org
          </a>
        </div>
      </div>
    </footer>
  );
}
