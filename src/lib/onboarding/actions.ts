"use server";

import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(interests: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("profiles")
    .update({ interests, onboarding_completed_at: new Date().toISOString() })
    .eq("id", user.id);
}
