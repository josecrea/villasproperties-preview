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
| finance.html | ✓ | | | | | |
| property.html | ✓ | | | | | |
| property-brief.html | ✓ | | | | | |

Ronda 4 (19-oct, commits `f2fab09`/`c5afa4b`/pendiente): inglés y alemán completados para las
3 páginas existentes. Reciprocidad de hreflang ahora a 6 idiomas (antes 4) en las 17 páginas de
la isla — `node tools/i18n/verificar-idiomas.js` y `python3 tools/i18n/check_links.py` en 0.
`shell.js`/`app.js` ampliados con las tablas de nav/claim/CTA en/de; comprobado en navegador
(Playwright) que nav, claim y selector sobreviven a su reescritura en runtime en las 6 páginas
nuevas. Pendiente: `finance.html` en los 5 idiomas (no se llegó por tiempo) y las 4 páginas
restantes del recorrido en los 5 idiomas.

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
