"use server";

import { createClient } from "@/lib/supabase/server";

export type IntergenerationalProject = {
  id: string;
  title: string;
  description: string;
  partnerName: string;
};

export async function getIntergenerationalData(): Promise<{
  pairs: number | null;
  projects: IntergenerationalProject[];
}> {
  const supabase = await createClient();

  const [{ data: settings }, { data: projects }] = await Promise.all([
    supabase.from("dimension_settings").select("intergenerational_pairs").eq("slug", "conexion-social").maybeSingle(),
    supabase
      .from("intergenerational_projects")
      .select("id, title, description, partner_name")
      .order("position", { ascending: true }),
  ]);

  return {
    pairs: settings?.intergenerational_pairs ?? null,
    projects: (projects ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      partnerName: p.partner_name,
    })),
  };
}
