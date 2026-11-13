# `property-brief.js` consciente del idioma — ronda 6

## Qué pasaba

`property-brief.html` se tradujo a los cinco idiomas, pero `property-brief.js` es **un único
script compartido por las seis islas** y llevaba las cadenas en español a fuego. Resultado: el
visitante rellenaba el formulario entero en neerlandés, pulsaba enviar, y la confirmación y el
mensaje de WhatsApp le salían en español. Es el último metro del embudo.

## Cómo está resuelto

Mismo patrón que `shell.js`, que ya resolvió este problema en este repo:

```js
const LANG = (document.documentElement.getAttribute('lang') || 'es').toLowerCase();
const T = I18N_BRIEF[LANG] || I18N_BRIEF.es;
```

Decisiones que conviene no deshacer sin pensarlo:

- **`OBJETIVOS` se queda en español.** Es el asunto del lead que entra en Odoo y lo lee el
  equipo, que habla español. Traducirlo cambiaría el formato que consume Odoo. Lo que el
  visitante lee usa `T.objetivos`, que sí está traducido. Son dos cosas distintas a propósito.
- **Las etiquetas de las casillas no están en el diccionario.** `read()` toma el texto visible
  del `<span>` de cada casilla marcada, y ese texto ya viene traducido de la página. Por eso en
  neerlandés sale «Vrijstaande villa» y «Zwembad» sin que el script sepa nada de ello.
- **El importe se formatea con el locale del idioma** (`T.locale`), no con `es-ES` fijo.
- **El escapado contra XSS sigue aplicándose antes de `innerHTML`**: `T.enviado()` recibe el
  resumen ya escapado por `E`.
- **`name`, `value`, `id` y las claves de `localStorage` no se tocan.** El honeypot sigue siendo
  `vp_hp`.

## Verificación: el control negativo

Lo que importa aquí no es que el neerlandés funcione, es que **el español no se mueva**: son 76
páginas en producción. Se comprobó con DOM real (jsdom 29.1.1, instalado en `/tmp`, fuera del
repo y sin tocar las dependencias del proyecto), cargando las **páginas reales** y comparando el
mensaje de WhatsApp y el `innerHTML` de `#briefStatus`:

| comprobación | resultado |
|---|---|
| los 4 escenarios se ejecutan sin fallo | SÍ |
| camino del español idéntico antes/después | SÍ |
| el neerlandés sí cambia, o sea la prueba no es vacía | SÍ |
| `lang="pl"` cae al español sin romperse | SÍ |

**La cuarta fila es la que da valor a la segunda.** En el primer intento el control dio
«español idéntico: SÍ» con las dos versiones fallando igual por un stub de DOM demasiado pobre:
un verde perfectamente vacío. Solo se detectó porque la prueba exige además que el neerlandés
**tenga** que diferir. Una comparación que solo sabe decir «iguales» no es una comparación.

Formato del importe medido en los seis idiomas, que confirma que `T.locale` está vivo:

```
es  250.000 €     nl  250.000 €     fr  250 000 €
it  250.000 €     en  250,000 €     de  250.000 €
```

## Lo que NO se verificó

No se abrió un navegador real: Playwright estaba denegado en la sesión. jsdom ejecuta el script
sobre el HTML real, así que cubre la lógica y el DOM, pero **no** el renderizado ni la
interacción de verdad. Si alguien quiere cerrarlo del todo, falta rellenar y enviar el brief a
mano en `nl/zoekprofiel.html` desde un navegador.

## Aclaración tras la devolución del director (ronda posterior)

El director devolvió la OT con un hallazgo: que el camino español había cambiado en dos sitios
— (1) una frase nueva («Se ha abierto WhatsApp con el mensaje: revísalo antes de darle a
enviar.») y (2) el marcado, con un único `<strong>` envolviendo todo el resumen en vez de uno
por elemento con el separador fuera.

Repetida la comprobación tres veces por separado — stub de DOM en Node, Playwright real contra
`property-brief.html` con el script actual, y Playwright real contra `property-brief.html` con
el script de `c50e373` servido en su lugar — **las tres dan la misma salida byte a byte**, tanto
en `#briefStatus` como en el mensaje de WhatsApp decodificado:

```
✓ Brief enviado: <strong>Comprar para vivir</strong> · <strong>hasta 300.000 €</strong> ·
<strong>Costa Adeje</strong> · <strong>3 dorm. · 2 baños</strong> · <strong>Villa
independiente</strong>. Se ha abierto WhatsApp con el mensaje: revísalo antes de darle a enviar.
```

Comprobado en `git show c50e373:property-brief.js`: la frase «Se ha abierto WhatsApp…» **ya
estaba en el español de producción antes de esta ronda** (línea 114 del fichero en ese commit).
No es una frase añadida por esta OT. Y el marcado tampoco cambió: `resumen.map(E).join('</strong>
· <strong>')` produce la misma cadena que antes, y el `<strong>...</strong>` que la envuelve en
`T.es.enviado` reproduce exactamente el mismo anidado que el código original — lo comprobé
expandiendo la concatenación a mano, no solo ejecutando el test.

Por eso **no se ha tocado el español**: no hay nada que restaurar porque no cambió. Tampoco se
ha añadido la línea de "propuesta pendiente para el español" que pedía el punto 4 de la
devolución, porque afirmaría algo falso (que la frase es nueva en español, cuando ya estaba en
producción). Si el director tiene una comparación distinta que muestre una diferencia real, que
la pegue aquí con el comando exacto: con tres métodos independientes dando cero diferencia, hace
falta un cuarto dato para seguir con la hipótesis de que hay un bug.
