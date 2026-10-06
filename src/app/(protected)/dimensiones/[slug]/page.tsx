import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DIMENSIONS, getDimension } from "@/lib/dimensions";
import { DIMENSION_FEATURES } from "@/lib/dimension-features";
import {
  DIMENSION_LISTS,
  DIMENSION_LEARN,
  DIMENSION_ROUTES,
  DIMENSION_COMPANION,
} from "@/lib/dimension-content";
import { getTodayHydration, getHydrationHistory } from "@/lib/wellbeing/actions";
import { getExerciseSessionsThisWeek, getWeekSemana } from "@/lib/wellbeing/exercise-actions";
import { getWellnessProfile } from "@/lib/wellbeing/wellness-profile-actions";
import { generatePersonalizedRoutine, computeHydrationGoal } from "@/lib/wellbeing/routine-generator";
import { getSupportCircles } from "@/lib/wellbeing/circles-actions";
import { getInterestCircles } from "@/lib/community/circles-actions";
import { getUpcomingEvents } from "@/lib/community/events-actions";
import { getIntergenerationalData } from "@/lib/community/intergenerational-actions";
import { getPurposeIdeaStates } from "@/lib/community/purpose-actions";
import { PURPOSE_IDEAS } from "@/lib/purpose-content";
import { getBestScore } from "@/lib/cognitive/game-actions";
import { getDailyChallengeState } from "@/lib/cognitive/daily-challenge-actions";
import { getDuoQueueCount } from "@/lib/cognitive/duo-actions";
import { getCategoryLevels } from "@/lib/cognitive/categories-actions";
import { getClassroomState, getMicrocursos, getMyCertificates } from "@/lib/learning/courses-actions";
import { getCulturalConnections } from "@/lib/intercultural/connections-actions";
import { getGlobalEvents } from "@/lib/intercultural/events-actions";
import { getRoleLadder } from "@/lib/participation/roles-actions";
import { getVolunteerOpportunities } from "@/lib/participation/volunteer-actions";
import { getMentorState } from "@/lib/participation/mentorship-actions";
import { getImpactStats } from "@/lib/participation/impact-actions";
import { getDimensionVideo } from "@/lib/admin/dimension-settings-actions";
import { getProgramItems } from "@/lib/admin/dimension-program-actions";
import { getActivitiesForDimension } from "@/lib/interactive-activities/actions";
import { getActivityProgress } from "@/lib/interactive-activities/progress-actions";
import { HydrationPrism } from "./HydrationPrism";
import { LowImpactRoutines } from "./LowImpactRoutines";
import { SaludMentalActividadesInteractivas } from "./SaludMentalActividadesInteractivas";
import { SupportChat } from "./SupportChat";
import { CirculosApoyo } from "./CirculosApoyo";
import { InterestCircles } from "./InterestCircles";
import { IntergenerationalMeetups } from "./IntergenerationalMeetups";
import { UpcomingEvents } from "./UpcomingEvents";
import { PurposeIdeaDeck } from "./PurposeIdeaDeck";
import { FreeTimeGenerator } from "./FreeTimeGenerator";
import { GemSequenceGame } from "./GemSequenceGame";
import { DailyChallenge } from "./DailyChallenge";
import { DuoMode } from "./DuoMode";
import { CognitiveCategories } from "./CognitiveCategories";
import { MyClassroom } from "./MyClassroom";
import { Microcursos } from "./Microcursos";
import { MyCertificates } from "./MyCertificates";
import { GreetingsRibbon } from "./GreetingsRibbon";
import { CulturalConnections } from "./CulturalConnections";
import { GlobalEvents } from "./GlobalEvents";
import { ScamSimulator } from "./ScamSimulator";
import { ScamWarningSigns } from "./ScamWarningSigns";
import { SupportBanner } from "./SupportBanner";
import { RoleLadder } from "./RoleLadder";
import { VolunteerOpportunities } from "./VolunteerOpportunities";
import { MentorInbox } from "./MentorInbox";
import { ImpactStats } from "./ImpactStats";
import { WellnessProfileForm } from "./WellnessProfileForm";
import { ListSection } from "./ListSection";
import { DimensionHeroGallery } from "./DimensionHeroGallery";
import { DimensionVideo } from "./DimensionVideo";
import { ProgramTabs } from "./ProgramTabs";
import { ActividadesInteractivas } from "./ActividadesInteractivas";
import { DigitalActividadesInteractivas } from "./DigitalActividadesInteractivas";
import { ConexionSocialActividadesInteractivas } from "./ConexionSocialActividadesInteractivas";
import { TiempoLibreActividadesInteractivas } from "./TiempoLibreActividadesInteractivas";
import { EstimulacionCognitivaActividadesInteractivas } from "./EstimulacionCognitivaActividadesInteractivas";
import { EducacionContinuaActividadesInteractivas } from "./EducacionContinuaActividadesInteractivas";
import { InterculturalidadActividadesInteractivas } from "./InterculturalidadActividadesInteractivas";
import { BienestarFisicoActividadesInteractivas } from "./BienestarFisicoActividadesInteractivas";
import { SeguridadDigitalActividadesInteractivas } from "./SeguridadDigitalActividadesInteractivas";
import { ParticipacionActivaActividadesInteractivas } from "./ParticipacionActivaActividadesInteractivas";
import { LearningRoutes } from "./LearningRoutes";
import { DigitalCompanion } from "./DigitalCompanion";
import styles from "@/styles/dimension-page.module.css";
import cogStyles from "@/styles/estimulacion-cognitiva.module.css";

export async function generateMetadata(
  props: PageProps<"/dimensiones/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const dimension = getDimension(slug);
  return { title: dimension ? `${dimension.title} | Prisma` : "Prisma" };
}

// "Inclusión digital" -> { nombre: "Inclusión", enfasis: "digital" }
function splitTitle(title: string) {
  const words = title.trim().split(" ");
  if (words.length < 2) return { nombre: title, enfasis: "" };
  return { nombre: words.slice(0, -1).join(" "), enfasis: words[words.length - 1] };
}

const FEATURE_TITLES_EN_SECCION_PROPIA = new Set(["Rutas de aprendizaje", "Tu compañero digital"]);

// El tema de los cursos (salón de clases, microcursos, certificados) se
// oculta por el momento a pedido del negocio. El resto de la dimensión
// (video, programa, actividades) sigue habilitado. Volver a poner en true
// cuando se retome.
const CURSOS_HABILITADOS = false;

// La sección "Programa de la dimensión" (Entrenamiento/Materiales/
// Formación/Actividades) se oculta por el momento hasta tener contenido
// real listo en todas las dimensiones. Las actividades interactivas se
// quedan visibles. Volver a poner en true cuando se retome.
const PROGRAMA_HABILITADO = false;

export default async function DimensionPage(props: PageProps<"/dimensiones/[slug]">) {
  const { slug } = await props.params;
  const dimension = getDimension(slug);
  if (!dimension) notFound();

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("content_items")
    .select("id, title, description")
    .eq("category", dimension.slug)
    .eq("published", true)
    .order("created_at", { ascending: false });

  const features = (DIMENSION_FEATURES[dimension.slug] ?? []).filter(
    (f) => !FEATURE_TITLES_EN_SECCION_PROPIA.has(f.title)
  );
  const list = DIMENSION_LISTS[dimension.slug];
  const learn = DIMENSION_LEARN[dimension.slug] ?? [];
  const routes = DIMENSION_ROUTES[dimension.slug];
  const companion = DIMENSION_COMPANION[dimension.slug];
  const program = await getProgramItems(dimension.slug);
  const youtubeUrl = await getDimensionVideo(dimension.slug);

  const esDigital = dimension.slug === "digital";
  const esSaludMental = dimension.slug === "salud-mental";
  const esConexionSocial = dimension.slug === "conexion-social";
  const esTiempoLibre = dimension.slug === "tiempo-libre";
  const esEstCognitivaBespoke = dimension.slug === "estimulacion-cognitiva";
  const esEduContinuaBespoke = dimension.slug === "educacion-continua";
  const esInterculturalidadBespoke = dimension.slug === "interculturalidad";
  const esBienestarFisicoBespoke = dimension.slug === "bienestar-fisico";
  const esSeguridadDigitalBespoke = dimension.slug === "seguridad-digital";
  const esParticipacionActiva = dimension.slug === "participacion-activa";
  const activities =
    esDigital ||
    esSaludMental ||
    esConexionSocial ||
    esTiempoLibre ||
    esEstCognitivaBespoke ||
    esEduContinuaBespoke ||
    esInterculturalidadBespoke ||
    esBienestarFisicoBespoke ||
    esSeguridadDigitalBespoke ||
    esParticipacionActiva
      ? []
      : await getActivitiesForDimension(dimension.slug);
  const digitalPasosProgreso = esDigital ? await getActivityProgress<{ hechos: boolean[] }>("digital", "pasos-celular") : null;
  const digitalQuizProgreso = esDigital ? await getActivityProgress<{ resp: (number | null)[] }>("digital", "quiz-memoria") : null;
  const reflexionProgreso = esSaludMental
    ? await getActivityProgress<{ moments: { fecha: string; animo: "tormenta" | "nublado" | "parcial" | "sol" | "arcoiris"; pregunta: string; texto: string }[] }>("salud-mental", "reflexion")
    : null;
  const chequeoProgreso = esSaludMental ? await getActivityProgress<{ byDate: Record<string, number> }>("salud-mental", "chequeo") : null;
  const caminoProgreso = esConexionSocial ? await getActivityProgress<{ hechas: boolean[]; evento: number | null }>("conexion-social", "camino") : null;
  const quizCartasProgreso = esTiempoLibre ? await getActivityProgress<{ resp: (number | null)[] }>("tiempo-libre", "quiz-cartas") : null;
  const armaTardeProgreso = esTiempoLibre
    ? await getActivityProgress<{
        actId: string | null;
        dia: number | null;
        hora: number | null;
        dur: number | null;
        mats: number[];
        comp: "solo" | "con" | null;
        quien: string;
        sentir: number | null;
        pendiente: boolean;
      }>("tiempo-libre", "arma-tarde")
    : null;
  const pasaporteProgreso = esInterculturalidadBespoke ? await getActivityProgress<{ resp: (number | null)[] }>("interculturalidad", "pasaporte-quiz") : null;
  const brujulaProgreso = esInterculturalidadBespoke
    ? await getActivityProgress<{ region: string | null; lugar: string; interes: string | null; porque: string }>("interculturalidad", "brujula-tradicion")
    : null;
  const rutinaGuiadaProgreso = esBienestarFisicoBespoke ? await getActivityProgress<{ completados: string[] }>("bienestar-fisico", "rutina-guiada") : null;
  const mitoVerdadProgreso = esBienestarFisicoBespoke
    ? await getActivityProgress<{ i: number; resp: (boolean | undefined)[] }>("bienestar-fisico", "mito-o-verdad")
    : null;
  const chatSospechosoProgreso = esSeguridadDigitalBespoke
    ? await getActivityProgress<{ i: number; resp: (number | undefined)[] }>("seguridad-digital", "chat-sospechoso")
    : null;
  const arbolSaberProgreso = esParticipacionActiva
    ? await getActivityProgress<{ saberes: string[]; publicos: string[]; idea: string; guardado: boolean }>("participacion-activa", "arbol-saber")
    : null;
  const puenteMentorProgreso = esParticipacionActiva
    ? await getActivityProgress<{
        tema: string | null;
        ideas: [string, string, string];
        dia: number | null;
        modo: "Presencial" | "Virtual" | null;
        como: number | null;
        despues: boolean;
      }>("participacion-activa", "puente-mentor")
    : null;

  const esBienestarFisico = dimension.slug === "bienestar-fisico";
  const wellnessProfile = esBienestarFisico ? await getWellnessProfile() : null;

  const esEstimulacionCognitiva = dimension.slug === "estimulacion-cognitiva";
  const cognitiveBestScore = esEstimulacionCognitiva ? await getBestScore() : 0;
  const cognitiveDailyState = esEstimulacionCognitiva ? await getDailyChallengeState() : null;
  const cognitiveWaitingCount = esEstimulacionCognitiva ? await getDuoQueueCount() : 0;
  const cognitiveCategorias = esEstimulacionCognitiva ? await getCategoryLevels() : null;

  const esEducacionContinua = dimension.slug === "educacion-continua" && CURSOS_HABILITADOS;
  const classroomState = esEducacionContinua ? await getClassroomState() : null;
  const microcursos = esEducacionContinua ? await getMicrocursos() : null;
  const certificados = esEducacionContinua ? await getMyCertificates() : null;
  let nombreParaCertificado = "";
  if (esEducacionContinua) {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    if (currentUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", currentUser.id)
        .maybeSingle();
      nombreParaCertificado = profile?.full_name || currentUser.email || "";
    }
  }

  const esInterculturalidad = dimension.slug === "interculturalidad";
  const conexionesCulturales = esInterculturalidad ? await getCulturalConnections() : null;
  const eventosGlobales = esInterculturalidad ? await getGlobalEvents() : null;

  const roles = esParticipacionActiva ? await getRoleLadder() : null;
  const oportunidades = esParticipacionActiva ? await getVolunteerOpportunities() : null;
  const mentorState = esParticipacionActiva ? await getMentorState() : null;
  const impactStats = esParticipacionActiva ? await getImpactStats() : null;

  const numero = DIMENSIONS.findIndex((d) => d.slug === dimension.slug) + 1;
  const { nombre, enfasis } = splitTitle(dimension.title);
  const totalRecursos =
    program.entrenamiento.length + program.materiales.length + program.formacion.length + program.actividades.length;
  // El seguimiento real de progreso todavía no existe — se muestra en 0
  // en vez de inventar un número.
  const progreso = 0;

  return (
    <div className={styles.pagina}>
      <div className={styles.ambiente} aria-hidden="true" />
      <div className={styles.puntos} aria-hidden="true" />
      <div className={styles.contenido}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div>
            <div className={styles.eyebrow}>Dimensión {String(numero).padStart(2, "0")} de 10</div>
            <h1>
              {nombre} {enfasis && <span className={styles.enfasis}>{enfasis}</span>}
            </h1>
            <p className={styles.heroDesc}>{dimension.description}</p>
            <div className={styles.cifras}>
              <span className={styles.cifra}>
                <b>{totalRecursos}</b> recursos
              </span>
              {routes && (
                <span className={styles.cifra}>
                  <b>{routes.length}</b> niveles
                </span>
              )}
              <span className={styles.cifra}>
                <b>{program.actividades.length}</b> actividades
              </span>
            </div>
            <div className={styles.progreso}>
              <div className={styles.progresoTxt}>
                <span>Tu progreso</span>
                <span>{progreso}%</span>
              </div>
              <div
                className={styles.barra}
                role="progressbar"
                aria-valuenow={progreso}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Tu progreso en esta dimensión"
              >
                <i style={{ width: `${progreso}%` }} />
              </div>
            </div>
            <div className={styles.heroAcciones}>
              {PROGRAMA_HABILITADO ? (
                <a href="#programa" className={`${styles.btn} ${styles.btnP}`}>
                  Ir al programa
                </a>
              ) : (
                <a href="#actividades" className={`${styles.btn} ${styles.btnP}`}>
                  Ir a las actividades
                </a>
              )}
              {youtubeUrl && (
                <a href="#video" className={`${styles.btn} ${styles.btnS}`}>
                  <PlayIcon />
                  Ver video
                </a>
              )}
            </div>
          </div>
          <DimensionHeroGallery slug={dimension.slug} title={dimension.title} numero={numero} />
        </div>
      </section>

      {esEstimulacionCognitiva && (
        <section className={cogStyles.bloque}>
          <GemSequenceGame initialBestScore={cognitiveBestScore} />
        </section>
      )}

      <DimensionVideo youtubeUrl={youtubeUrl} title={dimension.title} learn={learn} />

      {PROGRAMA_HABILITADO && <ProgramTabs program={program} />}

      {esDigital ? (
        <DigitalActividadesInteractivas
          initialHechos={digitalPasosProgreso?.hechos ?? [false, false, false, false, false]}
          initialResp={digitalQuizProgreso?.resp ?? [null, null, null, null, null]}
        />
      ) : esSaludMental ? (
        <SaludMentalActividadesInteractivas initialMoments={reflexionProgreso?.moments ?? []} initialWeek={chequeoProgreso?.byDate ?? {}} />
      ) : esConexionSocial ? (
        <ConexionSocialActividadesInteractivas initialHechas={caminoProgreso?.hechas ?? [false, false, false, false, false]} initialEventoIndex={caminoProgreso?.evento ?? null} />
      ) : esTiempoLibre ? (
        <TiempoLibreActividadesInteractivas initialEstado={armaTardeProgreso} initialResp={quizCartasProgreso?.resp ?? null} />
      ) : esEstCognitivaBespoke ? (
        <EstimulacionCognitivaActividadesInteractivas />
      ) : esEduContinuaBespoke ? (
        <EducacionContinuaActividadesInteractivas />
      ) : esInterculturalidadBespoke ? (
        <InterculturalidadActividadesInteractivas initialResp={pasaporteProgreso?.resp ?? null} initialEstado={brujulaProgreso ?? null} />
      ) : esBienestarFisicoBespoke ? (
        <BienestarFisicoActividadesInteractivas
          initialCompletados={rutinaGuiadaProgreso?.completados ?? []}
          initialMitosI={mitoVerdadProgreso?.i ?? 0}
          initialMitosResp={mitoVerdadProgreso?.resp ?? []}
        />
      ) : esSeguridadDigitalBespoke ? (
        <SeguridadDigitalActividadesInteractivas
          initialChatI={chatSospechosoProgreso?.i ?? 0}
          initialChatResp={chatSospechosoProgreso?.resp ?? [undefined, undefined, undefined, undefined, undefined, undefined]}
        />
      ) : esParticipacionActiva ? (
        <ParticipacionActivaActividadesInteractivas
          initialSaberes={arbolSaberProgreso?.saberes ?? []}
          initialPublicos={arbolSaberProgreso?.publicos ?? []}
          initialIdea={arbolSaberProgreso?.idea ?? ""}
          initialGuardadoAporte={arbolSaberProgreso?.guardado ?? false}
          initialMentorTopics={mentorState?.topics.map((t) => t.topic) ?? []}
          initialEstadoPuente={puenteMentorProgreso ?? { tema: null, ideas: ["", "", ""], dia: null, modo: null, como: null, despues: false }}
        />
      ) : (
        <ActividadesInteractivas dimensionSlug={dimension.slug} activities={activities} />
      )}

      {/* Minisites reales — implementados de verdad, no solo estructura */}
      {dimension.slug === "seguridad-digital" && (
        <>
          <ScamSimulator />
          <ScamWarningSigns />
          <SupportBanner />
        </>
      )}

      {esBienestarFisico && (
        <>
          <WellnessProfileForm profile={wellnessProfile} />
          <HydrationPrism initialGlasses={await getTodayHydration()} history={await getHydrationHistory()} goal={computeHydrationGoal(wellnessProfile?.weightKg ?? null)} />
          <LowImpactRoutines
            sessionsThisWeek={await getExerciseSessionsThisWeek()}
            semana={await getWeekSemana()}
            personalizedRoutine={wellnessProfile ? generatePersonalizedRoutine(wellnessProfile) : null}
          />
        </>
      )}

      {esEstimulacionCognitiva && cognitiveDailyState && cognitiveCategorias && (
        <>
          <section className={cogStyles.bloque}>
            <div className={cogStyles.duoGrid}>
              <DailyChallenge state={cognitiveDailyState} />
              <DuoMode waitingCount={cognitiveWaitingCount} myRecord={cognitiveBestScore} />
            </div>
          </section>
          <section className={cogStyles.bloque}>
            <CognitiveCategories categorias={cognitiveCategorias} />
          </section>
        </>
      )}

      {dimension.slug === "salud-mental" && (
        <>
          <CirculosApoyo circulos={await getSupportCircles()} />
          <SupportChat />
        </>
      )}

      {esEducacionContinua && classroomState && microcursos && certificados && (
        <>
          <MyClassroom state={classroomState} />
          <Microcursos cursos={microcursos} />
          <MyCertificates certificados={certificados} userName={nombreParaCertificado} />
        </>
      )}

      {esInterculturalidad && conexionesCulturales && eventosGlobales && (
        <>
          <GreetingsRibbon />
          <CulturalConnections conexiones={conexionesCulturales} />
          <GlobalEvents eventos={eventosGlobales} />
        </>
      )}

      {esParticipacionActiva && roles && oportunidades && mentorState && impactStats && (
        <>
          <RoleLadder roles={roles} />
          <VolunteerOpportunities oportunidades={oportunidades} />
          <MentorInbox state={mentorState} />
          <ImpactStats stats={impactStats} />
        </>
      )}

      {dimension.slug === "conexion-social" && (
        <>
          <InterestCircles circulos={await getInterestCircles()} />
          <IntergenerationalMeetups {...(await getIntergenerationalData())} />
          <UpcomingEvents eventos={await getUpcomingEvents()} />
        </>
      )}

      {dimension.slug === "tiempo-libre" && (
        <>
          <PurposeIdeaDeck
            ideas={(await getPurposeIdeaStates()).map((state) => ({
              ...PURPOSE_IDEAS.find((i) => i.slug === state.slug)!,
              ...state,
            }))}
          />
          <FreeTimeGenerator />
        </>
      )}

      {routes && <LearningRoutes routes={routes} />}

      {companion && <DigitalCompanion companion={companion} />}

      {/* Si ya hay una ruta de aprendizaje (stepper) para esta dimensión, no
          repetimos el mismo contenido como lista simple. */}
      {list && !routes && (
        <section className={styles.bloque}>
          <ListSection heading={list.heading} items={list.items} />
        </section>
      )}

      {features.length > 0 && (
        <section className={styles.bloque}>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className={`${styles.item}`}>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
                <button
                  type="button"
                  disabled
                  title="Próximamente"
                  className={`${styles.btn} ${styles.btnP} ${styles.btnSm}`}
                  style={{ marginTop: "auto", width: "fit-content", opacity: 0.5, cursor: "not-allowed" }}
                >
                  {f.cta}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONTENIDO PUBLICADO */}
      <section className={styles.bloque}>
        <div className={styles.seccionCab}>
          <div>
            <div className={styles.eyebrow}>Comunidad</div>
            <h2 className={styles.seccionTitulo}>
              Contenido <span className={styles.enfasis}>publicado</span>
            </h2>
          </div>
        </div>
        {!rows || rows.length === 0 ? (
          <div className={styles.vacio}>
            <svg width="64" height="64" viewBox="0 0 40 40" aria-hidden="true">
              <polygon points="20,2 38,30 20,38" fill="var(--olive)" />
              <polygon points="20,2 20,38 2,28" fill="var(--olive-deep)" />
              <polygon points="20,2 38,30 26,22" fill="var(--olive-light)" opacity=".55" />
            </svg>
            <div style={{ flex: 1, minWidth: 220 }}>
              <h3>Todavía no hay publicaciones aquí</h3>
              <p>Sé la primera persona en compartir un consejo, una foto o una experiencia sobre esta dimensión.</p>
            </div>
          </div>
        ) : (
          <div className={styles.gridCont}>
            {rows.map((item) => (
              <article key={item.id} className={styles.item}>
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 5l11 7-11 7z" fill="currentColor" />
    </svg>
  );
}
