#!/usr/bin/env python3
"""Franja «Nederlands · Français · Italiano» en la portada española y en buy.html.

Idempotente: se apoya en un marcador y se puede ejecutar cuantas veces haga falta.
Regla del PR: solo se ofrece lo que EXISTE. La portada tiene equivalente en
nl/fr/it (enlace con hreflang); buy.html no lo tiene, así que se enlaza a la
portada de cada idioma y NO se marca con hreflang (no es equivalente), solo lang.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MARCA = "<!-- franja-idiomas -->"
IDIOMAS = (("nl", "Nederlands"), ("fr", "Français"), ("it", "Italiano"))


def franja(equivalente: bool) -> str:
    enlaces = "".join(
        f'<a href="/{c}/index.html" lang="{c}"{f" hreflang={chr(34)}{c}{chr(34)}" if equivalente else ""}>{n}</a>'
        for c, n in IDIOMAS
    )
    return (
        f'{MARCA}<aside class="langstrip" aria-label="Idiomas disponibles / Beschikbare talen / '
        f'Langues disponibles / Lingue disponibili"><div class="wrap"><span>También en tu idioma:</span>'
        f"{enlaces}</div></aside>\n"
    )


def insertar(nombre: str, ancla: str, equivalente: bool) -> None:
    p = ROOT / nombre
    html = p.read_text(encoding="utf-8")
    if MARCA in html:
        print("ya tiene franja:", nombre)
        return
    assert html.count(ancla) >= 1, f"ancla no encontrada en {nombre}"
    p.write_text(html.replace(ancla, franja(equivalente) + ancla, 1), encoding="utf-8")
    print("franja añadida:", nombre)


if __name__ == "__main__":
    insertar("index.html", '<section class="section circle-bg"', True)
    insertar("buy.html", '<main id="contenido">', False)
