"use server";

import { createClient } from "@/lib/supabase/server";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function sendSupportMessage(
  history: ChatMessage[]
): Promise<{ reply: string; configured: boolean }> {
  const supabase = await createClient();

  const { data, error } = await supabase.functions.invoke("support-chat", {
    body: { history },
  });

  if (error || !data) {
    return {
      configured: true,
      reply: "No pude responder en este momento. Intenta de nuevo en un momento.",
    };
  }

  return { configured: data.configured ?? true, reply: data.reply };
}
