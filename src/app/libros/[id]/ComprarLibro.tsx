"use client";

import { useState } from "react";
import styles from "@/styles/libros.module.css";
import { startBookCheckout } from "@/lib/membership/checkout-actions";

type Metodo = "paypal" | "wompi";

// Botón "Comprar este libro": al pulsarlo muestra los dos métodos de pago y
// manda a la pasarela elegida. El precio lo vuelve a calcular el servidor.
export function ComprarLibro({
  libroId,
  precio,
  precioCop,
  primario = true,
}: {
  libroId: string;
  precio: number;
  precioCop: number | null;
  primario?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState<Metodo | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pagar(metodo: Metodo) {
    setEnviando(metodo);
    setError(null);
    const r = await startBookCheckout(libroId, metodo);
    if (r.ok) {
      window.location.assign(r.url);
      return;
    }
    setEnviando(null);
    setError(r.error);
  }

  return (
    <div>
      <button type="button" className={`${styles.btn} ${primario ? styles.btnP : styles.btnG}`} style={{ width: "100%" }} aria-expanded={abierto} onClick={() => setAbierto((a) => !a)}>
        Comprar este libro · <span className={styles.precio}>${precio.toFixed(2)}</span>
      </button>
      {abierto && (
        <div style={{ marginTop: 12 }}>
          <div className={styles.metodos} role="group" aria-label="Método de pago">
            <button type="button" className={styles.metodo} disabled={enviando !== null} onClick={() => pagar("paypal")}>
              {enviando === "paypal" ? "Un momento…" : "PayPal"}
              <small>${precio.toFixed(2)} USD</small>
            </button>
            <button type="button" className={styles.metodo} disabled={enviando !== null} onClick={() => pagar("wompi")}>
              {enviando === "wompi" ? "Un momento…" : "Wompi"}
              <small>{precioCop ? `$${precioCop.toLocaleString("es-CO")} COP` : "Pesos colombianos"}</small>
            </button>
          </div>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
