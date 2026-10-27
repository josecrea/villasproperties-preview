#!/usr/bin/env python3
"""Generate nl/fr/it/en/de finance.html from the Spanish source.

finance.html is the highest legal-risk page in this round: it talks about
money. The ES source contains ONE figure with no visible backing ("Hasta el
100% según perfil" — up to 100% financing depending on profile). Non-resident
buyers (the whole audience of this island) typically get 60-70% per the
buyer's guide already published in nl/fr/it/en/de — a materially different
number. Per instruction: don't translate an unsupported figure, flag it.
That single stat card is therefore left in Spanish, wrapped lang="es", in
every translated page, exactly like the data/quote blocks on other pages.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
from comun import leer_fuente, traducir, reescribir_rutas
SRC = leer_fuente("finance.html")
BASE = "https://villasproperties.es/"

MEMBERS = {
    "es": "finance.html", "nl": "nl/finance.html", "fr": "fr/finance.html",
    "it": "it/finance.html", "en": "en/finance.html", "de": "de/finance.html",
}
LABEL = {"es": "ES", "nl": "NL", "fr": "FR", "it": "IT", "en": "EN", "de": "DE"}
FOREIGN_TITLE = {
    "nl": "deze pagina is in het Spaans", "fr": "cette page est en espagnol", "it": "questa pagina è in spagnolo",
    "en": "this page is in Spanish", "de": "diese Seite ist auf Spanisch",
}
OG_LOCALE = {"nl": "nl_NL", "fr": "fr_FR", "it": "it_IT", "en": "en_GB", "de": "de_DE"}


def hreflang_block():
    tags = [f'<link rel="alternate" hreflang="{l}" href="{BASE}{p}">' for l, p in MEMBERS.items()]
    tags.append(f'<link rel="alternate" hreflang="x-default" href="{BASE}{MEMBERS["es"]}">')
    return "".join(tags)


def selector(current):
    items = []
    for l, p in sorted(MEMBERS.items()):
        rel = "self" if l == current else "alternate"
        cur = ' aria-current="true"' if l == current else ""
        items.append(f'<a href="/{p}" hreflang="{l}" rel="{rel}"{cur}>{LABEL[l]}</a>')
    return '<div class="lang-switch" role="navigation" aria-label="Language / Idioma">' + "".join(items) + "</div>"


T = {
    "Financiación de vivienda en Tenerife — Villa’s Properties": {
        "nl": "Financiering van een woning op Tenerife — Villa’s Properties",
        "fr": "Financement immobilier à Tenerife — Villa’s Properties",
        "it": "Finanziamento della casa a Tenerife — Villa’s Properties",
        "en": "Home financing in Tenerife — Villa’s Properties",
        "de": "Immobilienfinanzierung auf Teneriffa — Villa’s Properties",
    },
    "Financiación inmobiliaria en Tenerife: capacidad de compra real, entrada, cuota y preparación del expediente hipotecario.": {
        "nl": "Vastgoedfinanciering op Tenerife: reële aankoopcapaciteit, eigen inbreng, maandlast en voorbereiding van het hypotheekdossier.",
        "fr": "Financement immobilier à Tenerife : capacité d'achat réelle, apport, mensualité et préparation du dossier hypothécaire.",
        "it": "Finanziamento immobiliare a Tenerife: capacità di acquisto reale, anticipo, rata e preparazione della pratica di mutuo.",
        "en": "Property financing in Tenerife: your real purchase capacity, down payment, monthly instalment and mortgage application preparation.",
        "de": "Immobilienfinanzierung auf Teneriffa: reale Kaufkraft, Eigenkapital, Monatsrate und Vorbereitung des Hypothekendossiers.",
    },
    "Saltar al contenido": {
        "nl": "Naar de inhoud", "fr": "Aller au contenu", "it": "Vai al contenuto",
        "en": "Skip to content", "de": "Zum Inhalt springen",
    },
    "Financiar · compradores": {
        "nl": "Financiering · koper", "fr": "Financement · acheteurs", "it": "Finanziamento · acquirenti",
        "en": "Financing · buyers", "de": "Finanzierung · Käufer",
    },
    "Tu hipoteca, comparada<br>entre veinte bancos.": {
        "nl": "Uw hypotheek,<br>vergeleken tussen twintig banken.",
        "fr": "Votre crédit, comparé<br>entre vingt banques.",
        "it": "Il suo mutuo, confrontato<br>tra venti banche.",
        "en": "Your mortgage, compared<br>across twenty banks.",
        "de": "Ihre Hypothek, verglichen<br>zwischen zwanzig Banken.",
    },
    "Gratis, sin compromiso y sin moverte de casa. Estudiamos tu caso y\n  te decimos qué banco te da las mejores condiciones — no el que más nos convenga.": {
        "nl": "Gratis, zonder verplichting en zonder de deur uit te gaan. Wij bekijken uw situatie en\n  zeggen u welke bank de beste voorwaarden biedt — niet degene die ons het beste uitkomt.",
        "fr": "Gratuit, sans engagement et sans vous déplacer. Nous étudions votre dossier et\n  vous disons quelle banque propose les meilleures conditions — pas celle qui nous convient le mieux.",
        "it": "Gratuito, senza impegno e senza muoversi da casa. Studiamo il suo caso e\n  le diciamo quale banca offre le condizioni migliori — non quella più conveniente per noi.",
        "en": "Free, with no obligation, and without leaving home. We review your case and\n  tell you which bank offers the best terms — not the one that suits us best.",
        "de": "Kostenlos, unverbindlich und ohne das Haus zu verlassen. Wir prüfen Ihren Fall und\n  sagen Ihnen, welche Bank die besten Konditionen bietet — nicht die, die uns am meisten nützt.",
    },
    "Estudiad mi caso, gratis": {
        "nl": "Bekijk mijn situatie, gratis", "fr": "Étudiez mon dossier, gratuit", "it": "Studiate il mio caso, gratis",
        "en": "Review my case, for free", "de": "Prüfen Sie meinen Fall, kostenlos",
    },
    "2 minutos · sin compromiso": {
        "nl": "2 minuten · geen verplichting", "fr": "2 minutes · sans engagement", "it": "2 minuti · senza impegno",
        "en": "2 minutes · no obligation", "de": "2 Minuten · unverbindlich",
    },
    "Prefiero preguntar antes ↗": {
        "nl": "Ik wil eerst iets vragen ↗", "fr": "Je préfère poser une question d'abord ↗", "it": "Preferisco chiedere prima ↗",
        "en": "I'd rather ask a question first ↗", "de": "Ich frage lieber vorher ↗",
    },
    "bancos comparados": {
        "nl": "banken vergeleken", "fr": "banques comparées", "it": "banche confrontate",
        "en": "banks compared", "de": "verglichene Banken",
    },
    "online, sin oficinas": {
        "nl": "online, geen kantoren", "fr": "en ligne, sans agences", "it": "online, senza filiali",
        "en": "online, no branches", "de": "online, ohne Filialen",
    },
    "el estudio no cuesta nada": {
        "nl": "de analyse kost niets", "fr": "l'étude ne coûte rien", "it": "lo studio non costa nulla",
        "en": "the review costs nothing", "de": "die Prüfung kostet nichts",
    },
    "Entre otras, compiten por darte la mejor oferta:": {
        "nl": "Onder andere deze banken strijden om u het beste aanbod te geven:",
        "fr": "Entre autres, elles se disputent pour vous offrir la meilleure offre :",
        "it": "Tra le altre, competono per offrirle la migliore proposta:",
        "en": "Among others, these banks compete to give you the best offer:",
        "de": "Unter anderem konkurrieren diese Banken darum, Ihnen das beste Angebot zu machen:",
    },
    "<b>Un banco te da su oferta.</b><p class=\"muted\">Nosotros te damos la de veinte y te\n    enseñamos cuál sale a cuenta, con los números delante.</p>": {
        "nl": "<b>Eén bank geeft u haar aanbod.</b><p class=\"muted\">Wij geven u dat van twintig en\n    laten zien welk aanbod het voordeligst is, met de cijfers erbij.</p>",
        "fr": "<b>Une banque vous donne son offre.</b><p class=\"muted\">Nous vous donnons celle de vingt et\n    vous montrons laquelle est la plus avantageuse, chiffres à l'appui.</p>",
        "it": "<b>Una banca le dà la sua offerta.</b><p class=\"muted\">Noi le diamo quella di venti e\n    le mostriamo quale conviene davvero, con i numeri alla mano.</p>",
        "en": "<b>One bank gives you its offer.</b><p class=\"muted\">We give you offers from twenty and\n    show you which one actually works out best, with the numbers in front of you.</p>",
        "de": "<b>Eine Bank gibt Ihnen ihr Angebot.</b><p class=\"muted\">Wir geben Ihnen das von zwanzig und\n    zeigen Ihnen, welches sich wirklich lohnt, mit den Zahlen vor sich.</p>",
    },
    "<b>No pagas nada.</b><p class=\"muted\">El estudio es gratis. Si al final no te\n    interesa ninguna, no ha pasado nada.</p>": {
        "nl": "<b>U betaalt niets.</b><p class=\"muted\">De analyse is gratis. Als geen van de aanbiedingen\n    u uiteindelijk interesseert, is er niets verloren.</p>",
        "fr": "<b>Vous ne payez rien.</b><p class=\"muted\">L'étude est gratuite. Si finalement aucune offre\n    ne vous intéresse, il ne s'est rien passé.</p>",
        "it": "<b>Non paga nulla.</b><p class=\"muted\">Lo studio è gratuito. Se alla fine nessuna offerta\n    le interessa, non è successo nulla.</p>",
        "en": "<b>You pay nothing.</b><p class=\"muted\">The review is free. If in the end none of the offers\n    interest you, nothing is lost.</p>",
        "de": "<b>Sie zahlen nichts.</b><p class=\"muted\">Die Prüfung ist kostenlos. Wenn Sie sich am Ende für\n    kein Angebot interessieren, ist nichts passiert.</p>",
    },
    "¿Empezamos<br>por tu caso?": {
        "nl": "Zullen we beginnen<br>met uw situatie?",
        "fr": "On commence<br>par votre dossier ?",
        "it": "Iniziamo<br>dal suo caso?",
        "en": "Shall we start<br>with your case?",
        "de": "Fangen wir<br>mit Ihrem Fall an?",
    },
    "Cuéntanos tu caso en dos minutos. El estudio es gratis y sin compromiso.": {
        "nl": "Vertel ons uw situatie in twee minuten. De analyse is gratis en vrijblijvend.",
        "fr": "Racontez-nous votre dossier en deux minutes. L'étude est gratuite et sans engagement.",
        "it": "Raccontaci il suo caso in due minuti. Lo studio è gratuito e senza impegno.",
        "en": "Tell us about your case in two minutes. The review is free, with no obligation.",
        "de": "Erzählen Sie uns Ihren Fall in zwei Minuten. Die Prüfung ist kostenlos und unverbindlich.",
    },
}

WA_TEXT = {
    "nl": "Hallo, ik heb een vraag over de hypotheek.",
    "fr": "Bonjour, j'ai une question sur le crédit immobilier.",
    "it": "Buongiorno, ho una domanda sul mutuo.",
    "en": "Hi, I have a question about the mortgage.",
    "de": "Hallo, ich habe eine Frage zur Hypothek.",
}

SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "#", "/", "data:")


def fix_relative_paths(html: str) -> str:
    return reescribir_rutas(html)


def build(lang: str) -> str:
    html = SRC
    html = html.replace('<html lang="es">', f'<html lang="{lang}">', 1)
    html = html.replace('<meta property="og:locale" content="es_ES">', f'<meta property="og:locale" content="{OG_LOCALE[lang]}">')
    html = html.replace(
        '<link rel="canonical" href="https://villasproperties.es/finance.html">',
        f'<link rel="canonical" href="{BASE}{MEMBERS[lang]}">',
    )
    html = html.replace(
        '<meta property="og:url" content="https://villasproperties.es/finance.html">',
        f'<meta property="og:url" content="{BASE}{MEMBERS[lang]}">',
    )
    html = html.replace(
        '"item":"https://villasproperties.es/finance.html"',
        f'"item":"{BASE}{MEMBERS[lang]}"',
    )
    html = traducir(html, T, lang)

    # WhatsApp pre-filled message, localized (URL-encoded like the original).
    from urllib.parse import quote
    html = html.replace(
        "https://wa.me/34667384965?text=Hola%2C%20tengo%20una%20duda%20sobre%20la%20hipoteca.",
        f"https://wa.me/34667384965?text={quote(WA_TEXT[lang])}",
    )

    # The ONE unsupported figure on this page ("up to 100% depending on
    # profile" — non-resident buyers typically get 60-70%, per the buyer's
    # guide already published). Don't translate it: mark it as Spanish and
    # flag it in the delivery instead.
    html = html.replace(
        '<div><b>Hasta el 100 % según perfil.</b><p class="muted">Y te decimos desde el principio\n    hasta dónde llegas de verdad, no lo que te gustaría oír.</p></div>',
        '<div lang="es"><b>Hasta el 100 % según perfil.</b><p class="muted">Y te decimos desde el principio\n    hasta dónde llegas de verdad, no lo que te gustaría oír.</p></div>',
        1,
    )

    foreign_title = FOREIGN_TITLE[lang]
    html = html.replace("</head>", hreflang_block() + "</head>", 1)
    # finance.html's header/footer are empty shells filled by shell.js at
    # runtime; the lang-switch has nowhere static to live, so it's injected
    # right after <body> and shell.js's header rebuild will NOT touch it
    # (it lives outside .header, as a fixed strip) — simplest: place it
    # inside <header class="header solid"></header> so shell.js's existing
    # rescue-before-overwrite logic (added in the shell.js fix) picks it up.
    html = html.replace(
        '<header class="header solid"></header>',
        f'<header class="header solid">{selector(lang)}</header>',
        1,
    )
    html = fix_relative_paths(html)
    return html


def patch_es() -> str:
    html = SRC
    html = html.replace("</head>", hreflang_block() + "</head>", 1)
    html = html.replace(
        '<header class="header solid"></header>',
        f'<header class="header solid">{selector("es")}</header>',
        1,
    )
    return html


if __name__ == "__main__":
    for lang in ("nl", "fr", "it", "en", "de"):
        out = ROOT / MEMBERS[lang]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(build(lang), encoding="utf-8")
        print("wrote", out)
    (ROOT / "finance.html").write_text(patch_es(), encoding="utf-8")
    print("patched finance.html (es) with hreflang + selector")
