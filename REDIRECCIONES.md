# Mapa de redirecciones — villasproperties.es

> Generado por `tools/redirecciones.js`. **No editar a mano:** se regenera.

La web actual declara **53 URLs** en su sitemap. Aquí van todas: 32
se redirigen con 301 y 21 se dan de baja con 410.

Una 301 traslada el posicionamiento acumulado a la URL nueva; un 404 lo tira.
Por eso importa hacerlo **antes** de cambiar el DNS y no después.

## Se redirigen (301)

| Vieja | Nueva | Por qué |
|---|---|---|
| `/` | `/` | la portada es la portada |
| `/about-us` | `/contact.html` | quién está detrás vive ahora en contacto, con la bio de Valeria |
| `/contactus` | `/contact.html` | mismo propósito |
| `/catalogo` | `/properties.html` | el catálogo de inmuebles |
| `/galeria` | `/properties.html` | las fotos viven en las fichas del catálogo |
| `/encuentra-tu-casa` | `/buy.html` | el embudo de comprador |
| `/vendemos-tu-casa` | `/sell.html` | el embudo de vendedor |
| `/servicios-inmobiliarios` | `/sell.html` | servicios = lo que se hace al vender |
| `/valoracion-gratis-tenerife` | `/valuation.html` | el valorador, mismo propósito y misma intención de búsqueda |
| `/cuanto-vale-tu-piso-ahora-mismo` | `/valuation.html` | ídem |
| `/formulario-captacion` | `/valuation.html` | el formulario de captación es ahora el valorador |
| `/market-impact` | `/market-impact.html` | existe con el mismo nombre |
| `/financiacion` | `/financiacion/` | OJO: la carpeta redirige a /r/financiacion para no romper la comisión de Bayteca |
| `/referidos` | `/r/financiacion/` | programa de referidos = la entrada con atribución |
| `/privacy` | `/privacy.html` | política de privacidad |
| `/terms` | `/privacy.html` | no hay página de términos aparte; privacidad la cubre |
| `/blog` | `/insights.html` | el índice del blog |
| `/blog/4` | `/insights.html` | la categoría con contenido |
| `/blog/4/estudio-anual-del-mercado-inmobiliario-1` | `/post-estudio-anual-del-mercado-inmobiliario-1.html` | artículo rescatado, mismo slug |
| `/blog/4/cuanto-vale-realmente-mi-villa-en-tenerife-la-clave-esta-en-la-precision-no-en-la-prisa-2` | `/post-cuanto-vale-realmente-mi-villa-en-tenerife-la-clave-esta-en-la-precision-no-en-la-prisa-2.html` | artículo rescatado, mismo slug |
| `/blog/4/invertir-en-tenerife-por-que-la-seguridad-juridica-es-mas-importante-que-la-rentabilidad-3` | `/post-invertir-en-tenerife-por-que-la-seguridad-juridica-es-mas-importante-que-la-rentabilidad-3.html` | artículo rescatado, mismo slug |
| `/blog/4/de-adeje-al-norte-las-zonas-de-tenerife-que-marcaran-la-revalorizacion-en-2026-4` | `/post-de-adeje-al-norte-las-zonas-de-tenerife-que-marcaran-la-revalorizacion-en-2026-4.html` | artículo rescatado, mismo slug |
| `/blog/4/como-vender-una-casa-5` | `/post-como-vender-una-casa-5.html` | artículo rescatado, mismo slug |
| `/blog/4/como-vender-una-casa-fase-2-6` | `/post-como-vender-una-casa-fase-2-6.html` | artículo rescatado, mismo slug |
| `/blog/4/el-precio-de-la-vivienda-en-espana-se-ha-incrementado-un-45-en-los-ultimos-diez-anos-7` | `/post-el-precio-de-la-vivienda-en-espana-se-ha-incrementado-un-45-en-los-ultimos-diez-anos-7.html` | artículo rescatado, mismo slug |
| `/blog/4/por-que-tu-casa-no-se-vende-en-tenerife-8` | `/post-por-que-tu-casa-no-se-vende-en-tenerife-8.html` | artículo rescatado, mismo slug |
| `/vender-casa-adeje` | `/vender-casa-adeje.html` | landing municipal, mismo slug |
| `/vender-casa-arona` | `/vender-casa-arona.html` | landing municipal, mismo slug |
| `/vender-casa-granadilla-de-abona` | `/vender-casa-granadilla-de-abona.html` | landing municipal, mismo slug |
| `/vender-casa-guia-de-isora` | `/vender-casa-guia-de-isora.html` | landing municipal, mismo slug |
| `/vender-casa-san-miguel-de-abona` | `/vender-casa-san-miguel-de-abona.html` | landing municipal, mismo slug |
| `/vender-casa-santiago-del-teide` | `/vender-casa-santiago-del-teide.html` | landing municipal, mismo slug |

## Se dan de baja (410)

No se redirigen a la portada a propósito: Google trata una 301 masiva hacia la
home como un *soft 404* y la ignora igual, pero además ensucia el mapa. El 410
dice "se fue y no vuelve", y deja de pedirla antes.

| URL | Qué era |
|---|---|
| `/acm` | módulo de Odoo, nunca fue contenido |
| `/intro/odoo/action-website-website-preview` | URL interna del editor de Odoo |
| `/landing-pages` | plantilla de Odoo sin contenido propio |
| `/landin-pages-2` | ídem, y con la errata incluida |
| `/planes-de-precios` | no se venden planes: el modelo es comisión |
| `/pricing` | ídem |
| `/shop` | no hay tienda |
| `/website/info` | página de diagnóstico de Odoo |
| `/events` | módulo de eventos sin usar |
| `/forum` | foro sin usar |
| `/forum/ayuda-1` | ídem |
| `/forum/ayuda-1/faq` | ídem |
| `/profile/users` | perfiles del portal de Odoo |
| `/profile/ranks_badges` | ídem |
| `/blog/1` | categoría de blog vacía |
| `/blog/2` | ídem |
| `/blog/3` | ídem |
| `/blog/1/feed` | RSS de categoría vacía |
| `/blog/2/feed` | ídem |
| `/blog/3/feed` | ídem |
| `/blog/4/feed` | el RSS nuevo no existe todavía; si se crea, redirigir aquí |

## Antes de aplicar

1. El sitemap viejo declara las URLs en **http://**, no https. Al migrar hay que
   corregirlo o se pierde la señal de canonicidad.
2. `/financiacion` **no** apunta a `finance.html` directamente: pasa por
   `/financiacion/`, que redirige a `/r/financiacion`. Esa cadena preserva la
   atribución de Bayteca, que paga comisión por cierre. Romperla no da error:
   simplemente deja de cobrarse.
3. Vigilar 404 en Search Console la semana siguiente al cambio.
