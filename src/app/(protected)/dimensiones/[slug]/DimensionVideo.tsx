"use client";

import { useState } from "react";
import { getYoutubeVideoId } from "@/lib/youtube";
import styles from "@/styles/dimension-page.module.css";

export function DimensionVideo({
  youtubeUrl,
  title,
  learn,
}: {
  youtubeUrl: string | null;
  title: string;
  learn: string[];
}) {
  const videoId = youtubeUrl ? getYoutubeVideoId(youtubeUrl) : null;
  const [playing, setPlaying] = useState(false);

  return (
    <section className={styles.bloque} id="video">
      <div className={styles.seccionCab}>
        <div>
          <div className={styles.eyebrow}>Para empezar</div>
          <h2 className={`${styles.seccionTitulo}`}>
            Mira el video de la <span className={styles.enfasis}>dimensión</span>
          </h2>
        </div>
      </div>
      <div className={styles.videoGrid}>
        <div className={styles.video}>
          {videoId ? (
            playing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&cc_load_policy=1&hl=es`}
                title={`Video: ${title}`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                className={styles.videoFachada}
                onClick={() => setPlaying(true)}
                aria-label={`Reproducir video: ${title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} alt="" />
                <span className={styles.videoPlay}>
                  <PlayIcon size={30} color="#181712" />
                </span>
                <span className={styles.videoRotulo}>
                  <span>
                    <b>{title}</b>
                  </span>
                </span>
              </button>
            )
          ) : (
            <div className={styles.ph} role="img" aria-label="Espacio para el video de esta dimensión">
              <PlayIcon size={36} color="#e5ecb8" />
              <span>El video se agrega desde el panel de administración</span>
            </div>
          )}
        </div>
        {learn.length > 0 && (
          <aside className={styles.aprende}>
            <h3>Lo que aprenderás</h3>
            <ul>
              {learn.map((item) => (
                <li key={item}>
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </section>
  );
}

function PlayIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 5l11 7-11 7z" fill={color} />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#c7d873"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: 3 }}
    >
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}
