import type { Metadata } from "next";
import { getAllUsersWithProfiles } from "@/lib/admin/users-actions";
import { UsuariosClient } from "./UsuariosClient";

export const metadata: Metadata = { title: "Usuarios | Panel admin Prisma" };

export default async function AdminUsersPage() {
  const users = await getAllUsersWithProfiles();
  return <UsuariosClient initialUsers={users} />;
}
