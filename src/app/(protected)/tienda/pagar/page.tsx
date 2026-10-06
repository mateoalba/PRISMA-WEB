import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pago | Prisma" };

export default function PagarPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pago</h1>
        <p className="mt-1 text-foreground/70">Estamos preparando el pago en línea para la tienda.</p>
      </div>

      <div className="rounded-xl border border-line bg-surface p-10 text-center">
        <p className="font-display text-lg font-semibold text-foreground">Todavía no puedes pagar en línea</p>
        <p className="mt-2 text-sm text-foreground/60">
          {/* TODO: reemplazar por la línea de apoyo real de Penser cuando la definan (mismo número que el botón SOS) */}
          Mientras tanto, llámanos al <b>número por confirmar</b> y te ayudamos a completar tu pedido.
        </p>
        <Link href="/tienda" className="mt-6 inline-block rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-graphite">
          Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
