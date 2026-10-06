#!/usr/bin/env bash
# Activa una versión nueva en el servidor. Lo ejecuta GitHub Actions por SSH
# después de subir el paquete, pero también se puede correr a mano:
#   bash release.sh <id-de-version> [ruta-del-paquete.tar.gz]
#
# Qué hace: descomprime la versión en su propia carpeta, mueve el enlace
# "current" hacia ella, reinicia la app y comprueba que responde. Si no
# responde, vuelve solo a la versión anterior.
set -euo pipefail

BASE="${PRISMA_BASE:-/var/www/prisma}"
VERSION="${1:?uso: release.sh <id-de-version> [paquete.tar.gz]}"
PAQUETE="${2:-/tmp/prisma-release-$VERSION.tar.gz}"
PUERTO="${PRISMA_PORT:-3000}"
CONSERVAR="${PRISMA_KEEP:-5}"
DESTINO="$BASE/releases/$VERSION"
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

[ -f "$PAQUETE" ] || { echo "No existe el paquete $PAQUETE"; exit 1; }
[ -f "$BASE/shared/web.env" ] || { echo "Falta $BASE/shared/web.env (variables de entorno). Ver setup-server.sh"; exit 1; }

# La configuración de PM2 viaja con cada versión para que los cambios se apliquen.
if [ -f "$AQUI/ecosystem.config.cjs" ]; then
  cp "$AQUI/ecosystem.config.cjs" "$BASE/shared/ecosystem.config.cjs"
fi

echo "==> Descomprimiendo versión $VERSION"
rm -rf "$DESTINO"
mkdir -p "$DESTINO"
tar -xzf "$PAQUETE" -C "$DESTINO"
[ -f "$DESTINO/server.js" ] || { echo "El paquete no trae server.js: no es una versión válida"; rm -rf "$DESTINO"; exit 1; }

ANTERIOR="$(readlink -f "$BASE/current" 2>/dev/null || true)"

activar() { # $1 = carpeta de la versión
  ln -sfn "$1" "$BASE/current.nuevo"
  mv -Tf "$BASE/current.nuevo" "$BASE/current"
  PRISMA_BASE="$BASE" PRISMA_PORT="$PUERTO" pm2 startOrReload "$BASE/shared/ecosystem.config.cjs" --update-env >/dev/null
}

responde() {
  for _ in $(seq 1 30); do
    codigo="$(curl -s -o /dev/null -m 5 -w '%{http_code}' "http://127.0.0.1:$PUERTO/login" || true)"
    # 200 = sirve la página. Cualquier 5xx o ausencia de respuesta cuenta como falla.
    [ "$codigo" = "200" ] && return 0
    sleep 1
  done
  return 1
}

echo "==> Activando"
activar "$DESTINO"

if responde; then
  echo "==> Versión $VERSION activa y respondiendo"
else
  echo "!! La versión $VERSION no respondió."
  if [ -n "$ANTERIOR" ] && [ -d "$ANTERIOR" ] && [ "$ANTERIOR" != "$DESTINO" ]; then
    echo "!! Volviendo a $(basename "$ANTERIOR")"
    activar "$ANTERIOR"
    responde && echo "!! Versión anterior restaurada" || echo "!! Tampoco responde la anterior: revisar 'pm2 logs prisma-web'"
  fi
  exit 1
fi

# Limpieza: deja las últimas versiones por si hay que volver atrás.
cd "$BASE/releases"
ls -1t | tail -n +"$((CONSERVAR + 1))" | while read -r vieja; do
  [ "$BASE/releases/$vieja" = "$(readlink -f "$BASE/current")" ] && continue
  rm -rf "$BASE/releases/$vieja"
done
rm -f "$PAQUETE"
pm2 save >/dev/null 2>&1 || true
echo "==> Listo"
