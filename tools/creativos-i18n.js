/* creativos-i18n.js — Rótulos y copy de los creativos en otros idiomas.
 *
 * POR QUÉ
 * -------
 * El comprador de segunda residencia decide desde su país. Un creativo en
 * español no le para el pulgar a un belga ni a un alemán. `creativos.js --lang=de`
 * pinta la misma plantilla con estos rótulos y este copy.
 *
 * REGLAS (las mismas que creativos-copy.js, más dos)
 * --------------------------------------------------
 *  · Todo lo que se afirma está en la ficha. Nada de sol, invierno ni playa
 *    «a 5 minutos» si la ficha no lo dice.
 *  · NUNCA alquiler turístico: la licencia de vivienda vacacional se extingue con
 *    la venta (Ley 6/2025 de Canarias). Si se habla de alquilar, es de larga temporada.
 *  · Solo viviendas con certificado energético resuelto: una vivienda sin copy en
 *    un idioma NO se genera en ese idioma (no cae al texto español de la ficha).
 *  · Mismos límites de forma: gancho 16-23 caracteres por línea, cita ≤ 140,
 *    pruebas ≤ 32, kicker ≤ 28.
 *
 * Traducciones SIN revisar por una persona nativa (11-nov-2026).
 */
'use strict';

/* Una vivienda recién captada puede no tener municipio ni zona: una etiqueta vacía
 * («#») canta más que no ponerla. Se cae sola y el resto del copy sale igual. */
const etiqueta = (v) => {
  const limpio = String(v || '').split('(')[0].replace(/[^\wáéíóúñÁÉÍÓÚÑ\s]/gi, '').trim().replace(/\s+/g, '');
  return limpio ? `#${limpio}` : '';
};
const pueblo = (p) => etiqueta(p.town);
const HASH_ES = (p) => ['#TenerifeSur', pueblo(p), etiqueta(p.zone), '#Inmobiliaria', '#VillasProperties', '#CompraVivienda']
  .filter(Boolean).join(' ');

const L = {
  es: {
    locale: 'es-ES', sur: 'Tenerife Sur', enVenta: 'En venta', construidos: 'construidos',
    dorm: ['dormitorio', 'dormitorios'], bano: ['baño', 'baños'], energia: 'energía', y: 'y',
    precioConsultar: 'Precio a consultar', vivienda: 'vivienda', estudio: 'Estudio',
    ctaWa: 'Pide visita por WhatsApp',
    waQ: '¿Te la enseño?', waSmall: 'Responde <b>VISITA</b> a este estado y te mando la ficha completa.',
    cierreTit: '¿Cuál te enseño<br>primero?', cierreSub: 'Dime la referencia o el pueblo y te mando la ficha completa.',
    escribeme: 'Escríbeme', nViviendas: (n) => (n === 1 ? 'Una vivienda' : `${n} viviendas`),
    enVentaSur: 'en venta en el sur', desde: 'Desde', desliza: 'Desliza para verlas',
    copy: {
      post: 'Post (Instagram / Facebook)', ficha: 'Ficha completa y fotos', wa: 'Estado de WhatsApp (texto que acompaña a la imagen)',
      waTexto: 'Responde VISITA y te mando la ficha completa.', hashtags: HASH_ES,
    },
  },
  de: {
    locale: 'de-DE', sur: 'Teneriffa Süd', enVenta: 'Zu verkaufen', construidos: 'Fläche',
    dorm: ['Schlafzimmer', 'Schlafzimmer'], bano: ['Bad', 'Bäder'], energia: 'Energie', y: 'und',
    precioConsultar: 'Preis auf Anfrage', vivienda: 'Immobilie', estudio: 'Studio',
    ctaWa: 'Besichtigung per WhatsApp',
    waQ: 'Soll ich sie dir zeigen?', waSmall: 'Antworte <b>BESICHTIGUNG</b> und ich schicke dir das Exposé.',
    cierreTit: 'Welche zeige ich dir<br>zuerst?', cierreSub: 'Nenn mir die Referenz oder den Ort und ich schicke dir das vollständige Exposé.',
    escribeme: 'Schreib mir', nViviendas: (n) => (n === 1 ? 'Eine Immobilie' : `${n} Immobilien`),
    enVentaSur: 'im Süden zu verkaufen', desde: 'Ab', desliza: 'Wischen und ansehen',
    copy: {
      post: 'Post (Instagram / Facebook)', ficha: 'Mehr Infos auf Deutsch', wa: 'WhatsApp-Status (Text zum Bild)',
      waTexto: 'Antworte mit BESICHTIGUNG und ich schicke dir das vollständige Exposé.',
      hashtags: (p) => ['#Teneriffa', '#TeneriffaSüd', pueblo(p), '#ImmobilienTeneriffa', '#Zweitwohnsitz', '#VillasProperties'].filter(Boolean).join(' '),
    },
  },
  it: {
    locale: 'it-IT', sur: 'Tenerife Sud', enVenta: 'In vendita', construidos: 'superficie',
    dorm: ['camera', 'camere'], bano: ['bagno', 'bagni'], energia: 'energia', y: 'e',
    precioConsultar: 'Prezzo su richiesta', vivienda: 'immobile', estudio: 'Monolocale',
    ctaWa: 'Chiedi una visita su WhatsApp',
    waQ: 'Te la mostro?', waSmall: 'Rispondi <b>VISITA</b> a questo stato e ti mando la scheda completa.',
    cierreTit: 'Quale ti mostro<br>per prima?', cierreSub: 'Dimmi il riferimento o la zona e ti mando la scheda completa.',
    escribeme: 'Scrivimi', nViviendas: (n) => (n === 1 ? 'Una casa' : `${n} case`),
    enVentaSur: 'in vendita nel sud', desde: 'Da', desliza: 'Scorri per vederle',
    copy: {
      post: 'Post (Instagram / Facebook)', ficha: 'Più informazioni in italiano', wa: 'Stato di WhatsApp (testo che accompagna l’immagine)',
      waTexto: 'Rispondi VISITA e ti mando la scheda completa.',
      hashtags: (p) => ['#Tenerife', '#TenerifeSud', pueblo(p), '#CasaATenerife', '#SecondaCasa', '#VillasProperties'].filter(Boolean).join(' '),
    },
  },
  fr: {
    locale: 'fr-FR', sur: 'Tenerife Sud', enVenta: 'À vendre', construidos: 'surface',
    dorm: ['chambre', 'chambres'], bano: ['bain', 'bains'], energia: 'énergie', y: 'et',
    precioConsultar: 'Prix sur demande', vivienda: 'logement', estudio: 'Studio',
    ctaWa: 'Demandez une visite sur WhatsApp',
    waQ: 'Je vous la montre ?', waSmall: 'Répondez <b>VISITE</b> à ce statut et je vous envoie la fiche complète.',
    cierreTit: 'Laquelle voulez-vous<br>voir en premier ?', cierreSub: 'Indiquez la référence ou le village et je vous envoie la fiche complète.',
    escribeme: 'Écrivez-moi', nViviendas: (n) => (n === 1 ? 'Un bien' : `${n} biens`),
    enVentaSur: 'à vendre dans le sud', desde: 'À partir de', desliza: 'Faites défiler',
    copy: {
      post: 'Post (Instagram / Facebook)', ficha: 'Plus d’informations en français', wa: 'Statut WhatsApp (texte qui accompagne l’image)',
      waTexto: 'Répondez VISITE et je vous envoie la fiche complète.',
      hashtags: (p) => ['#Tenerife', '#TenerifeSud', pueblo(p), '#ImmobilierTenerife', '#ResidenceSecondaire', '#VillasProperties'].filter(Boolean).join(' '),
    },
  },
  nl: {
    locale: 'nl-BE', sur: 'Tenerife-Zuid', enVenta: 'Te koop', construidos: 'oppervlakte',
    dorm: ['slaapkamer', 'slaapkamers'], bano: ['badkamer', 'badkamers'], energia: 'energie', y: 'en',
    precioConsultar: 'Prijs op aanvraag', vivienda: 'woning', estudio: 'Studio',
    ctaWa: 'Vraag een bezichtiging via WhatsApp',
    waQ: 'Zal ik ze je tonen?', waSmall: 'Antwoord <b>BEZOEK</b> en ik stuur je de volledige fiche.',
    cierreTit: 'Welke toon ik je<br>eerst?', cierreSub: 'Geef me de referentie of het dorp en ik stuur je de volledige fiche.',
    escribeme: 'Schrijf me', nViviendas: (n) => (n === 1 ? 'Eén woning' : `${n} woningen`),
    enVentaSur: 'te koop in het zuiden', desde: 'Vanaf', desliza: 'Swipe om ze te zien',
    copy: {
      post: 'Post (Instagram / Facebook)', ficha: 'Meer info in het Nederlands', wa: 'WhatsApp-status (tekst bij de afbeelding)',
      waTexto: 'Antwoord BEZOEK en ik stuur je de volledige fiche.',
      hashtags: (p) => ['#Tenerife', '#TenerifeZuid', pueblo(p), '#HuisInSpanje', '#TweedeVerblijf', '#VillasProperties'].filter(Boolean).join(' '),
    },
  },
};

/* Copy por idioma y referencia. La foto de portada se hereda de creativos-copy.js. */
const COPY = {
  de: {
    14541: {
      kicker: 'Dachgeschoss · Chafiras', gancho: 'Drei Schlafzimmer.|Und unten der Pool.',
      cita: 'Drei Schlafzimmer, zwei Bäder und 10 m² Terrasse über dem Pool. 93 m², die keine Renovierung brauchen.',
      pruebas: ['10 m² Terrasse zum Pool', 'Zwei Bäder: Wanne und Dusche', 'Klimaanlage · möbliert', 'Flughafen Süd in Minuten'],
      post: 'Wohnanlage Biltmore Jardín in Las Chafiras: Pool, Gärten und das Einkaufszentrum La Gran Manzana nebenan; der Flughafen Teneriffa Süd ist in wenigen Autominuten erreichbar. Garagenstellplätze separat.',
    },
    112230501: {
      kicker: 'Hochparterre · Los Abrigos', gancho: 'Licht wie im 1. Stock.|Das Meer zu Fuß.',
      cita: 'Hochparterre, mehrere Meter über der Straße: Privatsphäre und Südlicht. Offene Küche und die Promenade von Los Abrigos zu Fuß.',
      pruebas: ['Über Straßenniveau', 'Offene, ausgestattete Küche', 'Südlage · Aufzug', 'Hausgeld 22 €/Monat'],
      post: 'Bezugsfertig, auf Wunsch mit einer optischen Auffrischung. Küstenort mit guter Verbindung nach El Médano, San Isidro und zum Flughafen Teneriffa Süd: Wohnsitz oder Langzeitvermietung.',
    },
    110909579: {
      kicker: 'Wohnung · Adeje Altstadt', gancho: '35 m² drinnen.|15 m² mit Meerblick.',
      cita: 'Adeje Ort, Südlage und 15 m² Terrasse mit dem Meer davor. Kleine Auffrischung: Wir begleiten Umbau und Finanzierung.',
      pruebas: ['15 m² Terrasse zum Meer', 'Südausrichtung', 'Hausgeld 32 €/Monat', 'Wir begleiten die Renovierung'],
      post: 'Hauptwohnsitz, Zweitwohnsitz oder Kapitalanlage mit wenig Aufwand. Wir kümmern uns um die Auffrischung und die Finanzierungsprüfung.',
    },
    111734875: {
      kicker: 'Loft · El Fraile · Arona', gancho: '60 m² Loft.|Keine einzige Stufe.',
      cita: 'Offene Küche, großes Wohnzimmer und ein Schlafzimmer, ebenerdig: leicht zu bewohnen, leicht zu pflegen.',
      pruebas: ['Erdgeschoss, ohne Treppen', 'Integrierte offene Küche', 'Klimaanlage', 'Südausrichtung'],
      post: 'Las Galletas, Costa del Silencio und Los Cristianos in wenigen Minuten; Supermärkte, Schulen und Nahverkehr in der Nähe. Auch als Kapitalanlage für die Langzeitvermietung.',
    },
    111928810: {
      kicker: 'Loft · El Fraile · Arona', gancho: 'Zwei Schlafzimmer.|Unser Einstiegspreis.',
      cita: 'Zwei Schlafzimmer, Bad und integrierte Küche auf 60 m², ebenerdig. Der günstigste Einstieg in unserem Katalog.',
      pruebas: ['2 Schlafzimmer', 'Erdgeschoss, ohne Treppen', 'Einbauschränke', 'Südausrichtung'],
      post: 'Der niedrigste Einstiegspreis in unserem Katalog, mit zwei Schlafzimmern. Erster Wohnsitz oder Kapitalanlage für die Langzeitvermietung.',
    },
  },
  it: {
    14541: {
      kicker: 'Attico · Las Chafiras', gancho: 'Tre camere.|E la piscina sotto.',
      cita: 'Tre camere, due bagni completi e una terrazza di 10 m² sulla piscina. 93 m² che non chiedono lavori.',
      pruebas: ['Terrazza di 10 m² sulla piscina', 'Due bagni: vasca e doccia', 'Aria condizionata · arredato', 'Aeroporto Sud a pochi minuti'],
      post: 'Residence Biltmore Jardín a Las Chafiras: piscina, giardini e il centro commerciale La Gran Manzana accanto; l’aeroporto di Tenerife Sud è a pochi minuti d’auto. Posti auto in garage a parte.',
    },
    112230501: {
      kicker: 'Piano rialzato · Los Abrigos', gancho: 'Luce da primo piano.|Il mare a due passi.',
      cita: 'Rialzato di alcuni metri sulla strada: riservatezza e luce da sud. Cucina a vista attrezzata e il lungomare di Los Abrigos a piedi.',
      pruebas: ['Rialzato sulla strada', 'Cucina a vista attrezzata', 'Esposizione sud · ascensore', 'Condominio 22 €/mese'],
      post: 'Pronto da abitare, con un ritocco estetico se si vuole. Paese di mare ben collegato con El Médano, San Isidro e l’aeroporto di Tenerife Sud: abitazione o affitto a lungo termine.',
    },
    110909579: {
      kicker: 'Appartamento · Adeje centro', gancho: '35 m² dentro.|15 m² vista mare.',
      cita: 'Adeje paese, esposizione sud e una terrazza di 15 m² con il mare davanti. Un rinnovo minimo: ti seguiamo nei lavori e nel mutuo.',
      pruebas: ['Terrazza di 15 m² sul mare', 'Esposizione sud', 'Condominio 32 €/mese', 'Ti seguiamo nei lavori'],
      post: 'Prima casa, seconda casa o investimento con pochi lavori. Ci occupiamo della sistemazione e dello studio del finanziamento.',
    },
    111734875: {
      kicker: 'Loft · El Fraile · Arona', gancho: '60 m² di loft.|Nemmeno un gradino.',
      cita: 'Cucina all’americana, soggiorno ampio e una camera, a piano strada: facile da vivere e da mantenere. Per una persona o per due.',
      pruebas: ['Piano terra, senza scale', 'Cucina all’americana', 'Aria condizionata', 'Esposizione sud'],
      post: 'Las Galletas, Costa del Silencio e Los Cristianos a pochi minuti; supermercati, scuole e trasporti vicini. Anche come investimento per l’affitto a lungo termine.',
    },
    111928810: {
      kicker: 'Loft · El Fraile · Arona', gancho: 'Due camere.|Il prezzo d’ingresso.',
      cita: 'Due camere, bagno completo e cucina integrata in 60 m² a piano strada. Il prezzo d’ingresso più basso del nostro catalogo.',
      pruebas: ['2 camere', 'Piano terra, senza scale', 'Armadi a muro', 'Esposizione sud'],
      post: 'Il prezzo d’ingresso più basso del nostro catalogo, con due camere. Prima casa o investimento per l’affitto a lungo termine.',
    },
  },
  fr: {
    14541: {
      kicker: 'Dernier étage · Las Chafiras', gancho: 'Trois chambres.|Et la piscine en bas.',
      cita: 'Trois chambres, deux salles de bain et une terrasse de 10 m² sur la piscine. 93 m² sans travaux à prévoir.',
      pruebas: ['Terrasse de 10 m² sur piscine', 'Deux sdb : baignoire et douche', 'Climatisation · meublé', 'Aéroport Sud à quelques minutes'],
      post: 'Résidence Biltmore Jardín à Las Chafiras : piscine, jardins et le centre commercial La Gran Manzana à côté ; l’aéroport de Tenerife Sud est à quelques minutes en voiture. Places de garage en supplément.',
    },
    112230501: {
      kicker: 'Rez surélevé · Los Abrigos', gancho: 'Lumière d’un 1er étage.|La mer à pied.',
      cita: 'Surélevé de plusieurs mètres au-dessus de la rue : intimité et lumière du sud. Cuisine ouverte équipée et le front de mer à pied.',
      pruebas: ['Surélevé au-dessus de la rue', 'Cuisine ouverte équipée', 'Plein sud · ascenseur', 'Charges 22 €/mois'],
      post: 'Prêt à habiter, avec un rafraîchissement esthétique si on le souhaite. Village côtier bien relié à El Médano, San Isidro et à l’aéroport de Tenerife Sud : résidence ou location de longue durée.',
    },
    110909579: {
      kicker: 'Appartement · Adeje village', gancho: '35 m² dedans.|15 m² face à la mer.',
      cita: 'Adeje village, plein sud, et une terrasse de 15 m² face à la mer. Un simple rafraîchissement : on vous accompagne, travaux et prêt.',
      pruebas: ['Terrasse de 15 m² sur la mer', 'Plein sud', 'Charges 32 €/mois', 'On vous accompagne'],
      post: 'Résidence principale, résidence secondaire ou investissement avec peu de travaux. Nous nous occupons de la remise en état et de l’étude de financement.',
    },
    111734875: {
      kicker: 'Loft · El Fraile · Arona', gancho: '60 m² de loft.|Pas une marche.',
      cita: 'Cuisine américaine, grand séjour et une chambre, de plain-pied : facile à vivre, facile à entretenir. Pour une ou deux personnes.',
      pruebas: ['Plain-pied, sans escaliers', 'Cuisine américaine', 'Climatisation', 'Plein sud'],
      post: 'Las Galletas, Costa del Silencio et Los Cristianos à quelques minutes ; supermarchés, écoles et transports à proximité. Aussi comme investissement en location de longue durée.',
    },
    111928810: {
      kicker: 'Loft · El Fraile · Arona', gancho: 'Deux chambres.|Notre prix d’entrée.',
      cita: 'Deux chambres, salle de bain et cuisine intégrée sur 60 m² de plain-pied. Le prix d’entrée le plus bas de notre catalogue.',
      pruebas: ['2 chambres', 'Plain-pied, sans escaliers', 'Placards intégrés', 'Plein sud'],
      post: 'Le prix d’entrée le plus bas de notre catalogue, avec deux chambres. Première résidence ou investissement en location de longue durée.',
    },
  },
  nl: {
    14541: {
      kicker: 'Penthouse · Las Chafiras', gancho: 'Drie slaapkamers.|Zwembad beneden.',
      cita: 'Drie slaapkamers, twee badkamers en een terras van 10 m² boven het zwembad. 93 m² zonder renovatie.',
      pruebas: ['Terras van 10 m² aan zwembad', 'Twee badkamers: bad en douche', 'Airco · gemeubeld', 'Luchthaven Zuid op minuten'],
      post: 'Residentie Biltmore Jardín in Las Chafiras: zwembad, tuinen en het winkelcentrum La Gran Manzana ernaast; de luchthaven Tenerife-Zuid ligt op enkele minuten rijden. Garageplaatsen apart.',
    },
    112230501: {
      kicker: 'Appartement · Los Abrigos', gancho: 'Licht van een 1e etage.|De zee te voet.',
      cita: 'Enkele meters boven de straat: privacy en licht uit het zuiden. Open ingerichte keuken en de zeedijk van Los Abrigos te voet.',
      pruebas: ['Verhoogd boven de straat', 'Open ingerichte keuken', 'Op het zuiden · lift', 'Syndicus 22 €/maand'],
      post: 'Instapklaar, met een esthetische opfrissing als je dat wilt. Kustdorp met goede verbinding naar El Médano, San Isidro en de luchthaven Tenerife-Zuid: woning of langdurige verhuur.',
    },
    110909579: {
      kicker: 'Appartement · Adeje dorp', gancho: '35 m² binnen.|15 m² met zeezicht.',
      cita: 'Adeje dorp, op het zuiden, en een terras van 15 m² met de zee ervoor. Wij begeleiden werken en financiering.',
      pruebas: ['Terras van 15 m² met zeezicht', 'Op het zuiden', 'Syndicus 32 €/maand', 'Wij begeleiden de werken'],
      post: 'Hoofdverblijf, tweede verblijf of investering met weinig werk. Wij zorgen voor de opfrissing en het financieringsonderzoek.',
    },
    111734875: {
      kicker: 'Loft · El Fraile · Arona', gancho: '60 m² loft.|Geen enkele trap.',
      cita: 'Open keuken, ruime woonkamer en één slaapkamer, gelijkvloers: makkelijk wonen, makkelijk onderhouden.',
      pruebas: ['Gelijkvloers, zonder trappen', 'Open keuken', 'Airco', 'Op het zuiden'],
      post: 'Las Galletas, Costa del Silencio en Los Cristianos op enkele minuten; supermarkten, scholen en openbaar vervoer vlakbij. Ook als investering voor langdurige verhuur.',
    },
    111928810: {
      kicker: 'Loft · El Fraile · Arona', gancho: 'Twee slaapkamers.|Onze instapprijs.',
      cita: 'Twee slaapkamers, badkamer en geïntegreerde keuken op 60 m², gelijkvloers. De laagste instapprijs in onze catalogus.',
      pruebas: ['2 slaapkamers', 'Gelijkvloers, zonder trappen', 'Inbouwkasten', 'Op het zuiden'],
      post: 'De laagste instapprijs in onze catalogus, met twee slaapkamers. Eerste woning of investering voor langdurige verhuur.',
    },
  },
};

module.exports = { L, COPY };
