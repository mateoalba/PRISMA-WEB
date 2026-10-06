import type { AdminNavCounts } from "@/lib/admin/nav-counts";
import {
  IcoDash,
  IcoContenido,
  IcoDims,
  IcoPrograma,
  IcoActividades,
  IcoApoyo,
  IcoInteres,
  IcoEncuentros,
  IcoEventos,
  IcoNovedades,
  IcoTienda,
  IcoUsuarios,
} from "./AdminNavIcons";

export type NavItem = {
  href: string;
  label: string;
  Icon: () => React.JSX.Element;
  count?: (n: AdminNavCounts) => number;
  alerta?: boolean;
};

export type NavGroup = { titulo: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    titulo: "General",
    items: [
      { href: "/admin", label: "Dashboard", Icon: IcoDash },
      { href: "/admin/contenido", label: "Contenido", Icon: IcoContenido, count: (n) => n.contenido },
    ],
  },
  {
    titulo: "Dimensiones",
    items: [
      { href: "/admin/dimensiones", label: "Videos", Icon: IcoDims, count: (n) => n.dimensionesSinVideo, alerta: true },
      { href: "/admin/programa", label: "Programa", Icon: IcoPrograma, count: (n) => n.programa },
      { href: "/admin/actividades", label: "Actividades interactivas", Icon: IcoActividades, count: (n) => n.actividades },
    ],
  },
  {
    titulo: "Comunidad",
    items: [
      { href: "/admin/circulos", label: "Círculos de apoyo", Icon: IcoApoyo, count: (n) => n.apoyo },
      { href: "/admin/circulos-interes", label: "Círculos de interés", Icon: IcoInteres, count: (n) => n.interes },
      { href: "/admin/encuentros", label: "Intergeneracional", Icon: IcoEncuentros, count: (n) => n.encuentros },
      { href: "/admin/eventos", label: "Eventos", Icon: IcoEventos, count: (n) => n.eventosProximos },
    ],
  },
  {
    titulo: "Publicaciones",
    items: [
      { href: "/admin/novedades", label: "Novedades", Icon: IcoNovedades, count: (n) => n.novedades },
      { href: "/admin/tienda", label: "Tienda", Icon: IcoTienda, count: (n) => n.tienda },
    ],
  },
  {
    titulo: "Personas",
    items: [{ href: "/admin/usuarios", label: "Usuarios", Icon: IcoUsuarios, count: (n) => n.usuarios }],
  },
];

export const NAV_FLAT: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
