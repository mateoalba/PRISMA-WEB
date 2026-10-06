import Link from "next/link";
import { PrismaLogo } from "@/components/layout/PrismaLogo";
import { HeaderAccountMenu } from "@/components/layout/HeaderAccountMenu";
import { Button } from "@/components/ui/Button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Inicio" },
  { href: "/dimensiones", label: "Dimensiones" },
  { href: "/#comunidad", label: "Comunidad" },
  { href: "https://penser.org", label: "Sobre PENSER", external: true },
  { href: "/novedades", label: "Novedades" },
  { href: "/tienda", label: "Tienda" },
];

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="20" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function SiteHeader({
  user,
}: {
  user: { initial: string; isAdmin: boolean } | null;
}) {
  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-6xl px-4 md:px-6">
      <div className="flex items-center justify-between gap-4 rounded-full border border-[var(--nav-glass-border)] border-t-[var(--nav-glass-border-t)] border-l-[var(--nav-glass-border-l)] bg-[var(--nav-glass-bg)] py-2.5 pl-6 pr-3 shadow-[var(--nav-glass-shadow)] backdrop-blur-2xl backdrop-saturate-150">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center">
            <PrismaLogo height={34} />
          </Link>

          <nav className="hidden items-center gap-8 text-[15px] font-semibold md:flex">
            {NAV_ITEMS.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground/60 transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground/60 transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {user ? (
            <div className="flex items-center gap-3">
              {/* TODO: reemplazar por la línea de apoyo real de Penser cuando la definan */}
              <a
                href="tel:+10000000000"
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                SOS
              </a>
              <Link
                href="/tienda"
                aria-label="Ver carrito"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--nav-glass-border)] bg-[var(--nav-glass-bg)] text-foreground hover:brightness-110"
              >
                <CartIcon />
              </Link>
              <HeaderAccountMenu initial={user.initial} isAdmin={user.isAdmin} />
            </div>
          ) : (
            <Link href="/login">
              <Button variant="primary" className="px-6 py-3 text-[15px]">
                Iniciar sesión
              </Button>
            </Link>
          )}
        </div>
    </header>
  );
}
