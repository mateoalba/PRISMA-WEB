import type { Metadata } from "next";
import { getAllCircles } from "@/lib/admin/circles-actions";
import { CirculosClient } from "./CirculosClient";

export const metadata: Metadata = { title: "Círculos de apoyo | Panel admin Prisma" };

export default async function AdminCirculosPage() {
  const circles = await getAllCircles();
  return <CirculosClient initialCircles={circles} />;
}
