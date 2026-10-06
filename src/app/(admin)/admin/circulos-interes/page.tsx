import type { Metadata } from "next";
import { getAllInterestCircles } from "@/lib/admin/interest-circles-actions";
import { InteresClient } from "./InteresClient";

export const metadata: Metadata = { title: "Círculos de interés | Panel admin Prisma" };

export default async function AdminInteresPage() {
  const circles = await getAllInterestCircles();
  return <InteresClient initialCircles={circles} />;
}
