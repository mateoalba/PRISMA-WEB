import type { Metadata } from "next";
import { DIMENSIONS } from "@/lib/dimensions";
import { getProgramItems, getAllProgramItems } from "@/lib/admin/dimension-program-actions";
import type { ProgramCategory } from "@/lib/admin/dimension-program-types";
import { ProgramaClient } from "./ProgramaClient";

export const metadata: Metadata = { title: "Programa | Panel admin Prisma" };

const SECCIONES: ProgramCategory[] = ["entrenamiento", "materiales", "formacion", "actividades"];

export default async function AdminProgramPage(props: PageProps<"/admin/programa">) {
  const { slug: slugParam, tab: tabParam } = await props.searchParams;
  const slug = typeof slugParam === "string" ? slugParam : DIMENSIONS[0].slug;
  const dimension = DIMENSIONS.find((d) => d.slug === slug) ?? DIMENSIONS[0];
  const initialTab = SECCIONES.includes(tabParam as ProgramCategory) ? (tabParam as ProgramCategory) : "entrenamiento";

  const [program, allItems] = await Promise.all([getProgramItems(dimension.slug), getAllProgramItems()]);

  const mapa: Record<string, Record<ProgramCategory, number>> = {};
  for (const d of DIMENSIONS) {
    mapa[d.slug] = { entrenamiento: 0, materiales: 0, formacion: 0, actividades: 0 };
  }
  for (const item of allItems) {
    if (mapa[item.slug]) mapa[item.slug][item.category]++;
  }

  return <ProgramaClient key={`${dimension.slug}-${initialTab}`} dimension={dimension} allDimensions={DIMENSIONS} initialProgram={program} initialTab={initialTab} mapa={mapa} />;
}
