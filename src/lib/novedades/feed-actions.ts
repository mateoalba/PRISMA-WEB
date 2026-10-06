"use server";

import { getPublishedNovedades, type Novedad, type NovedadType } from "@/lib/admin/novedades-actions";
import { getActiveOfertas } from "./ofertas-actions";

export type Destacado = {
  id: string;
  tipo: string;
  titulo: string;
  texto: string;
  meta: string[];
  boton: string | null;
  url: string | null;
  imagen: string | null;
};

export type PiezaMosaico = {
  id: string;
  tipo: NovedadType | "dato";
  titulo: string;
  texto: string;
  pie: string;
  tam: "" | "grande" | "ancha" | "alta";
  nuevo: boolean;
  imagen: string | null;
  url: string | null;
  num?: string;
};

const TIPO_DESTACADO_LABEL: Record<NovedadType, string> = {
  curso: "Nuevo curso",
  libro: "Libro del mes",
  producto: "Nuevo producto",
  evento: "Próximo evento",
  taller: "Nuevo taller",
  actividad: "Nueva actividad",
  general: "Novedad",
};

const NOMBRE_TIPO: Record<NovedadType, string> = {
  curso: "Curso",
  libro: "Libro",
  producto: "Producto",
  evento: "Evento",
  taller: "Taller",
  actividad: "Actividad",
  general: "Novedad",
};

function esNuevo(createdAt: string) {
  const dias = (Date.now() - new Date(createdAt).getTime()) / 86400000;
  return dias <= 21;
}

function tileSizeToTam(tileSize: Novedad["tile_size"]): PiezaMosaico["tam"] {
  return tileSize === "normal" ? "" : tileSize;
}

export async function getDestacados(): Promise<Destacado[]> {
  const todas = await getPublishedNovedades();
  const destacadas = todas.filter((n) => n.featured);
  const base = destacadas.length > 0 ? destacadas : todas.slice(0, 4);

  return base.slice(0, 6).map((n) => ({
    id: n.id,
    tipo: TIPO_DESTACADO_LABEL[n.type],
    titulo: n.title,
    texto: n.description,
    meta: n.meta_text
      ? n.meta_text
          .split("·")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    boton: n.link_href ? n.cta_label : null,
    url: n.link_href,
    imagen: n.image_url,
  }));
}

export async function getMosaico(): Promise<PiezaMosaico[]> {
  const todas = await getPublishedNovedades();

  const piezas: PiezaMosaico[] = todas.map((n) => ({
    id: n.id,
    tipo: n.type,
    titulo: n.title,
    texto: n.description,
    pie: n.meta_text ?? "",
    tam: tileSizeToTam(n.tile_size),
    nuevo: esNuevo(n.created_at),
    imagen: n.image_url,
    url: n.link_href,
  }));

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const cursosEsteMes = todas.filter((n) => n.type === "curso" && new Date(n.created_at) >= inicioMes).length;

  if (cursosEsteMes > 0) {
    piezas.splice(3, 0, {
      id: "dato-cursos-mes",
      tipo: "dato",
      titulo: "cursos nuevos este mes",
      texto: "Tecnología, arte, cocina y más.",
      pie: "Ver cursos",
      num: String(cursosEsteMes),
      tam: "",
      nuevo: false,
      imagen: null,
      url: "/dimensiones/educacion-continua",
    });
  }

  return piezas;
}

export type AvisoCinta = { destacado: string; texto: string };

export async function getCintaAvisos(): Promise<AvisoCinta[]> {
  const [novedades, ofertas] = await Promise.all([getPublishedNovedades(), getActiveOfertas()]);

  const avisosNovedades: AvisoCinta[] = novedades.slice(0, 6).map((n) => ({
    destacado: esNuevo(n.created_at) ? "Nuevo" : NOMBRE_TIPO[n.type],
    texto: n.title,
  }));

  const avisosOfertas: AvisoCinta[] = ofertas.slice(0, 3).map((o) => ({
    destacado: `-${Math.round((1 - o.price / o.priceBefore) * 100)}%`,
    texto: o.title,
  }));

  return [...avisosNovedades, ...avisosOfertas];
}
