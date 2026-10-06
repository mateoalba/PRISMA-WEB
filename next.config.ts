import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solo desarrollo: Wompi bloquea redirect-url con "localhost", así que en
  // local se prueba el cobro abriendo la app en http://localtest.me:3000
  // (ese dominio apunta a 127.0.0.1).
  allowedDevOrigins: ["localtest.me"],
};

export default nextConfig;
