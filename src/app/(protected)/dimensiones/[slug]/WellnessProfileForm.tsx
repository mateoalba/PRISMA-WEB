"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/bienestar.module.css";
import { saveWellnessProfile } from "@/lib/wellbeing/wellness-profile-actions";
import { CONDICIONES, type WellnessProfile } from "@/lib/wellbeing/routine-generator";

export function WellnessProfileForm({ profile }: { profile: WellnessProfile | null }) {
  const router = useRouter();
  const [editando, setEditando] = useState(profile === null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGuardando(true);
    await saveWellnessProfile(new FormData(e.currentTarget));
    setGuardando(false);
    setEditando(false);
    router.refresh();
  }

  if (!editando && profile) {
    const condiciones = profile.conditions.length > 0 ? CONDICIONES.filter((c) => profile.conditions.includes(c.value)).map((c) => c.label).join(", ") : "ninguna registrada";
    return (
      <section className={styles.bloque} aria-labelledby="perfil-titulo">
        <div className={styles.perfilResumen}>
          <div>
            <div className={styles.eyebrow}>Tus datos</div>
            <h2 className={styles.seccion} id="perfil-titulo" style={{ fontSize: 24 }}>
              Con lo que nos contaste
            </h2>
            <p>
              {profile.age ? `${profile.age} años` : "Edad no registrada"} · {profile.weightKg ? `${profile.weightKg} kg` : "Peso no registrado"} · Condiciones: {condiciones}
            </p>
          </div>
          <button type="button" className={`${styles.btn} ${styles.btnS}`} onClick={() => setEditando(true)}>
            Editar mis datos
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.bloque} aria-labelledby="perfil-titulo">
      <div className={styles.perfilCard}>
        <div className={styles.eyebrow}>Personaliza tu bienestar</div>
        <h2 className={styles.seccion} id="perfil-titulo" style={{ fontSize: 28 }}>
          Cuéntanos un poco de ti
        </h2>
        <p>Con tu edad, peso y condiciones de base armamos tu rutina de ejercicio del día y tu meta de agua. Puedes dejarlo en blanco si prefieres no compartirlo.</p>
        <form onSubmit={guardar} className={styles.perfilForm}>
          <div className={styles.perfilCampo}>
            <label htmlFor="wp-edad">Edad</label>
            <input id="wp-edad" name="age" type="number" min={0} max={120} defaultValue={profile?.age ?? ""} placeholder="Ej: 68" />
          </div>
          <div className={styles.perfilCampo}>
            <label htmlFor="wp-peso">Peso (kg)</label>
            <input id="wp-peso" name="weight_kg" type="number" min={0} max={300} step="0.1" defaultValue={profile?.weightKg ?? ""} placeholder="Ej: 70" />
          </div>
          <div className={`${styles.perfilCampo} ${styles.perfilCampoFull}`}>
            <label>Condiciones de base (marca las que apliquen)</label>
            <div className={styles.perfilCondiciones}>
              {CONDICIONES.map((c) => (
                <label key={c.value} className={styles.perfilCondicion}>
                  <input type="checkbox" name="conditions" value={c.value} defaultChecked={profile?.conditions.includes(c.value)} />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.perfilAcciones}>
            <button type="submit" className={`${styles.btn} ${styles.btnP}`} disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar y personalizar"}
            </button>
            {profile && (
              <button type="button" className={`${styles.btn} ${styles.btnS}`} onClick={() => setEditando(false)}>
                Cancelar
              </button>
            )}
          </div>
          <small className={styles.perfilAviso}>Esto no reemplaza el consejo de tu médico. Consulta antes de empezar una rutina nueva, sobre todo si tienes alguna condición de salud.</small>
        </form>
      </div>
    </section>
  );
}
