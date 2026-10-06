import type { Metadata } from "next";
import { getAllIntergenerationalProjects, getIntergenerationalPairs } from "@/lib/admin/intergenerational-admin-actions";
import { EncuentrosClient } from "./EncuentrosClient";

export const metadata: Metadata = { title: "Intergeneracional | Panel admin Prisma" };

export default async function AdminEncuentrosPage() {
  const [projects, pairs] = await Promise.all([getAllIntergenerationalProjects(), getIntergenerationalPairs()]);
  return <EncuentrosClient initialProjects={projects} initialPairs={pairs} />;
}
