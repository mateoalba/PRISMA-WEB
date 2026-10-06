"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = {
  error: string | null;
  success: boolean;
};

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const emergencyContactName = String(formData.get("emergencyContactName") ?? "").trim();
  const emergencyContactPhone = String(formData.get("emergencyContactPhone") ?? "").trim();

  if (!fullName) {
    return { error: "El nombre no puede estar vacío.", success: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión no válida.", success: false };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      last_name: lastName || null,
      phone: phone || null,
      city: city || null,
      emergency_contact_name: emergencyContactName || null,
      emergency_contact_phone: emergencyContactPhone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: "No se pudo guardar el cambio.", success: false };
  }

  // El nombre en los metadatos de Auth también se actualiza, para que
  // quede consistente si algo lo lee directamente desde ahí (p. ej. la app).
  await supabase.auth.updateUser({ data: { full_name: fullName } });

  // Cambiar el correo dispara el flujo real de confirmación de Supabase
  // Auth (llega un enlace al correo nuevo); el cambio no es inmediato.
  if (email && email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({ email });
    if (emailError) {
      return { error: "No se pudo iniciar el cambio de correo.", success: false };
    }
  }

  revalidatePath("/perfil");
  return { error: null, success: true };
}

export type AvatarState = { error: string | null; url: string | null };

export async function uploadAvatar(_prevState: AvatarState, formData: FormData): Promise<AvatarState> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Elige una imagen.", url: null };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "El archivo debe ser una imagen.", url: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesión no válida.", url: null };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (uploadError) {
    return { error: "No se pudo subir la foto.", url: null };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  await supabase.from("profiles").update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq("id", user.id);

  revalidatePath("/perfil");
  return { error: null, url: publicUrl };
}
