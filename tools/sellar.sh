#!/usr/bin/env bash
# sellar.sh — refresca el ?v= de TODOS los assets versionados.
#
# Por qué existe: al tocar un JS y refrescar solo "los sellos que me sonaban",
# tenerife-cinematic.js se quedó con el del día anterior y el navegador siguió
# sirviendo la versión cacheada. El arreglo estaba subido y no llegaba a nadie.
# Refrescar TODOS cuesta lo mismo y no se olvida ninguno.
set -euo pipefail
cd "$(dirname "$0")/.."
SELLO=$(date +%Y%m%d%H%M)
for f in *.html; do
  perl -pi -e "s/(\.(?:css|js)\?v=)[0-9]+/\${1}$SELLO/g" "$f"
done
echo "sello $SELLO aplicado en $(ls *.html | wc -l | tr -d ' ') páginas"
grep -oh '[a-z-]*\.\(css\|js\)?v=[0-9]*' *.html | sort -u | head -20
