// Bus mínimo para que otras secciones (p. ej. "¿Cómo te sientes hoy?")
// puedan abrir el panel flotante de Escucha activa sin acoplarse a su
// estado interno.
const EVENTO = "prisma:abrir-escucha";

export function abrirEscucha(opts?: { respirar?: boolean }) {
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: opts ?? {} }));
}

export function onAbrirEscucha(handler: (opts: { respirar?: boolean }) => void) {
  function listener(e: Event) {
    handler((e as CustomEvent).detail ?? {});
  }
  window.addEventListener(EVENTO, listener);
  return () => window.removeEventListener(EVENTO, listener);
}
