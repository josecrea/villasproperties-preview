#!/usr/bin/env python3
"""
Build the NL/FR/IT island for villasproperties-preview (OT atelier:villas-idiomas).
Scope: contact.html (es/nl/fr/it) + a new "guia del comprador" page (nl/fr/it only).
Everything else is OUT of scope for this pass (see dev report).

Generates:
  - nl/contact.html, fr/contact.html, it/contact.html
  - nl/guia-comprador.html, fr/guia-comprador.html, it/guia-comprador.html
  - rewrites contact.html (es) to add reciprocal hreflang + language selector
  - injects hreflang block into the generated pages too

The hreflang/selector block is generated from ONE equivalence table (PAGES below),
so reciprocity and "only offer the languages that exist" fall out for free instead
of being hand-maintained per page.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = "https://villasproperties.es/"

# --- equivalence table: one entry per "page group". Each key is the lang code
# used in hreflang; value is the path relative to site root. Add/remove langs
# per group to control exactly who gets offered in the selector (rule #3).
PAGES = {
    "contact": {
        "es": "contact.html",
        "nl": "nl/contact.html",
        "fr": "fr/contact.html",
        "it": "it/contact.html",
    },
    "guia-comprador": {
        # No Spanish source page exists on the site for this one (it's new
        # content derived from internal markdown, not a translation of an
        # existing ES page) -> no x-default, no "es" member. See report.
        "nl": "nl/guia-comprador.html",
        "fr": "fr/guia-comprador.html",
        "it": "it/guia-comprador.html",
    },
}

LANG_LABEL = {"es": "ES", "nl": "NL", "fr": "FR", "it": "IT"}
FOREIGN_TITLE = {
    "es": {"nl": "deze pagina is in het Spaans", "fr": "cette page est en espagnol", "it": "questa pagina è in spagnolo"},
}


def hreflang_block(group):
    """<link rel=alternate> set for every member of a group, reciprocal by construction."""
    members = PAGES[group]
    tags = []
    for lang, path in members.items():
        tags.append(f'<link rel="alternate" hreflang="{lang}" href="{BASE}{path}">')
    if "es" in members:
        tags.append(f'<link rel="alternate" hreflang="x-default" href="{BASE}{members["es"]}">')
    return "\n".join(tags)


def selector_html(group, current_lang):
    """Language selector: only offers languages that exist for THIS group (rule #3)."""
    members = PAGES[group]
    items = []
    for lang, path in sorted(members.items()):
        rel = "self" if lang == current_lang else "alternate"
        aria = ' aria-current="true"' if lang == current_lang else ""
        items.append(
            f'<a href="/{path}" hreflang="{lang}" rel="{rel}"{aria}>{LANG_LABEL[lang]}</a>'
        )
    return (
        '<div class="lang-switch" role="navigation" aria-label="Language / Idioma">'
        + "".join(items)
        + "</div>"
    )


def write(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print("wrote", path.relative_to(ROOT))


if __name__ == "__main__":
    print(hreflang_block("contact"))
    print(selector_html("contact", "nl"))
