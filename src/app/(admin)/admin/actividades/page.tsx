import type { Metadata } from "next";
import { DIMENSIONS } from "@/lib/dimensions";
import { getAllActivitiesAdmin } from "@/lib/admin/interactive-activities-actions";
import { ActividadesClient } from "./ActividadesClient";

export const metadata: Metadata = { title: "Actividades interactivas | Panel admin Prisma" };

export default async function AdminActividadesPage(props: PageProps<"/admin/actividades">) {
  const { slug: slugParam } = await props.searchParams;
  const slug = typeof slugParam === "string" ? slugParam : DIMENSIONS[0].slug;
  const dimension = DIMENSIONS.find((d) => d.slug === slug) ?? DIMENSIONS[0];

  const allActivities = await getAllActivitiesAdmin();

  return <ActividadesClient key={dimension.slug} dimension={dimension} allDimensions={DIMENSIONS} allActivities={allActivities} />;
}
