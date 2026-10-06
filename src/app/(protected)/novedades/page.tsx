import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getDestacados, getCintaAvisos, getMosaico } from "@/lib/novedades/feed-actions";
import { getActiveOfertas } from "@/lib/novedades/ofertas-actions";
import { getLibrosCatalogo } from "@/lib/novedades/libros-actions";
import { getMySubscription } from "@/lib/novedades/subscription-actions";
import { Portada } from "./Portada";
import { CintaAvisos } from "./CintaAvisos";
import { MosaicoNovedades } from "./MosaicoNovedades";
import { OfertasSemana } from "./OfertasSemana";
import { EstanteriaLibros } from "./EstanteriaLibros";
import { AvisameForm } from "./AvisameForm";
import styles from "@/styles/novedades.module.css";

export const metadata: Metadata = { title: "Novedades | Prisma" };

export default async function NovedadesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [destacados, cinta, mosaico, ofertas, libros, subscripcion, profile] = await Promise.all([
    getDestacados(),
    getCintaAvisos(),
    getMosaico(),
    getActiveOfertas(),
    getLibrosCatalogo(),
    getMySubscription(),
    user ? supabase.from("profiles").select("has_membership").eq("id", user.id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const hasMembership = profile.data?.has_membership ?? false;

  return (
    <div className={styles.pagina}>
      <div className={styles.ambiente} aria-hidden="true" />
      <div className={styles.puntos} aria-hidden="true" />
      <div className={styles.contenido}>
        <Portada destacados={destacados} />
        <CintaAvisos avisos={cinta} />
        <MosaicoNovedades piezas={mosaico} />
        <OfertasSemana ofertas={ofertas} />
        <EstanteriaLibros libros={libros} hasMembership={hasMembership} />
        <AvisameForm subscripcion={subscripcion} userEmail={user?.email ?? ""} />
      </div>
    </div>
  );
}
