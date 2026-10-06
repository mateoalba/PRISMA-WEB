"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/styles/perfil.module.css";
import { useToast } from "./ToastContext";
import type { MembershipState } from "@/lib/membership/actions";
import { startMembershipCheckout } from "@/lib/membership/checkout-actions";

const AVISOS_PAGO: Record<string, { texto: string; ok: boolean }> = {
  ok: { texto: "¡Pago recibido! Tu membresía ya está activa.", ok: true },
  pendiente: { texto: "Tu pago está en proceso. Apenas se confirme, tu membresía se activa sola.", ok: true },
  rechazado: { texto: "El pago fue rechazado y no se te cobró. Puedes intentarlo de nuevo.", ok: false },
  cancelado: { texto: "Cancelaste el pago. No se te cobró nada.", ok: false },
  error: { texto: "No pudimos confirmar el pago. Si te cobraron, escríbenos y lo resolvemos.", ok: false },
};

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function GiftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M12 8c-2 0-4-1.3-4-3.2A2.3 2.3 0 0 1 10.3 2C12 2 12 5 12 8zM12 8c2 0 4-1.3 4-3.2A2.3 2.3 0 0 0 13.7 2C12 2 12 5 12 8z" />
    </svg>
  );
}

export function MembresiaPanel({ membership }: { membership: MembershipState | null }) {
  const { notify } = useToast();
  const pago = useSearchParams().get("pago");
  const [enviando, setEnviando] = useState<"paypal" | "wompi" | null>(null);
  const [origin, setOrigin] = useState("");
  // Solo existe window en el cliente; se llena después del montaje para no
  // desajustar el HTML del servidor.
  /* eslint-disable-next-line react-hooks/set-state-in-effect */
  useEffect(() => setOrigin(window.location.origin), []);

  if (!membership) return null;

  const referralLink = `${origin}/registro?ref=${membership.referralCode}`;
  const referidosActivos = membership.referrals.filter((r) => r.active).length;

  function copiarLink() {
    navigator.clipboard?.writeText(referralLink);
    notify("Enlace copiado");
  }

  async function pagar(provider: "paypal" | "wompi") {
    setEnviando(provider);
    const r = await startMembershipCheckout(provider);
    if (r.ok) {
      window.location.assign(r.url);
      return;
    }
    setEnviando(null);
    notify(r.error);
  }

  const vence = membership.expiresAt
    ? new Date(membership.expiresAt).toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    : null;
  const mostrarPago = !membership.hasMembership || membership.expiresAt !== null;
  const aviso = AVISOS_PAGO[pago ?? ""];

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {aviso && (
        <div
          role="status"
          className={styles.tarjeta}
          style={{ padding: "14px 20px", borderColor: aviso.ok ? "var(--olive-light)" : "var(--coral, #ff8a74)" }}
        >
          {aviso.texto}
        </div>
      )}
      <div className={`${styles.tarjeta} ${styles.membresia}`}>
        <div>
          <div className={styles.eyebrow}>Membresía</div>
          <h2>
            {membership.hasMembership ? (
              <>
                Pagas <span className={styles.enfasis}>${membership.price}/mes</span>
              </>
            ) : membership.trialDaysLeft > 0 ? (
              <>
                Prueba gratis: te {membership.trialDaysLeft === 1 ? "queda" : "quedan"} <span className={styles.enfasis}>{membership.trialDaysLeft} {membership.trialDaysLeft === 1 ? "día" : "días"}</span>
              </>
            ) : (
              <>
                {membership.trialEnded ? "Tu prueba gratis " : "Tienes una cuenta "}
                <span className={styles.enfasis}>{membership.trialEnded ? "terminó" : "gratuita"}</span>
              </>
            )}
          </h2>
          <p>
            {membership.hasMembership
              ? membership.ahorroMensual > 0
                ? `Ahorras $${membership.ahorroMensual}/mes gracias a ${referidosActivos === 1 ? "1 persona que referiste" : `${referidosActivos} personas que referiste`} y sigue${referidosActivos === 1 ? "" : "n"} pagando su membresía.`
                : "Precio base. Refiere a alguien y cuando pague su membresía, tu precio baja."
              : `${
                  membership.trialDaysLeft > 0
                    ? "Durante la prueba lees una muestra de cada libro. Para descargarlos, compra el libro que te guste o hazte miembro. "
                    : membership.trialEnded
                      ? "Para descargar libros, compra el que te guste o hazte miembro. "
                      : ""
                }La membresía cuesta $50/mes e incluye todos los libros de la biblioteca. Refiere a alguien: si paga, tu precio baja a $40; con un segundo referido pagando, baja a $30.`}
          </p>
          {membership.hasMembership && vence && <p style={{ marginTop: 6 }}>Tu membresía está pagada hasta el {vence}.</p>}
          {membership.referredByName && !membership.hasMembership && <p style={{ marginTop: 6 }}>Te invitó {membership.referredByName}.</p>}
        </div>
      </div>

      {mostrarPago && (
        <div className={styles.tarjeta} style={{ padding: "24px 28px" }}>
          <div className={styles.eyebrow}>{membership.hasMembership ? "Renovar" : "Hazte miembro"}</div>
          <h3 style={{ margin: "6px 0 14px", fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "1.2rem" }}>
            {membership.hasMembership ? `Renueva 30 días por $${membership.price}` : `Elige tu método de pago · $${membership.price}`}
          </h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button type="button" className={`${styles.btn} ${styles.btnP}`} disabled={enviando !== null} onClick={() => pagar("paypal")}>
              {enviando === "paypal" ? "Un momento…" : "Pagar con PayPal"}
            </button>
            <button type="button" className={`${styles.btn} ${styles.btnS}`} disabled={enviando !== null} onClick={() => pagar("wompi")}>
              {enviando === "wompi" ? "Un momento…" : "Pagar con Wompi"}
            </button>
          </div>
          <p style={{ marginTop: 14, fontSize: 13, color: "var(--ink-muted)" }}>
            Cada pago activa 30 días de membresía al precio que ves arriba. No hay cobros automáticos: cuando se acabe el tiempo, renuevas aquí mismo. Wompi cobra en pesos colombianos (COP).
          </p>
        </div>
      )}

      <div className={styles.tarjeta} style={{ padding: "24px 28px" }}>
        <div className={styles.eyebrow}>Invita y ahorra</div>
        <h3 style={{ margin: "6px 0 8px", fontFamily: "var(--font-fraunces), Georgia, serif", fontSize: "1.2rem" }}>Tu enlace para invitar</h3>
        <p style={{ margin: "0 0 14px", color: "var(--ink-soft)" }}>Comparte este enlace. Cuando la persona pague su membresía, tu precio baja $10 (hasta un máximo de 2 personas).</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input readOnly value={referralLink} onFocus={(e) => e.target.select()} className={styles.chip} style={{ flex: "1 1 260px", minWidth: 0, cursor: "text" }} />
          <button type="button" className={`${styles.btn} ${styles.btnS}`} onClick={copiarLink}>
            <CopyIcon />
            Copiar
          </button>
        </div>

        {membership.referrals.length > 0 && (
          <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
            {membership.referrals.map((r) => (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 14, background: "var(--glass)", border: "1px solid var(--hair)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <GiftIcon />
                  {r.name}
                </span>
                <span className={styles.chip} style={r.active ? { background: "rgba(174,189,82,.16)", color: "var(--olive-light)" } : undefined}>
                  {r.active ? "Pagando" : "Sin membresía"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
