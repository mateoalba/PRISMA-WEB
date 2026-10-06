"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MentorTopic = { topic: string; pendingCount: number };

export type MentorshipRequestItem = {
  id: string;
  requesterName: string;
  topic: string;
  message: string;
  initial: string;
};

export type MentorState = {
  topics: MentorTopic[];
  pending: MentorshipRequestItem[];
  acceptedNames: string[];
};

export async function getMentorState(): Promise<MentorState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const vacio: MentorState = { topics: [], pending: [], acceptedNames: [] };
  if (!user) return vacio;

  const [{ data: topics }, { data: pendingRows }, { data: acceptedRows }] = await Promise.all([
    supabase.from("mentor_topics").select("topic").eq("user_id", user.id).order("created_at", { ascending: true }),
    supabase
      .from("mentorship_requests")
      .select("id, topic, message, requester_id")
      .eq("mentor_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase.from("mentorship_requests").select("requester_id").eq("mentor_id", user.id).eq("status", "accepted"),
  ]);

  const requesterIds = [...new Set([...(pendingRows ?? []).map((r) => r.requester_id), ...(acceptedRows ?? []).map((r) => r.requester_id)])];

  let profileMap = new Map<string, string>();
  if (requesterIds.length > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", requesterIds);
    profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name || "Alguien de la comunidad"]));
  }

  const pendingCountByTopic = new Map<string, number>();
  for (const r of pendingRows ?? []) {
    pendingCountByTopic.set(r.topic, (pendingCountByTopic.get(r.topic) ?? 0) + 1);
  }

  return {
    topics: (topics ?? []).map((t) => ({ topic: t.topic, pendingCount: pendingCountByTopic.get(t.topic) ?? 0 })),
    pending: (pendingRows ?? []).map((r) => {
      const nombre = profileMap.get(r.requester_id) ?? "Alguien de la comunidad";
      return {
        id: r.id,
        requesterName: nombre,
        topic: r.topic,
        message: r.message,
        initial: nombre.charAt(0).toUpperCase(),
      };
    }),
    acceptedNames: (acceptedRows ?? []).map((r) => (profileMap.get(r.requester_id) ?? "Alguien").split(" ")[0]),
  };
}

export async function addMentorTopic(topic: string) {
  const trimmed = topic.trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("mentor_topics").upsert({ user_id: user.id, topic: trimmed }, { onConflict: "user_id,topic", ignoreDuplicates: true });
  revalidatePath("/dimensiones/participacion-activa");
}

export async function removeMentorTopic(topic: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("mentor_topics").delete().eq("user_id", user.id).eq("topic", topic);
  revalidatePath("/dimensiones/participacion-activa");
}

export async function respondToMentorRequest(requestId: string, accept: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("mentorship_requests")
    .update({ status: accept ? "accepted" : "declined" })
    .eq("id", requestId)
    .eq("mentor_id", user.id);

  revalidatePath("/dimensiones/participacion-activa");
}
