import { requireAdmin } from "@/lib/admin/guard";
import { getAdminNavCounts } from "@/lib/admin/nav-counts";
import { AdminThemeProvider } from "./AdminThemeContext";
import { AdminUiProvider } from "./AdminUiContext";
import { AdminShellClient } from "./AdminShellClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const [counts, { data: profile }] = await Promise.all([
    getAdminNavCounts(),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  return (
    <AdminThemeProvider>
      <AdminUiProvider>
        <AdminShellClient counts={counts} adminName={profile?.full_name ?? ""} adminEmail={user.email ?? ""}>
          {children}
        </AdminShellClient>
      </AdminUiProvider>
    </AdminThemeProvider>
  );
}
