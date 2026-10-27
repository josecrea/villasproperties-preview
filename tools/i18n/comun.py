"""Utilidades comunes de los generadores i18n (atelier:villas-idiomas).

Tres cosas que antes estaban duplicadas (y mal) en cada gen_*.py:
  1. leer_fuente: el HTML español PRISTINO (origin/main), no el de la raíz del
     árbol de trabajo, que ya lleva el parche de hreflang/selector. Sin esto,
     regenerar duplicaba el selector de idioma y los hreflang.
  2. traducir: sustituye texto sin tocar identificadores (id, name, for,
     aria-controls...). Antes "Nombre" -> "Naam" rompía id="cNombre" y el
     manejador JS del formulario dejaba de encontrarlo.
  3. reescribir_rutas: prefija '../' en TODO atributo que lleva URL
     (href, src, action, poster, data-src, data-poster, data-img, srcset).
"""
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def leer_fuente(nombre: str) -> str:
    """HTML español sin parchear: `origin/main:<nombre>`; si no hay git o
    remoto, el fichero de la raíz (comportamiento antiguo)."""
    try:
        out = subprocess.run(
            ["git", "-C", str(ROOT), "show", f"origin/main:{nombre}"],
            capture_output=True, check=True,
        ).stdout
        return out.decode("utf-8")
    except (subprocess.CalledProcessError, FileNotFoundError):
        return (ROOT / nombre).read_text(encoding="utf-8")


# Atributos cuyo valor es un identificador/contrato con el JS: nunca se traducen.
# (data-* NO se enmascara: hay claves de la tabla que traducen data-alt-es y
# data-drift forma parte de fragmentos que sí se traducen.)
_ATTR_IDENT = re.compile(
    r'(\s)(id|name|for|form|list|aria-controls|aria-labelledby|aria-describedby)=("[^"]*"|\'[^\']*\')',
    re.I,
)


def traducir(html: str, tabla: dict, lang: str, omitir=()) -> str:
    """Aplica `tabla` (ES -> {lang: texto}) protegiendo los valores de los
    atributos identificadores, que se enmascaran y se restauran al final."""
    guardados = []

    def esconder(m):
        guardados.append(m.group(0))
        return f"\x00IDENT{len(guardados) - 1}\x00"

    html = _ATTR_IDENT.sub(esconder, html)
    for es, trs in tabla.items():
        if es in omitir:
            continue
        if lang in trs:
            html = html.replace(es, trs[lang])
    return re.sub(r"\x00IDENT(\d+)\x00", lambda m: guardados[int(m.group(1))], html)


SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "#", "/", "data:", "javascript:")
_ATTR_URL = re.compile(
    r'\b(href|src|action|poster|data-src|data-poster|data-img|srcset)=(["\'])([^"\']+)\2'
)


def _prefijar(val: str) -> str:
    return val if val.startswith(SKIP_PREFIXES) else "../" + val


def reescribir_rutas(html: str) -> str:
    """Páginas de nl/ fr/ it/ en/ de/ viven un nivel más abajo: toda URL
    relativa necesita '../'. Las absolutas, mailto:, tel:, '#' y '/...' no."""
    def repl(m):
        attr, q, val = m.group(1), m.group(2), m.group(3)
        if attr == "srcset":
            # "a.webp 1x, b.webp 2x": cada candidato lleva su propia URL
            partes = []
            for cand in val.split(","):
                cand = cand.strip()
                if not cand:
                    continue
                url, _, desc = cand.partition(" ")
                partes.append((_prefijar(url) + (" " + desc if desc else "")))
            nuevo = ", ".join(partes)
        else:
            nuevo = _prefijar(val)
        return f"{attr}={q}{nuevo}{q}"

    return _ATTR_URL.sub(repl, html)
