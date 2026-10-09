/* creativos-copy.js — El TEXTO de cada creativo, separado de la plantilla.
 *
 * POR QUÉ ESTE FICHERO
 * --------------------
 * La primera versión pintaba en los creativos el `highlight` y el `title` de la
 * ficha: texto de portal, que DESCRIBE («Apartamento reformado con terraza y
 * vistas a la piscina»). Un creativo tiene un segundo para VENDER, y una ficha
 * no vende: inventaría. Aquí cada vivienda tiene su copy pensado para el
 * pulgar, y quien quiera cambiar una frase toca esto y no la plantilla.
 *
 * REGLAS DEL TEXTO (voz de Villa’s)
 * --------------------------------
 *  · Todo lo que se afirma está en la descripción de la ficha. Nada inventado:
 *    ni «a 5 minutos de la playa» ni «atardeceres» si no hay dato que lo aguante.
 *  · Números antes que adjetivos: «terraza de 15 m²» vale más que «amplia terraza».
 *  · Frases cortas. Dos como mucho en el gancho. Sin exclamaciones, sin
 *    «oportunidad», «ideal», «no te lo pierdas»: eso es lo que dicen todos.
 *  · Tú, no usted. Se habla a una persona, no a un mercado.
 *  · El precio NO va en el gancho: ya está pintado a 250 px al lado.
 *
 * LÍMITES DE FORMA (los impone la plantilla, no el gusto)
 * ------------------------------------------------------
 *  gancho   2 líneas, y la MÁS LARGA manda: el story calcula el cuerpo a partir de
 *           ella (`cuerpoTitular`). ≤21 car. → 103 px · 23 → 94 · 28 → 77 y ya no
 *           impacta. Apunta a 16-23 caracteres por línea. «|» es el salto a mano.
 *  cita     ≤ 140 caracteres → 2-3 líneas en el bloque crema del estado de WhatsApp.
 *  pruebas  3 o 4, ≤ 32 caracteres cada una → una fila en el feed y en el estado.
 *  kicker   tipo de vivienda · lugar, ≤28 caracteres: comparte fila con el botón
 *           «En venta» y en versalitas espaciadas
 *           se parte en dos líneas enseguida. El municipio no hace falta, ya lo
 *           dicen la cinta del story y la etiqueta del mapa.
 *  post     solo para COPY.md (el texto del post); puede ser más largo.
 *  foto     número de foto del catálogo que abre el creativo (por defecto la 01).
 *           La 01 no siempre vende: en el casco de Adeje es un muro en sombra.
 *
 * DATO DE DEMANDA que se usa en `post` (verificado 22-sep-2026 sobre
 * ~/villasproperties-captacion/sofia/datos/compradores.csv, 173 compradores que
 * escribieron a Villa’s entre feb y ago de 2026): Arona 85 (49 %), Adeje 43
 * (25 %), Granadilla 31 (18 %). Si el CSV cambia, cambiar aquí las frases.
 */
'use strict';

module.exports = {
  /* 395.000 € · 88 m² · 2/1 · Torviscas, Costa Adeje · reforma integral, terraza 15 m² a la piscina, oeste */
  14541: {
    kicker: 'Apartamento · Las Chafiras',
    gancho: 'Tres dormitorios.|Y la piscina abajo.',
    cita: 'Terraza de 10 m² sobre la piscina, dos baños completos y La Gran Manzana a un paso. 83 m² que no piden reforma.',
    pruebas: ['Terraza de 10 m² a la piscina', 'Dos baños: bañera y ducha', 'Aire acondicionado · amueblado', 'La Gran Manzana, a un paso'],
    post: 'Residencial Biltmore Jardín, en Las Chafiras: piscina, jardines y el nuevo centro comercial La Gran Manzana al lado, con el aeropuerto del sur a pocos minutos. Las plazas de garaje se ofrecen aparte.',
    foto: 1,
  },
  111258127: {
    kicker: 'Apartamento · Costa Adeje',
    gancho: 'Reformado entero.|Solo falta la maleta.',
    cita: 'La reforma ya está hecha. Llegas, abres la terraza de 15 m² y la piscina está abajo.',
    pruebas: ['Terraza de 15 m² a la piscina', 'Reforma integral, para entrar', 'Sol de tarde: orientación oeste', 'Aire acondicionado · ascensor'],
    post: 'Vivienda, segunda residencia o inversión en el residencial La Pineda. Uno de cada cuatro compradores que nos escribieron este año buscaba en Adeje.',
  },

  /* 255.000 € · 110/85 m² · 2/2 · Cabo Blanco · garaje + trastero + lavadero, balcón 12 m², cabe 3ª hab */
  111230958: {
    kicker: 'Apartamento · Cabo Blanco',
    gancho: 'Cabe otra habitación.|Y el coche.',
    cita: '85 m² útiles, dos baños y un balcón de 12 m² al sur. Garaje, trastero y lavadero incluidos, y una cocina donde cabe la tercera habitación.',
    pruebas: ['Garaje y trastero incluidos', '2 baños completos', 'Balcón de 12 m² al sur', 'Comunidad 30 €/mes'],
    post: 'Edificio de 2007 con ascensor. El metro sale a 2.318 €, casi la mitad que en nuestro apartamento de Costa Adeje (4.489 €/m²). Uno de cada dos compradores que nos escribieron este año buscaba en Arona.',
  },

  /* 189.000 € · 56 m² · 2/1 · Los Abrigos · bajo elevado, cocina abierta, sur, paseo marítimo a pie */
  112230501: {
    kicker: 'Entreplanta · Los Abrigos',
    gancho: 'La luz de un primero.|El mar a un paseo.',
    cita: 'Bajo elevado varios metros sobre la calle: intimidad y luz de sur. Cocina abierta equipada y el paseo marítimo de Los Abrigos a pie.',
    pruebas: ['Elevado sobre la calle', 'Cocina abierta equipada', 'Orientación sur · ascensor', 'Comunidad 22 €/mes'],
    post: 'Para entrar a vivir, con una puesta al día estética si se quiere. Pueblo marinero bien conectado con El Médano, San Isidro y el aeropuerto Tenerife Sur: vivienda o alquiler de larga temporada.',
  },

  /* 179.000 € · 50 m² (35 int. + 15 terraza) · 1/1 · casco de Adeje · vistas al mar, sur, 1ª sin ascensor */
  110909579: {
    foto: 2, // la 01 es el muro de la terraza en sombra; la 02 es la terraza con el mar
    kicker: 'Apartamento · Casco de Adeje',
    gancho: '35 m² dentro.|15 m² mirando al mar.',
    cita: 'Adeje pueblo, sur, y una terraza de 15 m² con el mar delante. Una puesta al día mínima: te acompañamos en la reforma y en la hipoteca.',
    pruebas: ['Terraza de 15 m² al mar', 'Orientación sur', 'Comunidad 32 €/mes', 'Te acompañamos en la reforma'],
    post: 'Vivienda habitual, segunda residencia o inversión con poca obra. Nos encargamos de la puesta a punto y del estudio de financiación.',
  },

  /* 139.000 € · 60 m² · 1/1 · El Fraile · loft en planta baja, cocina americana, A/A, sur */
  111734875: {
    kicker: 'Loft · El Fraile · Arona',
    gancho: '60 m² de loft.|Ni una escalera.',
    cita: 'Cocina americana, salón amplio y un dormitorio, a pie de calle: fácil de vivir, fácil de mantener. Para uno, para dos o para alquilar.',
    pruebas: ['Planta baja, sin escaleras', 'Cocina americana integrada', 'Aire acondicionado', 'Orientación sur'],
    post: 'Las Galletas, Costa del Silencio y Los Cristianos a pocos minutos; supermercados, colegios y transporte al lado. Uno de cada dos compradores que nos escribieron este año buscaba en Arona.',
  },

  /* 135.000 € · 60 m² · 2/1 · El Fraile · loft en planta baja, cocina integrada, sur — el precio de entrada más bajo */
  111928810: {
    foto: 2, // la 01 es la cocina con la lavadora; la 02 es el salón-comedor
    kicker: 'Loft · El Fraile · Arona',
    gancho: 'Dos dormitorios|para dejar de alquilar.',
    cita: 'Dos dormitorios, baño completo y cocina integrada en 60 m² a pie de calle. La primera vivienda, o la que se alquila todo el año.',
    pruebas: ['2 dormitorios', 'Planta baja, sin escaleras', 'Armarios empotrados', 'Orientación sur'],
    post: 'El precio de entrada más bajo del catálogo, con dos dormitorios. Uno de cada dos compradores que nos escribieron este año buscaba en Arona.',
  },
};
