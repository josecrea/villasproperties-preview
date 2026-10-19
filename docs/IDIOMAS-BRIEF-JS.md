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
