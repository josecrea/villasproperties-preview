#!/usr/bin/env python3
"""Generate nl/fr/it index.html (ronda 3, atelier:villas-idiomas).

Priority-translated: hero, section headers/ledes, capability cards, tools
cards, process steps, advisory ecosystem cards, case study cards, insights
teasers, video section, final CTA, and the selector/hreflang/canonical/
JSON-LD plumbing. Long blocks that are either (a) live customer quotes, or
(b) a dense interactive demo widget, are left in Spanish and explicitly
marked with lang="es" on their wrapping element, per instruction: a marked
block beats a machine translation. header/footer markup doesn't need
translating here because shell.js overwrites both at runtime (already
lang-aware since the previous commit) — this script only needs to leave a
`.lang-switch` placeholder inside `.header` for shell.js to rescue.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
from comun import leer_fuente, traducir, reescribir_rutas
SRC = leer_fuente("index.html")
BASE = "https://villasproperties.es/"

MEMBERS = {
    "es": "", "nl": "nl/index.html", "fr": "fr/index.html", "it": "it/index.html",
    "en": "en/index.html", "de": "de/index.html",
}
PATH_ES = ""  # the ES canonical is the domain root, not /index.html
LABEL = {"es": "ES", "nl": "NL", "fr": "FR", "it": "IT", "en": "EN", "de": "DE"}
FOREIGN_TITLE = {
    "nl": "deze pagina is in het Spaans", "fr": "cette page est en espagnol", "it": "questa pagina è in spagnolo",
    "en": "this page is in Spanish", "de": "diese Seite ist auf Spanisch",
}
OG_LOCALE = {"nl": "nl_NL", "fr": "fr_FR", "it": "it_IT", "en": "en_GB", "de": "de_DE"}

def url_for(lang):
    return BASE + (PATH_ES if lang == "es" else MEMBERS[lang])

def hreflang_block():
    tags = [f'<link rel="alternate" hreflang="es" href="{url_for("es")}">']
    for l in ("nl", "fr", "it", "en", "de"):
        tags.append(f'<link rel="alternate" hreflang="{l}" href="{url_for(l)}">')
    tags.append(f'<link rel="alternate" hreflang="x-default" href="{url_for("es")}">')
    return "".join(tags)

def selector(current):
    items = []
    for l in ("es", "nl", "fr", "it", "en", "de"):
        rel = "self" if l == current else "alternate"
        cur = ' aria-current="true"' if l == current else ""
        items.append(f'<a href="/{MEMBERS[l] or PATH_ES}" hreflang="{l}" rel="{rel}"{cur}>{LABEL[l]}</a>')
    return '<div class="lang-switch" role="navigation" aria-label="Language / Idioma">' + "".join(items) + "</div>"

T = {
    "title": {
        "de": "Immobilienmakler im Süden von Teneriffa | Villa's Properties",
        "en": "Property agency in South Tenerife | Villa's Properties",
        "nl": "Vastgoedmakelaar in Zuid-Tenerife | Villa's Properties",
        "fr": "Agence immobilière dans le Sud de Tenerife | Villa's Properties",
        "it": "Agenzia immobiliare nel Sud di Tenerife | Villa's Properties",
    },
    "desc": {
        "de": 'Immobilienmakler im Süden von Teneriffa mit eigener Marktanalyse: Kauf, Verkauf, Investition und Finanzierung mit echten Daten je Mikrozone.',
        "en": 'Property agency in South Tenerife with its own market analysis: buying, selling, investing and financing with real data for every micro-zone.',
        "nl": "Vastgoedmakelaar in Zuid-Tenerife met eigen marktanalyse: aankoop, verkoop, investering en financiering met echte data per microzone.",
        "fr": "Agence immobilière dans le Sud de Tenerife avec analyse de marché propre : achat, vente, investissement et financement avec des données réelles par micro-zone.",
        "it": "Agenzia immobiliare nel Sud di Tenerife con analisi di mercato propria: acquisto, vendita, investimento e finanziamento con dati reali per ogni microzona.",
    },
    "ASESORAMIENTO INMOBILIARIO CON DATOS · TENERIFE SUR": {
        "de": 'IMMOBILIENBERATUNG MIT DATEN · SÜDEN VON TENERIFFA',
        "en": 'DATA-DRIVEN PROPERTY ADVICE · SOUTH TENERIFE',
        "nl": "VASTGOEDADVIES MET DATA · ZUID-TENERIFE",
        "fr": "CONSEIL IMMOBILIER BASÉ SUR LES DONNÉES · SUD DE TENERIFE",
        "it": "CONSULENZA IMMOBILIARE BASATA SUI DATI · SUD DI TENERIFE",
    },
    # EN deliberately has NO "en" entry here: the hero H1 already cycles to an
    # English phrase (data-alt-en="Tenerife.|Property.|Different.") on the
    # Spanish page via motion.js. Per instruction, en/index.html keeps this
    # block exactly as-is rather than duplicating/translating it.
    'data-alt-es="Inmobiliaria|en Tenerife.|Diferente.">Inmobiliaria<br>en Tenerife.<br>Diferente.</h1>': {
        "de": 'data-alt-es="Immobilien|auf Teneriffa.|Anders.">Immobilien<br>auf Teneriffa.<br>Anders.</h1>',
        "nl": 'data-alt-es="Vastgoed|op Tenerife.|Anders.">Vastgoed<br>op Tenerife.<br>Anders.</h1>',
        "fr": 'data-alt-es="Immobilier|à Tenerife.|Différent.">Immobilier<br>à Tenerife.<br>Différent.</h1>',
        "it": 'data-alt-es="Immobiliare|a Tenerife.|Diverso.">Immobiliare<br>a Tenerife.<br>Diverso.</h1>',
    },
    "Conocimiento local, análisis inmobiliario y ejecución completa para comprar, vender, financiar e invertir mejor en Tenerife.": {
        "de": 'Lokales Wissen, Immobilienanalyse und vollständige Umsetzung, um auf Teneriffa besser zu kaufen, zu verkaufen, zu finanzieren und zu investieren.',
        "en": 'Local knowledge, real-estate analysis and full-service execution to buy, sell, finance and invest better in Tenerife.',
        "nl": "Lokale kennis, vastgoedanalyse en volledige uitvoering om beter te koop, te verkopen, te financieren en te investeren op Tenerife.",
        "fr": "Connaissance locale, analyse immobilière et exécution complète pour mieux acheter, vendre, financer et investir à Tenerife.",
        "it": "Conoscenza locale, analisi immobiliare ed esecuzione completa per comprare, vendere, finanziare e investire meglio a Tenerife.",
    },
    '<span data-drift="20" style="display:inline-block">No vendemos m².</span><br><span data-drift="-28" style="display:inline-block">Interpretamos valor.</span>': {
        "en": '<span data-drift="20" style="display:inline-block">We don\'t sell m².</span><br><span data-drift="-28" style="display:inline-block">We interpret value.</span>',
        "de": '<span data-drift="20" style="display:inline-block">Wir verkaufen keine m².</span><br><span data-drift="-28" style="display:inline-block">Wir interpretieren Wert.</span>',
        "nl": '<span data-drift="20" style="display:inline-block">Wij verkopen geen m².</span><br><span data-drift="-28" style="display:inline-block">Wij interpreteren waarde.</span>',
        "fr": '<span data-drift="20" style="display:inline-block">Nous ne vendons pas des m².</span><br><span data-drift="-28" style="display:inline-block">Nous interprétons la valeur.</span>',
        "it": '<span data-drift="20" style="display:inline-block">Non vendiamo m².</span><br><span data-drift="-28" style="display:inline-block">Interpretiamo il valore.</span>',
    },
    "Una propiedad es ubicación, documentación, demanda, financiación, timing, capital y negociación. Villa’s Properties convierte esas variables en una decisión más clara.": {
        "de": "Eine Immobilie ist Lage, Dokumentation, Nachfrage, Finanzierung, Timing, Kapital und Verhandlung. Villa's Properties macht aus diesen Variablen eine klarere Entscheidung.",
        "en": "A property is location, paperwork, demand, financing, timing, capital and negotiation. Villa's Properties turns those variables into a clearer decision.",
        "nl": "Een woning is locatie, documentatie, vraag, financiering, timing, kapitaal en onderhandeling. Villa's Properties vertaalt die variabelen naar een duidelijkere beslissing.",
        "fr": "Un bien, c'est l'emplacement, les documents, la demande, le financement, le timing, le capital et la négociation. Villa's Properties transforme ces variables en une décision plus claire.",
        "it": "Un immobile è ubicazione, documentazione, domanda, finanziamento, timing, capitale e negoziazione. Villa's Properties trasforma queste variabili in una decisione più chiara.",
    },
    "Una marca.<br>Cuatro decisiones.": {
        "de": 'Eine Marke.<br>Vier Entscheidungen.',
        "en": 'One brand.<br>Four decisions.',
        "nl": "Eén merk.<br>Vier beslissingen.",
        "fr": "Une marque.<br>Quatre décisions.",
        "it": "Un marchio.<br>Quattro decisioni.",
    },
    "Funnels separados para no mezclar las necesidades de quien vende, compra, financia o invierte.": {
        "de": 'Getrennte Prozesse, damit die Bedürfnisse von Verkäufern, Käufern, Finanzierern und Investoren nicht vermischt werden.',
        "en": 'Separate funnels so the needs of sellers, buyers, financers and investors never get mixed up.',
        "nl": "Gescheiden trajecten om de behoeften van verkopers, kopers, financiers en investeerders niet te vermengen.",
        "fr": "Des parcours séparés pour ne pas mélanger les besoins de qui vend, achète, finance ou investit.",
        "it": "Percorsi separati per non confondere le esigenze di chi vende, compra, finanzia o investe.",
    },
    "<h3>Sell</h3><p>Valoración, Market Impact, estrategia, marketing, negociación y cierre.</p>": {
        "de": '<h3>Sell</h3><p>Bewertung, Market Impact, Strategie, Marketing, Verhandlung und Abschluss.</p>',
        "en": '<h3>Sell</h3><p>Valuation, Market Impact, strategy, marketing, negotiation and closing.</p>',
        "nl": "<h3>Sell</h3><p>Waardebepaling, Market Impact, strategie, marketing, onderhandeling en afsluiting.</p>",
        "fr": "<h3>Sell</h3><p>Estimation, Market Impact, stratégie, marketing, négociation et closing.</p>",
        "it": "<h3>Sell</h3><p>Valutazione, Market Impact, strategia, marketing, negoziazione e chiusura.</p>",
    },
    "<h3>Buy</h3><p>Catálogo, Personal Shopper, screening, Due Diligence, oferta y notaría.</p>": {
        "de": '<h3>Buy</h3><p>Katalog, Personal Shopper, Screening, Due Diligence, Angebot und Notar.</p>',
        "en": '<h3>Buy</h3><p>Catalogue, Personal Shopper, screening, Due Diligence, offer and notary.</p>',
        "nl": "<h3>Buy</h3><p>Catalogus, Personal Shopper, screening, Due Diligence, bod en notariële akte.</p>",
        "fr": "<h3>Buy</h3><p>Catalogue, Personal Shopper, screening, Due Diligence, offre et notaire.</p>",
        "it": "<h3>Buy</h3><p>Catalogo, Personal Shopper, screening, Due Diligence, offerta e notaio.</p>",
    },
    "<h3>Finance</h3><p>Capacidad de compra, estructura de financiación y acompañamiento del expediente.</p>": {
        "de": '<h3>Finance</h3><p>Kaufkraft, Finanzierungsstruktur und Begleitung des Dossiers.</p>',
        "en": '<h3>Finance</h3><p>Purchase capacity, financing structure and support through the application.</p>',
        "nl": "<h3>Finance</h3><p>Aankoopcapaciteit, financieringsstructuur en begeleiding van het dossier.</p>",
        "fr": "<h3>Finance</h3><p>Capacité d'achat, structure de financement et accompagnement du dossier.</p>",
        "it": "<h3>Finance</h3><p>Capacità di acquisto, struttura di finanziamento e accompagnamento della pratica.</p>",
    },
    "<h3>Invest</h3><p>Income, Value-add, Development, underwriting y oportunidades off-market.</p>": {
        "de": '<h3>Invest</h3><p>Income, Value-add, Development, Underwriting und Off-Market-Gelegenheiten.</p>',
        "en": '<h3>Invest</h3><p>Income, Value-add, Development, underwriting and off-market opportunities.</p>',
        "nl": "<h3>Invest</h3><p>Income, Value-add, Development, underwriting en off-market kansen.</p>",
        "fr": "<h3>Invest</h3><p>Income, Value-add, Development, underwriting et opportunités off-market.</p>",
        "it": "<h3>Invest</h3><p>Income, Value-add, Development, underwriting e opportunità off-market.</p>",
    },
    "Propiedades con<br>razón de ser.": {
        "de": 'Immobilien mit<br>einem Grund.',
        "en": 'Properties with<br>a reason to exist.',
        "nl": "Woningen met<br>een reden van bestaan.",
        "fr": "Des biens avec<br>une raison d'être.",
        "it": "Immobili con<br>una ragione d'essere.",
    },
    "La Home enseña selección y criterio. El catálogo completo mantiene filtros, estados y búsqueda compartible.": {
        "de": 'Die Startseite zeigt Auswahl und Kriterien. Der vollständige Katalog behält Filter, Status und eine teilbare Suche.',
        "en": 'The homepage shows selection and judgement. The full catalogue keeps its filters, statuses and shareable search.',
        "nl": "De homepage toont selectie en criteria. De volledige catalogus behoudt filters, statussen en een deelbare zoekopdracht.",
        "fr": "La page d'accueil montre une sélection et des critères. Le catalogue complet conserve les filtres, les statuts et une recherche partageable.",
        "it": "La homepage mostra selezione e criterio. Il catalogo completo mantiene filtri, stati e ricerca condivisibile.",
    },
    "Open catalogue ↗": {"nl": "Open catalogue ↗", "fr": "Open catalogue ↗", "it": "Open catalogue ↗", "en": "Open catalogue ↗", "de": "Open catalogue ↗"},
    "Lo dicen ellos,<br>no nosotros.": {
        "de": 'Das sagen sie,<br>nicht wir.',
        "en": 'They say it,<br>not us.',
        "nl": "Zij zeggen het,<br>niet wij.",
        "fr": "Ce sont eux qui le disent,<br>pas nous.",
        "it": "Lo dicono loro,<br>non noi.",
    },
    "Ver las 11 reseñas en Google ↗": {
        "de": 'Alle 11 Bewertungen auf Google ansehen ↗',
        "en": 'See all 11 reviews on Google ↗',
        "nl": "Bekijk alle 11 reviews op Google ↗",
        "fr": "Voir les 11 avis sur Google ↗",
        "it": "Vedi tutte le 11 recensioni su Google ↗",
    },
    "Tres herramientas.<br>Una mejor decisión.": {
        "de": 'Drei Werkzeuge.<br>Eine bessere Entscheidung.',
        "en": 'Three tools.<br>One better decision.',
        "nl": "Drie tools.<br>Een betere beslissing.",
        "fr": "Trois outils.<br>Une meilleure décision.",
        "it": "Tre strumenti.<br>Una decisione migliore.",
    },
    "Las herramientas que ya existen dejan de estar escondidas y pasan a formar parte del producto central de Villa’s Properties.": {
        "de": "Die bereits vorhandenen Werkzeuge sind nicht mehr versteckt und werden Teil des Kernprodukts von Villa's Properties.",
        "en": "The tools that already existed stop being hidden and become part of Villa's Properties' core product.",
        "nl": "De tools die al bestaan, komen uit de schaduw en worden onderdeel van het kernproduct van Villa's Properties.",
        "fr": "Les outils qui existent déjà sortent de l'ombre et deviennent partie du produit central de Villa's Properties.",
        "it": "Gli strumenti che già esistono smettono di essere nascosti e diventano parte del prodotto centrale di Villa's Properties.",
    },
    "<h3>Valoración</h3><p>Estimación gratuita con el €/m² real de tu zona: precio de anuncio, salida realista y contraste de escritura.</p>": {
        "de": '<h3>Bewertung</h3><p>Kostenlose Schätzung mit dem tatsächlichen €/m² Ihrer Zone: Angebotspreis, realistischer Verkaufspreis und Abgleich mit Kaufurkunden.</p>',
        "en": '<h3>Valuation</h3><p>Free estimate with the real €/m² for your area: asking price, a realistic exit price and a comparison against notarised deed prices.</p>',
        "nl": "<h3>Waardebepaling</h3><p>Gratis schatting met de echte €/m² van uw zone: vraagprijs, realistische verkoopprijs en vergelijking met akteprijzen.</p>",
        "fr": "<h3>Estimation</h3><p>Estimation gratuite avec le €/m² réel de votre zone : prix affiché, sortie réaliste et comparaison avec le prix notarié.</p>",
        "it": "<h3>Valutazione</h3><p>Stima gratuita con l'€/m² reale della sua zona: prezzo di annuncio, uscita realistica e confronto con il prezzo di rogito.</p>",
    },
    "Valorar gratis ↗": {"nl": "Gratis waarderen ↗", "fr": "Estimer gratuitement ↗", "it": "Valuta gratis ↗", "en": "Get a free valuation ↗", "de": "Kostenlos bewerten ↗"},
    "<h3>Market<br>Impact</h3><p>Precio publicado, mercado, Registro, alquiler y tiempo de exposición convertidos en contexto de decisión.</p>": {
        "de": '<h3>Market<br>Impact</h3><p>Angebotspreis, Markt, Grundbuch, Miete und Vermarktungsdauer, übersetzt in Entscheidungskontext.</p>',
        "en": '<h3>Market<br>Impact</h3><p>Listed price, market, Land Registry, rent and time on market turned into decision context.</p>',
        "nl": "<h3>Market<br>Impact</h3><p>Gepubliceerde prijs, markt, kadaster, huur en tijd op de markt vertaald naar beslissingscontext.</p>",
        "fr": "<h3>Market<br>Impact</h3><p>Prix publié, marché, registre foncier, loyer et durée d'exposition traduits en contexte de décision.</p>",
        "it": "<h3>Market<br>Impact</h3><p>Prezzo pubblicato, mercato, registro, affitto e tempo di esposizione tradotti in contesto decisionale.</p>",
    },
    "<h3>ACM</h3><p>Análisis comparativo, €/m², escenarios, riesgo y posición del activo frente al mercado.</p>": {
        "de": '<h3>ACM</h3><p>Vergleichsanalyse, €/m², Szenarien, Risiko und Position der Immobilie gegenüber dem Markt.</p>',
        "en": "<h3>ACM</h3><p>Comparative analysis, €/m², scenarios, risk and the asset's position against the market.</p>",
        "nl": "<h3>ACM</h3><p>Vergelijkende analyse, €/m², scenario's, risico en positie van het pand ten opzichte van de markt.</p>",
        "fr": "<h3>ACM</h3><p>Analyse comparative, €/m², scénarios, risque et position de l'actif face au marché.</p>",
        "it": "<h3>ACM</h3><p>Analisi comparativa, €/m², scenari, rischio e posizione dell'immobile rispetto al mercato.</p>",
    },
    "Cinco motores de decisión sobre un mismo activo. Baja y recorre el pipeline completo — <em>datos demo</em>.": {
        "de": 'Fünf Entscheidungsmotoren für dieselbe Immobilie. Scrollen Sie und durchlaufen Sie die gesamte Pipeline — <em>Demodaten</em>.',
        "en": 'Five decision engines on the same asset. Scroll down and go through the whole pipeline — <em>demo data</em>.',
        "nl": "Vijf beslissingsmotoren over hetzelfde pand. Scroll naar beneden en doorloop de hele pipeline — <em>demogegevens</em>.",
        "fr": "Cinq moteurs de décision sur un même actif. Descendez et parcourez tout le pipeline — <em>données de démonstration</em>.",
        "it": "Cinque motori decisionali sullo stesso immobile. Scorri e percorri l'intera pipeline — <em>dati demo</em>.",
    },
    "De la oportunidad<br>a la notaría.": {
        "de": 'Von der Gelegenheit<br>zum Notar.',
        "en": 'From opportunity<br>to the notary.',
        "nl": "Van kans<br>naar notaris.",
        "fr": "De l'opportunité<br>au notaire.",
        "it": "Dall'opportunità<br>al notaio.",
    },
    "<h3>Entender</h3><p class=\"muted\">Objetivo, activo, contexto y restricciones.</p>": {
        "de": '<h3>Verstehen</h3><p class="muted">Ziel, Immobilie, Kontext und Einschränkungen.</p>',
        "en": "<h3>Understand</h3><p class=\"muted\">Goal, asset, context and constraints.</p>",
        "nl": "<h3>Begrijpen</h3><p class=\"muted\">Doel, pand, context en beperkingen.</p>",
        "fr": "<h3>Comprendre</h3><p class=\"muted\">Objectif, actif, contexte et contraintes.</p>",
        "it": "<h3>Capire</h3><p class=\"muted\">Obiettivo, immobile, contesto e vincoli.</p>",
    },
    "<h3>Medir</h3><p class=\"muted\">Mercado, precio, financiación, riesgo y documentación.</p>": {
        "de": '<h3>Messen</h3><p class="muted">Markt, Preis, Finanzierung, Risiko und Dokumentation.</p>',
        "en": "<h3>Measure</h3><p class=\"muted\">Market, price, financing, risk and paperwork.</p>",
        "nl": "<h3>Meten</h3><p class=\"muted\">Markt, prijs, financiering, risico en documentatie.</p>",
        "fr": "<h3>Mesurer</h3><p class=\"muted\">Marché, prix, financement, risque et documentation.</p>",
        "it": "<h3>Misurare</h3><p class=\"muted\">Mercato, prezzo, finanziamento, rischio e documentazione.</p>",
    },
    "<h3>Negociar</h3><p class=\"muted\">Oferta, estrategia, partes, hitos y condiciones.</p>": {
        "de": '<h3>Verhandeln</h3><p class="muted">Angebot, Strategie, Parteien, Meilensteine und Bedingungen.</p>',
        "en": "<h3>Negotiate</h3><p class=\"muted\">Offer, strategy, parties, milestones and terms.</p>",
        "nl": "<h3>Onderhandelen</h3><p class=\"muted\">Bod, strategie, partijen, mijlpalen en voorwaarden.</p>",
        "fr": "<h3>Négocier</h3><p class=\"muted\">Offre, stratégie, parties, étapes et conditions.</p>",
        "it": "<h3>Negoziare</h3><p class=\"muted\">Offerta, strategia, parti, tappe e condizioni.</p>",
    },
    "<h3>Cerrar</h3><p class=\"muted\">Control documental y acompañamiento hasta notaría.</p>": {
        "de": '<h3>Abschließen</h3><p class="muted">Dokumentenkontrolle und Begleitung bis zum Notar.</p>',
        "en": "<h3>Close</h3><p class=\"muted\">Document control and support through to the notary.</p>",
        "nl": "<h3>Afsluiten</h3><p class=\"muted\">Documentcontrole en begeleiding tot bij de notaris.</p>",
        "fr": "<h3>Clôturer</h3><p class=\"muted\">Contrôle documentaire et accompagnement jusqu'au notaire.</p>",
        "it": "<h3>Chiudere</h3><p class=\"muted\">Controllo documentale e accompagnamento fino al notaio.</p>",
    },
    "Más allá del anuncio.": {
        "de": 'Mehr als das Inserat.',
        "en": 'Beyond the listing.',
        "nl": "Meer dan de advertentie.",
        "fr": "Au-delà de l'annonce.",
        "it": "Oltre l'annuncio.",
    },
    "Capacidades que ya existen en el negocio y ahora pasan a tener sitio dentro del sistema V2.": {
        "de": 'Fähigkeiten, die im Unternehmen bereits bestehen und nun einen Platz im V2-System erhalten.',
        "en": 'Capabilities that already existed in the business and now get a proper place inside the V2 system.',
        "nl": "Capaciteiten die al in het bedrijf bestaan en nu een plek krijgen binnen het V2-systeem.",
        "fr": "Des capacités qui existent déjà dans l'entreprise et qui trouvent désormais leur place dans le système V2.",
        "it": "Capacità che esistono già nell'azienda e che ora trovano posto nel sistema V2.",
    },
    "<strong>Due Diligence</strong><p>Registro, Catastro, urbanismo, cargas y documentación.</p>": {
        "de": '<strong>Due Diligence</strong><p>Grundbuch, Kataster, Bauplanung, Lasten und Dokumentation.</p>',
        "en": '<strong>Due Diligence</strong><p>Land Registry, Cadastre, planning, encumbrances and paperwork.</p>',
        "nl": "<strong>Due Diligence</strong><p>Kadaster, stedenbouw, lasten en documentatie.</p>",
        "fr": "<strong>Due Diligence</strong><p>Registre foncier, cadastre, urbanisme, charges et documentation.</p>",
        "it": "<strong>Due Diligence</strong><p>Registro, catasto, urbanistica, oneri e documentazione.</p>",
    },
    "<strong>Personal Shopper</strong><p>Búsqueda, screening y reacción local para compradores.</p>": {
        "de": '<strong>Personal Shopper</strong><p>Suche, Screening und lokale Reaktionsfähigkeit für Käufer.</p>',
        "en": '<strong>Personal Shopper</strong><p>Search, screening and local responsiveness for buyers.</p>',
        "nl": "<strong>Personal Shopper</strong><p>Zoeken, screening en lokale reactiesnelheid voor kopers.</p>",
        "fr": "<strong>Personal Shopper</strong><p>Recherche, screening et réactivité locale pour les acheteurs.</p>",
        "it": "<strong>Personal Shopper</strong><p>Ricerca, screening e reattività locale per gli acquirenti.</p>",
    },
    "<strong>Financiación</strong><p>Capacidad de compra y acompañamiento del expediente.</p>": {
        "de": '<strong>Finanzierung</strong><p>Kaufkraft und Begleitung des Dossiers.</p>',
        "en": '<strong>Financing</strong><p>Purchase capacity and support through the application.</p>',
        "nl": "<strong>Financiering</strong><p>Aankoopcapaciteit en begeleiding van het dossier.</p>",
        "fr": "<strong>Financement</strong><p>Capacité d'achat et accompagnement du dossier.</p>",
        "it": "<strong>Finanziamento</strong><p>Capacità di acquisto e accompagnamento della pratica.</p>",
    },
    "<strong>Value Creation</strong><p>Activos infrautilizados, reconfiguración y desajustes de mercado.</p>": {
        "de": '<strong>Value Creation</strong><p>Unzureichend genutzte Immobilien, Neukonfiguration und Marktungleichgewichte.</p>',
        "en": '<strong>Value Creation</strong><p>Underused assets, reconfiguration and market mismatches.</p>',
        "nl": "<strong>Value Creation</strong><p>Onderbenutte panden, herconfiguratie en marktafwijkingen.</p>",
        "fr": "<strong>Value Creation</strong><p>Actifs sous-exploités, reconfiguration et déséquilibres de marché.</p>",
        "it": "<strong>Value Creation</strong><p>Immobili sottoutilizzati, riconfigurazione e squilibri di mercato.</p>",
    },
    "<strong>Document Control</strong><p>Dossier, hitos, negociación y closing.</p>": {
        "de": '<strong>Document Control</strong><p>Dossier, Meilensteine, Verhandlung und Closing.</p>',
        "en": '<strong>Document Control</strong><p>Dossier, milestones, negotiation and closing.</p>',
        "nl": "<strong>Document Control</strong><p>Dossier, mijlpalen, onderhandeling en closing.</p>",
        "fr": "<strong>Document Control</strong><p>Dossier, étapes, négociation et closing.</p>",
        "it": "<strong>Document Control</strong><p>Pratica, tappe, negoziazione e closing.</p>",
    },
    "Experiencia hecha<br>evidencia.": {
        "de": 'Erfahrung wird<br>zum Beweis.',
        "en": 'Experience turned<br>into evidence.',
        "nl": "Ervaring omgezet<br>in bewijs.",
        "fr": "L'expérience devenue<br>preuve.",
        "it": "Esperienza fatta<br>evidenza.",
    },
    "Casos anonimizados en el prototipo. En producción: contexto, problema, riesgo, estrategia, ejecución y resultado verificable.": {
        "de": 'Anonymisierte Fälle im Prototyp. In der Produktion: Kontext, Problem, Risiko, Strategie, Umsetzung und überprüfbares Ergebnis.',
        "en": 'Anonymised cases in the prototype. In production: context, problem, risk, strategy, execution and a verifiable result.',
        "nl": "Geanonimiseerde cases in het prototype. In productie: context, probleem, risico, strategie, uitvoering en verifieerbaar resultaat.",
        "fr": "Cas anonymisés dans le prototype. En production : contexte, problème, risque, stratégie, exécution et résultat vérifiable.",
        "it": "Casi anonimizzati nel prototipo. In produzione: contesto, problema, rischio, strategia, esecuzione e risultato verificabile.",
    },
    "<h3>Reposicionar antes de bajar precio.</h3><p>Análisis de mercado, documentación y estrategia de salida antes de tocar el precio.</p>": {
        "de": '<h3>Neupositionierung statt Preissenkung.</h3><p>Marktanalyse, Dokumentation und Exit-Strategie, bevor der Preis angefasst wird.</p>',
        "en": '<h3>Repositioning before cutting the price.</h3><p>Market analysis, documentation and exit strategy before touching the price.</p>',
        "nl": "<h3>Herpositioneren vóór een prijsverlaging.</h3><p>Marktanalyse, documentatie en exitstrategie vóór de prijs wordt aangepast.</p>",
        "fr": "<h3>Repositionner avant de baisser le prix.</h3><p>Analyse de marché, documentation et stratégie de sortie avant de toucher au prix.</p>",
        "it": "<h3>Riposizionare prima di abbassare il prezzo.</h3><p>Analisi di mercato, documentazione e strategia di uscita prima di toccare il prezzo.</p>",
    },
    "<h3>Comprar con la documentación clara.</h3><p>Screening, visita, Due Diligence y negociación coordinados antes del compromiso.</p>": {
        "de": '<h3>Kaufen mit klarer Dokumentation.</h3><p>Screening, Besichtigung, Due Diligence und Verhandlung koordiniert, bevor man sich verpflichtet.</p>',
        "en": '<h3>Buying with clear paperwork.</h3><p>Screening, viewing, Due Diligence and negotiation coordinated before any commitment.</p>',
        "nl": "<h3>Kopen met duidelijke documentatie.</h3><p>Screening, bezichtiging, Due Diligence en onderhandeling gecoördineerd vóór de verbintenis.</p>",
        "fr": "<h3>Acheter avec des documents clairs.</h3><p>Screening, visite, Due Diligence et négociation coordonnés avant l'engagement.</p>",
        "it": "<h3>Comprare con la documentazione chiara.</h3><p>Screening, visita, Due Diligence e negoziazione coordinati prima dell'impegno.</p>",
    },
    "<h3>Encontrar valor donde el formato falla.</h3><p>Value-add y reconfiguración como tesis, sin publicar el playbook interno.</p>": {
        "de": '<h3>Wert finden, wo das Format versagt.</h3><p>Value-add und Neukonfiguration als These, ohne das interne Playbook zu veröffentlichen.</p>',
        "en": '<h3>Finding value where the format fails.</h3><p>Value-add and reconfiguration as a thesis, without publishing the internal playbook.</p>',
        "nl": "<h3>Waarde vinden waar het format faalt.</h3><p>Value-add en herconfiguratie als thesis, zonder het interne playbook te publiceren.</p>",
        "fr": "<h3>Trouver de la valeur là où le format échoue.</h3><p>Value-add et reconfiguration comme thèse, sans publier le playbook interne.</p>",
        "it": "<h3>Trovare valore dove il formato fallisce.</h3><p>Value-add e riconfigurazione come tesi, senza pubblicare il playbook interno.</p>",
    },
    "Insights,<br>no relleno.": {
        "de": 'Insights,<br>keine Füllmasse.',
        "en": 'Insights,<br>not filler.',
        "nl": "Insights,<br>geen opvulling.",
        "fr": "Des analyses,<br>pas du remplissage.",
        "it": "Approfondimenti,<br>non riempitivo.",
    },
    "El centro editorial de Villa's Properties: mercado, compra, venta, inversión, financiación y Tenerife.": {
        "de": "Das Redaktionszentrum von Villa's Properties: Markt, Kauf, Verkauf, Investition, Finanzierung und Teneriffa.",
        "en": "Villa's Properties' editorial hub: market, buying, selling, investing, financing and Tenerife.",
        "en": "Villa's Properties' editorial hub: market, buying, selling, investing, financing and Tenerife.",
        "nl": "Het redactionele centrum van Villa's Properties: markt, aankoop, verkoop, investering, financiering en Tenerife.",
        "fr": "Le centre éditorial de Villa's Properties : marché, achat, vente, investissement, financement et Tenerife.",
        "it": "Il centro editoriale di Villa's Properties: mercato, acquisto, vendita, investimento, finanziamento e Tenerife.",
    },
    "Villa’s en dieciocho segundos.": {
        "de": "Villa's in achtzehn Sekunden.",
        "en": "Villa's in eighteen seconds.",
        "nl": "Villa's in achttien seconden.",
        "fr": "Villa's en dix-huit secondes.",
        "it": "Villa's in diciotto secondi.",
    },
    "Lo que hacemos, sin adjetivos: el sur de Tenerife desde el aire y el criterio con el que miramos cada operación.": {
        "de": 'Was wir tun, ohne Adjektive: der Süden von Teneriffa aus der Luft und das Kriterium, mit dem wir jedes Geschäft betrachten.',
        "en": 'What we do, without adjectives: South Tenerife from the air and the judgement we apply to every deal.',
        "nl": "Wat we doen, zonder bijvoeglijke naamwoorden: Zuid-Tenerife vanuit de lucht en het criterium waarmee we elke transactie bekijken.",
        "fr": "Ce que nous faisons, sans adjectifs : le sud de Tenerife vu du ciel et le critère avec lequel nous examinons chaque opération.",
        "it": "Quello che facciamo, senza aggettivi: il sud di Tenerife dall'alto e il criterio con cui guardiamo ogni operazione.",
    },
    "Let’s talk<br>property.": {
        "de": 'Reden wir über<br>Immobilien.',
        "en": "Let's talk<br>property.",
        "nl": "Laten we praten<br>over vastgoed.",
        "fr": "Parlons<br>immobilier.",
        "it": "Parliamo<br>di immobili.",
    },
    "¿Quieres vender, comprar, financiar o analizar una oportunidad inmobiliaria en Tenerife?": {
        "de": 'Möchten Sie eine Immobilienchance auf Teneriffa verkaufen, kaufen, finanzieren oder analysieren?',
        "en": 'Want to sell, buy, finance or analyse a property opportunity in Tenerife?',
        "nl": "Wilt u verkopen, kopen, financieren of een vastgoedkans op Tenerife analyseren?",
        "fr": "Vous souhaitez vendre, acheter, financer ou analyser une opportunité immobilière à Tenerife ?",
        "it": "Vuole vendere, comprare, finanziare o analizzare un'opportunità immobiliare a Tenerife?",
    },
}

OUTBOUND_HREFS = [
    "properties.html", "sell.html", "buy.html", "invest.html", "intelligence.html",
    "insights.html", "finance.html", "valuation.html", "case-studies.html", "advisory.html",
    "property.html", "post-mapa-metro-cuadrado.html", "post-anuncio-vs-escritura.html",
    "post-donde-se-vende-de-verdad.html",
]

SKIP_PREFIXES = ("http://", "https://", "mailto:", "tel:", "#", "/", "data:")


def fix_relative_paths(html: str) -> str:
    return reescribir_rutas(html)


TARJETA_ESCRITURA = (
    '<article class="insight"><span class="eye">Venta</span><div><h3>Lo que pides y lo que se firma.</h3>'
    '<p>Ponderando por operaciones, en el sur se escritura un 21% por debajo del precio de anuncio. '
    'Municipio a municipio.</p></div><a class="eye" href="post-anuncio-vs-escritura.html">Leer el análisis ↗</a></article>'
)
TARJETA_SUR_SUBE = (
    '<article class="insight"><span class="eye">Venta</span><div><h3>El sur sube.</h3>'
    '<p>En el último año el metro cuadrado ha subido en los seis municipios del sur: de +1,9% en San Miguel '
    'de Abona a +5,3% en Guía de Isora (idealista, jul 2026).</p></div>'
    '<a class="eye" href="valuation.html">Valora tu casa ↗</a></article>'
)


def build(lang: str) -> str:
    html = SRC
    html = html.replace('<html lang="es">', f'<html lang="{lang}">', 1)
    html = html.replace('<title>Inmobiliaria en Tenerife Sur | Villa\'s Properties</title>', f'<title>{T["title"][lang]}</title>', 1)
    for key in ("description", ):
        pass
    desc = T["desc"][lang]
    html = html.replace(
        '<meta name="description" content="Inmobiliaria en Tenerife Sur con análisis de mercado propio: compra, venta, inversión y financiación con datos reales de cada microzona.">',
        f'<meta name="description" content="{desc}">',
    )
    html = html.replace('<link rel="canonical" href="https://villasproperties.es/">', f'<link rel="canonical" href="{url_for(lang)}">', 1)
    html = html.replace('<meta property="og:locale" content="es_ES">', f'<meta property="og:locale" content="{OG_LOCALE[lang]}">', 1)
    html = html.replace(
        "<meta property=\"og:title\" content=\"Inmobiliaria en Tenerife Sur | Villa's Properties\">",
        f'<meta property="og:title" content="{T["title"][lang]}">', 1,
    )
    html = html.replace(
        '<meta property="og:description" content="Inmobiliaria en Tenerife Sur con análisis de mercado propio: compra, venta, inversión y financiación con datos reales de cada microzona.">',
        f'<meta property="og:description" content="{desc}">', 1,
    )
    html = html.replace('<meta property="og:url" content="https://villasproperties.es/">', f'<meta property="og:url" content="{url_for(lang)}">', 1)
    html = html.replace(
        "<meta name=\"twitter:title\" content=\"Inmobiliaria en Tenerife Sur | Villa's Properties\">",
        f'<meta name="twitter:title" content="{T["title"][lang]}">', 1,
    )
    html = html.replace(
        '<meta name="twitter:description" content="Inmobiliaria en Tenerife Sur con análisis de mercado propio: compra, venta, inversión y financiación con datos reales de cada microzona.">',
        f'<meta name="twitter:description" content="{desc}">', 1,
    )
    # JSON-LD: unique @id + url + inLanguage per language page (rule: no dup @id across langs)
    html = html.replace(
        '{"@type":"WebSite","@id":"https://villasproperties.es/#website","url":"https://villasproperties.es/","name":"Villa\'s Properties","inLanguage":"es-ES","publisher":{"@id":"https://villasproperties.es/#org"}}',
        f'{{"@type":"WebSite","@id":"{url_for(lang)}#website-{lang}","url":"{url_for(lang)}","name":"Villa\'s Properties","inLanguage":"{lang}-{lang.upper()}","publisher":{{"@id":"https://villasproperties.es/#org"}}}}',
    )
    # hreflang block before </head>
    html = html.replace("</head>", hreflang_block() + "</head>", 1)
    # lang-switch placeholder inside the static header, right after <nav class="nav">
    # (shell.js rescues it before overwriting .header at runtime; see shell.js fix)
    html = re.sub(r'(<header class="header"[^>]*>.*?<nav class="nav">.*?</nav>)', lambda m: m.group(1) + selector(lang), html, count=1, flags=re.S)

    # Regla de negocio (Jose, 27-oct-2026): los datos de portada enganchan, no
    # asustan. Fuera la tarjeta "se escritura un 21% por debajo"; entra "El sur
    # sube" con enlace a la valoración. Solo en las copias traducidas: el
    # index.html español de la raíz se cambia en otro PR.

    # Regla de negocio (Jose, 27-oct-2026): los datos de portada enganchan, no
    # asustan. Fuera la tarjeta "se escritura un 21% por debajo"; entra "El sur
    # sube" con enlace a la valoración. Solo en las copias traducidas: el
    # index.html español de la raíz se cambia en otro PR.
    html = html.replace(TARJETA_ESCRITURA, TARJETA_SUR_SUBE, 1)

    # title/desc ya se aplicaron arriba como sustituciones puntuales de meta.
    html = traducir(html, T, lang, omitir=("title", "desc"))

    # Mark the untranslated blocks explicitly as Spanish (per instruction: a
    # marked block beats a machine translation).
    html = html.replace('<div class="propertygrid" id="propertyGrid">', '<div class="propertygrid" id="propertyGrid" lang="es">', 1)
    html = html.replace('<div class="reviewstage">', '<div class="reviewstage" lang="es">', 1)
    html = html.replace('<div class="is-stage" data-stage>', '<div class="is-stage" data-stage lang="es">', 1)
    html = html.replace('<div class="tf-captions" aria-live="polite">', '<div class="tf-captions" aria-live="polite" lang="es">', 1)
    if lang == "en":
        # Per instruction: don't duplicate/translate the EN/ES hero cycle.
        # It's left exactly as on the Spanish page, so mark it as Spanish.
        html = html.replace(
            '<h1 data-alt-en="Tenerife.|Property.|Different." data-alt-es="Inmobiliaria|en Tenerife.|Diferente.">',
            '<h1 lang="es" data-alt-en="Tenerife.|Property.|Different." data-alt-es="Inmobiliaria|en Tenerife.|Diferente.">',
            1,
        )

    # Mark outbound (ES-only) links with hreflang="es" + localized title.
    foreign_title = FOREIGN_TITLE[lang]
    for href in OUTBOUND_HREFS:
        html = html.replace(f'href="{href}"', f'href="{href}" hreflang="es" title="{foreign_title}"')
        html = html.replace(f'href="{href}?', f'href="{href}?')  # property.html?ref=... handled by prefix match below

    # property.html?ref=... links (query string) — mark too.
    html = re.sub(r'href="(property\.html\?ref=\d+)"', rf'href="\1" hreflang="es" title="{foreign_title}"', html)

    html = fix_relative_paths(html)
    return html


def patch_es() -> str:
    html = SRC
    html = html.replace("</head>", hreflang_block() + "</head>", 1)
    html = re.sub(r'(<header class="header"[^>]*>.*?<nav class="nav">.*?</nav>)', lambda m: m.group(1) + selector("es"), html, count=1, flags=re.S)
    return html


if __name__ == "__main__":
    for lang in ("nl", "fr", "it", "en", "de"):
        out = ROOT / MEMBERS[lang]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(build(lang), encoding="utf-8")
        print("wrote", out)
    (ROOT / "index.html").write_text(patch_es(), encoding="utf-8")
    print("patched index.html (es) with hreflang + selector")
