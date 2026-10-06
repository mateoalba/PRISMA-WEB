"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth/actions";

export function HeaderAccountMenu({
  initial,
  isAdmin,
}: {
  initial: string;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Cuenta"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-graphite hover:bg-brand-light"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-30 w-48 overflow-hidden rounded-lg border border-line bg-surface shadow-xl">
          <Link
            href="/perfil"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-white/5"
          >
            Mi perfil
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-foreground hover:bg-white/5"
            >
              Panel admin
            </Link>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="block w-full border-t border-line px-4 py-3 text-left text-sm font-semibold text-brand-light hover:bg-white/5"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
