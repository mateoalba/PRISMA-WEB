import type { Metadata } from "next";
import { getDashboardData } from "@/lib/admin/dashboard-actions";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = { title: "Dashboard | Panel admin Prisma" };

export default async function AdminDashboardPage() {
  const data = await getDashboardData();
  return <DashboardClient data={data} adminName={data.adminFirstName} />;
}
