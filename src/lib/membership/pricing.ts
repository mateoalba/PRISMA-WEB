// Reglas de precio de la membresía, en un archivo aparte (sin "use server")
// porque ese tipo de archivo solo puede exportar funciones async — esto son
// constantes y una función pura normal.
export const PRECIO_BASE = 50;
export const DESCUENTO_POR_REFERIDO = 10;
export const MAX_REFERIDOS_CON_DESCUENTO = 2;

export function calcularPrecioMembresia(referidosActivos: number) {
  const n = Math.min(referidosActivos, MAX_REFERIDOS_CON_DESCUENTO);
  return PRECIO_BASE - n * DESCUENTO_POR_REFERIDO;
}
