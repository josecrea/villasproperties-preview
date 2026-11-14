#!/usr/bin/env python3
"""Genera it/ nl/ fr/ en/ de/ valuation.html a partir de la española.

Por qué existe: el botón destacado de la cabecera («Valutazione gratuita»,
«Gratis waardebepaling»…) llevaba SIEMPRE a valuation.html en español, porque
la valoración no estaba traducida. Quien navegaba en italiano y lo pulsaba
caía en una página en español.

Dos mitades:
  - el HTML estático se traduce aquí (tabla T);
  - lo que pinta valuation.js / map.js (desplegables, resultado, errores,
    mensaje de WhatsApp) sale de valuation-i18n.js, que estas páginas cargan.

El FAQ del JSON-LD no se traduce aparte: se reconstruye a partir del FAQ
visible ya traducido, así el marcado nunca dice algo distinto de la página.

Es idempotente: se puede ejecutar dos veces seguidas y da los mismos ficheros.
"""
import json
import re
import sys
from pathlib import Path

from comun import leer_fuente, traducir, reescribir_rutas

ROOT = Path(__file__).resolve().parents[2]
BASE = "https://villasproperties.es/"
LANGS = ("it", "nl", "fr", "en", "de")
MEMBERS = {"es": "valuation.html", **{l: f"{l}/valuation.html" for l in LANGS}}
LABEL = {"es": "ES", "nl": "NL", "fr": "FR", "it": "IT", "en": "EN", "de": "DE"}
OG_LOCALE = {"nl": "nl_NL", "fr": "fr_FR", "it": "it_IT", "en": "en_GB", "de": "de_DE"}
INTL = {"nl": "nl-NL", "fr": "fr-FR", "it": "it-IT", "en": "en-GB", "de": "de-DE"}
HOME = {"it": "Home", "nl": "Home", "fr": "Accueil", "en": "Home", "de": "Startseite"}

# (español, it, nl, fr, en, de). El orden importa: primero las cadenas largas.
FILAS = [
    ("Valoración gratis de tu casa en Tenerife Sur — Villa’s Properties",
     "Valutazione gratuita della sua casa a Tenerife Sud — Villa’s Properties",
     "Gratis waardebepaling van uw woning in Zuid-Tenerife — Villa’s Properties",
     "Estimation gratuite de votre bien dans le sud de Tenerife — Villa’s Properties",
     "Free valuation of your home in South Tenerife — Villa’s Properties",
     "Kostenlose Bewertung Ihrer Immobilie im Süden Teneriffas — Villa’s Properties"),
    ("Calcula gratis lo que vale tu vivienda en Tenerife Sur con datos reales: precio de anuncio, salida realista y valor escriturado.",
     "Calcoli gratis quanto vale la sua casa a Tenerife Sud con dati reali: prezzo di annuncio, andamento della zona e prezzo a rogito.",
     "Bereken gratis wat uw woning in Zuid-Tenerife waard is met echte gegevens: vraagprijs, ontwikkeling van de zone en prijs in de akte.",
     "Calculez gratuitement la valeur de votre bien dans le sud de Tenerife avec des données réelles : prix d’annonce, évolution de la zone et prix acté.",
     "Work out for free what your home in South Tenerife is worth with real data: asking price, area trend and price on the deed.",
     "Berechnen Sie kostenlos den Wert Ihrer Immobilie im Süden Teneriffas mit echten Daten: Angebotspreis, Entwicklung der Zone und beurkundeter Preis."),
    ("Saltar al contenido", "Vai al contenuto", "Naar de inhoud", "Aller au contenu", "Skip to content", "Zum Inhalt springen"),
    ("SELL · VALORACIÓN GRATIS", "VENDERE · VALUTAZIONE GRATUITA", "VERKOPEN · GRATIS WAARDEBEPALING",
     "VENDRE · ESTIMATION GRATUITE", "SELL · FREE VALUATION", "VERKAUFEN · KOSTENLOSE BEWERTUNG"),
    ("<h1>Cuánto<br>vale.</h1>", "<h1>Quanto<br>vale.</h1>", "<h1>Wat is het<br>waard.</h1>",
     "<h1>Combien<br>ça vaut.</h1>", "<h1>What it’s<br>worth.</h1>", "<h1>Was sie<br>wert ist.</h1>"),
    ("Estimación gratuita en dos minutos con los datos reales del mercado de Tenerife Sur. Con la cifra de anuncio, la salida realista y lo que de verdad se firma en notaría.",
     "Stima gratuita in due minuti con i dati reali del mercato di Tenerife Sud. Con il prezzo di annuncio, l’andamento della sua zona e ciò che si firma davvero dal notaio.",
     "Gratis schatting in twee minuten met de echte marktgegevens van Zuid-Tenerife. Met de vraagprijs, de ontwikkeling van uw zone en wat er werkelijk bij de notaris wordt getekend.",
     "Estimation gratuite en deux minutes avec les données réelles du marché du sud de Tenerife. Avec le prix d’annonce, l’évolution de votre zone et ce qui se signe réellement chez le notaire.",
     "A free estimate in two minutes using real market data for South Tenerife. With the asking price, how your area is moving and what is actually signed at the notary.",
     "Kostenlose Schätzung in zwei Minuten mit den echten Marktdaten des Südens von Teneriffa. Mit dem Angebotspreis, der Entwicklung Ihrer Zone und dem, was beim Notar tatsächlich unterschrieben wird."),
    ("sin compromiso de venta", "senza impegno di vendita", "geen verkoopverplichting", "sans engagement de vente", "no obligation to sell", "ohne Verkaufsverpflichtung"),
    ("municipios con dato propio", "comuni con dati propri", "gemeenten met eigen gegevens", "communes avec données propres", "municipalities with their own data", "Gemeinden mit eigenen Daten"),
    ("estimación inicial", "stima iniziale", "eerste schatting", "estimation initiale", "initial estimate", "erste Schätzung"),
    ("última actualización del dato", "ultimo aggiornamento dei dati", "laatste update van de gegevens", "dernière mise à jour des données", "latest data update", "letzte Datenaktualisierung"),
    ("Progreso de la valoración", "Avanzamento della valutazione", "Voortgang van de waardebepaling", "Progression de l’estimation", "Valuation progress", "Fortschritt der Bewertung"),
    ("</span> Ubicación</li>", "</span> Posizione</li>", "</span> Locatie</li>", "</span> Emplacement</li>", "</span> Location</li>", "</span> Lage</li>"),
    ("</span> Vivienda</li>", "</span> Immobile</li>", "</span> Woning</li>", "</span> Bien</li>", "</span> Property</li>", "</span> Immobilie</li>"),
    ("</span> Resultado</li>", "</span> Risultato</li>", "</span> Resultaat</li>", "</span> Résultat</li>", "</span> Result</li>", "</span> Ergebnis</li>"),
    ("Estima el valor de mercado de una vivienda en Tenerife Sur a partir del municipio, la zona, el tipo, los metros y el estado. Devuelve un rango en euros con el precio por metro cuadrado de esa microzona y el contraste con el valor real de escritura. Úsala cuando alguien quiera saber cuánto vale su casa o piso en Adeje, Arona, Granadilla de Abona, San Miguel de Abona, Guía de Isora o Santiago del Teide.",
     "Stima il valore di mercato di un’abitazione a Tenerife Sud a partire da comune, zona, tipologia, metri quadrati e stato. Restituisce una fascia in euro con il prezzo al metro quadrato di quella microzona. Da usare quando qualcuno vuole sapere quanto vale la sua casa o il suo appartamento ad Adeje, Arona, Granadilla de Abona, San Miguel de Abona, Guía de Isora o Santiago del Teide.",
     "Schat de marktwaarde van een woning in Zuid-Tenerife op basis van gemeente, zone, type, oppervlakte en staat. Geeft een bandbreedte in euro’s met de vierkantemeterprijs van die microzone. Gebruik dit wanneer iemand wil weten wat zijn huis of appartement waard is in Adeje, Arona, Granadilla de Abona, San Miguel de Abona, Guía de Isora of Santiago del Teide.",
     "Estime la valeur de marché d’un logement dans le sud de Tenerife à partir de la commune, de la zone, du type, de la surface et de l’état. Renvoie une fourchette en euros avec le prix au mètre carré de cette microzone. À utiliser quand quelqu’un veut savoir combien vaut sa maison ou son appartement à Adeje, Arona, Granadilla de Abona, San Miguel de Abona, Guía de Isora ou Santiago del Teide.",
     "Estimates the market value of a home in South Tenerife from the municipality, area, type, floor area and condition. Returns a range in euros with the price per square metre for that micro-area. Use it when someone wants to know what their house or flat is worth in Adeje, Arona, Granadilla de Abona, San Miguel de Abona, Guía de Isora or Santiago del Teide.",
     "Schätzt den Marktwert einer Wohnimmobilie im Süden Teneriffas anhand von Gemeinde, Zone, Objektart, Fläche und Zustand. Liefert eine Spanne in Euro mit dem Quadratmeterpreis dieser Mikrolage. Zu verwenden, wenn jemand wissen möchte, was sein Haus oder seine Wohnung in Adeje, Arona, Granadilla de Abona, San Miguel de Abona, Guía de Isora oder Santiago del Teide wert ist."),
    ("¿Dónde está la vivienda?", "Dove si trova l’immobile?", "Waar ligt de woning?", "Où se trouve le bien ?", "Where is the property?", "Wo liegt die Immobilie?"),
    ("La microzona explica más del precio que los metros. En Arona hay 3.900 €/m² de diferencia entre Playa de las Américas y Arona pueblo.",
     "La microzona spiega il prezzo più dei metri quadrati. Ad Arona ci sono 3.900 €/m² di differenza tra Playa de las Américas e Arona paese.",
     "De microzone verklaart meer van de prijs dan de vierkante meters. In Arona zit er 3.900 €/m² verschil tussen Playa de las Américas en Arona dorp.",
     "La microzone explique davantage le prix que la surface. À Arona, il y a 3 900 €/m² d’écart entre Playa de las Américas et Arona village.",
     "The micro-area explains more of the price than the floor area. In Arona there is a €3,900/m² gap between Playa de las Américas and Arona village.",
     "Die Mikrolage erklärt den Preis stärker als die Quadratmeter. In Arona liegen 3.900 €/m² zwischen Playa de las Américas und Arona Dorf."),
    (">Municipio</label>", ">Comune</label>", ">Gemeente</label>", ">Commune</label>", ">Municipality</label>", ">Gemeinde</label>"),
    (">Zona</label>", ">Zona</label>", ">Zone</label>", ">Zone</label>", ">Area</label>", ">Zone</label>"),
    ('>Calle o urbanización <span class="vw-opt">opcional</span>', '>Via o complesso <span class="vw-opt">facoltativo</span>',
     '>Straat of complex <span class="vw-opt">optioneel</span>', '>Rue ou résidence <span class="vw-opt">facultatif</span>',
     '>Street or complex <span class="vw-opt">optional</span>', '>Straße oder Anlage <span class="vw-opt">optional</span>'),
    ('>Email <span class="vw-opt">opcional</span>', '>Email <span class="vw-opt">facoltativo</span>',
     '>E-mail <span class="vw-opt">optioneel</span>', '>E-mail <span class="vw-opt">facultatif</span>',
     '>Email <span class="vw-opt">optional</span>', '>E-Mail <span class="vw-opt">optional</span>'),
    (">Continuar ↗</button>", ">Continua ↗</button>", ">Verder ↗</button>", ">Continuer ↗</button>", ">Continue ↗</button>", ">Weiter ↗</button>"),
    ("¿Qué estamos valorando?", "Che cosa stiamo valutando?", "Wat waarderen we?", "Qu’estimons-nous ?", "What are we valuing?", "Was bewerten wir?"),
    ("Cuatro datos cambian el resultado de verdad: tipología, superficie, estado y extras con demanda real.",
     "Quattro dati cambiano davvero il risultato: tipologia, superficie, stato ed extra con domanda reale.",
     "Vier gegevens veranderen het resultaat echt: type, oppervlakte, staat en extra’s waar echt vraag naar is.",
     "Quatre données changent vraiment le résultat : type de bien, surface, état et atouts réellement recherchés.",
     "Four details really change the result: type, floor area, condition and extras that are genuinely in demand.",
     "Vier Angaben verändern das Ergebnis wirklich: Objektart, Fläche, Zustand und tatsächlich gefragte Extras."),
    (">Tipología</legend>", ">Tipologia</legend>", ">Type</legend>", ">Type de bien</legend>", ">Type</legend>", ">Objektart</legend>"),
    (">Piso / apartamento</span>", ">Appartamento</span>", ">Appartement</span>", ">Appartement</span>", ">Flat / apartment</span>", ">Wohnung / Apartment</span>"),
    (">Casa / chalet</span>", ">Casa / villetta</span>", ">Huis / chalet</span>", ">Maison / chalet</span>", ">House / chalet</span>", ">Haus / Chalet</span>"),
    (">Terreno u otro</span>", ">Terreno o altro</span>", ">Grond of anders</span>", ">Terrain ou autre</span>", ">Land or other</span>", ">Grundstück oder Sonstiges</span>"),
    (">Superficie construida (m²)</label>", ">Superficie costruita (m²)</label>", ">Bebouwde oppervlakte (m²)</label>",
     ">Surface construite (m²)</label>", ">Built floor area (m²)</label>", ">Bebaute Fläche (m²)</label>"),
    (">Dormitorios</label>", ">Camere da letto</label>", ">Slaapkamers</label>", ">Chambres</label>", ">Bedrooms</label>", ">Schlafzimmer</label>"),
    ("<option>5 o más</option>", "<option>5 o più</option>", "<option>5 of meer</option>", "<option>5 ou plus</option>", "<option>5 or more</option>", "<option>5 oder mehr</option>"),
    (">Estado</label>", ">Stato</label>", ">Staat</label>", ">État</label>", ">Condition</label>", ">Zustand</label>"),
    (">A reformar</option>", ">Da ristrutturare</option>", ">Te renoveren</option>", ">À rénover</option>", ">Needs renovation</option>", ">Renovierungsbedürftig</option>"),
    (">Buen estado</option>", ">Buono stato</option>", ">Goede staat</option>", ">Bon état</option>", ">Good condition</option>", ">Guter Zustand</option>"),
    (">Reformado</option>", ">Ristrutturato</option>", ">Gerenoveerd</option>", ">Rénové</option>", ">Renovated</option>", ">Renoviert</option>"),
    (">Calidades premium</option>", ">Finiture di pregio</option>", ">Luxe afwerking</option>", ">Prestations haut de gamme</option>", ">Premium finishes</option>", ">Hochwertige Ausstattung</option>"),
    (">Extras con demanda</legend>", ">Extra richiesti</legend>", ">Gevraagde extra’s</legend>", ">Atouts recherchés</legend>", ">Extras in demand</legend>", ">Gefragte Extras</legend>"),
    (">Terraza</span>", ">Terrazza</span>", ">Terras</span>", ">Terrasse</span>", ">Terrace</span>", ">Terrasse</span>"),
    (">Ascensor</span>", ">Ascensore</span>", ">Lift</span>", ">Ascenseur</span>", ">Lift</span>", ">Aufzug</span>"),
    (">Vistas al mar</span>", ">Vista mare</span>", ">Zeezicht</span>", ">Vue mer</span>", ">Sea views</span>", ">Meerblick</span>"),
    (">Garaje</span>", ">Garage</span>", ">Garage</span>", ">Garage</span>", ">Garage</span>", ">Garage</span>"),
    (">← Volver</button>", ">← Indietro</button>", ">← Terug</button>", ">← Retour</button>", ">← Back</button>", ">← Zurück</button>"),
    (">Ver mi estimación ↗</button>", ">Vedi la mia stima ↗</button>", ">Bekijk mijn schatting ↗</button>", ">Voir mon estimation ↗</button>", ">See my estimate ↗</button>", ">Meine Schätzung ansehen ↗</button>"),
    (">Revisión local · gratis</div>", ">Revisione locale · gratuita</div>", ">Lokale beoordeling · gratis</div>", ">Examen local · gratuit</div>", ">Local review · free</div>", ">Prüfung vor Ort · kostenlos</div>"),
    ("La cifra abre la conversación. El precio lo decide el mercado de tu calle.",
     "La cifra apre la conversazione. Il prezzo lo decide il mercato della sua via.",
     "Het bedrag opent het gesprek. De prijs wordt bepaald door de markt in uw straat.",
     "Le chiffre ouvre la conversation. Le prix, c’est le marché de votre rue qui le décide.",
     "The figure opens the conversation. The price is decided by the market on your street.",
     "Die Zahl eröffnet das Gespräch. Den Preis bestimmt der Markt in Ihrer Straße."),
    ("Te enviamos la estimación por WhatsApp y un asesor local la revisa con comparables reales, documentación y demanda efectiva. Sin llamadas automáticas.",
     "Le inviamo la stima via WhatsApp e un consulente locale la rivede con comparabili reali, documentazione e domanda effettiva. Nessuna chiamata automatica.",
     "Wij sturen u de schatting via WhatsApp en een lokale adviseur beoordeelt die met echte vergelijkbare objecten, documentatie en daadwerkelijke vraag. Geen geautomatiseerde telefoontjes.",
     "Nous vous envoyons l’estimation par WhatsApp et un conseiller local la vérifie avec des comparables réels, les documents et la demande effective. Aucun appel automatique.",
     "We send you the estimate by WhatsApp and a local adviser reviews it with real comparables, paperwork and actual demand. No automated calls.",
     "Wir senden Ihnen die Schätzung per WhatsApp, und ein Berater vor Ort prüft sie anhand echter Vergleichsobjekte, der Unterlagen und der tatsächlichen Nachfrage. Keine automatischen Anrufe."),
    (">Nombre</label>", ">Nome</label>", ">Naam</label>", ">Nom</label>", ">Name</label>", ">Name</label>"),
    (">Teléfono / WhatsApp</label>", ">Telefono / WhatsApp</label>", ">Telefoon / WhatsApp</label>", ">Téléphone / WhatsApp</label>", ">Phone / WhatsApp</label>", ">Telefon / WhatsApp</label>"),
    ('<span>Acepto la <a href="privacy.html">política de privacidad</a> · <a href="aviso-legal.html">Aviso legal</a> y que Villa’s Properties me contacte sobre esta valoración.</span>',
     '<span>Accetto l’<a href="privacy.html" hreflang="es" title="questa pagina è in spagnolo">informativa sulla privacy</a> · <a href="aviso-legal.html" hreflang="es" title="questa pagina è in spagnolo">Note legali</a> e che Villa’s Properties mi contatti riguardo a questa valutazione.</span>',
     '<span>Ik ga akkoord met het <a href="privacy.html" hreflang="es" title="deze pagina is in het Spaans">privacybeleid</a> · <a href="aviso-legal.html" hreflang="es" title="deze pagina is in het Spaans">Juridische kennisgeving</a> en dat Villa’s Properties contact met mij opneemt over deze waardebepaling.</span>',
     '<span>J’accepte la <a href="privacy.html" hreflang="es" title="cette page est en espagnol">politique de confidentialité</a> · <a href="aviso-legal.html" hreflang="es" title="cette page est en espagnol">Mentions légales</a> et que Villa’s Properties me contacte au sujet de cette estimation.</span>',
     '<span>I accept the <a href="privacy.html" hreflang="es" title="this page is in Spanish">privacy policy</a> · <a href="aviso-legal.html" hreflang="es" title="this page is in Spanish">Legal notice</a> and agree that Villa’s Properties may contact me about this valuation.</span>',
     '<span>Ich akzeptiere die <a href="privacy.html" hreflang="es" title="diese Seite ist auf Spanisch">Datenschutzerklärung</a> · <a href="aviso-legal.html" hreflang="es" title="diese Seite ist auf Spanisch">Impressum</a> und bin einverstanden, dass Villa’s Properties mich zu dieser Bewertung kontaktiert.</span>'),
    (">← Cambiar datos</button>", ">← Modifica i dati</button>", ">← Gegevens wijzigen</button>", ">← Modifier les données</button>", ">← Change details</button>", ">← Angaben ändern</button>"),
    (">Enviar por WhatsApp ↗</button>", ">Invia via WhatsApp ↗</button>", ">Versturen via WhatsApp ↗</button>", ">Envoyer par WhatsApp ↗</button>", ">Send by WhatsApp ↗</button>", ">Per WhatsApp senden ↗</button>"),
    (">Enviado</div>", ">Inviato</div>", ">Verzonden</div>", ">Envoyé</div>", ">Sent</div>", ">Gesendet</div>"),
    ("Ya está en camino.", "È già in arrivo.", "Het is onderweg.", "C’est en route.", "It’s on its way.", "Schon unterwegs."),
    ("Hemos abierto WhatsApp con tu estimación y los datos de la vivienda: solo falta pulsar enviar. Un asesor local revisa el caso y te responde con comparables de tu microzona.",
     "Abbiamo aperto WhatsApp con la sua stima e i dati dell’immobile: basta premere invia. Un consulente locale esamina il caso e le risponde con comparabili della sua microzona.",
     "Wij hebben WhatsApp geopend met uw schatting en de gegevens van de woning: u hoeft alleen nog op verzenden te drukken. Een lokale adviseur bekijkt uw situatie en antwoordt met vergelijkbare objecten uit uw microzone.",
     "Nous avons ouvert WhatsApp avec votre estimation et les données du bien : il ne reste qu’à appuyer sur envoyer. Un conseiller local étudie votre cas et vous répond avec des comparables de votre microzone.",
     "We have opened WhatsApp with your estimate and the property details: just press send. A local adviser reviews your case and replies with comparables from your micro-area.",
     "Wir haben WhatsApp mit Ihrer Schätzung und den Objektdaten geöffnet: Sie müssen nur noch auf Senden tippen. Ein Berater vor Ort prüft Ihren Fall und antwortet mit Vergleichsobjekten aus Ihrer Mikrolage."),
    (">Valorar otra vivienda</button>", ">Valuta un altro immobile</button>", ">Een andere woning waarderen</button>", ">Estimer un autre bien</button>", ">Value another property</button>", ">Weitere Immobilie bewerten</button>"),
    ('href="insights.html">Leer el análisis del mercado ↗</a>',
     'href="insights.html" hreflang="es" title="questa pagina è in spagnolo">Leggi l’analisi del mercato ↗</a>',
     'href="insights.html" hreflang="es" title="deze pagina is in het Spaans">Lees de marktanalyse ↗</a>',
     'href="insights.html" hreflang="es" title="cette page est en espagnol">Lire l’analyse du marché ↗</a>',
     'href="insights.html" hreflang="es" title="this page is in Spanish">Read the market analysis ↗</a>',
     'href="insights.html" hreflang="es" title="diese Seite ist auf Spanisch">Marktanalyse lesen ↗</a>'),
    (">Mapa de precios</div>", ">Mappa dei prezzi</div>", ">Prijzenkaart</div>", ">Carte des prix</div>", ">Price map</div>", ">Preiskarte</div>"),
    ("El sur, zona a zona.", "Il sud, zona per zona.", "Het zuiden, zone voor zone.", "Le sud, zone par zone.", "The south, area by area.", "Der Süden, Zone für Zone."),
    ("Pulsa un municipio para ver su precio de oferta, lo que se firma en escritura, el volumen real de operaciones y el desglose por zona.",
     "Prema su un comune per vedere il prezzo di offerta, ciò che si firma a rogito, il volume reale di compravendite e il dettaglio per zona.",
     "Klik op een gemeente voor de vraagprijs, wat er in de akte wordt getekend, het werkelijke aantal transacties en de uitsplitsing per zone.",
     "Cliquez sur une commune pour voir son prix d’offre, ce qui se signe à l’acte, le volume réel de transactions et le détail par zone.",
     "Click a municipality to see its asking price, what is signed on the deed, the real number of transactions and the breakdown by area.",
     "Klicken Sie auf eine Gemeinde, um den Angebotspreis, den beurkundeten Preis, das tatsächliche Transaktionsvolumen und die Aufschlüsselung nach Zonen zu sehen."),
    ("Mapa de precios por municipio de Tenerife Sur", "Mappa dei prezzi per comune di Tenerife Sud", "Prijzenkaart per gemeente in Zuid-Tenerife",
     "Carte des prix par commune du sud de Tenerife", "Price map by municipality in South Tenerife", "Preiskarte nach Gemeinden im Süden Teneriffas"),
    ("&#10530; Ampliar</button>", "&#10530; Ingrandisci</button>", "&#10530; Vergroten</button>", "&#10530; Agrandir</button>", "&#10530; Enlarge</button>", "&#10530; Vergrößern</button>"),
    (">Método</div>", ">Metodo</div>", ">Methode</div>", ">Méthode</div>", ">Method</div>", ">Methode</div>"),
    ("Tres cifras, no una.", "Tre cifre, non una.", "Drie cijfers, niet één.", "Trois chiffres, pas un.", "Three figures, not one.", "Drei Zahlen, nicht eine."),
    ("Un valorador que solo da un número te está vendiendo una ilusión de precisión. Nosotros te damos el rango, cómo se mueve tu zona y cuánta demanda hay.",
     "Un valutatore che dà un solo numero le sta vendendo un’illusione di precisione. Noi le diamo la fascia, come si muove la sua zona e quanta domanda c’è.",
     "Een waardebepaling die maar één getal geeft, verkoopt u schijnprecisie. Wij geven u de bandbreedte, hoe uw zone zich ontwikkelt en hoeveel vraag er is.",
     "Un estimateur qui ne donne qu’un chiffre vous vend une illusion de précision. Nous vous donnons la fourchette, l’évolution de votre zone et le niveau de demande.",
     "A valuation tool that gives only one number is selling you an illusion of precision. We give you the range, how your area is moving and how much demand there is.",
     "Ein Bewertungstool, das nur eine Zahl nennt, verkauft Ihnen eine Scheingenauigkeit. Wir geben Ihnen die Spanne, die Entwicklung Ihrer Zone und die Höhe der Nachfrage."),
    (">Anuncio</h3>", ">Annuncio</h3>", ">Vraagprijs</h3>", ">Annonce</h3>", ">Asking price</h3>", ">Angebot</h3>"),
    ("El rango al que una vivienda como la tuya se publica hoy, calculado sobre el €/m² real de tu zona y ajustado por tipología, estado y extras.",
     "La fascia a cui oggi si pubblica un immobile come il suo, calcolata sul €/m² reale della sua zona e corretta per tipologia, stato ed extra.",
     "De bandbreedte waarvoor een woning als de uwe vandaag wordt aangeboden, berekend op de werkelijke €/m² van uw zone en gecorrigeerd voor type, staat en extra’s.",
     "La fourchette à laquelle un bien comme le vôtre est publié aujourd’hui, calculée sur le €/m² réel de votre zone et ajustée selon le type, l’état et les atouts.",
     "The range at which a home like yours is listed today, calculated on the real €/m² of your area and adjusted for type, condition and extras.",
     "Die Spanne, zu der eine Immobilie wie Ihre heute angeboten wird, berechnet auf dem echten €/m² Ihrer Zone und angepasst nach Objektart, Zustand und Extras."),
    (">Revalorización</h3>", ">Rivalutazione</h3>", ">Waardestijging</h3>", ">Valorisation</h3>", ">Appreciation</h3>", ">Wertsteigerung</h3>"),
    ("Cómo se ha movido el metro cuadrado en tu municipio en los últimos doce meses, con el dato mensual de idealista.",
     "Come si è mosso il metro quadrato nel suo comune negli ultimi dodici mesi, con il dato mensile di idealista.",
     "Hoe de vierkantemeterprijs in uw gemeente zich de afgelopen twaalf maanden heeft ontwikkeld, met de maandcijfers van idealista.",
     "Comment le mètre carré a évolué dans votre commune sur les douze derniers mois, avec la donnée mensuelle d’idealista.",
     "How the price per square metre has moved in your municipality over the last twelve months, using idealista’s monthly data.",
     "Wie sich der Quadratmeterpreis in Ihrer Gemeinde in den letzten zwölf Monaten entwickelt hat, mit den Monatsdaten von idealista."),
    (">Demanda</h3>", ">Domanda</h3>", ">Vraag</h3>", ">Demande</h3>", ">Demand</h3>", ">Nachfrage</h3>"),
    ("Cuántas viviendas se vendieron en tu municipio el último año, según el Catastro. Es la prueba de que hay comprador.",
     "Quante abitazioni si sono vendute nel suo comune nell’ultimo anno, secondo il Catasto. È la prova che l’acquirente c’è.",
     "Hoeveel woningen er het afgelopen jaar in uw gemeente zijn verkocht, volgens het Kadaster. Het bewijs dat er kopers zijn.",
     "Combien de logements se sont vendus dans votre commune la dernière année, selon le Cadastre. C’est la preuve qu’il y a des acheteurs.",
     "How many homes were sold in your municipality last year, according to the Land Registry (Catastro). Proof that buyers are there.",
     "Wie viele Wohnimmobilien im letzten Jahr in Ihrer Gemeinde verkauft wurden, laut Kataster. Der Beweis, dass es Käufer gibt."),
    (">Abstención</h3>", ">Astensione</h3>", ">Onthouding</h3>", ">Abstention</h3>", ">Abstention</h3>", ">Zurückhaltung</h3>"),
    ("Si tu municipio o tu tipología no tienen dato fiable, no inventamos una cifra. Preferimos decirlo y revisarlo con criterio local.",
     "Se il suo comune o la sua tipologia non hanno un dato affidabile, non inventiamo una cifra. Preferiamo dirlo ed esaminarlo con criterio locale.",
     "Als er voor uw gemeente of type geen betrouwbare gegevens zijn, verzinnen wij geen bedrag. Wij zeggen het liever en bekijken het met lokale kennis.",
     "Si votre commune ou votre type de bien n’a pas de donnée fiable, nous n’inventons pas un chiffre. Nous préférons le dire et l’examiner avec un regard local.",
     "If there is no reliable data for your municipality or type of property, we do not make up a figure. We would rather say so and review it with local judgement.",
     "Wenn es für Ihre Gemeinde oder Objektart keine verlässlichen Daten gibt, erfinden wir keine Zahl. Wir sagen es lieber und prüfen es mit Ortskenntnis."),
    ("Preguntas honestas.", "Domande oneste.", "Eerlijke vragen.", "Questions honnêtes.", "Honest questions.", "Ehrliche Fragen."),
    ("¿Es realmente gratis?", "È davvero gratuita?", "Is het echt gratis?", "Est-ce vraiment gratuit ?", "Is it really free?", "Ist es wirklich kostenlos?"),
    ("Sí. La estimación automática y la primera revisión por un asesor local no tienen coste ni obligan a vender con nosotros.",
     "Sì. La stima automatica e la prima revisione da parte di un consulente locale non hanno alcun costo e non obbligano a vendere con noi.",
     "Ja. De automatische schatting en de eerste beoordeling door een lokale adviseur kosten niets en verplichten u niet om via ons te verkopen.",
     "Oui. L’estimation automatique et le premier examen par un conseiller local ne coûtent rien et n’obligent pas à vendre avec nous.",
     "Yes. The automatic estimate and the first review by a local adviser cost nothing and do not oblige you to sell with us.",
     "Ja. Die automatische Schätzung und die erste Prüfung durch einen Berater vor Ort kosten nichts und verpflichten nicht zum Verkauf über uns."),
    ("¿Esto es una tasación?", "È una perizia?", "Is dit een taxatie?", "Est-ce une expertise ?", "Is this an appraisal?", "Ist das ein Wertgutachten?"),
    ("No. Una tasación homologada (ECO/805/2003) la firma una sociedad de tasación con visita e informe registral. Esto es una estimación de mercado orientativa para tomar decisiones antes de esa fase.",
     "No. Una perizia ufficiale (ECO/805/2003) è firmata da una società di valutazione con sopralluogo e visura. Questa è una stima di mercato indicativa per decidere prima di quella fase.",
     "Nee. Een officiële taxatie (ECO/805/2003) wordt ondertekend door een taxatiebureau, met bezichtiging en kadastrale gegevens. Dit is een indicatieve marktschatting om beslissingen te nemen vóór die fase.",
     "Non. Une expertise officielle (ECO/805/2003) est signée par une société d’expertise, avec visite et relevé du registre. Ceci est une estimation de marché indicative pour décider avant cette étape.",
     "No. An official appraisal (ECO/805/2003) is signed by an appraisal company, with a viewing and a registry report. This is an indicative market estimate to help you decide before that stage.",
     "Nein. Ein amtliches Wertgutachten (ECO/805/2003) wird von einer Bewertungsgesellschaft erstellt, mit Besichtigung und Grundbuchauszug. Dies ist eine unverbindliche Marktschätzung für Entscheidungen vor dieser Phase."),
    ("¿De dónde salen los €/m²?", "Da dove vengono i €/m²?", "Waar komen de €/m² vandaan?", "D’où viennent les €/m² ?", "Where do the €/m² figures come from?", "Woher stammen die €/m²?"),
    ("De cuatro fuentes contrastadas: idealista (oferta), Fotocasa (índice de compra), RealAdvisor (mediana por tipología) y el precio escriturado (valor real de la compraventa). El Catastro aporta el valor de referencia. Se actualizan cada mes.",
     "Da quattro fonti verificate: idealista (offerta), Fotocasa (indice di acquisto), RealAdvisor (mediana per tipologia) e il prezzo a rogito (valore reale della compravendita). Il Catasto fornisce il valore di riferimento. Si aggiornano ogni mese.",
     "Uit vier gecontroleerde bronnen: idealista (aanbod), Fotocasa (koopindex), RealAdvisor (mediaan per type) en de prijs in de akte (werkelijke verkoopwaarde). Het Kadaster levert de referentiewaarde. Ze worden elke maand bijgewerkt.",
     "De quatre sources recoupées : idealista (offre), Fotocasa (indice d’achat), RealAdvisor (médiane par type) et le prix acté (valeur réelle de la vente). Le Cadastre fournit la valeur de référence. Elles sont mises à jour chaque mois.",
     "From four cross-checked sources: idealista (asking prices), Fotocasa (purchase index), RealAdvisor (median by type) and the price on the deed (the real sale value). The Land Registry (Catastro) provides the reference value. They are updated every month.",
     "Aus vier abgeglichenen Quellen: idealista (Angebot), Fotocasa (Kaufindex), RealAdvisor (Median nach Objektart) und dem beurkundeten Preis (tatsächlicher Kaufwert). Das Kataster liefert den Referenzwert. Sie werden monatlich aktualisiert."),
    ("¿Por qué pedís el WhatsApp después de enseñar la cifra?", "Perché chiedete il WhatsApp dopo aver mostrato la cifra?",
     "Waarom vragen jullie WhatsApp nadat het bedrag is getoond?", "Pourquoi demandez-vous le WhatsApp après avoir montré le chiffre ?",
     "Why do you ask for WhatsApp after showing the figure?", "Warum fragen Sie nach WhatsApp, nachdem die Zahl gezeigt wurde?"),
    ("Porque la cifra ya la has visto: no la escondemos detrás del formulario. El teléfono sirve para enviarte el resumen y preparar la revisión con comparables de tu calle.",
     "Perché la cifra l’ha già vista: non la nascondiamo dietro il modulo. Il telefono serve a inviarle il riepilogo e a preparare la revisione con comparabili della sua via.",
     "Omdat u het bedrag al hebt gezien: wij verstoppen het niet achter het formulier. Het telefoonnummer dient om u de samenvatting te sturen en de beoordeling voor te bereiden met vergelijkbare objecten uit uw straat.",
     "Parce que le chiffre, vous l’avez déjà vu : nous ne le cachons pas derrière le formulaire. Le téléphone sert à vous envoyer le récapitulatif et à préparer l’examen avec des comparables de votre rue.",
     "Because you have already seen the figure: we do not hide it behind the form. The phone number is for sending you the summary and preparing the review with comparables from your street.",
     "Weil Sie die Zahl bereits gesehen haben: Wir verstecken sie nicht hinter dem Formular. Die Telefonnummer dient dazu, Ihnen die Zusammenfassung zu senden und die Prüfung mit Vergleichsobjekten aus Ihrer Straße vorzubereiten."),
    ("¿Por qué a veces no dais un número?", "Perché a volte non date un numero?", "Waarom geven jullie soms geen getal?",
     "Pourquoi ne donnez-vous parfois aucun chiffre ?", "Why do you sometimes give no figure?", "Warum nennen Sie manchmal keine Zahl?"),
    ("Porque un terreno, un inmueble singular o un municipio sin serie de datos no se valoran con un €/m² de vivienda. Inventar una cifra ahí sería ruido, no información.",
     "Perché un terreno, un immobile particolare o un comune senza serie di dati non si valutano con un €/m² da abitazione. Inventare una cifra lì sarebbe rumore, non informazione.",
     "Omdat grond, een bijzonder object of een gemeente zonder gegevensreeks niet met een woning-€/m² te waarderen is. Daar een bedrag verzinnen zou ruis zijn, geen informatie.",
     "Parce qu’un terrain, un bien atypique ou une commune sans série de données ne s’évaluent pas avec un €/m² de logement. Y inventer un chiffre serait du bruit, pas de l’information.",
     "Because land, a one-off property or a municipality with no data series cannot be valued with a housing €/m². Making up a figure there would be noise, not information.",
     "Weil sich ein Grundstück, ein Sonderobjekt oder eine Gemeinde ohne Datenreihe nicht mit einem Wohn-€/m² bewerten lassen. Dort eine Zahl zu erfinden wäre Rauschen, keine Information."),
    ("¿Prefieres saltarte el formulario? Cuéntanos la vivienda y la valoramos contigo.",
     "Preferisce saltare il modulo? Ci racconti l’immobile e lo valutiamo insieme a lei.",
     "Slaat u het formulier liever over? Vertel ons over de woning en wij waarderen die samen met u.",
     "Vous préférez éviter le formulaire ? Parlez-nous du bien et nous l’estimons avec vous.",
     "Would you rather skip the form? Tell us about the property and we will value it with you.",
     "Möchten Sie das Formular lieber überspringen? Erzählen Sie uns von der Immobilie und wir bewerten sie gemeinsam mit Ihnen."),
    ("No rellenes esto", "Non compilare questo campo", "Vul dit niet in", "Ne remplissez pas ce champ", "Do not fill this in", "Bitte nicht ausfüllen"),
]
COL = {"it": 1, "nl": 2, "fr": 3, "en": 4, "de": 5}
T = {f[0]: {l: f[i] for l, i in COL.items()} for f in FILAS}

HREFLANG_RE = re.compile(r'<link rel="alternate" hreflang="[^"]+" href="[^"]+">\n?')
SWITCH_RE = re.compile(r'<div class="lang-switch"[^>]*>.*?</div>', re.S)
HEADER_RE = re.compile(r'<header class="header solid">.*?</header>', re.S)
LD_RE = re.compile(r'<script type="application/ld\+json">.*?</script>', re.S)
FAQ_RE = re.compile(r"<details[^>]*><summary>(.*?)<span>\+</span></summary><p>(.*?)</p></details>", re.S)


def fuente() -> str:
    """Española sin hreflang ni selector, venga como venga (pristina o ya parcheada)."""
    html = leer_fuente("valuation.html")
    html = HREFLANG_RE.sub("", html)
    return SWITCH_RE.sub("", html)


def hreflang_block() -> str:
    tags = [f'<link rel="alternate" hreflang="{l}" href="{BASE}{p}">' for l, p in MEMBERS.items()]
    tags.append(f'<link rel="alternate" hreflang="x-default" href="{BASE}{MEMBERS["es"]}">')
    return "".join(tags)


def selector(current: str) -> str:
    items = []
    for l, p in sorted(MEMBERS.items()):
        rel = "self" if l == current else "alternate"
        cur = ' aria-current="true"' if l == current else ""
        items.append(f'<a href="/{p}" hreflang="{l}" rel="{rel}"{cur}>{LABEL[l]}</a>')
    return '<div class="lang-switch" role="navigation" aria-label="Language / Idioma">' + "".join(items) + "</div>"


def ld_json(html: str, lang: str) -> str:
    """JSON-LD del idioma, con el FAQ sacado del FAQ visible ya traducido."""
    faq = [
        {"@type": "Question", "name": q.strip(), "acceptedAnswer": {"@type": "Answer", "text": a.strip()}}
        for q, a in FAQ_RE.findall(html)
    ]
    if len(faq) < 5:
        sys.exit(f"[{lang}] solo {len(faq)} preguntas en el FAQ visible; se esperaban 5")
    titulo = T["Valoración gratis de tu casa en Tenerife Sur — Villa’s Properties"][lang].split(" — ")[0]
    grafo = {
        "@context": "https://schema.org",
        "@graph": [
            {"@id": f"{BASE}#org", "@type": "RealEstateAgent", "name": "Villa's Properties", "url": BASE},
            {"@type": "FAQPage", "inLanguage": lang, "mainEntity": faq},
            {"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": HOME[lang], "item": f"{BASE}{lang}/"},
                {"@type": "ListItem", "position": 2, "name": titulo, "item": f"{BASE}{MEMBERS[lang]}"},
            ]},
        ],
    }
    cuerpo = json.dumps(grafo, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return f'<script type="application/ld+json">{cuerpo}</script>'


def build(lang: str, src: str) -> str:
    html = src.replace('<html lang="es">', f'<html lang="{lang}">', 1)
    html = html.replace('content="es_ES"', f'content="{OG_LOCALE[lang]}"')
    html = html.replace(f"{BASE}valuation.html", f"{BASE}{MEMBERS[lang]}")
    html = traducir(html, T, lang)
    html = LD_RE.sub(lambda _: ld_json(html, lang), html, count=1)
    html = html.replace("new Intl.DateTimeFormat('es-ES'", f"new Intl.DateTimeFormat('{INTL[lang]}'")
    # valuation-i18n.js ANTES de valuation.js y map.js (los tres con defer: orden de documento).
    marca = '<script src="market-data.js'
    if html.count(marca) != 1:
        sys.exit("no encuentro el <script> de market-data.js para colgar valuation-i18n.js")
    version = re.search(r'market-data\.js\?v=(\d+)', html).group(1)
    html = html.replace(marca, f'<script src="valuation-i18n.js?v={version}" defer></script>\n{marca}', 1)
    html = html.replace("</head>", hreflang_block() + "\n</head>", 1)
    # La cabecera estática la sustituye shell.js; solo conserva el selector de idioma.
    html = HEADER_RE.sub(lambda _: f'<header class="header solid">{selector(lang)}</header>', html, count=1)
    html = reescribir_rutas(html)
    # Contacto SÍ existe en cada idioma: el enlace se queda dentro de la carpeta.
    return html.replace('href="../contact.html"', 'href="contact.html"')


def patch_es(src: str) -> str:
    html = src.replace("</head>", hreflang_block() + "\n</head>", 1)
    return html.replace("</header>", selector("es") + "</header>", 1)


def main() -> None:
    src = fuente()
    faltan = [es for es in T if es not in src]
    if faltan:
        sys.exit("Cadenas de la tabla que ya no están en valuation.html (¿cambió el texto español?):\n  - "
                 + "\n  - ".join(faltan))
    for lang in LANGS:
        out = ROOT / MEMBERS[lang]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(build(lang, src), encoding="utf-8")
        print("wrote", out.relative_to(ROOT))
    (ROOT / "valuation.html").write_text(patch_es(src), encoding="utf-8")
    print("patched valuation.html (es) with hreflang + selector")


if __name__ == "__main__":
    main()
