#!/usr/bin/env python3
"""Check that every local href/src in the 7 touched files resolves to a file
that actually exists in the repo. No browser needed."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FILES = [
    "contact.html",
    "nl/contact.html", "fr/contact.html", "it/contact.html", "en/contact.html", "de/contact.html",
    "nl/guia-comprador.html", "fr/guia-comprador.html", "it/guia-comprador.html", "en/guia-comprador.html", "de/guia-comprador.html",
    "index.html",
    "nl/index.html", "fr/index.html", "it/index.html", "en/index.html", "de/index.html",
    "finance.html",
    "nl/finance.html", "fr/finance.html", "it/finance.html", "en/finance.html", "de/finance.html",
]

fallos = []
for rel in FILES:
    p = ROOT / rel
    html = p.read_text(encoding="utf-8")
    for val in re.findall(r'(?:href|src)="([^"]+)"', html):
        if val.startswith(("http://", "https://", "mailto:", "tel:", "#", "data:")):
            continue
        clean = val.split("?")[0].split("#")[0]
        if clean.startswith("/"):
            target = ROOT / clean.lstrip("/")
        else:
            target = (p.parent / clean).resolve()
        if not target.exists():
            fallos.append(f"{rel}: enlace roto -> {val} (resuelto a {target})")

print(f"{len(FILES)} ficheros comprobados.")
if fallos:
    for f in fallos:
        print("✗", f)
    print(f"\n{len(fallos)} enlaces rotos.")
    raise SystemExit(1)
print("✓ 0 enlaces internos rotos.")
