#!/usr/bin/env python3
"""Página de viviendas en cada idioma (de/nl/it/fr).

Las portadas de idioma enseñan las fichas en español. Esta página da a quien
llega de fuera las viviendas en su idioma: textos de `viviendas_i18n.json`
(los del kit de anuncios) y precio, fotos y enlaces de `properties-data.js`,
para que el precio no se quede viejo cuando cambia la ficha.

Uso: python3 tools/i18n/gen_viviendas.py
"""
import html
import json
import re
from pathlib import Path
from urllib.parse import quote

from gen_guia import ROOT_HEADER, SKIP

ROOT = Path(__file__).resolve().parents[2]
BASE = "https://villasproperties.es/"
TELEFONO = "34667384965"
FOTOS = ("01", "03", "04")          # la 02 de Adeje lleva marca de agua de un portal
MIEMBROS = {
    "de": "de/immobilien.html", "nl": "nl/woningen.html",
    "it": "it/immobili.html", "fr": "fr/biens.html",
}
ETIQUETA = {"de": "DE", "nl": "NL", "it": "IT", "fr": "FR"}
OG = {"de": "de_DE", "nl": "nl_NL", "it": "it_IT", "fr": "fr_FR"}
GUIA = "guia-comprador.html"

T = {
    "de": {
        "title": "Immobilien im Süden Teneriffas kaufen | Villa's Properties",
        "desc": "Wohnungen und Lofts zum Kauf im Süden Teneriffas, mit allen Angaben auf Deutsch: Flächen, Energieklasse, Nebenkosten und Lage.",
        "eye": "ZU VERKAUFEN · TENERIFFA SÜD", "h1": "Unsere Immobilien.",
        "lede": "Alle Angaben auf Deutsch. Besichtigung vor Ort oder per Video; Ihre Fragen beantworten wir schriftlich auf Deutsch, per WhatsApp oder E-Mail.",
        "lista": "Objekte", "tag": "Zu verkaufen", "hab": "Schlafzimmer", "ban": ("Bad", "Bäder"), "sup": "bebaut",
        "wa": "Per WhatsApp anfragen", "idealista": "Auf Idealista ansehen ↗", "fotos": "Alle Fotos (Seite auf Spanisch) ↗",
        "msg": "Hallo, ich interessiere mich für „{t}“ ({p}), Ref. {r}.",
        "guia": "Käuferleitfaden: 10 Fragen mit Zahlen →", "foreign": "diese Seite ist auf Spanisch",
        "aviso": "Angaben ohne Gewähr; maßgeblich sind Grundbuchauszug und Kaufvertrag. Wir versprechen keine Ferienvermietung: Nach dem kanarischen Gesetz 6/2025 erlischt eine bestehende Lizenz beim Verkauf.",
        "cta": "Frage per WhatsApp ↗",
    },
    "nl": {
        "title": "Woningen te koop in Zuid-Tenerife | Villa's Properties",
        "desc": "Appartementen en lofts te koop in het zuiden van Tenerife, met alle gegevens in het Nederlands: oppervlakte, energielabel, kosten en ligging.",
        "eye": "TE KOOP · TENERIFE ZUID", "h1": "Onze woningen.",
        "lede": "Alle gegevens in het Nederlands. Bezichtiging ter plaatse of per video; uw vragen beantwoorden wij schriftelijk in het Nederlands, via WhatsApp of e-mail.",
        "lista": "Woningen", "tag": "Te koop", "hab": "slaapkamers", "ban": ("badkamer", "badkamers"), "sup": "bebouwd",
        "wa": "Vraag via WhatsApp", "idealista": "Bekijk op Idealista ↗", "fotos": "Alle foto's (pagina in het Spaans) ↗",
        "msg": "Hallo, ik heb interesse in “{t}” ({p}), ref. {r}.",
        "guia": "Gids voor de koper: 10 vragen met cijfers →", "foreign": "deze pagina is in het Spaans",
        "aviso": "Gegevens onder voorbehoud; het kadaster en de koopakte zijn bindend. Wij beloven geen toeristische verhuur: volgens de Canarische wet 6/2025 vervalt een bestaande vergunning bij verkoop.",
        "cta": "Uw vraag via WhatsApp ↗",
    },
    "it": {
        "title": "Case in vendita nel sud di Tenerife | Villa's Properties",
        "desc": "Appartamenti e loft in vendita nel sud di Tenerife, con tutti i dati in italiano: superfici, classe energetica, spese e posizione.",
        "eye": "IN VENDITA · TENERIFE SUD", "h1": "I nostri immobili.",
        "lede": "Tutti i dati in italiano. Visita sul posto o in video; rispondiamo alle sue domande per iscritto in italiano, via WhatsApp o e-mail.",
        "lista": "Immobili", "tag": "In vendita", "hab": "camere", "ban": ("bagno", "bagni"), "sup": "costruiti",
        "wa": "Chieda via WhatsApp", "idealista": "Veda su Idealista ↗", "fotos": "Tutte le foto (pagina in spagnolo) ↗",
        "msg": "Buongiorno, mi interessa «{t}» ({p}), rif. {r}.",
        "guia": "Guida per l'acquirente: 10 domande con i numeri →", "foreign": "questa pagina è in spagnolo",
        "aviso": "Dati indicativi; fanno fede il registro della proprietà e l'atto di compravendita. Non promettiamo l'affitto turistico: con la legge canaria 6/2025 la licenza esistente si estingue con la vendita.",
        "cta": "La sua domanda via WhatsApp ↗",
    },
    "fr": {
        "title": "Biens à vendre dans le sud de Tenerife | Villa's Properties",
        "desc": "Appartements et lofts à vendre dans le sud de Tenerife, avec toutes les informations en français : surfaces, classe énergétique, charges et emplacement.",
        "eye": "À VENDRE · TENERIFE SUD", "h1": "Nos biens.",
        "lede": "Toutes les informations en français. Visite sur place ou en vidéo ; nous répondons à vos questions par écrit en français, par WhatsApp ou e-mail.",
        "lista": "Biens", "tag": "À vendre", "hab": "chambres", "ban": ("salle de bain", "salles de bain"), "sup": "construits",
        "wa": "Demander par WhatsApp", "idealista": "Voir sur Idealista ↗", "fotos": "Toutes les photos (page en espagnol) ↗",
        "msg": "Bonjour, je suis intéressé(e) par « {t} » ({p}), réf. {r}.",
        "guia": "Guide de l'acheteur : 10 questions avec les chiffres →", "foreign": "cette page est en espagnol",
        "aviso": "Informations données à titre indicatif ; le registre de la propriété et l'acte de vente font foi. Nous ne promettons pas de location touristique : avec la loi canarienne 6/2025, la licence existante s'éteint à la vente.",
        "cta": "Votre question par WhatsApp ↗",
    },
}

ESTILO = """<style>
.vl{display:grid;gap:clamp(64px,8vw,120px)}
.vl-item{display:grid;grid-template-columns:1.08fr .92fr;gap:clamp(24px,4vw,64px);align-items:start;padding-top:clamp(28px,3vw,44px);border-top:1px solid var(--line)}
.vl-item:nth-child(even) .vl-fotos{order:2}
.vl-fotos{display:grid;grid-template-columns:1fr 1fr;gap:8px;position:sticky;top:24px}
.vl-fotos img{width:100%;height:100%;object-fit:cover;aspect-ratio:4/3;display:block;background:var(--paper-2)}
.vl-fotos img:first-child{grid-column:1/-1;aspect-ratio:3/2}
.vl-num{font-size:10px;font-weight:600;letter-spacing:.2em;color:var(--atlantic)}
.vl-item h3{font-size:clamp(30px,3.6vw,52px);font-weight:400;line-height:1;letter-spacing:-.045em;margin:10px 0 12px}
.vl-item .price{font-size:clamp(26px,2.6vw,38px);font-weight:400;letter-spacing:-.03em;margin:18px 0 6px}
.vl-datos{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:12px;color:var(--muted);padding:12px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.vl-datos strong{color:var(--ink);font-weight:600}
.vl-item ul{list-style:none;margin:20px 0;padding:0}
.vl-item li{position:relative;padding:9px 0 9px 22px;border-bottom:1px solid var(--line);font-size:15px}
.vl-item li:before{content:"";position:absolute;left:2px;top:17px;width:7px;height:7px;border-radius:50%;background:var(--atlantic)}
.vl-item p.vl-txt{font-size:16px;line-height:1.6;color:var(--muted);max-width:60ch}
.vl-item .propcta{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}
.vl-item .btn{transition:transform .2s ease,opacity .2s ease}
.vl-item .btn:hover{transform:translateY(-2px)}
.vl-item .btn:focus-visible{outline:2px solid var(--atlantic);outline-offset:3px}
.vl-guia{display:inline-block;margin-top:clamp(48px,6vw,80px);font-size:clamp(20px,2.2vw,30px);letter-spacing:-.03em;border-bottom:1px solid currentColor}
@media(max-width:820px){.vl-item{grid-template-columns:1fr}.vl-item:nth-child(even) .vl-fotos{order:0}.vl-fotos{position:static}}
@media(prefers-reduced-motion:reduce){.vl-item .btn{transition:none}}
</style>"""


def leer_fichas():
    """{ref: {slug, price, url, town, zone, beds, baths, built}} desde properties-data.js."""
    fuente = (ROOT / "properties-data.js").read_text(encoding="utf-8")
    fichas = {}
    bloques = re.split(r"(?m)^\s*ref:\s*'", fuente)[1:]
    for bloque in bloques:
        ref = bloque.split("'", 1)[0]

        def campo(nombre, patron=r"'([^']*)'"):
            m = re.search(rf"(?m)^\s*{nombre}:\s*{patron}", bloque)
            return m.group(1) if m else None
        fichas[ref] = {
            "slug": campo("slug"), "url": campo("url"), "town": campo("town"), "zone": campo("zone"),
            "price": campo("price", r"(\d+)"), "beds": campo("beds", r"(\d+)"),
            "baths": campo("baths", r"(\d+)"), "built": campo("built", r"(\d+)"),
        }
    return fichas


def precio(valor):
    return f"{int(valor):,}".replace(",", ".") + " €"


def idealista_en(url, lang):
    """El mismo anuncio de Idealista con la interfaz en el idioma del visitante."""
    m = re.search(r"/inmueble/(\d+)", url or "")
    return f"https://www.idealista.com/{lang}/inmueble/{m.group(1)}/" if m else None


def sin_comunes(textos_por_ref, lang):
    """Quita los párrafos que se repiten en todas las viviendas (van una vez, en la entradilla)."""
    listas = [v[lang]["parrafos"] for v in textos_por_ref.values()]
    comunes = set(listas[0]).intersection(*map(set, listas[1:])) if len(listas) > 1 else set()
    return {ref: [p for p in v[lang]["parrafos"] if p not in comunes] for ref, v in textos_por_ref.items()}


def articulo(i, ref, ficha, texto, parrafos, lang):
    t, e = T[lang], html.escape
    titulo, pvp = texto["titulo"], precio(ficha["price"])
    wa = f"https://wa.me/{TELEFONO}?text=" + quote(t["msg"].format(t=titulo, p=pvp.replace(" ", " "), r=ref))
    fotos = "".join(
        f'<img src="../assets/img/{ficha["slug"]}/{n}.webp" alt="{e(titulo)} · {k + 1}" '
        f'loading="{"eager" if i == 0 and k == 0 else "lazy"}" decoding="async" width="1200" height="800">'
        for k, n in enumerate(FOTOS))
    banos = int(ficha["baths"])
    datos = (f'<span><strong>{ficha["built"]} m²</strong> {e(t["sup"])}</span>'
             f'<span><strong>{ficha["beds"]}</strong> {e(t["hab"])}</span>'
             f'<span><strong>{banos}</strong> {e(t["ban"][0 if banos == 1 else 1])}</span>'
             f'<span>Ref. <strong>{e(ref)}</strong></span>')
    botones = [f'<a class="btn green" href="{e(wa)}" target="_blank" rel="noopener">{e(t["wa"])}</a>']
    enlace = idealista_en(ficha["url"], lang)
    if enlace:
        botones.append(f'<a class="btn" href="{e(enlace)}" target="_blank" rel="noopener">{e(t["idealista"])}</a>')
    botones.append(f'<a class="btn" href="../property.html?ref={e(ref)}" hreflang="es" title="{e(t["foreign"])}">{e(t["fotos"])}</a>')
    return (
        f'<article class="property vl-item" id="{e(ficha["slug"])}" data-ref="{e(ref)}">'
        f'<div class="vl-fotos">{fotos}</div><div>'
        f'<div class="vl-num">{i + 1:02d} · {e(t["tag"])}</div><h3>{e(titulo)}</h3>'
        f'<div class="meta">{e(ficha["zone"])} · {e(ficha["town"])} · Tenerife</div>'
        f'<div class="price">{pvp}</div><div class="vl-datos">{datos}</div>'
        + "".join(f'<p class="vl-txt">{e(p)}</p>' for p in parrafos[:1])
        + "<ul>" + "".join(f"<li>{e(p)}</li>" for p in texto["puntos"]) + "</ul>"
        + "".join(f'<p class="vl-txt">{e(p)}</p>' for p in parrafos[1:])
        + f'<div class="propcta">{"".join(botones)}</div></div></article>')


def hreflang_block():
    return "".join(f'<link rel="alternate" hreflang="{l}" href="{BASE}{p}">' for l, p in MIEMBROS.items())


def selector(actual):
    items = []
    for l, p in sorted(MIEMBROS.items()):
        rel = "self" if l == actual else "alternate"
        cur = ' aria-current="true"' if l == actual else ""
        items.append(f'<a href="/{p}" hreflang="{l}" rel="{rel}"{cur}>{ETIQUETA[l]}</a>')
    return '<div class="lang-switch" role="navigation" aria-label="Language">' + "".join(items) + "</div>"


def build(lang, fichas, textos):
    t = T[lang]
    parrafos = sin_comunes(textos, lang)
    articulos = []
    for i, ref in enumerate(textos):
        if ref not in fichas or not fichas[ref]["price"]:
            raise SystemExit(f"la vivienda {ref} no está (o no tiene precio) en properties-data.js")
        articulos.append(articulo(i, ref, fichas[ref], textos[ref][lang], parrafos[ref], lang))
    cuerpo = (ESTILO
              + f'<div class="head" data-reveal><div class="eye">{len(articulos):02d}</div><div><h2>{html.escape(t["lista"])}</h2></div></div>'
              + f'<div class="vl">{"".join(articulos)}</div>'
              + f'<a class="vl-guia" href="{GUIA}">{html.escape(t["guia"])}</a>')
    pagina = ROOT_HEADER.format(
        lang=lang, title=html.escape(t["title"]), desc=html.escape(t["desc"]), canonical=BASE + MIEMBROS[lang],
        og=OG[lang], hreflang=hreflang_block(), skip=SKIP[lang], foreign_title=t["foreign"],
        selector=selector(lang), eye=t["eye"], h1=html.escape(t["h1"]), lede=html.escape(t["lede"]),
        note="", faq=cuerpo, disclaimer=html.escape(t["aviso"]), cta=html.escape(t["cta"]),
    )
    # vp-lead.js registra en el CRM el interés por WhatsApp de cada vivienda, con su origen.
    version = re.search(r"vp-safe\.js\?v=(\d+)", pagina)
    lead = f'<script src="../vp-lead.js?v={version.group(1)}" defer></script>' if version else ""
    if "vp-lead.js" not in pagina:
        pagina = pagina.replace("</body>", lead + "\n</body>", 1)
    return pagina


def main():
    fichas = leer_fichas()
    textos = json.loads((Path(__file__).parent / "viviendas_i18n.json").read_text(encoding="utf-8"))
    for lang, ruta in MIEMBROS.items():
        destino = ROOT / ruta
        destino.write_text(build(lang, fichas, textos), encoding="utf-8")
        print("wrote", destino.relative_to(ROOT))


if __name__ == "__main__":
    main()
