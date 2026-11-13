#!/usr/bin/env python3
"""Generate nl/fr/it/en/de contact.html from the Spanish source, translating
only text nodes (titles, meta, visible copy). Structure/CSS/JS/attributes are
byte-identical to the ES page except for lang, hreflang, canonical, selector
and the translated strings below. Also rewrites the ES contact.html in place
to add the reciprocal hreflang block + selector."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
from comun import leer_fuente, traducir, reescribir_rutas
SRC = leer_fuente("contact.html")

BASE = "https://villasproperties.es/"
MEMBERS = {
    "es": "contact.html", "nl": "nl/contact.html", "fr": "fr/contact.html",
    "it": "it/contact.html", "en": "en/contact.html", "de": "de/contact.html",
}
LABEL = {"es": "ES", "nl": "NL", "fr": "FR", "it": "IT", "en": "EN", "de": "DE"}
FOREIGN_TITLE = {
    "nl": "deze pagina is in het Spaans",
    "fr": "cette page est en espagnol",
    "it": "questa pagina è in spagnolo",
    "en": "this page is in Spanish",
    "de": "diese Seite ist auf Spanisch",
}


def hreflang_block(lang_for_canonical_check=None):
    tags = [f'<link rel="alternate" hreflang="{l}" href="{BASE}{p}">' for l, p in MEMBERS.items()]
    tags.append(f'<link rel="alternate" hreflang="x-default" href="{BASE}{MEMBERS["es"]}">')
    return "".join(tags)


def selector(current):
    items = []
    for l, p in sorted(MEMBERS.items()):
        rel = "self" if l == current else "alternate"
        cur = ' aria-current="true"' if l == current else ""
        items.append(f'<a href="/{p}" hreflang="{l}" rel="{rel}"{cur}>{LABEL[l]}</a>')
    return '<div class="lang-switch" role="navigation" aria-label="Language / Idioma / Taal">' + "".join(items) + "</div>"


# Translation tables: ES string -> {lang: translation}. Kept literal (no
# invented claims); mirrors exactly what the ES page says.
T = {
    "Contacto con un asesor en Tenerife Sur — Villa’s Properties": {
        "nl": "Contact met een adviseur in Zuid-Tenerife — Villa’s Properties",
        "fr": "Contact avec un conseiller dans le Sud de Tenerife — Villa’s Properties",
        "it": "Contatta un consulente nel Sud di Tenerife — Villa’s Properties",
        "en": "Talk to an advisor in South Tenerife — Villa’s Properties",
        "de": "Kontakt zu einem Berater im Süden von Teneriffa — Villa’s Properties",
    },
    "Habla con un asesor local de Villa’s Properties en Tenerife Sur. Sin llamadas automáticas.": {
        "nl": "Praat met een lokale adviseur van Villa’s Properties in Zuid-Tenerife. Geen automatische oproepen.",
        "fr": "Parlez avec un conseiller local de Villa’s Properties dans le Sud de Tenerife. Aucun appel automatisé.",
        "it": "Parli con un consulente locale di Villa’s Properties nel Sud di Tenerife. Nessuna chiamata automatica.",
        "en": "Talk to a local Villa’s Properties advisor in South Tenerife. No automated calls.",
        "de": "Sprechen Sie mit einem lokalen Berater von Villa’s Properties im Süden von Teneriffa. Keine automatisierten Anrufe.",
    },
    "Saltar al contenido": {
        "nl": "Naar de inhoud", "fr": "Aller au contenu", "it": "Vai al contenuto",
        "en": "Skip to content", "de": "Zum Inhalt springen",
    },
    "START A CONVERSATION": {
        "nl": "START A CONVERSATION", "fr": "START A CONVERSATION", "it": "START A CONVERSATION",
        "en": "START A CONVERSATION", "de": "START A CONVERSATION",
    },
    "Let’s talk<br>property.": {
        "nl": "Laten we praten<br>over vastgoed.",
        "fr": "Parlons<br>immobilier.",
        "it": "Parliamo<br>di immobili.",
        "en": "Let’s talk<br>property.",
        "de": "Reden wir über<br>Immobilien.",
    },
    "Compra, venta, financiación, inversión o análisis. Elige la intención y prepara la conversación correcta desde el principio.": {
        "nl": "Aankoop, verkoop, financiering, investering of analyse. Kies uw doel en begin het gesprek meteen op de juiste manier.",
        "fr": "Achat, vente, financement, investissement ou analyse. Choisissez votre intention et préparez la bonne conversation dès le départ.",
        "it": "Acquisto, vendita, finanziamento, investimento o analisi. Scelga l'obiettivo e prepari la conversazione giusta fin dall'inizio.",
        "en": "Buying, selling, financing, investing or analysis. Choose your intent and start the right conversation from the outset.",
        "de": "Kauf, Verkauf, Finanzierung, Investition oder Analyse. Wählen Sie Ihr Anliegen und beginnen Sie das Gespräch von Anfang an richtig.",
    },
    "<h3>Sell</h3><p>Valoración, Market Impact y estrategia de propietario.</p>": {
        "nl": "<h3>Sell</h3><p>Waardebepaling, Market Impact en eigenaarsstrategie.</p>",
        "fr": "<h3>Sell</h3><p>Estimation, Market Impact et stratégie de propriétaire.</p>",
        "it": "<h3>Sell</h3><p>Valutazione, Market Impact e strategia del proprietario.</p>",
        "en": "<h3>Sell</h3><p>Valuation, Market Impact and owner strategy.</p>",
        "de": "<h3>Sell</h3><p>Bewertung, Market Impact und Eigentümerstrategie.</p>",
    },
    "<h3>Buy</h3><p>Catálogo, Personal Shopper y Due Diligence.</p>": {
        "nl": "<h3>Buy</h3><p>Catalogus, Personal Shopper en Due Diligence.</p>",
        "fr": "<h3>Buy</h3><p>Catalogue, Personal Shopper et Due Diligence.</p>",
        "it": "<h3>Buy</h3><p>Catalogo, Personal Shopper e Due Diligence.</p>",
        "en": "<h3>Buy</h3><p>Catalogue, Personal Shopper and Due Diligence.</p>",
        "de": "<h3>Buy</h3><p>Katalog, Personal Shopper und Due Diligence.</p>",
    },
    "<h3>Finance</h3><p>Capacidad de compra y estructura de financiación.</p>": {
        "nl": "<h3>Finance</h3><p>Aankoopcapaciteit en financieringsstructuur.</p>",
        "fr": "<h3>Finance</h3><p>Capacité d'achat et structure de financement.</p>",
        "it": "<h3>Finance</h3><p>Capacità di acquisto e struttura di finanziamento.</p>",
        "en": "<h3>Finance</h3><p>Purchase capacity and financing structure.</p>",
        "de": "<h3>Finance</h3><p>Kaufkraft und Finanzierungsstruktur.</p>",
    },
    "<h3>Invest</h3><p>Yield, CAPEX, Value-add y oportunidades.</p>": {
        "nl": "<h3>Invest</h3><p>Yield, CAPEX, Value-add en kansen.</p>",
        "fr": "<h3>Invest</h3><p>Yield, CAPEX, Value-add et opportunités.</p>",
        "it": "<h3>Invest</h3><p>Yield, CAPEX, Value-add e opportunità.</p>",
        "en": "<h3>Invest</h3><p>Yield, CAPEX, Value-add and opportunities.</p>",
        "de": "<h3>Invest</h3><p>Yield, CAPEX, Value-add und Gelegenheiten.</p>",
    },
    "Quién está detrás": {
        "nl": "Wie staat hierachter", "fr": "Qui est derrière", "it": "Chi c'è dietro",
        "en": "Who's behind it", "de": "Wer dahintersteht",
    },
    "<h2>Una cara, no un buzón.</h2>": {
        "nl": "<h2>Een gezicht, geen postbus.</h2>",
        "fr": "<h2>Un visage, pas une boîte aux lettres.</h2>",
        "it": "<h2>Un volto, non una casella postale.</h2>",
        "en": "<h2>A face, not a mailbox.</h2>",
        "de": "<h2>Ein Gesicht, kein Briefkasten.</h2>",
    },
    "CEO · Villa’s Properties": {
        "nl": "CEO · Villa’s Properties", "fr": "CEO · Villa’s Properties", "it": "CEO · Villa’s Properties",
        "en": "CEO · Villa’s Properties", "de": "CEO · Villa’s Properties",
    },
    "Valeria Villa creció en Cernobbio, un pueblo del lago de Como pegado a la frontera suiza, donde se aprende pronto que una casa nunca es solo una casa: es el sitio donde alguien decide quedarse.": {
        "nl": "Valeria Villa groeide op in Cernobbio, een dorp aan het Comomeer, vlak bij de Zwitserse grens, waar men al snel leert dat een huis nooit zomaar een huis is: het is de plek waar iemand besluit te blijven.",
        "fr": "Valeria Villa a grandi à Cernobbio, un village du lac de Côme, tout près de la frontière suisse, où l'on apprend vite qu'une maison n'est jamais seulement une maison : c'est l'endroit où quelqu'un décide de rester.",
        "it": "Valeria Villa è cresciuta a Cernobbio, un paese sul lago di Como vicino al confine svizzero, dove si imparano presto che una casa non è mai solo una casa: è il luogo dove qualcuno decide di restare.",
        "en": "Valeria Villa grew up in Cernobbio, a village on Lake Como right on the Swiss border, where you learn early on that a house is never just a house: it's the place where someone decides to stay.",
        "de": "Valeria Villa wuchs in Cernobbio auf, einem Dorf am Comer See direkt an der Schweizer Grenze, wo man früh lernt, dass ein Haus nie nur ein Haus ist: Es ist der Ort, an dem sich jemand entscheidet zu bleiben.",
    },
    "Estudió Antropología en Milán, y esa forma de mirar no la ha abandonado. Antes de hablar de metros y precios, entiende cómo vive una familia, qué la trajo hasta aquí y qué está buscando de verdad cuando dice que quiere «algo con vistas al mar».": {
        "nl": "Ze studeerde Antropologie in Milaan, en die manier van kijken is nooit verdwenen. Vóór ze over vierkante meters en prijzen praat, wil ze begrijpen hoe een gezin leeft, wat hen hierheen heeft gebracht en wat ze werkelijk zoeken als ze zeggen “iets met zeezicht” te willen.",
        "fr": "Elle a étudié l'anthropologie à Milan, et ce regard ne l'a jamais quittée. Avant de parler de mètres carrés et de prix, elle comprend comment vit une famille, ce qui l'a menée jusqu'ici et ce qu'elle recherche vraiment quand elle dit vouloir « quelque chose avec vue sur la mer ».",
        "it": "Ha studiato Antropologia a Milano, e quello sguardo non l'ha mai abbandonata. Prima di parlare di metri e prezzi, capisce come vive una famiglia, cosa l'ha portata fin qui e cosa sta davvero cercando quando dice di volere «qualcosa con vista sul mare».",
        "en": "She studied Anthropology in Milan, and that way of looking at things has never left her. Before talking about square metres and prices, she understands how a family lives, what brought them here, and what they're really looking for when they say they want &ldquo;something with sea views&rdquo;.",
        "de": "Sie studierte Anthropologie in Mailand, und diese Sichtweise hat sie nie verlassen. Bevor sie über Quadratmeter und Preise spricht, versteht sie, wie eine Familie lebt, was sie hierher geführt hat und was sie wirklich sucht, wenn sie sagt, sie wolle &bdquo;etwas mit Meerblick&ldquo;.",
    },
    "Hace una década entró en Century 21, una de las mayores redes inmobiliarias del mundo, y allí aprendió el oficio con su método: cómo se valora un inmueble con datos y no con intuición, cómo se negocia sin romper la confianza de ninguna de las dos partes y cómo se acompaña una operación hasta la firma en notaría.": {
        "nl": "Tien jaar geleden kwam ze bij Century 21, een van de grootste vastgoednetwerken ter wereld, waar ze het vak leerde volgens hun methode: hoe je een pand waardeert met data in plaats van intuïtie, hoe je onderhandelt zonder het vertrouwen van beide partijen te breken, en hoe je een transactie begeleidt tot de ondertekening bij de notaris.",
        "fr": "Il y a dix ans, elle a rejoint Century 21, l'un des plus grands réseaux immobiliers au monde, où elle a appris le métier avec leur méthode : comment estimer un bien avec des données plutôt qu'avec l'intuition, comment négocier sans briser la confiance d'aucune des deux parties, et comment accompagner une opération jusqu'à la signature chez le notaire.",
        "it": "Dieci anni fa è entrata in Century 21, una delle maggiori reti immobiliari del mondo, dove ha imparato il mestiere con il loro metodo: come valutare un immobile con i dati e non con l'intuito, come negoziare senza rompere la fiducia di nessuna delle due parti e come accompagnare un'operazione fino alla firma dal notaio.",
        "en": "A decade ago she joined Century 21, one of the world's largest real estate networks, and there she learned the trade with their method: how to value a property with data rather than intuition, how to negotiate without breaking either side's trust, and how to support a deal through to the notary signing.",
        "de": "Vor einem Jahrzehnt kam sie zu Century 21, einem der größten Immobiliennetzwerke der Welt, und lernte dort das Handwerk nach deren Methode: wie man eine Immobilie anhand von Daten statt Intuition bewertet, wie man verhandelt, ohne das Vertrauen einer der beiden Seiten zu brechen, und wie man ein Geschäft bis zur notariellen Unterschrift begleitet.",
    },
    "Hoy dirige Villa’s Properties en el sur de Tenerife, aplicando esas dos escuelas a la vez: el rigor de una gran firma internacional y la mirada de quien sabe que detrás de cada venta hay una mudanza, una herencia, un divorcio o el principio de una vida nueva.": {
        "nl": "Vandaag leidt ze Villa's Properties in het zuiden van Tenerife, waarbij ze beide scholen combineert: de nauwkeurigheid van een grote internationale firma en de blik van iemand die weet dat achter elke verkoop een verhuizing, een erfenis, een scheiding of het begin van een nieuw leven schuilt.",
        "fr": "Aujourd'hui, elle dirige Villa's Properties dans le sud de Tenerife, en appliquant ces deux écoles à la fois : la rigueur d'une grande entreprise internationale et le regard de quelqu'un qui sait que derrière chaque vente se cache un déménagement, un héritage, un divorce ou le début d'une nouvelle vie.",
        "it": "Oggi dirige Villa's Properties nel sud di Tenerife, applicando entrambe le scuole: il rigore di una grande azienda internazionale e lo sguardo di chi sa che dietro ogni vendita c'è un trasferimento, un'eredità, un divorzio o l'inizio di una vita nuova.",
        "en": "Today she runs Villa's Properties in the south of Tenerife, applying both schools at once: the rigour of a major international firm and the outlook of someone who knows that behind every sale there's a move, an inheritance, a divorce, or the start of a new life.",
        "de": "Heute leitet sie Villa's Properties im Süden von Teneriffa und wendet beide Schulen zugleich an: die Sorgfalt eines großen internationalen Unternehmens und den Blick einer Person, die weiß, dass hinter jedem Verkauf ein Umzug, eine Erbschaft, eine Scheidung oder der Beginn eines neuen Lebens steht.",
    },
    "Del lago de Como al Atlántico, sigue haciendo lo mismo: ayudar a la gente a encontrar su sitio.": {
        "nl": "Van het Comomeer tot de Atlantische Oceaan blijft ze hetzelfde doen: mensen helpen hun plek te vinden.",
        "fr": "Du lac de Côme à l'Atlantique, elle continue de faire la même chose : aider les gens à trouver leur place.",
        "it": "Dal lago di Como all'Atlantico, continua a fare la stessa cosa: aiutare le persone a trovare il proprio posto.",
        "en": "From Lake Como to the Atlantic, she keeps doing the same thing: helping people find their place.",
        "de": "Vom Comer See bis zum Atlantik tut sie weiterhin dasselbe: Menschen helfen, ihren Platz zu finden.",
    },
    "WhatsApp directo ↗": {
        "nl": "Direct WhatsApp ↗", "fr": "WhatsApp direct ↗", "it": "WhatsApp diretto ↗",
        "en": "Direct WhatsApp ↗", "de": "Direkt per WhatsApp ↗",
    },
    "Escríbenos": {
        "nl": "Schrijf ons", "fr": "Écrivez-nous", "it": "Scrivici",
        "en": "Write to us", "de": "Schreiben Sie uns",
    },
    "<h2>Cuéntanos la operación.</h2>": {
        "nl": "<h2>Vertel ons over de transactie.</h2>",
        "fr": "<h2>Parlez-nous de votre projet.</h2>",
        "it": "<h2>Raccontaci la tua operazione.</h2>",
        "en": "<h2>Tell us about it.</h2>",
        "de": "<h2>Erzählen Sie uns von Ihrem Vorhaben.</h2>",
    },
    "Cuanto más concreto, mejor te podemos responder. El mensaje se abre en tu WhatsApp para que veas exactamente qué envías: aquí no hay formulario que guarde tus datos en ningún sitio.": {
        "nl": "Hoe concreter, hoe beter we kunnen antwoorden. Het bericht wordt geopend in uw WhatsApp, zodat u precies ziet wat u verstuurt: er is hier geen formulier dat uw gegevens ergens opslaat.",
        "fr": "Plus c'est précis, mieux nous pourrons vous répondre. Le message s'ouvre dans votre WhatsApp pour que vous voyiez exactement ce que vous envoyez : il n'y a ici aucun formulaire qui enregistre vos données où que ce soit.",
        "it": "Più è concreto, meglio potremo risponderle. Il messaggio si apre nel suo WhatsApp così vede esattamente cosa invia: qui non c'è alcun modulo che salvi i suoi dati in nessun posto.",
        "en": "The more specific you are, the better we can respond. The message opens in your WhatsApp so you can see exactly what you're sending: there's no form here that stores your data anywhere.",
        "de": "Je konkreter, desto besser können wir antworten. Die Nachricht öffnet sich in Ihrem WhatsApp, damit Sie genau sehen, was Sie senden: Hier gibt es kein Formular, das Ihre Daten irgendwo speichert.",
    },
    "Nombre": {"nl": "Naam", "fr": "Nom", "it": "Nome", "en": "Name", "de": "Name"},
    "Teléfono": {"nl": "Telefoon", "fr": "Téléphone", "it": "Telefono", "en": "Phone", "de": "Telefon"},
    "¿Qué necesitas?": {
        "nl": "Wat heeft u nodig?", "fr": "De quoi avez-vous besoin ?", "it": "Di cosa ha bisogno?",
        "en": "What do you need?", "de": "Was brauchen Sie?",
    },
    "Vender una propiedad": {
        "nl": "Een woning verkopen", "fr": "Vendre un bien", "it": "Vendere un immobile",
        "en": "Sell a property", "de": "Eine Immobilie verkaufen",
    },
    "Comprar": {"nl": "Kopen", "fr": "Acheter", "it": "Comprare", "en": "Buy", "de": "Kaufen"},
    "Financiación": {"nl": "Financiering", "fr": "Financement", "it": "Finanziamento", "en": "Financing", "de": "Finanzierung"},
    "Invertir": {"nl": "Investeren", "fr": "Investir", "it": "Investire", "en": "Invest", "de": "Investieren"},
    "Otra cosa": {"nl": "Iets anders", "fr": "Autre chose", "it": "Altro", "en": "Something else", "de": "Etwas anderes"},
    "Tu mensaje": {"nl": "Uw bericht", "fr": "Votre message", "it": "Il suo messaggio", "en": "Your message", "de": "Ihre Nachricht"},
    "Zona, tipo de inmueble, plazo…": {
        "nl": "Zone, type woning, termijn…", "fr": "Zone, type de bien, délai…", "it": "Zona, tipo di immobile, tempistica…",
        "en": "Area, property type, timeframe…", "de": "Gebiet, Immobilientyp, Zeitrahmen…",
    },
    "Abrir en WhatsApp ↗": {
        "nl": "Openen in WhatsApp ↗", "fr": "Ouvrir dans WhatsApp ↗", "it": "Apri in WhatsApp ↗",
        "en": "Open in WhatsApp ↗", "de": "In WhatsApp öffnen ↗",
    },
    "Prefiero email": {
        "nl": "Ik geef de voorkeur aan e-mail", "fr": "Je préfère l'e-mail", "it": "Preferisco l'email",
        "en": "I'd rather email", "de": "Ich bevorzuge E-Mail",
    },
    "No rellenes esto": {
        "nl": "Vul dit niet in", "fr": "Ne remplissez pas ceci", "it": "Non compili questo campo",
        "en": "Don't fill this in", "de": "Dieses Feld nicht ausfüllen",
    },
    "<small>Teléfono</small>": {
        "nl": "<small>Telefoon</small>", "fr": "<small>Téléphone</small>", "it": "<small>Telefono</small>",
        "en": "<small>Phone</small>", "de": "<small>Telefon</small>",
    },
    "<small>Email</small>": {
        "nl": "<small>E-mail</small>", "fr": "<small>E-mail</small>", "it": "<small>Email</small>",
        "en": "<small>Email</small>", "de": "<small>E-Mail</small>",
    },
    "<small>Zona</small><span>Sur de Tenerife · Adeje, Arona, Granadilla, San Miguel, Guía de Isora y Santiago del Teide</span>": {
        "nl": "<small>Zone</small><span>Zuid-Tenerife · Adeje, Arona, Granadilla, San Miguel, Guía de Isora en Santiago del Teide</span>",
        "fr": "<small>Zone</small><span>Sud de Tenerife · Adeje, Arona, Granadilla, San Miguel, Guía de Isora et Santiago del Teide</span>",
        "it": "<small>Zona</small><span>Sud di Tenerife · Adeje, Arona, Granadilla, San Miguel, Guía de Isora e Santiago del Teide</span>",
        "en": "<small>Area</small><span>South Tenerife · Adeje, Arona, Granadilla, San Miguel, Guía de Isora and Santiago del Teide</span>",
        "de": "<small>Gebiet</small><span>Süden von Teneriffa · Adeje, Arona, Granadilla, San Miguel, Guía de Isora und Santiago del Teide</span>",
    },
    "<small>Sociedad</small>": {
        "nl": "<small>Bedrijf</small>", "fr": "<small>Société</small>", "it": "<small>Società</small>",
        "en": "<small>Company</small>", "de": "<small>Unternehmen</small>",
    },
}

OG_LOCALE = {"nl": "nl_NL", "fr": "fr_FR", "it": "it_IT", "en": "en_GB", "de": "de_DE"}


def build(lang: str) -> str:
    html = SRC
    # lang attr
    html = html.replace('<html lang="es">', f'<html lang="{lang}">', 1)
    # og:locale
    html = html.replace('<meta property="og:locale" content="es_ES">', f'<meta property="og:locale" content="{OG_LOCALE[lang]}">')
    # canonical -> self (never to the Spanish page)
    html = html.replace(
        '<link rel="canonical" href="https://villasproperties.es/contact.html">',
        f'<link rel="canonical" href="{BASE}{MEMBERS[lang]}">',
    )
    html = html.replace(
        '<meta property="og:url" content="https://villasproperties.es/contact.html">',
        f'<meta property="og:url" content="{BASE}{MEMBERS[lang]}">',
    )
    html = html.replace(
        '"item":"https://villasproperties.es/contact.html"',
        f'"item":"{BASE}{MEMBERS[lang]}"',
    )
    # title/meta/og/twitter strings + body strings
    html = traducir(html, T, lang)
    # internal links that stay in Spanish (outside the island): mark them.
    foreign_title = FOREIGN_TITLE[lang]

    def mark(html_src, href):
        pattern = f'<a href="{href}">'
        repl = f'<a href="{href}" hreflang="es" title="{foreign_title}">'
        return html_src.replace(pattern, repl)

    for href in ["properties.html", "sell.html", "buy.html", "intelligence.html", "finance.html", "invest.html"]:
        html = mark(html, href)
    html = html.replace(
        '<a class="brand" href="index.html" aria-label="Villa’s Properties">',
        f'<a class="brand" href="index.html" aria-label="Villa’s Properties" hreflang="es" title="{foreign_title}">',
    )
    html = html.replace("</head>", hreflang_block() + "</head>", 1)
    html = re.sub(
        r'(<nav class="nav">.*?</nav>)',
        lambda m: m.group(1) + selector(lang),
        html,
        count=1,
        flags=re.S,
    )
    html = fix_relative_paths(html)
    return html


SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "#", "/", "data:")


def fix_relative_paths(html: str) -> str:
    return reescribir_rutas(html)


def patch_es() -> str:
    html = SRC
    html = html.replace("</head>", hreflang_block() + "</head>", 1)
    html = re.sub(
        r'(<nav class="nav">.*?</nav>)',
        lambda m: m.group(1) + selector("es"),
        html,
        count=1,
        flags=re.S,
    )
    return html


if __name__ == "__main__":
    for lang in ("nl", "fr", "it", "en", "de"):
        out = ROOT / MEMBERS[lang]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(build(lang), encoding="utf-8")
        print("wrote", out)
    (ROOT / "contact.html").write_text(patch_es(), encoding="utf-8")
    print("patched contact.html (es) with hreflang + selector")
