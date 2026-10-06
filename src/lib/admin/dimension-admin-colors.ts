// Paleta de color por dimensión usada solo dentro del panel admin (mapa de
// programa, videos, dashboard, usuarios) — distinta de la paleta del
// espectro público (@/lib/dimension-spectrum), que usa tonos oliva muy
// parecidos entre sí a propósito. Aquí cada dimensión necesita un color
// bien diferenciable a simple vista.
export const DIMENSION_ADMIN_COLORS: Record<string, string> = {
  digital: "#aebd52",
  "salud-mental": "#9fd3c9",
  "conexion-social": "#ffb48a",
  "tiempo-libre": "#e8c95a",
  "estimulacion-cognitiva": "#b8a4e3",
  "educacion-continua": "#7fb7e6",
  interculturalidad: "#e39bb6",
  "bienestar-fisico": "#8fd18a",
  "seguridad-digital": "#ff8a74",
  "participacion-activa": "#d9c7a0",
};

export function dimensionAdminColor(slug: string): string {
  return DIMENSION_ADMIN_COLORS[slug] ?? "#aebd52";
}
