#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generador de las 10 páginas de comprar-casa-adeje/arona (ronda 6, atelier:villas-idiomas).
Uso puntual, no se despliega: construye nl/fr/it/en/de/*.html con la misma
arquitectura de isla que nl/index.html y nl/guia-comprador.html (shell.js
lang-aware, hreflang recíproco a 6, selector de idioma estático rescatado por
shell.js). Se borra o se deja en tools/i18n/ como utilidad reanudable."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

LANGS = ['nl', 'fr', 'it', 'en', 'de']

SLUGS = {
    'adeje': {'nl': 'huis-kopen-adeje.html', 'fr': 'acheter-maison-adeje.html', 'it': 'comprare-casa-adeje.html', 'en': 'buy-house-adeje.html', 'de': 'haus-kaufen-adeje.html'},
    'arona': {'nl': 'huis-kopen-arona.html', 'fr': 'acheter-maison-arona.html', 'it': 'comprare-casa-arona.html', 'en': 'buy-house-arona.html', 'de': 'haus-kaufen-arona.html'},
}

OG_LOCALE = {'nl': 'nl_NL', 'fr': 'fr_FR', 'it': 'it_IT', 'en': 'en_GB', 'de': 'de_DE'}
FOREIGN_TITLE = {'nl': 'deze pagina is in het Spaans', 'fr': 'cette page est en espagnol', 'it': 'questa pagina è in spagnolo', 'en': 'this page is in Spanish', 'de': 'diese Seite ist auf Spanisch'}
SKIP = {'nl': 'Naar de inhoud', 'fr': 'Aller au contenu', 'it': 'Vai al contenuto', 'en': 'Skip to content', 'de': 'Zum Inhalt springen'}
LANG_ARIA = {'nl': 'Taal / Idioma', 'fr': 'Langue / Idioma', 'it': 'Lingua / Idioma', 'en': 'Language / Idioma', 'de': 'Sprache / Idioma'}

# --- datos numéricos por ciudad (idénticos al original ES; no se inventan) ---
CITY = {
    'adeje': {
        'EsName': 'Adeje', 'pedido': '4.756 €/m²', 'firmado': '4.304 €/m²', 'dist': '9,5 %', 'compraventas': '1.917',
        'zonaTop': 'La Caleta', 'zonaTopVal': '7.469 €/m²', 'zonaBottom': 'Armeñime', 'zonaBottomVal': '2.529 €/m²', 'ratio': '2,95',
        'zoneTable': [
            ('La Caleta', '7.469 €/m²', '+3,9 %'), ('Playa de las Américas (Adeje)', '6.000 €/m²', '+3,6 %'),
            ('San Eugenio Bajo', '5.944 €/m²', '+10,5 %'), ('Playa de Fañabé', '5.917 €/m²', '-2,4 %'),
            ('Torviscas Bajo', '5.412 €/m²', '0 %'), ('Costa Adeje', '5.309 €/m²', '+3,4 %'),
            ('Playa de Fañabé Alto', '4.773 €/m²', '+9,6 %'), ('San Eugenio Alto', '4.684 €/m²', '+2,7 %'),
            ('Playa Paraíso', '4.496 €/m²', '+5,3 %'), ('Torviscas Centro y Alto', '4.154 €/m²', '-4,2 %'),
            ('Casco urbano de Adeje', '3.425 €/m²', '—'), ('Tijoco - La Quinta - Caucho', '2.722 €/m²', '—'),
            ('Armeñime', '2.529 €/m²', '—'),
        ],
        'budgetTable': [
            ('La Caleta', '27 m²', '40 m²', '60 m²'), ('Playa de las Américas (Adeje)', '33 m²', '50 m²', '75 m²'),
            ('San Eugenio Bajo', '34 m²', '50 m²', '76 m²'), ('Playa de Fañabé', '34 m²', '51 m²', '76 m²'),
            ('Torviscas Bajo', '37 m²', '55 m²', '83 m²'), ('Costa Adeje', '38 m²', '57 m²', '85 m²'),
            ('Playa de Fañabé Alto', '42 m²', '63 m²', '94 m²'), ('San Eugenio Alto', '43 m²', '64 m²', '96 m²'),
            ('Playa Paraíso', '44 m²', '67 m²', '100 m²'), ('Torviscas Centro y Alto', '48 m²', '72 m²', '108 m²'),
            ('Casco urbano de Adeje', '58 m²', '88 m²', '131 m²'), ('Tijoco - La Quinta - Caucho', '73 m²', '110 m²', '165 m²'),
            ('Armeñime', '79 m²', '119 m²', '178 m²'),
        ],
        'geo': {'lat': 28.1227, 'lng': -16.7261},
        'otherCity': 'arona',
    },
    'arona': {
        'EsName': 'Arona', 'pedido': '4.038 €/m²', 'firmado': '3.138 €/m²', 'dist': '22,3 %', 'compraventas': '3.441',
        'zonaTop': 'Playa de las Américas', 'zonaTopVal': '6.085 €/m²', 'zonaBottom': 'Valle San Lorenzo', 'zonaBottomVal': '2.441 €/m²', 'ratio': '2,49',
        'zoneTable': [
            ('Playa de las Américas', '6.085 €/m²', '+0,6 %'), ('Los Cristianos', '4.784 €/m²', '+4 %'),
            ('Palm Mar', '4.057 €/m²', '+5,8 %'), ('Costa del Silencio-Las Galletas', '3.404 €/m²', '+4,9 %'),
            ('Chayofa', '3.109 €/m²', '-8,4 %'), ('Cho-Guaza', '2.900 €/m²', '+3,6 %'),
            ('Las Rosas', '2.821 €/m²', '+14,9 %'), ('Cabo Blanco', '2.744 €/m²', '+21,6 %'),
            ('Arona Pueblo', '2.600 €/m²', '—'), ('El Fraile', '2.535 €/m²', '+11,2 %'),
            ('Valle San Lorenzo', '2.441 €/m²', '+7,1 %'),
        ],
        'budgetTable': [
            ('Playa de las Américas', '33 m²', '49 m²', '74 m²'), ('Los Cristianos', '42 m²', '63 m²', '94 m²'),
            ('Palm Mar', '49 m²', '74 m²', '111 m²'), ('Costa del Silencio-Las Galletas', '59 m²', '88 m²', '132 m²'),
            ('Chayofa', '64 m²', '96 m²', '145 m²'), ('Cho-Guaza', '69 m²', '103 m²', '155 m²'),
            ('Las Rosas', '71 m²', '106 m²', '160 m²'), ('Cabo Blanco', '73 m²', '109 m²', '164 m²'),
            ('Arona Pueblo', '77 m²', '115 m²', '173 m²'), ('El Fraile', '79 m²', '118 m²', '178 m²'),
            ('Valle San Lorenzo', '82 m²', '123 m²', '184 m²'),
        ],
        'geo': {'lat': 28.0997, 'lng': -16.681},
        'otherCity': 'adeje',
    },
}

# --- textos por idioma: plantillas con {City} y números ya resueltos por ciudad ---
T = {
'nl': {
    'eyeZone': lambda c: f"{c['EsName'].upper()} · Zuidkust" if c['EsName']=='Arona' else f"{c['EsName'].upper()} · Zuidwestkust",
    'titleTag': lambda name: f"Huis kopen in {name}: prijzen per zone en reëel verschil | Villa's Properties",
    'ogDesc': lambda c: f"Wat kost kopen in {c['EsName']}: {c['pedido']} vraagprijs tegenover {c['firmado']} notarieel. Prijs per zone, hoeveel oppervlakte in uw budget past en wat te checken voor u tekent.",
    'metaDesc': "Villa's Properties: makelaar in Zuid-Tenerife met eigen marktanalyse voor kopen, verkopen, financieren en investeren met echte data.",
    'serviceType': lambda name: f"Advies bij het kopen van een woning in {name}",
    'offerDesc': 'Eerste gesprek en inzicht in de zoneprijs zonder kosten',
    'faqName': lambda name: f'Veelgestelde vragen over kopen in {name}',
    'breadHome': 'Home', 'breadBuy': 'Kopen', 'breadThis': lambda name: f"Huis kopen in {name}",
    'h1': lambda name: f"Huis kopen in {name}:<br>wat gevraagd wordt en wat getekend wordt.",
    'lede_adeje': lambda c: f"In Adeje wordt gemiddeld {c['pedido']} gevraagd en bij de notaris wordt {c['firmado']} getekend. Het is de duurste gemeente van het zuiden en degene met het grootste verschil tussen kust en binnenland: de zone beslist meer dan de vierkante meters.",
    'lede_arona': lambda c: f"In Arona wordt gemiddeld {c['pedido']} gevraagd en bij de notaris wordt {c['firmado']} getekend. Arona tekent vier van elke tien verkopen van de regio. Meer transacties betekent meer vergelijkingsmateriaal en minder ruimte voor een fantasieprijs.",
    'eye01': '01 · Het reële verschil', 'h2_01': 'Wat gevraagd wordt<br>en wat getekend wordt.',
    'lbl_ask': 'wat gevraagd wordt · idealista jul 2026', 'lbl_signed': 'wat getekend wordt · notarieel',
    'lbl_dist': 'verschil tussen vragen en tekenen', 'lbl_sales': 'verkopen per jaar · Catastro 2025',
    'bankpie': lambda c: f"De notariële prijs is het gemiddelde van ALLE verkopen in de gemeente, kust en binnenland samen. Het is niet de korting die u op een specifieke woning krijgt: het bewijst dat in {c['EsName']} de gepubliceerde prijs en de slotprijs niet hetzelfde zijn.",
    'eye02': '02 · Zones', 'h2_02': 'Waar uw budget<br>past.',
    'muted02': lambda c: f"Tussen {c['zonaTop']} en {c['zonaBottom']} is er {c['ratio']}x verschil. Het gemeentelijk gemiddelde beschrijft geen specifieke woning.",
    'th_zone': 'Zone', 'th_askm2': '€/m² vraagprijs', 'th_12m': '12 maanden',
    'caption02': 'Bron: idealista, jul 2026. Vraagprijs, geen slotprijs.',
    'eye03': '03 · Hoeveel woning u krijgt', 'h2_03': 'Wat u koopt<br>met uw budget.',
    'muted03': lambda name: f"Geschatte oppervlakte tegen de vraagprijs van elke zone van {name}. Het is een vuistregel, geen taxatie: nuttig om zones af te strepen voordat u er weekenden aan besteedt om ze te bezichtigen.",
    'eye04': '04 · Vragen', 'h2_04': 'Wat kopers hier<br>vragen.',
    'ctaEye': 'Geen automatische telefoontjes', 'ctaH2': "Zeggen wij u of<br>die prijs klopt?",
    'ctaP': 'Stuur ons de advertentie die u bekijkt en wij vertellen u wat er echt in die zone getekend wordt, welke marge er is en wat u moet checken voordat u een voorschot tekent.',
    'ctaBtn1': 'Advertentie versturen ↗', 'ctaBtn2': 'Woningen bekijken',
    'exploreEye': 'Verder kijken', 'sellMuted': lambda name: f"Staat u aan de andere kant en wilt u verkopen? ",
    'sellLink': lambda name: f"Huis verkopen in {name}",
    'skip': SKIP['nl'], 'langAria': LANG_ARIA['nl'],
},
'fr': {
    'eyeZone': lambda c: f"{c['EsName'].upper()} · Côte sud" if c['EsName']=='Arona' else f"{c['EsName'].upper()} · Côte sud-ouest",
    'titleTag': lambda name: f"Acheter une maison à {name} : prix par zone et marge réelle | Villa's Properties",
    'ogDesc': lambda c: f"Ce que coûte l'achat à {c['EsName']} : {c['pedido']} affiché contre {c['firmado']} notarié. Prix zone par zone, surface accessible selon votre budget et ce qu'il faut vérifier avant de signer.",
    'metaDesc': "Villa's Properties : agence immobilière dans le sud de Tenerife avec analyse de marché propre pour acheter, vendre, financer et investir avec des données réelles.",
    'serviceType': lambda name: f"Conseil pour l'achat d'un bien à {name}",
    'offerDesc': 'Premier échange et lecture du prix de la zone sans frais',
    'faqName': lambda name: f"Questions fréquentes sur l'achat à {name}",
    'breadHome': 'Accueil', 'breadBuy': 'Acheter', 'breadThis': lambda name: f"Acheter une maison à {name}",
    'h1': lambda name: f"Acheter une maison à {name} :<br>ce qui est demandé, ce qui est signé.",
    'lede_adeje': lambda c: f"À Adeje, on demande en moyenne {c['pedido']} et on signe chez le notaire {c['firmado']}. C'est la commune la plus chère du sud et celle où l'écart entre la côte et l'intérieur est le plus grand : la zone compte plus que les mètres carrés.",
    'lede_arona': lambda c: f"À Arona, on demande en moyenne {c['pedido']} et on signe chez le notaire {c['firmado']}. Arona concentre quatre ventes sur dix dans la région. Plus de transactions signifie plus de comparables et moins de place pour un prix fantaisiste.",
    'eye01': '01 · La marge réelle', 'h2_01': 'Ce qui est demandé<br>et ce qui est signé.',
    'lbl_ask': 'prix demandé · idealista juil. 2026', 'lbl_signed': 'prix signé · notarié',
    'lbl_dist': 'écart entre demande et signature', 'lbl_sales': 'ventes par an · Catastro 2025',
    'bankpie': lambda c: f"Le prix notarié est la moyenne de TOUTES les ventes de la commune, côte et intérieur compris. Ce n'est pas la remise que vous obtiendrez sur un bien précis : c'est la preuve qu'à {c['EsName']} le prix affiché et le prix de clôture ne sont pas les mêmes.",
    'eye02': '02 · Zones', 'h2_02': 'Où votre budget<br>vous mène.',
    'muted02': lambda c: f"Entre {c['zonaTop']} et {c['zonaBottom']}, l'écart est de {c['ratio']} fois. La moyenne communale ne décrit aucun bien précis.",
    'th_zone': 'Zone', 'th_askm2': '€/m² affiché', 'th_12m': '12 mois',
    'caption02': 'Source : idealista, juil. 2026. Prix affiché, pas de clôture.',
    'eye03': '03 · Combien de surface', 'h2_03': 'Ce que vous achetez<br>avec votre budget.',
    'muted03': lambda name: f"Surface approximative au prix affiché de chaque zone de {name}. C'est une règle de trois, pas une estimation : elle sert à écarter des zones avant de perdre des week-ends à les visiter.",
    'eye04': '04 · Questions', 'h2_04': 'Ce que demandent<br>ceux qui achètent ici.',
    'ctaEye': 'Sans appels automatiques', 'ctaH2': "On vous dit si<br>ce prix tient la route ?",
    'ctaP': "Envoyez-nous l'annonce que vous regardez et nous vous disons ce qui se signe vraiment dans cette zone, quelle marge existe et quoi vérifier avant de signer un compromis.",
    'ctaBtn1': "Envoyer l'annonce ↗", 'ctaBtn2': 'Voir les biens',
    'exploreEye': 'Continuer à regarder', 'sellMuted': lambda name: f"Vous êtes de l'autre côté et voulez vendre ? ",
    'sellLink': lambda name: f"Vendre une maison à {name}",
    'skip': SKIP['fr'], 'langAria': LANG_ARIA['fr'],
},
'it': {
    'eyeZone': lambda c: f"{c['EsName'].upper()} · Costa sud" if c['EsName']=='Arona' else f"{c['EsName'].upper()} · Costa sud-ovest",
    'titleTag': lambda name: f"Comprare casa a {name}: prezzi per zona e margine reale | Villa's Properties",
    'ogDesc': lambda c: f"Quanto costa comprare a {c['EsName']}: {c['pedido']} richiesto contro {c['firmado']} rogitato. Prezzo zona per zona, quanta superficie entra nel tuo budget e cosa verificare prima di firmare.",
    'metaDesc': "Villa's Properties: agenzia immobiliare nel sud di Tenerife con analisi di mercato propria per comprare, vendere, finanziare e investire con dati reali.",
    'serviceType': lambda name: f"Consulenza per l'acquisto di casa a {name}",
    'offerDesc': 'Prima consulenza e lettura del prezzo di zona senza costi',
    'faqName': lambda name: f"Domande frequenti su comprare casa a {name}",
    'breadHome': 'Home', 'breadBuy': 'Comprare', 'breadThis': lambda name: f"Comprare casa a {name}",
    'h1': lambda name: f"Comprare casa a {name}:<br>quello che si chiede e quello che si firma.",
    'lede_adeje': lambda c: f"Ad Adeje si chiede in media {c['pedido']} e davanti al notaio si firma {c['firmado']}. È il comune più caro del sud e quello con la maggiore distanza tra costa ed entroterra: la zona conta più dei metri quadri.",
    'lede_arona': lambda c: f"Ad Arona si chiede in media {c['pedido']} e davanti al notaio si firma {c['firmado']}. Arona firma quattro compravendite su dieci della zona. Più operazioni significa più comparabili e meno margine per un prezzo di fantasia.",
    'eye01': '01 · Il margine reale', 'h2_01': 'Quello che si chiede<br>e quello che si firma.',
    'lbl_ask': 'quello che si chiede · idealista lug 2026', 'lbl_signed': 'quello che si firma · rogitato',
    'lbl_dist': 'distanza tra richiesta e firma', 'lbl_sales': 'compravendite all\'anno · Catastro 2025',
    'bankpie': lambda c: f"Il prezzo di rogito è la media di TUTTE le compravendite del comune, costa ed entroterra incluse. Non è lo sconto che otterrai su una casa specifica: è la prova che a {c['EsName']} il prezzo pubblicato e il prezzo di chiusura non sono la stessa cosa.",
    'eye02': '02 · Zone', 'h2_02': 'Dove entra<br>il tuo budget.',
    'muted02': lambda c: f"Tra {c['zonaTop']} e {c['zonaBottom']} c'è una differenza di {c['ratio']} volte. La media comunale non descrive nessuna casa specifica.",
    'th_zone': 'Zona', 'th_askm2': '€/m² annuncio', 'th_12m': '12 mesi',
    'caption02': 'Fonte: idealista, lug 2026. Prezzo di annuncio, non di chiusura.',
    'eye03': '03 · Quanta casa entra', 'h2_03': 'Cosa compri<br>con il tuo budget.',
    'muted03': lambda name: f"Superficie approssimativa al prezzo di annuncio di ogni zona di {name}. È una regola del tre, non una perizia: serve a scartare zone prima di perdere i fine settimana a visitarle.",
    'eye04': '04 · Domande', 'h2_04': 'Quello che chiedono<br>chi compra qui.',
    'ctaEye': 'Niente chiamate automatiche', 'ctaH2': "Ti diciamo se<br>quel prezzo si sostiene?",
    'ctaP': "Mandaci l'annuncio che stai guardando e ti diciamo cosa si firma davvero in quella zona, quale margine c'è e cosa verificare prima di firmare la caparra.",
    'ctaBtn1': "Manda l'annuncio ↗", 'ctaBtn2': 'Vedi gli immobili',
    'exploreEye': 'Continua a guardare', 'sellMuted': lambda name: f"Sei dall'altra parte e vuoi vendere? ",
    'sellLink': lambda name: f"Vendere casa a {name}",
    'skip': SKIP['it'], 'langAria': LANG_ARIA['it'],
},
'en': {
    'eyeZone': lambda c: f"{c['EsName'].upper()} · South coast" if c['EsName']=='Arona' else f"{c['EsName'].upper()} · Southwest coast",
    'titleTag': lambda name: f"Buying a house in {name}: prices by zone and the real margin | Villa's Properties",
    'ogDesc': lambda c: f"What it costs to buy in {c['EsName']}: {c['pedido']} asking versus {c['firmado']} notarised. Price zone by zone, how much space fits your budget and what to check before signing.",
    'metaDesc': "Villa's Properties: a South Tenerife estate agency with in-house market analysis for buying, selling, financing and investing with real data.",
    'serviceType': lambda name: f"Advice on buying a home in {name}",
    'offerDesc': 'First consultation and zone-price read at no cost',
    'faqName': lambda name: f"Frequently asked questions about buying in {name}",
    'breadHome': 'Home', 'breadBuy': 'Buy', 'breadThis': lambda name: f"Buying a house in {name}",
    'h1': lambda name: f"Buying a house in {name}:<br>what's asked and what's signed.",
    'lede_adeje': lambda c: f"In Adeje the average asking price is {c['pedido']}, and the notarised price is {c['firmado']}. It's the most expensive municipality in the south, and the one with the widest gap between the coast and the inland villages: the zone matters more than the square metres.",
    'lede_arona': lambda c: f"In Arona the average asking price is {c['pedido']}, and the notarised price is {c['firmado']}. Arona accounts for four in ten sales in the area. More transactions mean more comparables and less room for a fantasy price.",
    'eye01': '01 · The real margin', 'h2_01': "What's asked<br>and what's signed.",
    'lbl_ask': 'asking price · idealista Jul 2026', 'lbl_signed': 'signed price · notarised',
    'lbl_dist': 'gap between asking and signing', 'lbl_sales': 'sales per year · Catastro 2025',
    'bankpie': lambda c: f"The notarised price is the average of ALL sales in the municipality, coast and inland alike. It isn't the discount you'll get on a specific property: it's proof that in {c['EsName']} the listed price and the closing price are not the same thing.",
    'eye02': '02 · Zones', 'h2_02': 'Where your budget<br>fits.',
    'muted02': lambda c: f"Between {c['zonaTop']} and {c['zonaBottom']} there's a {c['ratio']}x difference. The municipal average doesn't describe any specific property.",
    'th_zone': 'Zone', 'th_askm2': '€/m² listed', 'th_12m': '12 months',
    'caption02': 'Source: idealista, Jul 2026. Listing price, not closing price.',
    'eye03': '03 · How much house fits', 'h2_03': 'What you buy<br>with your budget.',
    'muted03': lambda name: f"Approximate floor area at the listing price for each zone of {name}. It's a rule of thumb, not a valuation: useful for ruling out zones before losing weekends viewing them.",
    'eye04': '04 · Questions', 'h2_04': 'What buyers ask<br>around here.',
    'ctaEye': 'No automated calls', 'ctaH2': "Want us to check<br>if that price holds up?",
    'ctaP': "Send us the listing you're looking at and we'll tell you what's really signing in that zone, what margin there is, and what to check before signing a deposit contract.",
    'ctaBtn1': 'Send the listing ↗', 'ctaBtn2': 'View properties',
    'exploreEye': 'Keep looking', 'sellMuted': lambda name: f"On the other side of this and looking to sell? ",
    'sellLink': lambda name: f"Selling a house in {name}",
    'skip': SKIP['en'], 'langAria': LANG_ARIA['en'],
},
'de': {
    'eyeZone': lambda c: f"{c['EsName'].upper()} · Südküste" if c['EsName']=='Arona' else f"{c['EsName'].upper()} · Südwestküste",
    'titleTag': lambda name: f"Haus kaufen in {name}: Preise nach Zone und reale Spanne | Villa's Properties",
    'ogDesc': lambda c: f"Was der Kauf in {c['EsName']} kostet: {c['pedido']} Angebotspreis gegenüber {c['firmado']} notariell beurkundet. Preis Zone für Zone, wie viel Fläche in Ihr Budget passt und was vor der Unterschrift zu prüfen ist.",
    'metaDesc': "Villa's Properties: Immobilienmakler im Süden von Teneriffa mit eigener Marktanalyse für Kauf, Verkauf, Finanzierung und Investition mit echten Daten.",
    'serviceType': lambda name: f"Beratung beim Hauskauf in {name}",
    'offerDesc': 'Erstgespräch und Einschätzung des Zonenpreises kostenlos',
    'faqName': lambda name: f"Häufige Fragen zum Hauskauf in {name}",
    'breadHome': 'Start', 'breadBuy': 'Kaufen', 'breadThis': lambda name: f"Haus kaufen in {name}",
    'h1': lambda name: f"Haus kaufen in {name}:<br>was verlangt und was beurkundet wird.",
    'lede_adeje': lambda c: f"In Adeje werden im Schnitt {c['pedido']} verlangt, und notariell beurkundet werden {c['firmado']}. Es ist die teuerste Gemeinde im Süden und jene mit dem größten Abstand zwischen Küste und Inland: die Zone entscheidet mehr als die Quadratmeter.",
    'lede_arona': lambda c: f"In Arona werden im Schnitt {c['pedido']} verlangt, und notariell beurkundet werden {c['firmado']}. Auf Arona entfallen vier von zehn Verkäufen der Region. Mehr Transaktionen bedeuten mehr Vergleichswerte und weniger Raum für einen Fantasiepreis.",
    'eye01': '01 · Die reale Spanne', 'h2_01': 'Was verlangt wird<br>und was beurkundet wird.',
    'lbl_ask': 'Angebotspreis · idealista Jul 2026', 'lbl_signed': 'beurkundeter Preis · notariell',
    'lbl_dist': 'Abstand zwischen Angebot und Beurkundung', 'lbl_sales': 'Verkäufe pro Jahr · Catastro 2025',
    'bankpie': lambda c: f"Der beurkundete Preis ist der Durchschnitt ALLER Verkäufe der Gemeinde, Küste und Inland zusammen. Es ist nicht der Nachlass, den Sie bei einer konkreten Immobilie bekommen: Es ist der Beweis, dass in {c['EsName']} der veröffentlichte Preis und der Abschlusspreis nicht dasselbe sind.",
    'eye02': '02 · Zonen', 'h2_02': 'Wo Ihr Budget<br>hinreicht.',
    'muted02': lambda c: f"Zwischen {c['zonaTop']} und {c['zonaBottom']} liegt ein {c['ratio']}-facher Unterschied. Der Gemeindedurchschnitt beschreibt keine konkrete Immobilie.",
    'th_zone': 'Zone', 'th_askm2': '€/m² Angebot', 'th_12m': '12 Monate',
    'caption02': 'Quelle: idealista, Jul 2026. Angebotspreis, nicht Abschlusspreis.',
    'eye03': '03 · Wie viel Haus hineinpasst', 'h2_03': 'Was Sie kaufen<br>mit Ihrem Budget.',
    'muted03': lambda name: f"Ungefähre Fläche zum Angebotspreis jeder Zone von {name}. Es ist eine Dreisatzregel, keine Bewertung: nützlich, um Zonen auszuschließen, bevor Sie Wochenenden mit Besichtigungen verbringen.",
    'eye04': '04 · Fragen', 'h2_04': 'Was Käufer hier<br>fragen.',
    'ctaEye': 'Keine automatischen Anrufe', 'ctaH2': "Sagen wir Ihnen,<br>ob der Preis stimmt?",
    'ctaP': "Schicken Sie uns das Angebot, das Sie sich ansehen, und wir sagen Ihnen, was in dieser Zone wirklich beurkundet wird, welche Spanne es gibt und was vor der Anzahlung zu prüfen ist.",
    'ctaBtn1': 'Angebot schicken ↗', 'ctaBtn2': 'Immobilien ansehen',
    'exploreEye': 'Weiter umsehen', 'sellMuted': lambda name: f"Sie stehen auf der anderen Seite und wollen verkaufen? ",
    'sellLink': lambda name: f"Haus verkaufen in {name}",
    'skip': SKIP['de'], 'langAria': LANG_ARIA['de'],
},
}

# FAQ: 7 preguntas por idioma, con placeholders {name}/{c} resueltos via f-strings al vuelo
def faqs(lang, name, c):
    if lang == 'nl':
        return [
            (f"Kan ik echt afdingen bij het kopen in {name}?", f"In {name} wordt gemiddeld {c['pedido']} gevraagd en bij de notaris wordt {c['firmado']} getekend: een verschil van {c['dist']}. Dat is geen automatische korting —het notariële cijfer combineert kust en binnenland, en een specifieke woning kan erboven of erbeneden liggen— maar het zegt wel dat de gepubliceerde prijs in deze zone niet de slotprijs is."),
            (f"Welke zone van {name} past bij mijn budget?", f"Binnen {name} is er {c['ratio']}x verschil tussen {c['zonaTop']} ({c['zonaTopVal']}) en {c['zonaBottom']} ({c['zonaBottomVal']}). Met hetzelfde geld koopt u bijna het dubbele aan oppervlakte door van wijk te wisselen binnen dezelfde gemeente."),
            (f"Wordt er veel verkocht in {name}?", f"Het Catastro registreert {c['compraventas']} woningverkopen per jaar in {name}. Dat is belangrijker dan het lijkt: waar veel transacties zijn, zijn er veel vergelijkingspanden, is de prijs betrouwbaarder en is later doorverkopen makkelijker."),
            ("Welke kosten heeft de koper naast de prijs?", "Naast de prijs: de overdrachtsbelasting (ITP) bij een tweedehandswoning —of IGIC en zegelrecht bij nieuwbouw—, de notaris, het eigendomsregister, de gestoría en, bij een hypotheek, de taxatie. Reken dit uit met concrete cijfers vóór u een voorschot tekent, want dit is de post die operaties op het laatste moment doet mislukken."),
            (f"Kan ik kopen in {name} als ik geen inwoner van Spanje ben?", "Ja, er is geen beperking om te kopen. Wat u nodig heeft is een NIE, een rekening in Spanje voor de betalingen en bewijs van de herkomst van de middelen bij de notaris. Heeft u ook financiering nodig, dan heeft een niet-inwoner een hogere eigen inbreng nodig dan een inwoner, dus bespreek dit met de bank vóórdat u een bod doet."),
            ("Hoelang duurt een aankoop van bod tot ondertekening?", "Zonder financiering: een paar weken. Met een hypotheek is een realistische termijn zelden korter dan 45 dagen vanaf het voorschot: daaronder is het risico niet van de bank, maar van het verliezen van de aanbetaling. De termijn wordt onderhandeld in het voorschotcontract, en is het punt waar de meeste operaties stuklopen."),
            ("Wat moet ik controleren voordat ik het voorschot teken?", "Bijgewerkt uittreksel van het Register (eigendom en lasten), dat de registeromschrijving overeenkomt met de werkelijkheid en met het Catastro, dat er geen illegale bouwwerken zijn, de stedenbouwkundige status van de grond, de VvE-bijdragen en de staat van de VvE, en wie de IBI heeft betaald. Een probleem vinden vóór het tekenen is onderhandelen; het erna vinden is een rechtszaak."),
        ]
    if lang == 'fr':
        return [
            (f"Peut-on vraiment négocier en achetant à {name} ?", f"À {name}, on demande en moyenne {c['pedido']} et on signe chez le notaire {c['firmado']} : un écart de {c['dist']}. Ce n'est pas une remise automatique —le chiffre notarié mélange côte et intérieur, et un bien précis peut être au-dessus ou en dessous— mais cela confirme que le prix affiché dans cette zone n'est pas le prix de clôture."),
            (f"Quelle zone de {name} correspond à mon budget ?", f"Au sein de {name}, il y a un écart de {c['ratio']} fois entre {c['zonaTop']} ({c['zonaTopVal']}) et {c['zonaBottom']} ({c['zonaBottomVal']}). Avec le même budget, on achète presque le double de surface en changeant de quartier dans la même commune."),
            (f"Est-ce qu'on vend beaucoup à {name} ?", f"Le Catastro enregistre {c['compraventas']} ventes de logements par an à {name}. C'est plus important qu'il ne paraît : là où il y a beaucoup de transactions, il y a beaucoup de comparables, le prix est plus fiable et revendre plus tard est plus facile."),
            ("Quels frais l'acheteur paie-t-il en plus du prix ?", "En plus du prix : l'impôt de transmission (ITP) pour un bien d'occasion —ou l'IGIC et les droits d'enregistrement pour un bien neuf—, le notaire, le Registre de la propriété, le gestor et, en cas d'emprunt, l'estimation. Il convient de le calculer avec des chiffres précis avant de signer un compromis, car c'est le poste qui fait échouer les opérations au dernier moment."),
            (f"Puis-je acheter à {name} si je ne réside pas en Espagne ?", "Oui, il n'y a aucune restriction à l'achat. Il faut un NIE, un compte en Espagne pour les paiements et justifier l'origine des fonds devant le notaire. Si vous avez besoin d'un financement, un non-résident doit prévoir un apport personnel plus important qu'un résident : il convient d'en discuter avec la banque avant de faire une offre, pas après."),
            ("Combien de temps dure un achat, de l'offre à la signature ?", "Sans financement : quelques semaines. Avec un prêt, le délai réaliste descend rarement sous 45 jours depuis le compromis : au-dessous, le risque n'est plus celui de la banque mais celui de perdre le dépôt. Ce délai se négocie dans le compromis de vente, et c'est le point où le plus d'opérations échouent."),
            ("Que faut-il vérifier avant de signer le compromis ?", "Une note simple actualisée du Registre (propriété et charges), que la description enregistrée correspond à la réalité et au Catastro, qu'il n'y a pas de travaux non légalisés, la situation urbanistique du terrain, les charges de copropriété et son état, et qui est à jour de la taxe foncière (IBI). Trouver un problème avant de signer, c'est une négociation ; le trouver après, c'est un procès."),
        ]
    if lang == 'it':
        return [
            (f"Si può davvero trattare sul prezzo comprando a {name}?", f"A {name} si chiede in media {c['pedido']} e davanti al notaio si firma {c['firmado']}: una distanza del {c['dist']}. Non è uno sconto automatico —il dato di rogito mescola costa ed entroterra, e una casa specifica può essere sopra o sotto— ma conferma che il prezzo pubblicato in questa zona non è il prezzo di chiusura."),
            (f"Quale zona di {name} si adatta al mio budget?", f"All'interno di {name} c'è una differenza di {c['ratio']} volte tra {c['zonaTop']} ({c['zonaTopVal']}) e {c['zonaBottom']} ({c['zonaBottomVal']}). Con lo stesso budget si compra quasi il doppio della superficie cambiando quartiere nello stesso comune."),
            (f"Si vende molto a {name}?", f"Il Catastro registra {c['compraventas']} compravendite di abitazioni all'anno a {name}. Conta più di quanto sembri: dove ci sono molte operazioni ci sono molti comparabili, il prezzo è più affidabile e rivendere in futuro è più facile."),
            ("Quali spese ha l'acquirente oltre al prezzo?", "Oltre al prezzo: l'imposta di trasferimento (ITP) se è una casa di seconda mano —o l'IGIC e l'imposta di bollo se è una nuova costruzione—, il notaio, il Registro della Proprietà, il gestor e, in caso di mutuo, la perizia. Conviene calcolarlo con cifre concrete prima di firmare la caparra, perché è la voce che fa saltare le operazioni all'ultimo momento."),
            (f"Posso comprare a {name} se non sono residente in Spagna?", "Sì, non c'è alcuna restrizione all'acquisto. Serve il NIE, un conto in Spagna per i pagamenti e giustificare l'origine dei fondi davanti al notaio. Se serve anche un finanziamento, un non residente parte da un apporto proprio maggiore di un residente, quindi conviene parlarne con la banca prima di fare un'offerta, non dopo."),
            ("Quanto dura un acquisto dall'offerta alla firma?", "Senza finanziamento: poche settimane. Con un mutuo, il termine realistico raramente scende sotto i 45 giorni dalla caparra: sotto quella soglia il rischio non è della banca, ma di perdere la caparra. Il termine si negozia nel contratto di caparra, ed è il punto dove più operazioni falliscono."),
            ("Cosa conviene verificare prima di firmare la caparra?", "Nota semplice aggiornata del Registro (proprietà e vincoli), che la descrizione registrale corrisponda alla realtà e al Catastro, che non ci siano opere non legalizzate, la situazione urbanistica del suolo, le spese condominiali e lo stato del condominio, e chi è in regola con l'IBI. Trovare un problema prima di firmare è una trattativa; trovarlo dopo è una causa."),
        ]
    if lang == 'en':
        return [
            (f"Can you really negotiate the price when buying in {name}?", f"In {name} the average asking price is {c['pedido']}, and the notarised price is {c['firmado']}: a {c['dist']} gap. That's not an automatic discount —the notarised figure mixes coast and inland, and a specific property can sit above or below it— but it does prove that the listed price in this zone isn't the closing price."),
            (f"Which zone of {name} fits my budget?", f"Within {name} there's a {c['ratio']}x difference between {c['zonaTop']} ({c['zonaTopVal']}) and {c['zonaBottom']} ({c['zonaBottomVal']}). With the same money you buy almost double the floor area by moving to a different neighbourhood within the same municipality."),
            (f"Does {name} sell a lot of property?", f"The Land Registry (Catastro) records {c['compraventas']} home sales a year in {name}. That matters more than it seems: where there are many transactions there are many comparables, the price is more reliable, and reselling later is easier."),
            ("What costs does the buyer pay on top of the price?", "On top of the price: transfer tax (ITP) for a resale property —or IGIC and stamp duty for a new build—, the notary, the Land Registry, the gestor (administrative agent) and, if there's a mortgage, the valuation. It's worth working this out with real figures before signing a deposit contract, because it's the item that derails deals at the last minute."),
            (f"Can I buy in {name} if I'm not a resident of Spain?", "Yes, there's no restriction on buying. What you do need is an NIE number, a Spanish account for the payments, and to show the source of funds to the notary. If you also need financing, a non-resident starts from a larger deposit than a resident, so it's worth discussing this with the bank before making an offer, not after."),
            ("How long does a purchase take from offer to signing?", "Without financing: a few weeks. With a mortgage, a realistic timeframe is rarely under 45 days from the deposit contract: below that, the risk isn't the bank's, it's losing the deposit. That timeframe is negotiated in the deposit contract, and it's the point where most deals fall through."),
            ("What should you check before signing the deposit contract?", "An up-to-date Land Registry extract (ownership and charges), that the registered description matches reality and the Cadastre, that there's no unregistered building work, the land's planning status, the community fees and the state of the homeowners' association, and who's up to date on the local property tax (IBI). Finding a problem before signing is a negotiation; finding it afterwards is a lawsuit."),
        ]
    # de
    return [
        (f"Kann man beim Kauf in {name} wirklich verhandeln?", f"In {name} werden im Schnitt {c['pedido']} verlangt, und notariell beurkundet werden {c['firmado']}: ein Abstand von {c['dist']}. Das ist kein automatischer Nachlass —die beurkundete Zahl vermischt Küste und Inland, und eine konkrete Immobilie kann darüber oder darunter liegen— aber sie zeigt, dass der veröffentlichte Preis in dieser Zone nicht der Abschlusspreis ist."),
        (f"Welche Zone von {name} passt zu meinem Budget?", f"Innerhalb von {name} gibt es einen {c['ratio']}-fachen Unterschied zwischen {c['zonaTop']} ({c['zonaTopVal']}) und {c['zonaBottom']} ({c['zonaBottomVal']}). Mit demselben Geld kauft man fast die doppelte Fläche, wenn man innerhalb derselben Gemeinde das Viertel wechselt."),
        (f"Wird in {name} viel verkauft?", f"Das Catastro verzeichnet {c['compraventas']} Wohnungsverkäufe pro Jahr in {name}. Das ist wichtiger, als es scheint: Wo viele Transaktionen stattfinden, gibt es viele Vergleichswerte, der Preis ist zuverlässiger und ein späterer Weiterverkauf ist leichter."),
        ("Welche Kosten hat der Käufer zusätzlich zum Preis?", "Zusätzlich zum Preis: die Grunderwerbsteuer (ITP) bei einer Bestandsimmobilie —oder IGIC und Stempelsteuer bei einem Neubau—, der Notar, das Grundbuchamt, die Gestoría und, bei einer Hypothek, die Wertermittlung. Es lohnt sich, dies mit konkreten Zahlen zu berechnen, bevor man eine Anzahlung unterschreibt, denn das ist der Posten, der Geschäfte in letzter Minute zum Scheitern bringt."),
        (f"Kann ich in {name} kaufen, wenn ich nicht in Spanien ansässig bin?", "Ja, es gibt keine Einschränkung beim Kauf. Nötig sind eine NIE-Nummer, ein Konto in Spanien für die Zahlungen und der Nachweis der Mittelherkunft gegenüber dem Notar. Wer zusätzlich eine Finanzierung braucht: Ein Nicht-Ansässiger benötigt einen höheren Eigenanteil als ein Ansässiger, daher lohnt es sich, dies vor einem Angebot mit der Bank zu besprechen, nicht danach."),
        ("Wie lange dauert ein Kauf vom Angebot bis zur Unterschrift?", "Ohne Finanzierung: ein paar Wochen. Mit Hypothek liegt eine realistische Frist selten unter 45 Tagen ab der Anzahlung: darunter liegt das Risiko nicht bei der Bank, sondern beim Verlust der Anzahlung. Diese Frist wird im Anzahlungsvertrag verhandelt und ist der Punkt, an dem die meisten Geschäfte scheitern."),
        ("Was sollte man vor der Unterschrift der Anzahlung prüfen?", "Aktueller Grundbuchauszug (Eigentum und Lasten), dass die eingetragene Beschreibung mit der Realität und dem Catastro übereinstimmt, dass keine nicht legalisierten Bauarbeiten vorliegen, der planungsrechtliche Status des Grundstücks, die Nebenkosten und der Zustand der Eigentümergemeinschaft, und wer mit der Grundsteuer (IBI) auf dem Laufenden ist. Ein Problem vor der Unterschrift zu finden ist eine Verhandlung; es danach zu finden ist ein Rechtsstreit."),
    ]

def html_escape_attr(s):
    return s.replace('&', '&amp;').replace('"', '&quot;')

def build_page(city_key, lang):
    c = CITY[city_key]
    t = T[lang]
    name = c['EsName']
    slug = SLUGS[city_key][lang]
    url = f"https://villasproperties.es/{lang}/{slug}"
    es_page = f"comprar-casa-{city_key}.html"
    es_url = f"https://villasproperties.es/{es_page}"
    title = t['titleTag'](name)
    og_desc = t['ogDesc'](c)
    meta_desc = t['metaDesc']
    og_locale = OG_LOCALE[lang]
    out_mark = f' hreflang="es" title="{FOREIGN_TITLE[lang]}"'

    # hreflang alternates (recíproco a 6: es + 5)
    alts = [('es', es_url)]
    for lg in LANGS:
        alts.append((lg, f"https://villasproperties.es/{lg}/{SLUGS[city_key][lg]}"))
    alts.append(('x-default', es_url))
    alt_html = ''.join(f'<link rel="alternate" hreflang="{lg}" href="{href}">' for lg, href in alts)

    # lang-switch estático (rescatado por shell.js)
    switch_items = [('ES', 'es', '/' + es_page, False)]
    for lg in LANGS:
        switch_items.append((lg.upper(), lg, f"/{lg}/{SLUGS[city_key][lg]}", lg == lang))
    switch_html = '<div class="lang-switch" role="navigation" aria-label="' + t['langAria'] + '">' + ''.join(
        f'<a href="{href}" hreflang="{code}"' + (' rel="self" aria-current="true">' if cur else ' rel="alternate">') + label + '</a>'
        for label, code, href, cur in switch_items
    ) + '</div>'

    # JSON-LD
    faq_items = faqs(lang, name, c)
    faq_json = ','.join(
        '{"@type":"Question","name":"%s","acceptedAnswer":{"@type":"Answer","text":"%s"}}' % (
            q.replace('"', '\\"'), a.replace('"', '\\"')
        ) for q, a in faq_items
    )
    service_desc = t['offerDesc']
    ld = (
        '{"@context":"https://schema.org","@graph":['
        '{"@type":"Service","serviceType":"%s","provider":{"@type":"RealEstateAgent","name":"Villa\'s Properties","telephone":"+34667384965","email":"info@villasproperties.es","address":{"@type":"PostalAddress","streetAddress":"Calle Mencey Anaga, 23","addressLocality":"Las Chafiras","postalCode":"38639","addressRegion":"Santa Cruz de Tenerife","addressCountry":"ES"}},"areaServed":{"@type":"City","name":"%s","geo":{"@type":"GeoCoordinates","latitude":%s,"longitude":%s}},"offers":{"@type":"Offer","price":"0","priceCurrency":"EUR","description":"%s"}},'
        '{"@type":"FAQPage","mainEntity":[%s]},'
        '{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"%s","item":"https://villasproperties.es/%s/index.html"},{"@type":"ListItem","position":2,"name":"%s","item":"https://villasproperties.es/%s/buy.html"},{"@type":"ListItem","position":3,"name":"%s"}]}'
        ']}'
    ) % (
        service_desc and t['serviceType'](name), name, c['geo']['lat'], c['geo']['lng'], service_desc,
        faq_json,
        t['breadHome'], lang, t['breadBuy'], lang, t['breadThis'](name),
    )
    # Nota: buy.html no existe traducido en la isla; el breadcrumb usa la ruta ES con outMark en el nav visible,
    # pero en JSON-LD referenciamos la página española de compra para no inventar una URL inexistente.
    ld = ld.replace(f'https://villasproperties.es/{lang}/buy.html', 'https://villasproperties.es/buy.html')

    lede_key = 'lede_adeje' if city_key == 'adeje' else 'lede_arona'
    lede = t[lede_key](c)

    zone_rows = ''.join(f'<tr><td>{z}</td><td>{v}</td><td>{d}</td></tr>' for z, v, d in c['zoneTable'])
    budget_rows = ''.join(f'<tr><td>{z}</td><td>{a}</td><td>{b}</td><td>{d}</td></tr>' for z, a, b, d in c['budgetTable'])

    faq_html = ''
    for i, (q, a) in enumerate(faq_items, start=1):
        faq_html += f'<div class="feature-row"><b>{i:02d}</b><div><b>{q}</b><p class="muted">{a}</p></div></div>'

    other_key = c['otherCity']
    other_name = CITY[other_key]['EsName']
    other_slug = SLUGS[other_key][lang]

    sell_es = f"vender-casa-{city_key}.html"

    body = f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<link rel="icon" type="image/webp" href="../assets/brand/logo-placeholder.webp"><link rel="stylesheet" href="../site.css?v=202610121758">
<noscript><style>[data-reveal],[data-stagger],[data-stagger-group]>*,.hero-content>*{{opacity:1!important;transform:none!important;clip-path:none!important}}</style></noscript>
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self'; font-src 'self'; connect-src 'self' https://odoo.okservice.es https://api.github.com https://uploads.github.com https://overpass-api.de; form-action 'self' https://odoo.okservice.es; frame-src 'none'; object-src 'none'; base-uri 'self'">
<meta name="referrer" content="strict-origin-when-cross-origin">
<!-- seo:start -->
<meta name="description" content="{html_escape_attr(meta_desc)}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta name="theme-color" content="#5f8075">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Villa's Properties">
<meta property="og:locale" content="{og_locale}">
<meta property="og:title" content="{html_escape_attr(title)}">
<meta property="og:description" content="{html_escape_attr(og_desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="https://villasproperties.es/assets/brand/tenerife-mercado.webp">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{html_escape_attr(title)}">
<meta name="twitter:description" content="{html_escape_attr(og_desc)}">
<meta name="twitter:image" content="https://villasproperties.es/assets/brand/tenerife-mercado.webp">
<link rel="manifest" href="../site.webmanifest">
<script type="application/ld+json">{ld}</script>
<!-- seo:end -->
{alt_html}
</head>
<body>
<a class="skip-link" href="#contenido">{t['skip']}</a>
<header class="header solid"><div class="wrap headerin"><a class="brand" href="../index.html" aria-label="Villa's Properties"{out_mark}><div class="lockup"><div class="wordmark"><span>VILL</span><span class="a">A</span><span>&rsquo;S&nbsp;PROPERTIES</span></div></div></a><nav class="nav"><a href="../properties.html"{out_mark}>Properties</a><a href="../sell.html"{out_mark}>Sell</a><a href="../buy.html"{out_mark}>Buy</a></nav>{switch_html}</div></header>
<main id="contenido">

  <section class="pagehero"><div class="wrap">
    <div class="eye">{t['eyeZone'](c)}</div>
    <h1>{t['h1'](name)}</h1>
    <p class="pagelede">{lede}</p>
  </div></section>

  <section class="section tight"><div class="wrap">
    <div class="head" data-reveal><div class="eye">{t['eye01']}</div>
    <div><h2>{t['h2_01']}</h2></div></div>
    <div class="bankcifras">
      <div><strong>{c['pedido']}</strong><small>{t['lbl_ask']}</small></div>
      <div><strong>{c['firmado']}</strong><small>{t['lbl_signed']}</small></div>
      <div><strong>{c['dist']}</strong><small>{t['lbl_dist']}</small></div>
      <div><strong>{c['compraventas']}</strong><small>{t['lbl_sales']}</small></div>
    </div>
    <p class="bankpie">{t['bankpie'](c)}</p>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="head" data-reveal><div class="eye">{t['eye02']}</div>
    <div><h2>{t['h2_02']}</h2>
    <p class="muted">{t['muted02'](c)}</p></div></div>
    <table class="post-table"><thead><tr><th>{t['th_zone']}</th><th>{t['th_askm2']}</th><th>{t['th_12m']}</th></tr></thead>
    <tbody>{zone_rows}</tbody></table>
    <p class="bankpie">{t['caption02']}</p>
  </div></section>

  <section class="section tight"><div class="wrap">
    <div class="head" data-reveal><div class="eye">{t['eye03']}</div>
    <div><h2>{t['h2_03']}</h2>
    <p class="muted">{t['muted03'](name)}</p></div></div>
    <table class="post-table"><thead><tr><th>{t['th_zone']}</th><th>200.000 €</th><th>300.000 €</th><th>450.000 €</th></tr></thead>
    <tbody>{budget_rows}</tbody></table>
  </div></section>

  <section class="section tight"><div class="wrap">
    <div class="head" data-reveal><div class="eye">{t['eye04']}</div>
    <div><h2>{t['h2_04']}</h2></div></div>
    <div class="feature-list">
      {faq_html}
    </div>
  </div></section>

  <section class="sell-cta" data-header-theme="green"><div class="wrap" style="position:relative;z-index:1">
    <div class="eye">{t['ctaEye']}</div>
    <h2>{t['ctaH2']}</h2>
    <p style="max-width:580px">{t['ctaP']}</p>
    <div class="actions" style="justify-content:flex-start;margin-top:25px">
      <a class="btn fill" href="https://wa.me/34667384965" target="_blank" rel="noopener">{t['ctaBtn1']}</a>
      <a class="btn" href="../properties.html"{out_mark}>{t['ctaBtn2']}</a>
    </div>
  </div></section>

  <section class="section tight"><div class="wrap">
    <div class="eye">{t['exploreEye']}</div>
    <div class="actions" style="justify-content:flex-start;margin-top:16px;flex-wrap:wrap"><a class="btn" href="{other_slug}">{other_name}</a><a class="btn" href="../comprar-casa-granadilla-de-abona.html"{out_mark}>Granadilla de Abona</a><a class="btn" href="../comprar-casa-san-miguel-de-abona.html"{out_mark}>San Miguel de Abona</a><a class="btn" href="../comprar-casa-guia-de-isora.html"{out_mark}>Guía de Isora</a><a class="btn" href="../comprar-casa-santiago-del-teide.html"{out_mark}>Santiago del Teide</a><a class="btn" href="../comprar-casa-los-cristianos.html"{out_mark}>Los Cristianos</a><a class="btn" href="../comprar-casa-costa-adeje.html"{out_mark}>Costa Adeje</a><a class="btn" href="../comprar-casa-el-medano.html"{out_mark}>El Médano</a></div>
    <p class="muted" style="margin-top:26px">{t['sellMuted'](name)}<a href="../{sell_es}"{out_mark}>{t['sellLink'](name)}</a>.</p>
  </div></section>

</main>
<footer class="footer"></footer>
<script src="../vp-safe.js?v=202610121758" defer></script><script src="../vp-lead.js?v=202610121758" defer></script><script src="../vp-consent.js?v=202610121758" defer></script><script src="../shell.js?v=202610121758" defer></script><script src="../app.js?v=202610121758" defer></script><script src="../social.js?v=202610121758" defer></script><script src="../market-data.js?v=202610121758" defer></script><script src="../buy.js?v=202610121758" defer></script><script src="../motion.js?v=202610121758" defer></script><script src="../backoffice-auth.js?v=202610121758" defer></script>
</body>
</html>
"""
    return body, slug

def main():
    for city_key in ('adeje', 'arona'):
        for lang in LANGS:
            body, slug = build_page(city_key, lang)
            out_dir = os.path.join(ROOT, lang)
            os.makedirs(out_dir, exist_ok=True)
            out_path = os.path.join(out_dir, slug)
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(body)
            print('wrote', os.path.relpath(out_path, ROOT))

if __name__ == '__main__':
    main()
