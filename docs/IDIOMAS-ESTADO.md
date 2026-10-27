# Idiomas de villasproperties.es — objetivo y estado

## Objetivo (número + verbo)
Dejar **el recorrido del comprador (7 páginas) en 6 idiomas** = 42 páginas, con el verificador en
0 huérfanos y 0 canonical cruzados, y el menú y el selector sobreviviendo al JavaScript en todas.

## Los idiomas los deciden las escrituras, no la intuición
Nacionalidad del comprador por código postal (informes del Notariado, 12 meses, en
`~/villaradar-precios/fuentes/notariado/`):

| CP | Zona | Extranjeros | Primeras nacionalidades |
|---|---|---:|---|
| 38679 | La Caleta (Adeje) | 87,5 % | Bélgica 26,6 % · Rumanía 6,3 % · Ucrania 6,3 % |
| 38670 | La Postura (Adeje) | 64,0 % | Bélgica 22,6 % · Italia 11,3 % · R. Unido 5,7 % |
| 38639 | El Monte (San Miguel) | 61,0 % | Italia 18,1 % · Polonia 10,2 % · Bélgica 6,8 % |
| 38631 | Ten-Bel (Arona) | 50,0 % | Italia 30 % · **R. Unido 16,7 %** · Bélgica 13,3 % · Hungría 10 % · Polonia 10 % |
| 38588 | Casablanca-Poris (Arico) | 47,6 % | **Alemania 45,2 %** · Francia 7,1 % |

**Orden por evidencia:** italiano (4 de 6 zonas) · neerlandés y francés (Bélgica, 1.ª en las dos
zonas caras) · **inglés** (R. Unido en 3 zonas y lengua franca de rumanos, ucranianos, húngaros y
polacos) · **alemán** (45 % en Poris, la mayor concentración de una sola nacionalidad).
Polaco sería el siguiente; de momento lo cubre el inglés.

## Páginas del recorrido (las 7)
`index.html` · `contact.html` · `guia-comprador.html` (nueva) · `comprar-casa-adeje.html` ·
`comprar-casa-arona.html` · `finance.html` · `property.html` (+ `property-brief.html`).

## Estado
| Página | ES | NL | FR | IT | EN | DE |
|---|---|---|---|---|---|---|
| index.html | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| contact.html | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| guia-comprador.html | — | ✓ | ✓ | ✓ | ✓ | ✓ |
| comprar-casa-adeje.html | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| comprar-casa-arona.html | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| finance.html | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| property.html | ✓ | | | | | |
| property-brief.html | ✓ | ✓ (`nl/zoekprofiel.html`) | ✓ (`fr/brief-recherche.html`) | ✓ (`it/brief-ricerca.html`) | ✓ (`en/property-brief.html`) | ✓ (`de/suchprofil.html`) |

Ronda 4 (19-oct, commits `f2fab09`/`c5afa4b`/`3e62e05`): inglés y alemán completados para
index/contact/guia-comprador. Reciprocidad de hreflang a 6 idiomas en 17 páginas, 0/0.

Ronda 5 (19-oct, commit `f46f7c2`): **finance.html completada en los 5 idiomas** (23 páginas
totales en el verificador, sigue 0 huérfanos / 0 canonical cruzados). Se paró aquí tras la
página 1 de las 5 pedidas, por tiempo — commit hecho y rama reanudable. 🚩 Cifra encontrada sin
respaldo en el ES original: "Hasta el 100 % según perfil" (financiación) no se tradujo; se dejó
marcada `lang="es"` en las 5 páginas y se señaló en la entrega en lugar de traducirla, porque
contradice el 60-70 % que la propia guía del comprador (ya publicada) documenta para no
residentes. Pendiente para la siguiente ronda: `comprar-casa-adeje.html`,
`comprar-casa-arona.html`, `property.html`, `property-brief.html` — las 4 en los 5 idiomas.

Ronda 6 (19-oct, ramas `feat/idiomas-r6-landings` y `feat/idiomas-r6-brief`, fusionadas en
`feat/idiomas-nl-fr-it`): **tres páginas completadas en los 5 idiomas** —
`comprar-casa-adeje.html`, `comprar-casa-arona.html` y `property-brief.html`.
El verificador cuenta ahora **41 páginas**, con 0 huérfanos y 0 canonical cruzados.

**Novedad: se traduce el slug.** Son páginas de búsqueda, así que el nombre del fichero es parte
del trabajo: `huis-kopen-adeje.html` (nl), `acheter-maison-adeje.html` (fr),
`comprare-casa-adeje.html` (it), `buy-house-adeje.html` (en), `haus-kaufen-adeje.html` (de), sus
análogos de Arona, y para el brief `nl/zoekprofiel.html`, `fr/brief-recherche.html`,
`it/brief-ricerca.html`, `en/property-brief.html`, `de/suchprofil.html`. Los
`<link rel="alternate">` de las seis versiones, incluidos los originales en español de la raíz,
se actualizaron en consecuencia.

**Un fallo real del verificador, encontrado dos veces.** `verificar-idiomas.js` y
`check_links.py` asumían que el nombre de fichero es el mismo en todos los idiomas, lo cual era
cierto para index/contact/guia-comprador/finance y falso en cuanto se traduce el slug: marcaba
**10 falsos positivos**. Se corrigió derivando el `x-default` esperado del propio `hreflang="es"`
que declara cada página, en vez de adivinarlo quitando el prefijo de idioma. Los **dos devs de
la ronda llegaron a ese fallo y a la misma corrección por separado**, sin verse entre ellos; al
fusionar se conservó una sola copia.

**El formulario, traducido sin romper el lead.** Se tradujo solo lo visible: `<label>`, texto de
`<option>`, `<span>` de cada `.chip`, `placeholder`, `.chiplabel`/`.chipnota`, botones y
`#briefStatus`. Los `name`, `value`, `id`, `for` y el honeypot `vp_hp` se dejaron byte a byte
iguales al español, y se verificó campo a campo que el orden coincide en las seis versiones. Los
atributos `toolname`/`tooldescription` del `<form>` siguen intactos y en español, porque no son
para el usuario.

**La promesa de financiación, cerrada.** La ronda 5 había dejado en español la tarjeta del
«hasta el 100 % según perfil» para no extender a cinco idiomas una promesa que no se sostiene
para no residentes. Ahora las cinco traducciones de `finance.html` llevan la cifra real: **60–70 %**
del menor de precio o tasación, con **30–40 %** de capital propio más **8 %** de gastos, y sin
`lang="es"`. El `finance.html` en español de la raíz **no se tocó**: esa decisión es de Jose, y
hay un informe aparte sobre ella en `~/villas-cierre-2026-10-19/HALLAZGO-FINANCIACION-LEY-5-2019.md`.

**`property.html` queda fuera, y no por falta de tiempo.** Es una cáscara vacía
(`<main id="propertyView"></main>`) que rellena `property.js` desde `properties-data.js`. Una
copia estática en una isla pasaría todos los chequeos y saldría en español en el navegador: es
el caso de libro de «verde por curl». Si hay que traducirla, el trabajo está en la capa de
JavaScript, no en el HTML.

**Pendiente en marcha:** `property-brief.js` compone el mensaje de WhatsApp y el resumen de
`#briefStatus` tras enviar con cadenas en español (`Objetivo:`, `Presupuesto máximo:`, `dorm.`,
`Comprar para vivir`…), y es un único script compartido por las seis islas. El formulario
funciona y el lead no se pierde, pero quien lo rellena en neerlandés ve la confirmación en
español. Lo detectó el dev de la OT-B sin arreglarlo, por no ser su fichero; ya tiene orden de
trabajo propia (OT-C, rama `feat/idiomas-r6-brief-js`), con la condición dura de que el camino
del español no cambie ni un carácter.

**Defecto preexistente, señalado y no tocado:** el selector de idioma en nav y footer de
`nl/index.html` tiene el bloque hreflang y el `lang-switch` duplicados. Viene de rondas
anteriores.

## Reglas que no se negocian
- Isla cerrada: las otras 76 páginas no se tocan. Los enlaces que salen apuntan al español,
  marcados con `hreflang="es"` y `title` en el idioma de la página.
- El selector solo ofrece los idiomas en los que **esa** página existe.
- Cada página canoniza a sí misma en su idioma.
- Bloques que son datos o citas literales (listado de inmuebles, reseñas) se quedan en español
  **marcados con `lang="es"`**: mejor eso que traducción automática.
- 🔴 Nunca prometer alquiler turístico ni rentabilidad vacacional (Ley 6/2025 de Canarias: la
  habilitación de vivienda vacacional se extingue con la transmisión). 🔴 Nunca anunciar un
  inmueble sin certificado energético (RD 390/2021 art. 15.2).
- `shell.js` y `app.js` reescriben cabecera y menú en runtime: cualquier idioma nuevo hay que
  comprobarlo **en navegador**, no solo en el HTML (el verificador estático no lo ve).
- Nada se publica: rama `feat/idiomas-nl-fr-it` y PR #5. Un commit por página para poder reanudar.

## Por qué esto NO es una campaña del método /goal
Se pasó la compuerta: hay volumen, pero **no hay incertidumbre de método** (la isla ya funciona y
está verificada) ni ramas de fallo que merezca archivar. Es ejecución repetida. De la maquinaria
del método se conserva solo lo útil aquí: objetivo cuantificado, esta tabla de estado para
reanudar, y un commit por página.
