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
| comprar-casa-adeje.html | ✓ | | | | | |
| comprar-casa-arona.html | ✓ | | | | | |
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

Ronda 6 (19-oct, rama `feat/idiomas-r6-brief`): **property-brief.html completada en los 5
idiomas**, con slug traducido en cada isla (`nl/zoekprofiel.html`, `fr/brief-recherche.html`,
`it/brief-ricerca.html`, `en/property-brief.html`, `de/suchprofil.html`) — los `<link
rel="alternate">` de las seis versiones y los de la raíz en español se actualizaron en consecuencia.
Se tradujo solo lo visible: `<label>`, texto de `<option>`, `<span>` de cada `.chip`,
`placeholder`, `.chiplabel`/`.chipnota`, botones y `#briefStatus`. `name`, `value`, `id`, `for` y
el honeypot (`vp_hp`) se dejaron byte a byte iguales al original — verificado campo a campo
(mismo orden de `name`/`value`/`id`/`for` en las 6 versiones). `toolname`/`tooldescription` del
`<form>` intactos, en español. Se cerró también la tarjeta de financiación que ronda 5 dejó en
español en `finance.html` (NL/FR/IT/EN/DE): pasa a la cifra real para no residentes (60–70 % del
menor de precio o tasación, 30–40 % de capital propio + 8 % de gastos), sin `lang="es"`. El
`finance.html` y el `property-brief.html` en español de la raíz no se tocaron en su texto visible.
`tools/i18n/verificar-idiomas.js` y `tools/i18n/check_links.py` tenían la lista de páginas y el
cálculo de `x-default` **codificados asumiendo que el nombre de fichero es igual en todos los
idiomas**; con slug traducido eso rompía, así que se corrigió `verificar-idiomas.js` para derivar
el `x-default` esperado del propio `hreflang="es"` de la página en vez de adivinarlo quitando el
prefijo de idioma, y se añadieron las 6 páginas nuevas a ambos scripts. 🚩 Hallazgo para el
director, no arreglado aquí: `property-brief.js` es un script único compartido por las 6 islas y
compone el mensaje de WhatsApp y el resumen de `#briefStatus` tras el envío con cadenas
**hardcodeadas en español** (`Objetivo:`, `Presupuesto máximo:`, `dorm.`, `baños`, `Comprar para
vivir`…), igual que `OBJETIVOS`. El formulario funciona y el lead no se pierde (los `value`
intocables llegan igual), pero un visitante que rellena el brief en neerlandés/francés/italiano/
inglés/alemán ve la confirmación final y genera el WhatsApp en español. No estaba en el reparto
de ficheros de esta OT (no es de los 10 asignados) y tocarlo afecta a las 6 islas a la vez: se
deja para que el director lo convierta en su propia orden de trabajo.

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
