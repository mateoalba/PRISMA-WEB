#!/usr/bin/env bash
# Prepara un servidor Ubuntu 22.04/24.04 NUEVO para correr PRISMA. Se ejecuta
# una sola vez, con el usuario normal (ubuntu), que debe poder usar sudo:
#
#   bash setup-server.sh <dominio>        ej.: bash setup-server.sh demo.penser.org
#
# Instala Node 22, PM2 (mantiene la app viva) y Caddy (HTTPS automático),
# crea las carpetas, deja la plantilla de variables y agenda el cron diario
# de membresías. Se puede volver a ejecutar sin romper nada.
set -euo pipefail

DOMINIO="${1:?uso: bash setup-server.sh <dominio>   (ej.: demo.penser.org)}"
BASE="${PRISMA_BASE:-/var/www/prisma}"
USUARIO="$(id -un)"
SUDO=""
[ "$(id -u)" -ne 0 ] && SUDO="sudo"
# Solo para pruebas en contenedores sin systemd.
OMITIR_SERVICIOS="${PRISMA_SKIP_SERVICES:-0}"

echo "==> 1/7 Paquetes base"
$SUDO apt-get update -y
$SUDO env DEBIAN_FRONTEND=noninteractive apt-get install -y curl ca-certificates gnupg cron debian-keyring debian-archive-keyring apt-transport-https

echo "==> 2/7 Memoria de respaldo (swap de 1 GB) por si el servidor es chico"
if [ "$OMITIR_SERVICIOS" != "1" ] && ! swapon --show | grep -q .; then
  $SUDO fallocate -l 1G /swapfile
  $SUDO chmod 600 /swapfile
  $SUDO mkswap /swapfile >/dev/null
  $SUDO swapon /swapfile
  echo '/swapfile none swap sw 0 0' | $SUDO tee -a /etc/fstab >/dev/null
fi

echo "==> 3/7 Node 22"
if ! command -v node >/dev/null 2>&1 || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | $SUDO -E bash -
  $SUDO apt-get install -y nodejs
fi
node -v

echo "==> 4/7 PM2"
command -v pm2 >/dev/null 2>&1 || $SUDO npm install -g pm2

echo "==> 5/7 Caddy"
if ! command -v caddy >/dev/null 2>&1; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | $SUDO gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | $SUDO tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  $SUDO apt-get update -y
  $SUDO env DEBIAN_FRONTEND=noninteractive apt-get install -y caddy
fi

echo "==> 6/7 Carpetas y variables"
$SUDO mkdir -p "$BASE/releases" "$BASE/shared"
$SUDO chown -R "$USUARIO:$USUARIO" "$BASE"

if [ ! -f "$BASE/shared/web.env" ]; then
  cat > "$BASE/shared/web.env" <<ENV
# Variables de PRISMA en este servidor. Completa los valores y guarda.
# Este archivo NO está en GitHub y solo lo puede leer el usuario del servidor.
NODE_ENV=production
APP_URL=https://$DOMINIO

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Texto largo y aleatorio (el cron diario de membresías lo usa para identificarse)
CRON_SECRET=

# Wompi (llaves de pruebas para la demo; las pub_prod_ para producción)
WOMPI_PUBLIC_KEY=
WOMPI_INTEGRITY_SECRET=
WOMPI_EVENTS_SECRET=
WOMPI_COP_PER_USD=4200

# PayPal (sandbox para la demo; PAYPAL_ENV=live en producción)
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox
ENV
  chmod 600 "$BASE/shared/web.env"
  echo "   Creé $BASE/shared/web.env: HAY QUE COMPLETARLO antes del primer despliegue."
else
  echo "   $BASE/shared/web.env ya existe: no lo toco."
fi

cat > "$BASE/shared/cron-membresias.sh" <<'CRON'
#!/usr/bin/env bash
# Da de baja las membresías vencidas (equivale al cron de Vercel).
set -euo pipefail
ENV_FILE="${PRISMA_BASE:-/var/www/prisma}/shared/web.env"
valor() { grep -E "^$1=" "$ENV_FILE" | head -1 | cut -d= -f2-; }
curl -fsS -m 60 -H "Authorization: Bearer $(valor CRON_SECRET)" "$(valor APP_URL)/api/cron/membresias"
echo
CRON
chmod 700 "$BASE/shared/cron-membresias.sh"

echo "==> 7/7 Publicación (Caddy), arranque automático y cron"
$SUDO tee /etc/caddy/Caddyfile >/dev/null <<CADDY
$DOMINIO {
	encode zstd gzip
	reverse_proxy 127.0.0.1:3000
}
CADDY

# 11:00 UTC = 06:00 en Colombia/Ecuador
echo "0 11 * * * $USUARIO PRISMA_BASE=$BASE $BASE/shared/cron-membresias.sh >> $BASE/shared/cron.log 2>&1" | $SUDO tee /etc/cron.d/prisma-membresias >/dev/null
$SUDO chmod 644 /etc/cron.d/prisma-membresias

if [ "$OMITIR_SERVICIOS" != "1" ]; then
  $SUDO systemctl enable --now caddy
  $SUDO systemctl reload caddy || $SUDO systemctl restart caddy
  $SUDO env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$USUARIO" --hp "$HOME" >/dev/null
fi

echo
echo "Servidor listo para $DOMINIO. Siguientes pasos:"
echo "  1) Completa las variables:  nano $BASE/shared/web.env"
echo "  2) Apunta el DNS de $DOMINIO a la IP pública de este servidor."
echo "  3) Sube un cambio a la rama main de GitHub: el despliegue corre solo."
