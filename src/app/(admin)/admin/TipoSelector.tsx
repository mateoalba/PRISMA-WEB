"use client";

import styles from "@/styles/admin.module.css";
import { PROGRAM_ITEM_TYPES, type ProgramItemType } from "@/lib/admin/dimension-program-types";

const ICON_PATHS: Record<ProgramItemType, React.ReactNode> = {
  guia: (
    <>
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" />
    </>
  ),
  pdf: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6M8 14h8M8 17h5" />
    </>
  ),
  audio: (
    <>
      <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
      <rect x="3" y="14" width="4" height="7" rx="2" />
      <rect x="17" y="14" width="4" height="7" rx="2" />
    </>
  ),
  video: (
    <>
      <rect x="2" y="5" width="15" height="14" rx="3" />
      <path d="M17 10l5-3v10l-5-3" />
    </>
  ),
  curso: (
    <>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11v5c3 2 9 2 12 0v-5" />
    </>
  ),
  taller: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z" />,
  reto: <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />,
  encuentro: (
    <>
      <circle cx="8" cy="9" r="3" />
      <circle cx="16" cy="9" r="3" />
      <path d="M2 20c0-3 2.7-5 6-5 1.5 0 2.9.4 4 1.2 1.1-.8 2.5-1.2 4-1.2 3.3 0 6 2 6 5" />
    </>
  ),
};

const SHORT_LABEL: Record<ProgramItemType, string> = {
  guia: "Práctica",
  pdf: "PDF",
  audio: "Audio",
  video: "Video",
  curso: "Curso",
  taller: "Taller",
  reto: "Reto",
  encuentro: "Encuentro",
};

export function TipoSelector({ value, onChange, name }: { value: ProgramItemType; onChange: (t: ProgramItemType) => void; name: string }) {
  return (
    <div className={styles.tipoSel}>
      {PROGRAM_ITEM_TYPES.map((t) => (
        <label key={t.value}>
          <input type="radio" name={name} checked={value === t.value} onChange={() => onChange(t.value)} />
          <span>
            <svg className={styles.tipoSelIco} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {ICON_PATHS[t.value]}
            </svg>
            {SHORT_LABEL[t.value]}
          </span>
        </label>
      ))}
    </div>
  );
}
