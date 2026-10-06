"use client";

import { useState } from "react";
import styles from "@/styles/dimension-page.module.css";
import { saveActivityResponse } from "@/lib/interactive-activities/actions";
import type { ChecklistConfig, ChecklistResponseData } from "@/lib/interactive-activities/types";

export function ChecklistActivity({
  activityId,
  dimensionSlug,
  config,
  initialResponse,
}: {
  activityId: string;
  dimensionSlug: string;
  config: ChecklistConfig;
  initialResponse: ChecklistResponseData | null;
}) {
  const [checked, setChecked] = useState<boolean[]>(initialResponse?.checked ?? config.items.map(() => false));

  function alternar(i: number) {
    const next = checked.map((c, idx) => (idx === i ? !c : c));
    setChecked(next);
    saveActivityResponse(activityId, dimensionSlug, { checked: next });
  }

  return (
    <ul className={styles.checklist}>
      {config.items.map((item, i) => (
        <li key={i}>
          <label className={styles.checklistItem}>
            <input type="checkbox" checked={checked[i]} onChange={() => alternar(i)} />
            <span>{item}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
