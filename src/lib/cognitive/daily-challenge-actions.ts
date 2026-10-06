"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DAILY_CHALLENGES, type DailyChallenge } from "@/lib/cognitive-content";

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getTodayChallenge(): DailyChallenge {
  const idx = dayOfYear(new Date()) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[idx];
}

export type DailyChallengeState = {
  challenge: DailyChallenge;
  completedToday: boolean;
  week: { label: string; done: boolean; isToday: boolean }[];
  weekProgressPct: number;
};

export async function getDailyChallengeState(): Promise<DailyChallengeState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const challenge = getTodayChallenge();
  const LETRAS = ["L", "M", "M", "J", "V", "S", "D"];

  if (!user) {
    return {
      challenge,
      completedToday: false,
      week: LETRAS.map((l) => ({ label: l, done: false, isToday: false })),
      weekProgressPct: 0,
    };
  }

  const hoy = new Date();
  // lunes de esta semana
  const diaSemana = (hoy.getDay() + 6) % 7; // 0 = lunes
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - diaSemana);

  const dias: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return d;
  });

  const { data } = await supabase
    .from("cognitive_daily_completions")
    .select("completed_date")
    .eq("user_id", user.id)
    .gte("completed_date", toDateKey(dias[0]))
    .lte("completed_date", toDateKey(dias[6]));

  const doneDates = new Set((data ?? []).map((r) => r.completed_date));
  const hoyKey = toDateKey(hoy);

  const week = dias.map((d, i) => ({
    label: LETRAS[i],
    done: doneDates.has(toDateKey(d)),
    isToday: toDateKey(d) === hoyKey,
  }));

  return {
    challenge,
    completedToday: doneDates.has(hoyKey),
    week,
    weekProgressPct: Math.round((week.filter((d) => d.done).length / 7) * 100),
  };
}

export async function completeDailyChallenge() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("cognitive_daily_completions")
    .upsert({ user_id: user.id, completed_date: toDateKey(new Date()) });

  revalidatePath("/dimensiones/estimulacion-cognitiva");
}
