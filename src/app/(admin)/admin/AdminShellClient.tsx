"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import styles from "@/styles/admin.module.css";
import { NAV_GROUPS, NAV_FLAT } from "./AdminNavConfig";
import { IcoVolver, IcoSalir, IcoMenu } from "./AdminNavIcons";
import { useAdminTheme } from "./AdminThemeContext";
import { signOut } from "@/lib/auth/actions";
import type { AdminNavCounts } from "@/lib/admin/nav-counts";
import { TopSearch } from "./TopSearch";

export function AdminShellClient({
  counts,
  adminName,
  adminEmail,
  children,
}: {
  counts: AdminNavCounts;
  adminName: string;
  adminEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme } = useAdminTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [ind, setInd] = useState({ top: 0, height: 0 });

  const activo = useMemo(() => {
    const exact = NAV_FLAT.find((i) => i.href === pathname);
    if (exact) return exact;
    return NAV_FLAT.filter((i) => i.href !== "/admin" && pathname.startsWith(i.href)).sort((a, b) => b.href.length - a.href.length)[0];
  }, [pathname]);

  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLAnchorElement>(`a[href="${activo?.href ?? "/admin"}"]`);
    if (el) setInd({ top: el.offsetTop, height: el.offsetHeight });
  }, [activo]);

  const iniciales = (adminName || adminEmail || "?").charAt(0).toUpperCase();

  return (
    <div className={styles.admin} data-theme={theme}>
      {mobileOpen && <div className={styles.veloAbierto} onClick={() => setMobileOpen(false)} aria-hidden="true" />}
      <div className={styles.app}>
        <aside className={`${styles.side} ${mobileOpen ? styles.sideOpen : ""}`}>
          <div className={styles.sideMarca}>
            <Image src="/prisma-logo.png" alt="PRISMA by PENSER" height={30} width={100} className={styles.logoOscuro} style={{ height: 30, width: "auto" }} />
            <Image src="/prisma-logo-light.png" alt="PRISMA by PENSER" height={30} width={100} className={styles.logoClaro} style={{ height: 30, width: "auto" }} />
            <span className={styles.sideTag}>Admin</span>
          </div>
          <nav ref={navRef} className={styles.nav}>
            <span className={styles.navInd} style={{ transform: `translateY(${ind.top}px)`, height: ind.height }} aria-hidden="true" />
            {NAV_GROUPS.map((g) => (
              <div key={g.titulo}>
                <div className={styles.navGrupo}>{g.titulo}</div>
                {g.items.map((item) => {
                  const on = item === activo;
                  const n = item.count ? item.count(counts) : undefined;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`${styles.navLink} ${on ? styles.navLinkOn : ""}`}
                      aria-current={on ? "page" : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.Icon />
                      <span>{item.label}</span>
                      {n != null && (
                        <span className={`${styles.navN} ${item.alerta && n > 0 ? styles.navNAlerta : ""}`} title={item.alerta && n > 0 ? `${n} sin video` : undefined}>
                          {n}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className={styles.sidePie}>
            <Link href="/dashboard" className={styles.sidePieLink}>
              <IcoVolver />
              Volver a la app
            </Link>
            <div className={styles.sideYo}>
              <span className={styles.avatar}>{iniciales}</span>
              <div style={{ minWidth: 0, flex: "1 1 0%" }}>
                <b style={{ display: "block", overflowWrap: "break-word" }}>{adminName || adminEmail}</b>
                <span>Administrador</span>
              </div>
              <form action={signOut} style={{ flex: "none" }}>
                <button type="submit" className={`${styles.btnIco} ${styles.sideSalir}`} title="Cerrar sesión">
                  <IcoSalir />
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className={styles.main}>
          <div className={styles.top}>
            <button type="button" className={`${styles.btnIco} ${styles.topMenu}`} onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
              <IcoMenu />
            </button>
            <div className={styles.miga}>
              Panel admin <span>/</span> <b>{activo?.label ?? "Dashboard"}</b>
            </div>
            <TopSearch />
          </div>
          <main className={styles.vista}>{children}</main>
        </div>
      </div>
      <div id="admin-portal-root" className={styles.adminPortalRoot} />
    </div>
  );
}
