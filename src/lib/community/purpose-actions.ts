"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PURPOSE_IDEAS } from "@/lib/purpose-content";

export type PurposeIdeaState = {
  slug: string;
  signupCount: number;
  signedUp: boolean;
};

export async function getPurposeIdeaStates(): Promise<PurposeIdeaState[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return PURPOSE_IDEAS.map((i) => ({ slug: i.slug, signupCount: 0, signedUp: false }));
  }

  const [{ data: counts }, { data: mine }] = await Promise.all([
    supabase.rpc("purpose_activity_signup_counts"),
    supabase.from("purpose_activity_signups").select("idea_slug").eq("user_id", user.id),
  ]);

  const countBySlug = new Map<string, number>(
    (counts ?? []).map((c: { idea_slug: string; signup_count: number }) => [c.idea_slug, c.signup_count])
  );
  const mineSlugs = new Set((mine ?? []).map((m) => m.idea_slug));

  return PURPOSE_IDEAS.map((i) => ({
    slug: i.slug,
    signupCount: countBySlug.get(i.slug) ?? 0,
    signedUp: mineSlugs.has(i.slug),
  }));
}

export async function togglePurposeSignup(slug: string, signUp: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (signUp) {
    await supabase.from("purpose_activity_signups").insert({ idea_slug: slug, user_id: user.id });
  } else {
    await supabase.from("purpose_activity_signups").delete().eq("idea_slug", slug).eq("user_id", user.id);
  }

  revalidatePath("/dimensiones/tiempo-libre");
}
