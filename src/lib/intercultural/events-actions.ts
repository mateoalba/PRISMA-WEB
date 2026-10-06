"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Convierte "hora local de una ciudad" (texto tal como se guardó) a un
// instante real (UTC), igual que hacía fechaEnZona() en el prototipo.
// No exportada: un archivo "use server" solo puede exportar funciones
// async, así que esta se queda como ayudante interno del archivo.
function fechaEnZona(localDatetime: string, zona: string): Date {
  const [d, h] = localDatetime.split("T");
  const [Y, M, D] = d.split("-").map(Number);
  const [hh, mm] = h.split(":").map(Number);
  const guess = Date.UTC(Y, M - 1, D, hh, mm);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zona,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(guess));
  const g = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const comoLocal = Date.UTC(+g.year, +g.month - 1, +g.day, Number(g.hour) % 24, +g.minute);
  return new Date(guess - (comoLocal - guess));
}

export type GlobalEvent = {
  id: string;
  title: string;
  description: string;
  city: string;
  timezone: string;
  isFeatured: boolean;
  eventAtIso: string; // instante real (UTC) ya calculado
  reminded: boolean;
};

export async function getGlobalEvents(): Promise<GlobalEvent[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: events }, { data: mine }] = await Promise.all([
    supabase
      .from("global_events")
      .select("id, title, description, city, timezone, local_datetime, is_featured")
      .order("position", { ascending: true }),
    supabase.from("global_event_reminders").select("event_id").eq("user_id", user.id),
  ]);

  if (!events) return [];
  const remindedIds = new Set((mine ?? []).map((m) => m.event_id));

  return events
    .map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      city: e.city,
      timezone: e.timezone,
      isFeatured: e.is_featured,
      eventAtIso: fechaEnZona(e.local_datetime, e.timezone).toISOString(),
      reminded: remindedIds.has(e.id),
    }))
    .sort((a, b) => new Date(a.eventAtIso).getTime() - new Date(b.eventAtIso).getTime());
}

export async function setReminder(eventId: string, on: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  if (on) {
    await supabase.from("global_event_reminders").insert({ event_id: eventId, user_id: user.id });
  } else {
    await supabase.from("global_event_reminders").delete().eq("event_id", eventId).eq("user_id", user.id);
  }
  revalidatePath("/dimensiones/interculturalidad");
}
