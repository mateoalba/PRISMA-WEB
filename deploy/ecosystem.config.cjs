// Configuración de PM2: mantiene la app corriendo y la reinicia si se cae o
// se pasa de memoria. Las variables secretas se leen de shared/web.env.
const base = process.env.PRISMA_BASE || "/var/www/prisma";

module.exports = {
  apps: [
    {
      name: "prisma-web",
      cwd: `${base}/current`,
      script: "server.js",
      interpreter_args: `--env-file=${base}/shared/web.env`,
      env: {
        NODE_ENV: "production",
        PORT: process.env.PRISMA_PORT || "3000",
        HOSTNAME: "127.0.0.1", // solo Caddy (en el mismo servidor) puede llegar a la app
      },
      max_memory_restart: "700M",
      kill_timeout: 8000,
    },
  ],
};
