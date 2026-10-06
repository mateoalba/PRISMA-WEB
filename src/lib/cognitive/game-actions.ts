"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getBestScore(game: string = "gemas"): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from("cognitive_game_scores")
    .select("best_score")
    .eq("user_id", user.id)
    .eq("game", game)
    .maybeSingle();

  return data?.best_score ?? 0;
}

export async function saveBestScore(score: number, game: string = "gemas") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("cognitive_game_scores")
    .select("best_score")
    .eq("user_id", user.id)
    .eq("game", game)
    .maybeSingle();

  if (existing && existing.best_score >= score) return;

  await supabase
    .from("cognitive_game_scores")
    .upsert({ user_id: user.id, game, best_score: score, updated_at: new Date().toISOString() });

  revalidatePath("/dimensiones/estimulacion-cognitiva");
}
