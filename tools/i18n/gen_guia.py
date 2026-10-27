#!/usr/bin/env python3
"""Generate nl/fr/it guia-comprador.html — new content (buyer guide), no ES
equivalent exists on the site, so: hreflang only among nl/fr/it, NO x-default
(there is nothing in Spanish to default to on this domain)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = "https://villasproperties.es/"
MEMBERS = {
    "nl": "nl/guia-comprador.html", "fr": "fr/guia-comprador.html", "it": "it/guia-comprador.html",
    "en": "en/guia-comprador.html", "de": "de/guia-comprador.html",
}
LABEL = {"nl": "NL", "fr": "FR", "it": "IT", "en": "EN", "de": "DE"}

TITLE = {
    "nl": "Gids voor de koper — 10 vragen | Villa's Properties",
    "fr": "Guide de l'acheteur — 10 questions | Villa's Properties",
    "it": "Guida per l'acquirente — 10 domande | Villa's Properties",
    "en": "Buyer's guide — 10 questions | Villa's Properties",
    "de": "Käuferleitfaden — 10 Fragen | Villa's Properties",
}
DESC = {
    "nl": "De 10 vragen die Belgische koper ons het meest stellen over een woning kopen in Tenerife: kosten, NIE, hypotheek, belastingen en verhuur.",
    "fr": "Les 10 questions que les acheteurs belges nous posent le plus souvent sur l'achat d'un bien à Tenerife : frais, NIE, crédit, fiscalité et location.",
    "it": "Le 10 domande più frequenti degli acquirenti italiani sull'acquisto di una casa a Tenerife: spese, NIE, mutuo, fiscalità e affitto.",
    "en": "The 10 questions international buyers ask us most about buying a home in Tenerife: costs, NIE, mortgage, tax and renting it out.",
    "de": "Die 10 Fragen, die uns deutsche Käufer am häufigsten zum Hauskauf auf Teneriffa stellen: Kosten, NIE, Hypothek, Steuern und Vermietung.",
}
EYE = {
    "nl": "GIDS VOOR DE KOPER", "fr": "GUIDE DE L'ACHETEUR", "it": "GUIDA PER L'ACQUIRENTE",
    "en": "BUYER'S GUIDE", "de": "KÄUFERLEITFADEN",
}
H1 = {
    "nl": "Een woning kopen<br>in Tenerife.",
    "fr": "Acheter un bien<br>à Tenerife.",
    "it": "Comprare casa<br>a Tenerife.",
    "en": "Buying a home<br>in Tenerife.",
    "de": "Ein Haus kaufen<br>auf Teneriffa.",
}
LEDE = {
    "nl": "10 vragen, met concrete cijfers en zonder beloftes die we niet kunnen waarmaken.",
    "fr": "10 questions, avec des chiffres concrets et sans promesses que nous ne pourrions pas tenir.",
    "it": "10 domande, con numeri concreti e senza promesse che non potremmo mantenere.",
    "en": "10 questions, with real numbers and no promises we couldn't keep.",
    "de": "10 Fragen, mit konkreten Zahlen und ohne Versprechen, die wir nicht halten könnten.",
}
NOTE_NEW_TRANSLATION = {
    "it": "<p class=\"muted\" style=\"margin-top:10px\"><em>Traduzione nuova, in attesa di revisione umana (adattata dalla versione spagnola originale).</em></p>",
}
DISCLAIMER = {
    "nl": "Informatie van algemene aard, geen fiscaal of juridisch advies. Bijgewerkt op 9 oktober 2026.",
    "fr": "Information générale, ni conseil fiscal ni conseil juridique. Mise à jour le 9 octobre 2026.",
    "it": "Informazione di carattere generale, non consulenza fiscale o legale. Aggiornata il 9 ottobre 2026.",
    "en": "General information, not tax or legal advice. Updated on 9 October 2026.",
    "de": "Allgemeine Information, keine Steuer- oder Rechtsberatung. Aktualisiert am 9. Oktober 2026.",
}
WHATSAPP_CTA = {
    "nl": "Stel uw vraag via WhatsApp ↗", "fr": "Posez votre question sur WhatsApp ↗", "it": "Fai la tua domanda su WhatsApp ↗",
    "en": "Ask us on WhatsApp ↗", "de": "Ihre Frage per WhatsApp ↗",
}
FOREIGN_TITLE = {
    "nl": "deze pagina is in het Spaans", "fr": "cette page est en espagnol", "it": "questa pagina è in spagnolo",
    "en": "this page is in Spanish", "de": "diese Seite ist auf Spanisch",
}

# 10-question bodies, already localized/adapted (see sources: GIDS-KOPER-NL.md,
# GUIDE-ACHETEUR-FR.md, and for IT the new adaptation from GUIA-COMPRADOR-BELGA-ES.md)
QA = {
    "nl": [
        ("Wat kost kopen bovenop de prijs?", "Overdrachtsbelasting (ITP) op de Canarische Eilanden: 6,5&nbsp;% op tweedehandswoningen (op de hoogste van prijs of &laquo;valor de referencia&raquo;). Daarbij notaris 600&ndash;1.200&nbsp;&euro;, eigendomsregister 400&ndash;800&nbsp;&euro;, gestor&iacute;a 300&ndash;600&nbsp;&euro; en een onafhankelijke advocaat (&plusmn;&nbsp;1&nbsp;% + IGIC). Reken op &plusmn;&nbsp;8&nbsp;%. Voorbeeld 395.000&nbsp;&euro; &rarr; &plusmn;&nbsp;31.900&nbsp;&euro;. Nieuwbouw: 7&nbsp;% IGIC + AJD in plaats van ITP."),
        ("Heb ik een NIE nodig?", "Ja, v&oacute;&oacute;r de ondertekening. Aan te vragen bij het Spaanse consulaat in Brussel of bij de Polic&iacute;a Nacional in Tenerife; met een volmacht regelt uw advocaat het."),
        ("Moet ik een Spaanse bankrekening openen?", "Niet verplicht: de akte vermeldt de betaalmiddelen en een overschrijving vanuit Belgi&euml; volstaat. Wel handig voor domicili&euml;ring van IBI, syndicuskosten en nutsvoorzieningen."),
        ("Moet ik naar Tenerife komen om te tekenen?", "Nee. Notari&euml;le volmacht in Belgi&euml; + apostille; uw advocaat tekent de akte. Gebruikelijk is &eacute;&eacute;n reis om te bezichtigen."),
        ("Krijg ik een hypotheek?", "Spaanse banken financieren niet-residenten doorgaans tot 60&ndash;70&nbsp;% van de laagste van prijs of schatting. Voorzie 30&ndash;40&nbsp;% eigen middelen plus de &plusmn;&nbsp;8&nbsp;% kosten."),
        ("Wat betaal ik jaarlijks?", "IBI (gemeentebelasting), syndicuskosten (bv. 86&nbsp;&euro;/maand in het pilootappartement), nutsvoorzieningen en de Spaanse niet-residentenbelasting (IRNR, model 210): 19&nbsp;% over 1,1&nbsp;% (of 2&nbsp;%) van de kadastrale waarde. Voorbeeld: kadastrale waarde 120.000&nbsp;&euro; &rarr; &plusmn;&nbsp;251&nbsp;&euro;/jaar."),
        ("En de Belgische fiscus?", "Binnen 4 maanden na de aankoop aangifte bij de FOD Financi&euml;n (Patrimoniumdocumentatie, via MyMinfin); u krijgt een Belgisch kadastraal inkomen. In uw aangifte: vak III, code 1106, met &laquo;vrijstelling met progressievoorbehoud&raquo; (dubbelbelastingverdrag Belgi&euml;&ndash;Spanje). U betaalt niet twee keer, maar het telt mee voor het tarief op uw andere inkomsten."),
        ("Mag ik verhuren aan toeristen (Airbnb)?", "Meestal niet zomaar. Canarische wet 6/2025: toeristische verhuur kan alleen waar het gemeentelijk plan dit uitdrukkelijk toelaat (max.&nbsp;10&nbsp;% van de woningen), de woning minstens 10 jaar oud is en de vergunning geldt 5 jaar; <strong>een bestaande vergunning vervalt bij verkoop</strong> (overgangsbep. 1.11). Bovendien is sinds 3 april 2025 de voorafgaande goedkeuring van de mede-eigenaars met 3/5 vereist (art. 17.12 LPH). Langetermijnverhuur blijft mogelijk. <strong>Wij beloven geen toeristisch rendement.</strong>"),
        ("Wat als ik later verkoop?", "Spanje: 19&nbsp;% op de meerwaarde (EU-inwoners); de koper houdt 3&nbsp;% van de prijs in als voorschot (art. 25.2 TRLIRNR), terugvorderbaar; plus gemeentelijke &laquo;plusval&iacute;a&raquo;. Belgi&euml;: aangifte pro rata voor dat jaar."),
        ("Wat doet Villa's Properties?", "Bezichtiging ter plaatse of via video, documentatie van het pand (eigendomsuittreksel, syndicus, IBI, <strong>energiecertificaat</strong>), coördinatie met uw advocaat en de notaris, begeleiding in het Nederlands. Voorwaarden: vraag het ons."),
    ],
    "fr": [
        ("Combien co&ucirc;te l'achat en plus du prix&nbsp;?", "Droits de mutation (ITP) aux Canaries&nbsp;: 6,5&nbsp;% sur l'ancien (sur le plus &eacute;lev&eacute; du prix ou de la &laquo;&nbsp;valor de referencia&nbsp;&raquo;). S'y ajoutent le notaire 600&ndash;1&nbsp;200&nbsp;&euro;, le registre foncier 400&ndash;800&nbsp;&euro;, la gestor&iacute;a 300&ndash;600&nbsp;&euro; et un avocat ind&eacute;pendant (&plusmn;&nbsp;1&nbsp;% + IGIC). Comptez &plusmn;&nbsp;8&nbsp;%. Exemple 395&nbsp;000&nbsp;&euro; &rarr; &plusmn;&nbsp;31&nbsp;900&nbsp;&euro;. Neuf&nbsp;: IGIC 7&nbsp;% + AJD au lieu de l'ITP."),
        ("Faut-il un NIE&nbsp;?", "Oui, avant la signature. Au consulat d'Espagne &agrave; Bruxelles ou &agrave; la Polic&iacute;a Nacional &agrave; Tenerife&nbsp;; avec une procuration, votre avocat s'en charge."),
        ("Dois-je ouvrir un compte bancaire espagnol&nbsp;?", "Pas obligatoire&nbsp;: l'acte identifie les moyens de paiement et un virement depuis la Belgique suffit. Utile toutefois pour domicilier l'IBI, les charges de copropri&eacute;t&eacute; et les fournitures."),
        ("Dois-je venir &agrave; Tenerife pour signer&nbsp;?", "Non. Procuration notari&eacute;e en Belgique + apostille&nbsp;; votre avocat signe l'acte. L'usage&nbsp;: un seul voyage pour visiter."),
        ("Puis-je obtenir un cr&eacute;dit&nbsp;?", "Les banques espagnoles financent les non-r&eacute;sidents en g&eacute;n&eacute;ral &agrave; 60&ndash;70&nbsp;% du plus bas du prix ou de l'expertise. Pr&eacute;voyez 30&ndash;40&nbsp;% de fonds propres plus &plusmn;&nbsp;8&nbsp;% de frais."),
        ("Que paie-t-on chaque ann&eacute;e&nbsp;?", "IBI (taxe communale), charges de copropri&eacute;t&eacute; (p.&nbsp;ex. 86&nbsp;&euro;/mois pour l'appartement pilote), fournitures et l'imp&ocirc;t espagnol des non-r&eacute;sidents (IRNR, mod&egrave;le 210)&nbsp;: 19&nbsp;% sur 1,1&nbsp;% (ou 2&nbsp;%) de la valeur cadastrale. Exemple&nbsp;: valeur cadastrale 120&nbsp;000&nbsp;&euro; &rarr; &plusmn;&nbsp;251&nbsp;&euro;/an."),
        ("Et le fisc belge&nbsp;?", "D&eacute;clarer l'achat dans les 4 mois au SPF Finances (Documentation patrimoniale, via MyMinfin)&nbsp;; un revenu cadastral belge est attribu&eacute;. Dans la d&eacute;claration&nbsp;: cadre III, code 1106, avec &laquo;&nbsp;exon&eacute;ration avec r&eacute;serve de progressivit&eacute;&nbsp;&raquo; (convention BE-ES). Pas de double imposition, mais le revenu compte pour le taux appliqu&eacute; &agrave; vos autres revenus."),
        ("Puis-je louer &agrave; des touristes (Airbnb)&nbsp;?", "En g&eacute;n&eacute;ral, pas d'embl&eacute;e. Loi canarienne 6/2025&nbsp;: location touristique uniquement l&agrave; o&ugrave; le plan communal l'autorise express&eacute;ment (max.&nbsp;10&nbsp;% des logements), logement d'au moins 10 ans, licence de 5 ans&nbsp;; <strong>une licence existante s'&eacute;teint &agrave; la vente</strong> (disp. trans. 1.11). De plus, depuis le 3 avril 2025, l'accord pr&eacute;alable de la copropri&eacute;t&eacute; aux 3/5 est requis (art. 17.12 LPH). La location de longue dur&eacute;e reste possible. <strong>Nous ne promettons aucun rendement touristique.</strong>"),
        ("Et si je revends plus tard&nbsp;?", "Espagne&nbsp;: 19&nbsp;% sur la plus-value (r&eacute;sidents UE)&nbsp;; l'acheteur retient 3&nbsp;% du prix &agrave; titre d'acompte (art. 25.2 TRLIRNR), r&eacute;cup&eacute;rable&nbsp;; plus la &laquo;&nbsp;plusval&iacute;a&nbsp;&raquo; communale. Belgique&nbsp;: d&eacute;claration prorata pour l'ann&eacute;e."),
        ("Que fait Villa's Properties&nbsp;?", "Visite sur place ou en vid&eacute;o, documentation du bien (extrait du registre, copropri&eacute;t&eacute;, IBI, <strong>certificat &eacute;nerg&eacute;tique</strong>), coordination avec votre avocat et le notaire, accompagnement en fran&ccedil;ais. Conditions&nbsp;: demandez-nous."),
    ],
    "it": [
        ("Quanto costa comprare, oltre al prezzo?", "Imposta di trasferimento (ITP) alle Canarie: 6,5&nbsp;% sulla seconda mano (sul maggiore tra prezzo e &laquo;valor de referencia&raquo;). Si aggiungono notaio 600&ndash;1.200&nbsp;&euro;, registro della proprietà 400&ndash;800&nbsp;&euro;, gestor&iacute;a 300&ndash;600&nbsp;&euro; e un avvocato indipendente (&plusmn;&nbsp;1&nbsp;% + IGIC). Calcoli &asymp;&nbsp;8&nbsp;%. Esempio: a <strong>Ten-Bel</strong>, un appartamento di 70&nbsp;m&sup2; a 2.604&nbsp;&euro;/m&sup2; (&asymp;&nbsp;182.000&nbsp;&euro;) &rarr; spese &asymp;&nbsp;14.600&nbsp;&euro;. Nuova costruzione: IGIC 7&nbsp;% + AJD invece dell'ITP."),
        ("Serve il NIE?", "S&igrave;, prima della firma. Si richiede al Consolato spagnolo in Italia o alla Polic&iacute;a Nacional a Tenerife; con una procura lo gestisce il suo avvocato."),
        ("Devo aprire un conto bancario spagnolo?", "Non &egrave; obbligatorio: l'atto notarile identifica i mezzi di pagamento e un bonifico dall'Italia &egrave; valido. &Egrave; comunque utile per domiciliare IBI, spese di comunit&agrave; e utenze."),
        ("Devo venire a Tenerife per firmare?", "No. Procura notarile in Italia + apostille; il suo avvocato firma l'atto. Di norma si fa un solo viaggio, per la visita."),
        ("Mi danno un mutuo?", "Le banche spagnole finanziano i non residenti di norma al 60&ndash;70&nbsp;% del minore tra prezzo e perizia. Per un ticket d'investimento basso come Ten-Bel, consideri comunque il 30&ndash;40&nbsp;% di capitale proprio più l'&asymp;&nbsp;8&nbsp;% di spese."),
        ("Cosa si paga ogni anno?", "IBI (tassa comunale), spese di comunit&agrave;, utenze e l'imposta spagnola sui non residenti (IRNR, modello 210): 19&nbsp;% sull'1,1&nbsp;% (o 2&nbsp;%) del valore catastale. Esempio: valore catastale 100.000&nbsp;&euro; &rarr; &asymp;&nbsp;209&nbsp;&euro;/anno."),
        ("E il fisco italiano?", "Gli immobili all'estero vanno dichiarati nel quadro RW e sono soggetti a IVIE (0,76&nbsp;% del valore, con credito per le imposte gi&agrave; pagate in Spagna). Niente doppia imposizione grazie alla convenzione Italia-Spagna, ma va dichiarato ogni anno."),
        ("Posso affittarlo a turisti?", "In generale, non da subito. La Legge 6/2025 delle Canarie: l'affitto turistico &egrave; possibile solo dove il piano comunale lo consente espressamente (max.&nbsp;10&nbsp;% delle abitazioni), con immobile di almeno 10 anni e licenza di 5 anni; <strong>una licenza esistente si estingue con la vendita</strong> (disp. trans. 1.11). Dal 3 aprile 2025 serve inoltre l'approvazione dei 3/5 della comunit&agrave; di proprietari (art. 17.12 LPH). L'affitto a lungo termine resta possibile. <strong>Non promettiamo alcuna rendita turistica.</strong>"),
        ("E se vendo più avanti?", "Spagna: 19&nbsp;% sulla plusvalenza (residenti UE); l'acquirente trattiene il 3&nbsp;% del prezzo come anticipo (art. 25.2 TRLIRNR), recuperabile; pi&ugrave; la &laquo;plusval&iacute;a&raquo; comunale. Italia: da dichiarare nell'anno della vendita."),
        ("Cosa fa Villa's Properties?", "Visita di persona o in video, documentazione dell'immobile (nota simple, comunit&agrave;, IBI, <strong>certificato energetico</strong>), coordinamento con il suo avvocato e il notaio, assistenza in italiano. Condizioni: ci scriva."),
    ],
    "en": [
        ("What does buying cost on top of the price?", "Transfer tax (ITP) in the Canary Islands: 6.5% on resale homes (on the higher of the price or the &laquo;valor de referencia&raquo;). On top of that: notary &euro;600&ndash;1,200, land registry &euro;400&ndash;800, a gestor&iacute;a &euro;300&ndash;600, and an independent lawyer (&plusmn;1% + IGIC). Budget &plusmn;8% overall. Example: &euro;395,000 &rarr; &plusmn;&euro;31,900. New-build: 7% IGIC + AJD instead of ITP."),
        ("Do I need an NIE?", "Yes, before signing. It's requested at the Spanish consulate in your home country or at the Polic&iacute;a Nacional in Tenerife; with a power of attorney, your lawyer can handle it for you."),
        ("Do I need to open a Spanish bank account?", "Not compulsory: the deed records the means of payment and a transfer from abroad is valid. It's still convenient for direct-debiting IBI (council tax), community fees and utilities."),
        ("Do I need to travel to sign?", "No. A notarised power of attorney in your home country plus an apostille lets your lawyer sign on your behalf. Most buyers still make one trip to view the property."),
        ("Can I get a mortgage?", "Spanish banks typically lend non-residents 60&ndash;70% of the lower of the price or the valuation. Plan for 30&ndash;40% of your own funds plus the &plusmn;8% in costs."),
        ("What do I pay every year?", "IBI (council tax), community fees, utilities, and Spanish non-resident income tax (IRNR, form 210): 19% on 1.1% (or 2%) of the cadastral value. Example: a &euro;120,000 cadastral value &rarr; &plusmn;&euro;251/year."),
        ("What about tax back home?", "Most buyers still need to declare the purchase (and, later, any rental income or capital gain) to their home tax authority. Spain has a double-taxation treaty with the UK, Romania, Ukraine, Hungary and Poland, among others, so you won't be taxed twice &mdash; but check the specific declaration and deadline that applies where you live, since it varies by country."),
        ("Can I rent it out to tourists (Airbnb)?", "Generally not straight away. Canary Islands Law 6/2025: tourist letting is only allowed where the local municipal plan expressly permits it (max. 10% of homes), the property is at least 10 years old, and the licence runs for 5 years; <strong>an existing licence is extinguished when the property is sold</strong> (transitional provision 1.11). Since 3 April 2025, prior approval by 3/5 of the owners' community is also required (art. 17.12 LPH). Long-term letting remains possible. <strong>We make no promise of tourist-rental income.</strong>"),
        ("What if I sell later on?", "Spain: 19% on the capital gain (EU residents); the buyer withholds 3% of the price as an advance payment (art. 25.2 TRLIRNR), which is recoverable; plus the municipal &laquo;plusval&iacute;a&raquo;. Your home country: usually declared pro rata for that tax year."),
        ("What does Villa's Properties do?", "In-person or video viewing, property documentation (land registry extract, community of owners, IBI, <strong>energy performance certificate</strong>), coordination with your lawyer and the notary, and support in English. Terms: just ask us."),
    ],
    "de": [
        ("Was kostet der Kauf zusätzlich zum Preis?", "Grunderwerbsteuer (ITP) auf den Kanaren: 6,5&nbsp;% bei Bestandsimmobilien (auf den höheren Betrag aus Kaufpreis oder &laquo;valor de referencia&raquo;). Dazu kommen Notar 600&ndash;1.200&nbsp;&euro;, Grundbuchamt 400&ndash;800&nbsp;&euro;, Gestor&iacute;a 300&ndash;600&nbsp;&euro; und ein unabhängiger Anwalt (&plusmn;&nbsp;1&nbsp;% + IGIC). Rechnen Sie insgesamt mit &plusmn;&nbsp;8&nbsp;%. Beispiel Poris/Arico: eine Wohnung mit 70&nbsp;m&sup2; zu 1.923&nbsp;&euro;/m&sup2; (&asymp;&nbsp;135.000&nbsp;&euro;) &rarr; Nebenkosten &asymp;&nbsp;10.800&nbsp;&euro;. Neubau: 7&nbsp;% IGIC + AJD statt ITP."),
        ("Brauche ich eine NIE?", "Ja, vor der Unterzeichnung. Zu beantragen beim spanischen Konsulat in Deutschland oder bei der Polic&iacute;a Nacional auf Teneriffa; mit einer Vollmacht erledigt das Ihr Anwalt für Sie."),
        ("Muss ich ein spanisches Bankkonto eröffnen?", "Nicht zwingend: Die notarielle Urkunde weist die Zahlungsmittel aus, und eine Überweisung aus Deutschland ist gültig. Praktisch ist es trotzdem für die Lastschrift von IBI (Grundsteuer), Gemeinschaftskosten und Versorgern."),
        ("Muss ich zur Unterzeichnung nach Teneriffa reisen?", "Nein. Eine notarielle Vollmacht in Deutschland plus Apostille genügt, damit Ihr Anwalt die Urkunde für Sie unterschreibt. Üblich ist trotzdem eine Reise für die Besichtigung."),
        ("Bekomme ich eine Hypothek?", "Spanische Banken finanzieren Nicht-Residenten in der Regel bis 60&ndash;70&nbsp;% des niedrigeren Werts aus Kaufpreis oder Gutachten. Rechnen Sie mit 30&ndash;40&nbsp;% Eigenkapital plus den &plusmn;&nbsp;8&nbsp;% Nebenkosten."),
        ("Was zahle ich jedes Jahr?", "IBI (Grundsteuer), Gemeinschaftskosten, Versorger und die spanische Nicht-Residenten-Steuer (IRNR, Formular 210): 19&nbsp;% auf 1,1&nbsp;% (oder 2&nbsp;%) des Katasterwerts. Beispiel: Katasterwert 80.000&nbsp;&euro; &rarr; &asymp;&nbsp;167&nbsp;&euro;/Jahr."),
        ("Und das deutsche Finanzamt?", "Ausländische Immobilien sind in der Steuererklärung anzugeben (Anlage AUS bei Vermietung bzw. Veräußerungsgewinnen); das Doppelbesteuerungsabkommen Deutschland&ndash;Spanien verhindert eine doppelte Besteuerung, wirkt sich aber über den Progressionsvorbehalt auf Ihren Steuersatz aus. Eine Selbstnutzung ohne Einkünfte ist in Deutschland grundsätzlich nicht erklärungspflichtig &mdash; im Zweifel den Steuerberater fragen."),
        ("Kann ich an Touristen vermieten (Airbnb)?", "In der Regel nicht ohne Weiteres. Kanarisches Gesetz 6/2025: Touristische Vermietung ist nur dort erlaubt, wo der kommunale Bebauungsplan sie ausdrücklich zulässt (max.&nbsp;10&nbsp;% der Wohnungen), die Immobilie mindestens 10 Jahre alt ist und die Lizenz 5 Jahre gilt; <strong>eine bestehende Lizenz erlischt beim Verkauf</strong> (Übergangsbestimmung 1.11). Seit dem 3. April 2025 ist außerdem die vorherige Zustimmung von 3/5 der Eigentümergemeinschaft erforderlich (Art. 17.12 LPH). Langzeitvermietung bleibt möglich. <strong>Wir versprechen keine touristische Rendite.</strong>"),
        ("Und wenn ich später verkaufe?", "Spanien: 19&nbsp;% auf den Veräußerungsgewinn (EU-Ansässige); der Käufer behält 3&nbsp;% des Preises als Vorauszahlung ein (Art. 25.2 TRLIRNR), die erstattungsfähig ist; zuzüglich der kommunalen &laquo;plusval&iacute;a&raquo;. Deutschland: in der Regel anteilig für das betreffende Steuerjahr zu erklären."),
        ("Was macht Villa's Properties?", "Besichtigung vor Ort oder per Video, Objektdokumentation (Grundbuchauszug, Eigentümergemeinschaft, IBI, <strong>Energieausweis</strong>), Koordination mit Ihrem Anwalt und dem Notar, Begleitung auf Deutsch. Konditionen: einfach fragen."),
    ],
}

ROOT_HEADER = """<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><link rel="icon" type="image/webp" href="../assets/brand/logo-placeholder.webp"><link rel="stylesheet" href="../site.css?v=202610121758"><noscript><style>[data-reveal],[data-stagger],[data-stagger-group]>*,.hero-content>*{{opacity:1!important;transform:none!important;clip-path:none!important}}</style></noscript>
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self'; font-src 'self'; connect-src 'self' https://odoo.okservice.es https://api.github.com https://uploads.github.com https://overpass-api.de; form-action 'self' https://odoo.okservice.es; frame-src 'none'; object-src 'none'; base-uri 'self'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="theme-color" content="#5f8075">
<meta property="og:type" content="article"><meta property="og:site_name" content="Villa's Properties"><meta property="og:locale" content="{og}">
<meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{canonical}">
<link rel="manifest" href="../site.webmanifest">
{hreflang}
</head><body>
<a class="skip-link" href="#contenido">{skip}</a><header class="header solid"><div class="wrap headerin"><a class="brand" href="../index.html" aria-label="Villa's Properties" hreflang="es" title="{foreign_title}"><div class="lockup"><div class="wordmark"><span>VILL</span><span class="a">A</span><span>&rsquo;S&nbsp;PROPERTIES</span></div><div class="brand-sub">PROPERTY INTELLIGENCE &middot; TENERIFE</div></div></a><nav class="nav"><a href="../properties.html" hreflang="es" title="{foreign_title}">Properties</a><a href="../sell.html" hreflang="es" title="{foreign_title}">Sell</a><a href="../buy.html" hreflang="es" title="{foreign_title}">Buy</a><a href="../intelligence.html" hreflang="es" title="{foreign_title}">Intelligence</a></nav>{selector}</div></header>
<main id="contenido">
<section class="pagehero" data-reveal><div class="wrap"><div class="eye">{eye}</div><h1>{h1}</h1><p class="pagelede">{lede}</p>{note}</div></section>
<section class="section" data-reveal><div class="wrap">
{faq}
<p class="muted" style="margin-top:28px;font-size:.85rem">{disclaimer}</p>
<div style="margin-top:28px"><a class="btn green" href="https://wa.me/34667384965" target="_blank" rel="noopener">{cta}</a></div>
</div></section>
</main>
<footer class="footer"><div class="wrap"><div class="footer-bottom"><span>&copy; <span id="year">2026</span> Villa's Properties</span></div></div></footer>
<script src="../vp-safe.js?v=202610121758" defer></script><script src="../vp-consent.js?v=202610121758" defer></script><script src="../shell.js?v=202610121758" defer></script><script src="../app.js?v=202610121758" defer></script><script src="../motion.js?v=202610121758" defer></script>
</body></html>"""

SKIP = {
    "nl": "Naar de inhoud", "fr": "Aller au contenu", "it": "Vai al contenuto",
    "en": "Skip to content", "de": "Zum Inhalt springen",
}


def hreflang_block():
    tags = [f'<link rel="alternate" hreflang="{l}" href="{BASE}{p}">' for l, p in MEMBERS.items()]
    return "".join(tags)  # no x-default: no ES equivalent exists for this new page


def selector(current):
    items = []
    for l, p in sorted(MEMBERS.items()):
        rel = "self" if l == current else "alternate"
        cur = ' aria-current="true"' if l == current else ""
        items.append(f'<a href="/{p}" hreflang="{l}" rel="{rel}"{cur}>{LABEL[l]}</a>')
    return '<div class="lang-switch" role="navigation" aria-label="Language">' + "".join(items) + "</div>"


def faq_html(lang):
    out = ['<div class="head" data-reveal><div class="eye">FAQ</div><div><h2>10 Q&amp;A</h2></div></div><dl class="faqlist">']
    for i, (q, a) in enumerate(QA[lang], 1):
        out.append(f'<dt>{i}. {q}</dt><dd>{a}</dd>')
    out.append('</dl>')
    return "".join(out)


def build(lang):
    og = {"nl": "nl_NL", "fr": "fr_FR", "it": "it_IT", "en": "en_GB", "de": "de_DE"}[lang]
    html = ROOT_HEADER.format(
        lang=lang, title=TITLE[lang], desc=DESC[lang], canonical=BASE + MEMBERS[lang], og=og,
        hreflang=hreflang_block(), skip=SKIP[lang], foreign_title=FOREIGN_TITLE[lang],
        selector=selector(lang), eye=EYE[lang], h1=H1[lang], lede=LEDE[lang],
        note=NOTE_NEW_TRANSLATION.get(lang, ""), faq=faq_html(lang),
        disclaimer=DISCLAIMER[lang], cta=WHATSAPP_CTA[lang],
    )
    return html


if __name__ == "__main__":
    for lang in ("nl", "fr", "it", "en", "de"):
        out = ROOT / MEMBERS[lang]
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(build(lang), encoding="utf-8")
        print("wrote", out)
