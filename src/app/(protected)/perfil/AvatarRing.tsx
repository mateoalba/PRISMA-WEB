"use client";

import { useActionState, useEffect, useRef } from "react";
import styles from "@/styles/perfil.module.css";
import { uploadAvatar, type AvatarState } from "@/lib/profile/actions";
import { useToast } from "./ToastContext";
import type { DimensionActivity } from "@/lib/profile/stats";

const TONOS = ["#c7d873", "#b3c35a", "#9fae47", "#8a983a", "#7e8c35", "#aebd52", "#8c9a5e", "#85935a", "#a3b07a", "#bccb8a"];

function CamaraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

const initialState: AvatarState = { error: null, url: null };

export function AvatarRing({ activity, initial, avatarUrl }: { activity: DimensionActivity[]; initial: string; avatarUrl: string | null }) {
  const [state, formAction] = useActionState(uploadAvatar, initialState);
  const { notify } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    if (state.url && state.url !== lastUrl.current) {
      lastUrl.current = state.url;
      notify("Foto actualizada");
    }
    if (state.error) {
      notify(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const R = 86;
  const C = 2 * Math.PI * R;
  const n = activity.length;
  const hueco = 6;
  const largo = C / n - hueco;

  return (
    <div className={styles.anillo} aria-label="Anillo de actividad en las 10 dimensiones">
      <svg viewBox="0 0 190 190" aria-hidden="true">
        {activity.map((d, i) => {
          const ini = i * (C / n);
          return (
            <g key={d.slug}>
              <circle className={styles.anilloFondo} cx="95" cy="95" r={R} strokeDasharray={`${largo} ${C - largo}`} strokeDashoffset={-ini} />
              <circle
                className={styles.anilloSeg}
                cx="95"
                cy="95"
                r={R}
                stroke={TONOS[i % TONOS.length]}
                strokeDasharray={`${(largo * d.pct) / 100} ${C}`}
                strokeDashoffset={-ini}
              >
                <title>{`${d.name}: ${d.pct}%`}</title>
              </circle>
            </g>
          );
        })}
      </svg>
      <div className={styles.anilloFoto}>
        {avatarUrl ? <img src={avatarUrl} alt="" /> : initial}
      </div>
      <form ref={formRef} action={formAction}>
        <label className={styles.cambiarFoto} title="Cambiar foto">
          <CamaraIcon />
          <input
            type="file"
            accept="image/*"
            name="avatar"
            className={styles.sr}
            aria-label="Cambiar foto de perfil"
            onChange={() => formRef.current?.requestSubmit()}
          />
        </label>
      </form>
    </div>
  );
}
