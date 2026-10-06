import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { getLibro } from "@/lib/novedades/libros-actions";
import { calcularAcceso } from "@/lib/libros/access";
import { wompiConfig } from "@/lib/membership/wompi";
import { PRECIO_BASE } from "@/lib/membership/pricing";
import styles from "@/styles/libros.module.css";
import { ComprarLibro } from "./ComprarLibro";

export async function generateMetadata({ params }: PageProps<"/libros/[id]">): Promise<Metadata> {
  const { id } = await params;
  const libro = await getLibro(id);
  return { title: libro ? `${libro.title} | Prisma` : "Libro | Prisma" };
}

function dias(n: number) {
  return `${n} ${n === 1 ? "día" : "días"}`;
}

export default async function LibroPage({ params, searchParams }: PageProps<"/libros/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const libro = await getLibro(id);
  if (!libro) notFound();

  const acceso = await calcularAcceso(libro.id);

  let headerUser: { initial: string; isAdmin: boolean } | null = null;
  if (acceso.userId) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: perfil } = await supabase.from("profiles").select("role, full_name").eq("id", acceso.userId).maybeSingle();
    headerUser = {
      initial: (perfil?.full_name?.trim()?.[0] ?? user?.email?.[0] ?? "?").toUpperCase(),
      isAdmin: perfil?.role === "admin",
    };
  }

  const cfg = wompiConfig();
  const precioCop = cfg ? Math.round(libro.price * cfg.copPerUsd) : null;
  const irAqui = `/libros/${libro.id}`;
  const loginHref = `/login?next=${encodeURIComponent(irAqui)}`;
  const denegado = query.acceso === "denegado";

  const compra = <ComprarLibro libroId={libro.id} precio={libro.price} precioCop={precioCop} primario={acceso.estado !== "prueba"} />;
  const miembro = (
    <Link href="/perfil?tab=membresia" className={styles.enlaceMiembro}>
      <b>¿Te gustan varios libros?</b> Hazte miembro desde ${PRECIO_BASE}/mes y descarga <b>todos</b> los libros de la biblioteca.
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={headerUser} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div className={styles.pagina}>
          <Link href="/novedades" className={styles.volver}>
            ← Volver a novedades
          </Link>

          <section className={styles.ficha}>
            <div className={styles.portada}>
              <div className={styles.libro3d}>
                {libro.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- portada en Supabase Storage, tamaño fijo por CSS
                  <img className={styles.tapa} src={libro.imageUrl} alt={`Portada de ${libro.title}`} />
                ) : (
                  <div className={`${styles.tapa} ${styles.tapaVacia}`}>{libro.title}</div>
                )}
              </div>
            </div>

            <div className={styles.info}>
              <span className={styles.eyebrow}>Biblioteca PRISMA</span>
              <h1 className={styles.titulo}>{libro.title}</h1>
              <p className={styles.autor}>Por {libro.author}</p>
              <ul className={styles.datos}>
                <li>{libro.format}</li>
                {libro.totalPages && <li>{libro.totalPages} páginas</li>}
                {libro.hasPdf && <li>Muestra de {libro.previewPages} páginas</li>}
              </ul>

              <div className={styles.panel}>
                {denegado && <p className={styles.aviso}>Todavía no tienes acceso a ese libro. Puedes comprarlo o hacerte miembro.</p>}

                {!libro.hasPdf ? (
                  <>
                    <span className={styles.estado}>Próximamente</span>
                    <p className={styles.panelTexto}>Este libro todavía no está disponible para leer ni descargar. Vuelve pronto.</p>
                  </>
                ) : acceso.estado === "descarga" ? (
                  <>
                    <span className={`${styles.estado} ${styles.estadoOk}`}>{acceso.esMiembro ? "Incluido en tu membresía" : "Es tuyo"}</span>
                    <p className={styles.panelTexto}>
                      {acceso.esMiembro ? "Como miembro puedes descargar este libro y todos los de la biblioteca." : "Compraste este libro: puedes descargarlo cuando quieras."}
                    </p>
                    <div className={styles.acciones}>
                      <a href={`/api/libros/${libro.id}/descargar`} className={`${styles.btn} ${styles.btnP}`}>
                        Descargar el libro (PDF)
                      </a>
                      <Link href={`${irAqui}/leer`} className={`${styles.btn} ${styles.btnG}`}>
                        Leer la muestra en pantalla
                      </Link>
                    </div>
                  </>
                ) : acceso.estado === "prueba" ? (
                  <>
                    <span className={`${styles.estado} ${styles.estadoPrueba}`}>Prueba gratis · te quedan {dias(acceso.diasPrueba)}</span>
                    <p className={styles.panelTexto}>
                      Durante tu prueba puedes <strong>leer una muestra de {libro.previewPages} páginas</strong>. Para descargar el libro completo, cómpralo o hazte miembro.
                    </p>
                    <div className={styles.acciones}>
                      <Link href={`${irAqui}/leer`} className={`${styles.btn} ${styles.btnP}`}>
                        Leer la muestra
                      </Link>
                      {compra}
                      {miembro}
                    </div>
                  </>
                ) : acceso.estado === "bloqueado" ? (
                  <>
                    <span className={styles.estado}>{acceso.tuvoPrueba ? "Tu prueba terminó" : "Solo para miembros o compradores"}</span>
                    <p className={styles.panelTexto}>
                      {acceso.tuvoPrueba ? "Tus 15 días gratis ya pasaron. " : ""}
                      Compra solo este libro o hazte miembro para descargarlo.
                    </p>
                    <div className={styles.acciones}>
                      {compra}
                      {miembro}
                    </div>
                  </>
                ) : (
                  <>
                    <span className={`${styles.estado} ${styles.estadoPrueba}`}>15 días gratis</span>
                    <p className={styles.panelTexto}>
                      Crea tu cuenta y <strong>lee una muestra de este libro durante 15 días</strong>, sin pagar nada. Después puedes comprarlo solo a él (${libro.price.toFixed(2)}) o hacerte miembro para tener todos.
                    </p>
                    <div className={styles.acciones}>
                      <Link href="/registro" className={`${styles.btn} ${styles.btnP}`}>
                        Empezar mis 15 días gratis
                      </Link>
                      <Link href={loginHref} className={`${styles.btn} ${styles.btnG}`}>
                        Ya tengo cuenta
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
