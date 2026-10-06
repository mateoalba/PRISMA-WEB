import type { Metadata } from "next";
import styles from "@/styles/admin.module.css";
import { DIMENSIONS } from "@/lib/dimensions";
import { getAllDimensionVideos } from "@/lib/admin/dimension-settings-actions";
import { DimensionesClient } from "./DimensionesClient";

export const metadata: Metadata = { title: "Dimensiones | Panel admin Prisma" };

export default async function AdminDimensionsPage() {
  const videos = await getAllDimensionVideos();

  return (
    <div>
      <div className={styles.cab}>
        <div>
          <div className={styles.eyebrow}>Videos</div>
          <h1>Videos por dimensión</h1>
          <p>El video que se muestra incrustado en cada una de las 10 dimensiones de la app.</p>
        </div>
      </div>
      <DimensionesClient dimensiones={DIMENSIONS} videos={videos} />
    </div>
  );
}
